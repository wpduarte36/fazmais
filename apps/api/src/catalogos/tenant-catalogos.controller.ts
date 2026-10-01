import {
  Controller,
  Delete,
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
import { PrismaService } from '../prisma/prisma.service';
import { resolverTenantAlvo } from '../common/tenant-alvo.util';
import { AuditoriaService } from '../auditoria/auditoria.service';
import { TenantCatalogosService } from './tenant-catalogos.service';

@Controller('tenant-catalogos')
@UseGuards(JwtAuthGuard, RolesGuard)
// MASTER entra pela "Área do Admin" (aba Municípios), informando o
// município via ?tenantId= — ver resolverTenantAlvo.
@Roles('ADMIN', 'MASTER')
export class TenantCatalogosController {
  constructor(
    private readonly tenantCatalogosService: TenantCatalogosService,
    private readonly prisma: PrismaService,
    private readonly auditoria: AuditoriaService,
  ) {}

  @Get()
  async list(@CurrentUser() user: JwtPayload, @Query('tenantId') tenantId?: string) {
    const alvo = await resolverTenantAlvo(this.prisma, user, tenantId);
    await this.auditoria.registrarAcessoPainel(user, alvo);
    return this.tenantCatalogosService.listDisponiveis(alvo);
  }

  @Post(':catalogoId')
  @HttpCode(HttpStatus.NO_CONTENT)
  async ativar(
    @CurrentUser() user: JwtPayload,
    @Param('catalogoId', ParseUUIDPipe) catalogoId: string,
    @Query('tenantId') tenantId?: string,
  ) {
    const alvo = await resolverTenantAlvo(this.prisma, user, tenantId);
    await this.tenantCatalogosService.ativar(alvo, catalogoId);
    await this.registrarCatalogo(user, alvo, catalogoId, 'CATALOGO_ATIVADO', 'Ativou');
  }

  @Delete(':catalogoId')
  @HttpCode(HttpStatus.NO_CONTENT)
  async desativar(
    @CurrentUser() user: JwtPayload,
    @Param('catalogoId', ParseUUIDPipe) catalogoId: string,
    @Query('tenantId') tenantId?: string,
  ) {
    const alvo = await resolverTenantAlvo(this.prisma, user, tenantId);
    await this.tenantCatalogosService.desativar(alvo, catalogoId);
    await this.registrarCatalogo(user, alvo, catalogoId, 'CATALOGO_DESATIVADO', 'Desativou');
  }

  private async registrarCatalogo(
    user: JwtPayload,
    tenantId: string,
    catalogoId: string,
    acao: 'CATALOGO_ATIVADO' | 'CATALOGO_DESATIVADO',
    verbo: string,
  ) {
    if (user.role !== 'MASTER') return;
    const catalogo = await this.prisma.catalogo.findUnique({ where: { id: catalogoId }, select: { name: true } });
    await this.auditoria.registrar(user, {
      tenantId,
      acao,
      descricao: `${verbo} o catálogo ${catalogo?.name ?? catalogoId} no município`,
      detalhes: { catalogoId },
    });
  }
}
