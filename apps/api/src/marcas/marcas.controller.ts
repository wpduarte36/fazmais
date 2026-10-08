import { Body, Controller, Get, Param, ParseUUIDPipe, Patch, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { JwtPayload } from '../auth/strategies/jwt.strategy';
import { AuditoriaService } from '../auditoria/auditoria.service';
import { UpdateMarcaDto } from './dto/update-marca.dto';
import { CreateMarcaDto } from './dto/create-marca.dto';
import { MarcasService } from './marcas.service';

const CAMPOS_AUDITADOS = ['nomeExibicao', 'nomeAssistente', 'corPrimaria', 'logoUrl', 'iconeUrl', 'assistenteImagemUrl', 'assistenteAvatarUrl', 'dominios'] as const;

// Gestão de empresas: só Master. A rota pública (/marcas/atual) fica no
// MarcasPublicoController.
@Controller('marcas')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('MASTER')
export class MarcasController {
  constructor(
    private readonly marcasService: MarcasService,
    private readonly auditoria: AuditoriaService,
  ) {}

  @Get()
  listar() {
    return this.marcasService.listar();
  }

  @Post()
  async criar(@CurrentUser() user: JwtPayload, @Body() dto: CreateMarcaDto) {
    const marca = await this.marcasService.criar(dto);
    await this.auditoria.registrar(user, {
      tenantId: null,
      acao: 'MARCA_CRIADA',
      descricao: `Criou a empresa ${marca.nomeExibicao}`,
      detalhes: { marcaId: marca.id, slug: marca.slug },
    });
    return marca;
  }

  @Patch(':id')
  async atualizar(@CurrentUser() user: JwtPayload, @Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdateMarcaDto) {
    const { anterior, atualizada } = await this.marcasService.atualizar(id, dto);
    const alteracoes: Record<string, unknown> = {};
    for (const campo of CAMPOS_AUDITADOS) {
      if (JSON.stringify(anterior[campo]) !== JSON.stringify(atualizada[campo])) {
        alteracoes[campo] = Array.isArray(atualizada[campo]) ? atualizada[campo].join(', ') : atualizada[campo];
      }
    }
    if (Object.keys(alteracoes).length > 0) {
      await this.auditoria.registrar(user, {
        tenantId: null,
        acao: 'MARCA_ALTERADA',
        descricao: `Alterou a empresa ${atualizada.nomeExibicao}`,
        detalhes: { marcaId: id, alteracoes: alteracoes as Record<string, string | null> },
      });
    }
    return atualizada;
  }
}
