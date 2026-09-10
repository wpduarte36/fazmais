import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { NameOnlyDto } from './dto/name-only.dto';
import { ReorderConteudosDto } from './dto/reorder-conteudos.dto';

@Injectable()
export class ColecoesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(eixoId: string, dto: NameOnlyDto) {
    const eixo = await this.prisma.eixo.findFirst({
      where: { id: eixoId, tenantId: null },
    });
    if (!eixo) {
      throw new NotFoundException('Eixo não encontrado');
    }
    const ordem = await this.prisma.colecao.count({ where: { eixoId } });
    return this.prisma.colecao.create({
      data: { eixoId, tenantId: eixo.tenantId, name: dto.name, ordem },
    });
  }

  async update(id: string, dto: NameOnlyDto) {
    await this.findOrThrow(id);
    return this.prisma.colecao.update({
      where: { id },
      data: { name: dto.name },
    });
  }

  async remove(id: string): Promise<void> {
    await this.findOrThrow(id);
    await this.prisma.colecao.delete({ where: { id } });
  }

  // Mesmo racional de EixosService.reorderColecoes: recebe a lista de ids de
  // conteúdo na ordem final desejada e persiste o índice de cada um como
  // `ordem`. Confere que todo id pertence mesmo a essa coleção antes de
  // gravar.
  async reorderConteudos(colecaoId: string, dto: ReorderConteudosDto) {
    await this.findOrThrow(colecaoId);
    const conteudos = await this.prisma.conteudo.findMany({
      where: { colecaoId },
      select: { id: true },
    });
    const idsValidos = new Set(conteudos.map((c) => c.id));
    const idsRecebidos = new Set(dto.conteudoIds);
    if (
      dto.conteudoIds.length !== idsValidos.size ||
      dto.conteudoIds.some((id) => !idsValidos.has(id)) ||
      idsValidos.size !== idsRecebidos.size
    ) {
      throw new BadRequestException(
        'A lista precisa conter exatamente os conteúdos dessa coleção, sem repetir nem faltar nenhum.',
      );
    }

    await this.prisma.$transaction(
      dto.conteudoIds.map((id, index) =>
        this.prisma.conteudo.update({ where: { id }, data: { ordem: index } }),
      ),
    );
  }

  // tenantId: null restringe a catálogos globais — hoje o único tipo
  // alcançável por essas rotas (@Roles('MASTER')). Mantém update/remove
  // consistentes com o check que create() já fazia via o Eixo pai, pra não
  // silenciosamente aceitar um id de coleção de tenant se isso um dia
  // existir.
  private async findOrThrow(id: string) {
    const colecao = await this.prisma.colecao.findFirst({
      where: { id, tenantId: null },
    });
    if (!colecao) {
      throw new NotFoundException('Coleção não encontrada');
    }
    return colecao;
  }
}
