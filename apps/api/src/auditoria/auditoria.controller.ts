import { Controller, Get, ParseIntPipe, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { AuditoriaService } from './auditoria.service';

@Controller('auditoria')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('MASTER')
export class AuditoriaController {
  constructor(private readonly auditoriaService: AuditoriaService) {}

  @Get()
  listar(
    @Query('tenantId') tenantId?: string,
    @Query('cursor') cursor?: string,
    @Query('limite', new ParseIntPipe({ optional: true })) limite?: number,
  ) {
    return this.auditoriaService.listar({ tenantId, cursor, limite });
  }
}
