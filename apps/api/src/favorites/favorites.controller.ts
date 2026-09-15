import {
  Controller,
  Delete,
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
import { FavoritesService } from './favorites.service';

@Controller('favorites')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('PROFESSOR')
export class FavoritesController {
  constructor(private readonly favoritesService: FavoritesService) {}

  @Post(':conteudoId')
  @HttpCode(HttpStatus.NO_CONTENT)
  favoritar(@CurrentUser() user: JwtPayload, @Param('conteudoId', ParseUUIDPipe) conteudoId: string) {
    return this.favoritesService.favoritar(user.sub, user.tenantId as string, conteudoId);
  }

  @Delete(':conteudoId')
  @HttpCode(HttpStatus.NO_CONTENT)
  desfavoritar(@CurrentUser() user: JwtPayload, @Param('conteudoId', ParseUUIDPipe) conteudoId: string) {
    return this.favoritesService.desfavoritar(user.sub, user.tenantId as string, conteudoId);
  }
}
