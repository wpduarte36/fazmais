import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { EixoDto } from './dto/eixo.dto';
import { ReorderColecoesDto } from './dto/reorder-colecoes.dto';

@Injectable()
export class EixosService {
  constructor(private readonly prisma: PrismaService) {}

  async create(catalogoId: string, dto: EixoDto) {
    const catalogo = await this.prisma.catalogo.findFirst({
      where: { id: catalogoId, tenantId: null },
    });
    if (!catalogo) {
      throw new NotFoundException('Catálogo não encontrado');
    }
    const ordem = await this.prisma.eixo.count({ where: { catalogoId } });
    return this.prisma.eixo.create({
      data: {
        catalogoId,
        tenantId: catalogo.tenantId,
        name: dto.name,
        description: dto.description,
        ordem,
      },
    });
  }

  async update(id: string, dto: EixoDto) {
    await this.findOrThrow(id);
    return this.prisma.eixo.update({
      where: { id },
      data: { name: dto.name, description: dto.description },
    });
  }

  async remove(id: string): Promise<void> {
    await this.findOrThrow(id);
    await this.prisma.eixo.delete({ where: { id } });
  }

  // Recebe a lista de ids de coleção na ordem final desejada e persiste o
  // índice de cada uma como `ordem`. Confere que todo id pertence mesmo a
  // esse eixo antes de gravar — evita que um id de outro eixo (ou lixo)
  // bagunce a ordem de coleções que não deveriam ser tocadas.
  async reorderColecoes(eixoId: string, dto: ReorderColecoesDto) {
    await this.findOrThrow(eixoId);
    const colecoes = await this.prisma.colecao.findMany({
      where: { eixoId },
      select: { id: true },
    });
    const idsValidos = new Set(colecoes.map((c) => c.id));
    const idsRecebidos = new Set(dto.colecaoIds);
    if (
      dto.colecaoIds.length !== idsValidos.size ||
      dto.colecaoIds.some((id) => !idsValidos.has(id)) ||
      idsValidos.size !== idsRecebidos.size
    ) {
      throw new BadRequestException(
        'A lista precisa conter exatamente as coleções desse eixo, sem repetir nem faltar nenhuma.',
      );
    }

    await this.prisma.$transaction(
      dto.colecaoIds.map((id, index) =>
        this.prisma.colecao.update({ where: { id }, data: { ordem: index } }),
      ),
    );
  }

  // Mesmo racional de ColecoesService.findOrThrow: restringe a catálogos
  // globais, consistente com o check que create() já faz.
  private async findOrThrow(id: string) {
    const eixo = await this.prisma.eixo.findFirst({
      where: { id, tenantId: null },
    });
    if (!eixo) {
      throw new NotFoundException('Eixo não encontrado');
    }
    return eixo;
  }
}
