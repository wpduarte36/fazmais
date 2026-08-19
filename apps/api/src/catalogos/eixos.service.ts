import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { EixoDto } from './dto/eixo.dto';

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
    return this.prisma.eixo.create({
      data: {
        catalogoId,
        tenantId: catalogo.tenantId,
        name: dto.name,
        description: dto.description,
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
