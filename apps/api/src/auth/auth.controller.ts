import { Body, Controller, HttpCode, HttpStatus, Post, Req, Res } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { Request, Response } from 'express';
import { Throttle } from '@nestjs/throttler';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { SetPasswordDto } from './dto/set-password.dto';

const REFRESH_COOKIE_NAME = 'refreshToken';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly configService: ConfigService,
  ) {}

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @Throttle({ default: { limit: 5, ttl: 60_000 } })
  async login(@Body() dto: LoginDto, @Res({ passthrough: true }) res: Response) {
    const user = await this.authService.validateUser(dto.login, dto.password);
    const { accessToken, refreshToken, user: userSummary } = await this.authService.login(user);

    const isProduction = this.configService.get('NODE_ENV') === 'production';
    res.cookie(REFRESH_COOKIE_NAME, refreshToken, {
      httpOnly: true,
      secure: isProduction,
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000,
      path: '/',
    });

    return { accessToken, user: userSummary };
  }

  @Post('set-password')
  @HttpCode(HttpStatus.NO_CONTENT)
  setPassword(@Body() dto: SetPasswordDto) {
    return this.authService.setPasswordFromToken(dto.token, dto.password);
  }

  @Post('logout')
  @HttpCode(HttpStatus.NO_CONTENT)
  async logout(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const refreshToken = (req.cookies as Record<string, string> | undefined)?.[REFRESH_COOKIE_NAME];
    if (refreshToken) {
      await this.authService.revokeRefreshToken(refreshToken);
    }
    res.clearCookie(REFRESH_COOKIE_NAME, { path: '/' });
  }
}
