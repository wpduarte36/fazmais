import {
  Body,
  Controller,
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
import { RatingsService } from './ratings.service';
import { AvaliarDto } from './dto/avaliar.dto';

@Controller('ratings')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('PROFESSOR')
export class RatingsController {
  constructor(private readonly ratingsService: RatingsService) {}

  @Post(':conteudoId')
  @HttpCode(HttpStatus.NO_CONTENT)
  avaliar(
    @CurrentUser() user: JwtPayload,
    @Param('conteudoId', ParseUUIDPipe) conteudoId: string,
    @Body() dto: AvaliarDto,
  ) {
    return this.ratingsService.avaliar(user.sub, user.tenantId as string, conteudoId, dto.score);
  }
}
