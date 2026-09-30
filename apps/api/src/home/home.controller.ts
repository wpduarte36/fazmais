import {
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Post,
  Query,
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
// ADMIN e MASTER entram aqui pela "visão do educador" (ver
// conteudo-visibility.util). Master só lê o feed — as escritas (view,
// favoritos, avaliações, progresso) continuam fechadas pra ele.
@Roles('PROFESSOR', 'ADMIN', 'MASTER')
export class HomeController {
  constructor(private readonly homeService: HomeService) {}

  @Get('feed')
  async getFeed(
    @CurrentUser() user: JwtPayload,
    @Query('tenantId') tenantId?: string,
    @Query('planoId') planoId?: string,
  ) {
    // Só o Master escolhe município/plano; pros demais os parâmetros são
    // ignorados e vale o município e o plano do próprio usuário.
    if (user.role === 'MASTER') {
      const visao = await this.homeService.resolverVisaoMaster(tenantId, planoId);
      return this.homeService.getFeed(user.sub, visao.tenantId, visao);
    }
    return this.homeService.getFeed(user.sub, user.tenantId as string);
  }

  @Post('view/:conteudoId')
  @Roles('PROFESSOR', 'ADMIN')
  @HttpCode(HttpStatus.NO_CONTENT)
  registrarView(@CurrentUser() user: JwtPayload, @Param('conteudoId', ParseUUIDPipe) conteudoId: string) {
    return this.homeService.registrarView(conteudoId, user.sub, user.tenantId as string, user.role);
  }
}
