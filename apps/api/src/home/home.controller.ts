import {
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Post,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { JwtPayload } from '../auth/strategies/jwt.strategy';
import { HomeService } from './home.service';

@Controller('home')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('PROFESSOR')
export class HomeController {
  constructor(private readonly homeService: HomeService) {}

  @Get('feed')
  getFeed(@CurrentUser() user: JwtPayload) {
    return this.homeService.getFeed(user.sub, user.tenantId as string);
  }

  @Post('view/:conteudoId')
  @HttpCode(HttpStatus.NO_CONTENT)
  registrarView(@Param('conteudoId', ParseUUIDPipe) conteudoId: string) {
    return this.homeService.registrarView(conteudoId);
  }
}
