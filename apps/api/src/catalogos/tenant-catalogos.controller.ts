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
import { TenantCatalogosService } from './tenant-catalogos.service';

@Controller('tenant-catalogos')
@UseGuards(JwtAuthGuard, RolesGuard)
// MASTER entra pelo "Acessar como admin" (aba Municípios), informando o
// município via ?tenantId= — ver resolverTenantAlvo.
@Roles('ADMIN', 'MASTER')
export class TenantCatalogosController {
  constructor(
    private readonly tenantCatalogosService: TenantCatalogosService,
    private readonly prisma: PrismaService,
  ) {}

  @Get()
  async list(@CurrentUser() user: JwtPayload, @Query('tenantId') tenantId?: string) {
    return this.tenantCatalogosService.listDisponiveis(await resolverTenantAlvo(this.prisma, user, tenantId));
  }

  @Post(':catalogoId')
  @HttpCode(HttpStatus.NO_CONTENT)
  async ativar(
    @CurrentUser() user: JwtPayload,
    @Param('catalogoId', ParseUUIDPipe) catalogoId: string,
    @Query('tenantId') tenantId?: string,
  ) {
    return this.tenantCatalogosService.ativar(await resolverTenantAlvo(this.prisma, user, tenantId), catalogoId);
  }

  @Delete(':catalogoId')
  @HttpCode(HttpStatus.NO_CONTENT)
  async desativar(
    @CurrentUser() user: JwtPayload,
    @Param('catalogoId', ParseUUIDPipe) catalogoId: string,
    @Query('tenantId') tenantId?: string,
  ) {
    return this.tenantCatalogosService.desativar(await resolverTenantAlvo(this.prisma, user, tenantId), catalogoId);
  }
}
