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
import { ProgressService } from './progress.service';
import { AtualizarProgressoDto } from './dto/atualizar-progresso.dto';

@Controller('progress')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('PROFESSOR')
export class ProgressController {
  constructor(private readonly progressService: ProgressService) {}

  @Post(':conteudoId')
  @HttpCode(HttpStatus.NO_CONTENT)
  atualizar(
    @CurrentUser() user: JwtPayload,
    @Param('conteudoId', ParseUUIDPipe) conteudoId: string,
    @Body() dto: AtualizarProgressoDto,
  ) {
    return this.progressService.atualizar(
      user.sub,
      user.tenantId as string,
      conteudoId,
      dto.progressPercent,
      dto.lastPosition ?? 0,
    );
  }
}
