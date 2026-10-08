import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { JwtPayload } from '../auth/strategies/jwt.strategy';
import { PrismaService } from '../prisma/prisma.service';
import { AuditoriaService } from '../auditoria/auditoria.service';
import { TenantsService } from './tenants.service';
import { CreateTenantDto } from './dto/create-tenant.dto';
import { UpdateTenantDto } from './dto/update-tenant.dto';
import { CreateAdminDto } from './dto/create-admin.dto';
import { UpdateAdminDto } from './dto/update-admin.dto';

@Controller('tenants')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('MASTER')
export class TenantsController {
  constructor(
    private readonly tenantsService: TenantsService,
    private readonly prisma: PrismaService,
    private readonly auditoria: AuditoriaService,
  ) {}

  @Get()
  list() {
    return this.tenantsService.list();
  }

  @Post()
  async create(@CurrentUser() user: JwtPayload, @Body() dto: CreateTenantDto) {
    const tenant = await this.tenantsService.create(dto);
    await this.auditoria.registrar(user, {
      tenantId: tenant.id,
      acao: 'MUNICIPIO_CRIADO',
      descricao: `Criou o município ${tenant.name}`,
    });
    return tenant;
  }

  @Patch(':id')
  async update(@CurrentUser() user: JwtPayload, @Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdateTenantDto) {
    const anterior = await this.prisma.tenant.findUnique({ where: { id }, select: { name: true, marcaId: true } });
    const tenant = await this.tenantsService.update(id, dto);
    // Na trilha vai o nome da marca (o id não diz nada pra quem lê), e só se mudou.
    const { marcaId, ...alteracoes } = dto;
    if (marcaId !== undefined && marcaId !== anterior?.marcaId) {
      const marca = marcaId ? await this.prisma.marca.findUnique({ where: { id: marcaId }, select: { nomeExibicao: true } }) : null;
      Object.assign(alteracoes, { marca: marca?.nomeExibicao ?? 'padrão' });
    }
    await this.auditoria.registrar(user, {
      tenantId: id,
      acao: 'MUNICIPIO_ALTERADO',
      descricao:
        anterior && anterior.name !== tenant.name
          ? `Renomeou o município ${anterior.name} para ${tenant.name}`
          : `Alterou o município ${tenant.name}`,
      detalhes: { alteracoes },
    });
    return tenant;
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@CurrentUser() user: JwtPayload, @Param('id', ParseUUIDPipe) id: string) {
    const excluido = await this.prisma.tenant.findUnique({ where: { id }, select: { name: true } });
    await this.tenantsService.remove(id);
    await this.auditoria.registrar(user, {
      tenantId: id,
      tenantNameFallback: excluido?.name,
      acao: 'MUNICIPIO_EXCLUIDO',
      descricao: `Excluiu o município ${excluido?.name}`,
    });
  }

  @Get(':id/admins')
  listAdmins(@Param('id', ParseUUIDPipe) id: string) {
    return this.tenantsService.listAdmins(id);
  }

  @Post(':id/admins')
  async createAdmin(@CurrentUser() user: JwtPayload, @Param('id', ParseUUIDPipe) id: string, @Body() dto: CreateAdminDto) {
    const admin = await this.tenantsService.createAdmin(id, dto);
    await this.auditoria.registrar(user, {
      tenantId: id,
      acao: 'ADMIN_CRIADO',
      descricao: `Criou o admin ${admin.name} (${admin.login})`,
      detalhes: { userId: admin.id, email: admin.email },
    });
    return admin;
  }

  @Patch(':id/admins/:userId')
  async updateAdmin(
    @CurrentUser() user: JwtPayload,
    @Param('id', ParseUUIDPipe) id: string,
    @Param('userId', ParseUUIDPipe) userId: string,
    @Body() dto: UpdateAdminDto,
  ) {
    const admin = await this.tenantsService.updateAdmin(id, userId, dto);
    await this.auditoria.registrar(user, {
      tenantId: id,
      acao: 'ADMIN_ALTERADO',
      descricao: `Alterou o admin ${admin.name} (${admin.login})`,
      detalhes: { userId, alteracoes: { ...dto } },
    });
    return admin;
  }

  @Delete(':id/admins/:userId')
  @HttpCode(HttpStatus.NO_CONTENT)
  async removeAdmin(
    @CurrentUser() user: JwtPayload,
    @Param('id', ParseUUIDPipe) id: string,
    @Param('userId', ParseUUIDPipe) userId: string,
  ) {
    // Lido antes: depois do delete não há mais nome pra pôr no registro.
    const excluido = await this.prisma.user.findFirst({
      where: { id: userId, tenantId: id, role: 'ADMIN' },
      select: { name: true, login: true },
    });
    await this.tenantsService.removeAdmin(id, userId);
    await this.auditoria.registrar(user, {
      tenantId: id,
      acao: 'ADMIN_EXCLUIDO',
      descricao: `Excluiu o admin ${excluido?.name} (${excluido?.login})`,
      detalhes: { userId },
    });
  }
}
