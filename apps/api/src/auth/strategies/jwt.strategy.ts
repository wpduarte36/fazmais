import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import type { Role, UserStatus } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';

export interface JwtPayload {
  sub: string;
  tenantId: string | null;
  role: Role;
  status: UserStatus;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    configService: ConfigService,
    private readonly prisma: PrismaService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.getOrThrow<string>('JWT_ACCESS_SECRET'),
    });
  }

  // Busca role/tenantId/status atuais no banco em vez de confiar no payload
  // assinado — sem isso, desativar um usuário ou trocar seu papel não tem
  // efeito nenhum até o access token expirar sozinho (até 15min por padrão).
  async validate(payload: JwtPayload): Promise<JwtPayload> {
    const user = await this.prisma.user.findUnique({
      where: { id: payload.sub },
      select: { id: true, tenantId: true, role: true, status: true },
    });
    if (!user || user.status !== 'ATIVO') {
      throw new UnauthorizedException('Sessão inválida ou expirada');
    }
    return {
      sub: user.id,
      tenantId: user.tenantId,
      role: user.role,
      status: user.status,
    };
  }
}
