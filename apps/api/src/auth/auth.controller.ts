import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  Res,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { Request, Response } from 'express';
import { Throttle } from '@nestjs/throttler';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { SetPasswordDto } from './dto/set-password.dto';

const REFRESH_COOKIE_NAME = 'refreshToken';

// Em produção web (Vercel) e API (Railway) ficam em domínios diferentes, então
// o cookie de refresh precisa de `sameSite: 'none'` + `secure` pra ser enviado
// nas requisições cross-site. Local (mesma máquina, http) mantém 'strict'.
// clearCookie só apaga um cookie se receber os MESMOS atributos com que ele
// foi criado — por isso login/refresh/logout compartilham este objeto.
function refreshCookieOptions(isProduction: boolean) {
  return {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? ('none' as const) : ('strict' as const),
    path: '/',
  };
}

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly configService: ConfigService,
  ) {}

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @Throttle({ default: { limit: 5, ttl: 60_000 } })
  async login(
    @Body() dto: LoginDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const user = await this.authService.validateUser(dto.login, dto.password);
    const {
      accessToken,
      refreshToken,
      user: userSummary,
    } = await this.authService.login(user);
    this.setRefreshCookie(res, refreshToken);
    return { accessToken, user: userSummary };
  }

  // Chamado pelo frontend quando o access token expira (a cada 15min) — usa
  // o refresh token do cookie httpOnly pra emitir um novo par de tokens sem
  // pedir login de novo. O limite é folgado (várias abas podem renovar quase
  // juntas), só serve pra cortar abuso — o refresh token em si é um JWT
  // assinado, não dá pra forçar por tentativa e erro.
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @Throttle({ default: { limit: 30, ttl: 60_000 } })
  async refresh(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const refreshToken = (req.cookies as Record<string, string> | undefined)?.[
      REFRESH_COOKIE_NAME
    ];
    if (!refreshToken) {
      throw new UnauthorizedException('Sessão expirada, faça login novamente');
    }

    try {
      const {
        accessToken,
        refreshToken: newRefreshToken,
        user: userSummary,
      } = await this.authService.refresh(refreshToken);
      this.setRefreshCookie(res, newRefreshToken);
      return { accessToken, user: userSummary };
    } catch (err) {
      this.clearRefreshCookie(res);
      throw err;
    }
  }

  private get isProduction(): boolean {
    return this.configService.get('NODE_ENV') === 'production';
  }

  private setRefreshCookie(res: Response, refreshToken: string): void {
    res.cookie(REFRESH_COOKIE_NAME, refreshToken, {
      ...refreshCookieOptions(this.isProduction),
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
  }

  private clearRefreshCookie(res: Response): void {
    res.clearCookie(REFRESH_COOKIE_NAME, refreshCookieOptions(this.isProduction));
  }

  // Token de 32 bytes aleatórios (inbruteforçável), mas um limite por IP é
  // barato e evita alguém varrer tokens em massa.
  @Post('set-password')
  @HttpCode(HttpStatus.NO_CONTENT)
  @Throttle({ default: { limit: 10, ttl: 60_000 } })
  setPassword(@Body() dto: SetPasswordDto) {
    return this.authService.setPasswordFromToken(dto.token, dto.password);
  }

  @Post('logout')
  @HttpCode(HttpStatus.NO_CONTENT)
  async logout(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const refreshToken = (req.cookies as Record<string, string> | undefined)?.[
      REFRESH_COOKIE_NAME
    ];
    if (refreshToken) {
      await this.authService.revokeRefreshToken(refreshToken);
    }
    this.clearRefreshCookie(res);
  }
}
