import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService, type JwtSignOptions } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { createHash } from 'node:crypto';
import { PrismaService } from '../prisma/prisma.service';
import type { User } from '@prisma/client';

interface AccessTokenPayload {
  sub: string;
  tenantId: string | null;
  role: string;
  status: string;
}

// Hash bcrypt de um valor fixo, comparado quando o login não existe ou não
// tem senha definida ainda — mantém o custo/tempo de resposta parecido com
// o caso de senha errada, pra não dar um oráculo de timing que revele se um
// login existe. Gerado uma vez em módulo, nunca corresponde a senha real.
const DUMMY_PASSWORD_HASH = bcrypt.hashSync('senha-nao-existe-timing-guard', 10);

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  // Mensagem de credenciais inválidas é sempre a mesma pra login inexistente,
  // senha ainda não definida (1º acesso pendente) e senha errada — do
  // contrário dá pra enumerar contas só tentando logar, já que login é único
  // no sistema inteiro. Só revelamos o motivo específico (pendente/inativo)
  // depois de confirmar que a senha bate, quando quem pergunta já provou que
  // é o dono da conta.
  async validateUser(login: string, password: string): Promise<User> {
    const user = await this.prisma.user.findUnique({ where: { login } });
    const passwordMatches = await bcrypt.compare(
      password,
      user?.password ?? DUMMY_PASSWORD_HASH,
    );

    if (!user || !user.password || !passwordMatches) {
      throw new UnauthorizedException('Login ou senha inválidos');
    }
    if (user.status === 'PENDENTE') {
      throw new UnauthorizedException('Seu cadastro ainda está pendente de aprovação');
    }
    if (user.status === 'INATIVO') {
      throw new UnauthorizedException('Seu acesso está inativo');
    }
    return user;
  }

  async login(user: User) {
    const accessToken = this.signAccessToken(user);
    const refreshToken = await this.issueRefreshToken(user.id);

    return {
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        name: user.name,
        login: user.login,
        role: user.role,
        tenantId: user.tenantId,
        planoId: user.planoId,
      },
    };
  }

  private signAccessToken(user: User): string {
    const payload: AccessTokenPayload = {
      sub: user.id,
      tenantId: user.tenantId,
      role: user.role,
      status: user.status,
    };
    return this.jwtService.sign(payload, {
      secret: this.configService.getOrThrow<string>('JWT_ACCESS_SECRET'),
      expiresIn: this.configService.get<string>('JWT_ACCESS_EXPIRES', '15m') as JwtSignOptions['expiresIn'],
    });
  }

  private async issueRefreshToken(userId: string): Promise<string> {
    const refreshExpires = this.configService.get<string>('JWT_REFRESH_EXPIRES', '7d');
    const token = this.jwtService.sign(
      { sub: userId },
      {
        secret: this.configService.getOrThrow<string>('JWT_REFRESH_SECRET'),
        expiresIn: refreshExpires as JwtSignOptions['expiresIn'],
      },
    );

    await this.prisma.refreshToken.create({
      data: {
        userId,
        tokenHash: this.hashToken(token),
        expiresAt: this.resolveExpiryDate(refreshExpires),
      },
    });

    return token;
  }

  // Consome um token de "1º acesso" (FIRST_ACCESS) ou de redefinição de
  // senha (RESET) — mesma tabela pros dois casos. Usado hoje só pelo fluxo
  // de 1º acesso; RESET fica pronto pra quando a Tela 03 (esqueceu senha)
  // for implementada.
  async setPasswordFromToken(token: string, newPassword: string): Promise<void> {
    const tokenHash = this.hashToken(token);
    const resetToken = await this.prisma.passwordResetToken.findUnique({
      where: { tokenHash },
    });

    if (
      !resetToken ||
      resetToken.usedAt ||
      resetToken.expiresAt.getTime() < Date.now()
    ) {
      throw new BadRequestException('Token inválido ou expirado');
    }

    const passwordHash = await bcrypt.hash(newPassword, 10);

    await this.prisma.$transaction([
      this.prisma.user.update({
        where: { id: resetToken.userId },
        data: { password: passwordHash, status: 'ATIVO' },
      }),
      this.prisma.passwordResetToken.update({
        where: { id: resetToken.id },
        data: { usedAt: new Date() },
      }),
    ]);
  }

  // Revoga o refresh token guardado (se o hash bater com algum não usado
  // ainda) — não invalida o access token já emitido (fica valendo até
  // expirar sozinho, ver JwtStrategy), mas evita que esse refresh token
  // sirva pra tirar um novo access token depois do logout.
  async revokeRefreshToken(token: string): Promise<void> {
    await this.prisma.refreshToken.updateMany({
      where: { tokenHash: this.hashToken(token), revokedAt: null },
      data: { revokedAt: new Date() },
    });
  }

  private hashToken(token: string): string {
    return createHash('sha256').update(token).digest('hex');
  }

  private resolveExpiryDate(expiresIn: string): Date {
    const match = /^(\d+)([smhd])$/.exec(expiresIn);
    if (!match) {
      throw new Error(`Formato de expiração inválido: ${expiresIn}`);
    }
    const amount = Number(match[1]);
    const unitMs: Record<string, number> = { s: 1000, m: 60_000, h: 3_600_000, d: 86_400_000 };
    return new Date(Date.now() + amount * unitMs[match[2]]);
  }
}
