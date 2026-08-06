import { Injectable, UnauthorizedException } from '@nestjs/common';
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

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async validateUser(login: string, password: string): Promise<User> {
    const user = await this.prisma.user.findUnique({ where: { login } });
    if (!user) {
      throw new UnauthorizedException('Login ou senha inválidos');
    }
    if (user.status === 'PENDENTE') {
      throw new UnauthorizedException('Seu cadastro ainda está pendente de aprovação');
    }
    if (user.status === 'INATIVO') {
      throw new UnauthorizedException('Seu acesso está inativo');
    }
    if (!user.password) {
      throw new UnauthorizedException('Você ainda não definiu sua senha de acesso');
    }
    const passwordMatches = await bcrypt.compare(password, user.password);
    if (!passwordMatches) {
      throw new UnauthorizedException('Login ou senha inválidos');
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
