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
import { AuditoriaService, ROLE_LABEL } from '../auditoria/auditoria.service';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
// MASTER entra pela "Área do Admin" (aba Municípios), informando o
// município via ?tenantId= — ver resolverTenantAlvo.
@Roles('ADMIN', 'MASTER')
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly prisma: PrismaService,
    private readonly auditoria: AuditoriaService,
  ) {}

  // Ações do Master aqui ("Área do Admin") vão pra trilha de auditoria;
  // as do próprio Admin não (AuditoriaService.registrar ignora quem não é Master).

  @Get()
  async list(@CurrentUser() user: JwtPayload, @Query('tenantId') tenantId?: string) {
    const alvo = await resolverTenantAlvo(this.prisma, user, tenantId);
    await this.auditoria.registrarAcessoPainel(user, alvo);
    return this.usersService.list(alvo);
  }

  @Get('stats')
  async stats(@CurrentUser() user: JwtPayload, @Query('tenantId') tenantId?: string) {
    return this.usersService.stats(await resolverTenantAlvo(this.prisma, user, tenantId));
  }

  @Post()
  async create(
    @CurrentUser() user: JwtPayload,
    @Body() dto: CreateUserDto,
    @Query('tenantId') tenantId?: string,
  ) {
    const alvo = await resolverTenantAlvo(this.prisma, user, tenantId);
    const criado = await this.usersService.create(alvo, dto);
    await this.auditoria.registrar(user, {
      tenantId: alvo,
      acao: 'USUARIO_CRIADO',
      descricao: `Criou o usuário ${criado.name} (${criado.login}) · ${ROLE_LABEL[criado.role]}`,
      detalhes: { userId: criado.id, email: criado.email, planoName: criado.planoName },
    });
    return criado;
  }

  @Patch(':id')
  async update(
    @CurrentUser() user: JwtPayload,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateUserDto,
    @Query('tenantId') tenantId?: string,
  ) {
    const alvo = await resolverTenantAlvo(this.prisma, user, tenantId);
    const atualizado = await this.usersService.update(alvo, user.sub, id, dto);
    await this.auditoria.registrar(user, {
      tenantId: alvo,
      acao: 'USUARIO_ALTERADO',
      descricao: `Alterou o usuário ${atualizado.name} (${atualizado.login})`,
      detalhes: { userId: id, alteracoes: { ...dto } },
    });
    return atualizado;
  }

  @Post(':id/reset-password')
  async resetPassword(
    @CurrentUser() user: JwtPayload,
    @Param('id', ParseUUIDPipe) id: string,
    @Query('tenantId') tenantId?: string,
  ) {
    const alvo = await resolverTenantAlvo(this.prisma, user, tenantId);
    const resultado = await this.usersService.resetPassword(alvo, id);
    if (user.role === 'MASTER') {
      const resetado = await this.prisma.user.findUnique({ where: { id }, select: { name: true, login: true } });
      await this.auditoria.registrar(user, {
        tenantId: alvo,
        acao: 'USUARIO_SENHA_RESETADA',
        descricao: `Gerou link de redefinição de senha para ${resetado?.name} (${resetado?.login})`,
        detalhes: { userId: id },
      });
    }
    return resultado;
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(
    @CurrentUser() user: JwtPayload,
    @Param('id', ParseUUIDPipe) id: string,
    @Query('tenantId') tenantId?: string,
  ) {
    const alvo = await resolverTenantAlvo(this.prisma, user, tenantId);
    // Lido antes: depois do delete não há mais nome pra pôr no registro.
    const excluido =
      user.role === 'MASTER'
        ? await this.prisma.user.findFirst({
            where: { id, tenantId: alvo },
            select: { name: true, login: true, role: true },
          })
        : null;
    await this.usersService.remove(alvo, user.sub, id);
    await this.auditoria.registrar(user, {
      tenantId: alvo,
      acao: 'USUARIO_EXCLUIDO',
      descricao: `Excluiu o usuário ${excluido?.name} (${excluido?.login}) · ${ROLE_LABEL[excluido?.role ?? ''] ?? ''}`,
      detalhes: { userId: id },
    });
  }
}
