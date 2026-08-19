import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { NameOnlyDto } from './dto/name-only.dto';

@Injectable()
export class EixosService {
  constructor(private readonly prisma: PrismaService) {}

  async create(catalogoId: string, dto: NameOnlyDto) {
    const catalogo = await this.prisma.catalogo.findFirst({
      where: { id: catalogoId, tenantId: null },
    });
    if (!catalogo) {
      throw new NotFoundException('Catálogo não encontrado');
    }
    return this.prisma.eixo.create({
      data: { catalogoId, tenantId: catalogo.tenantId, name: dto.name },
    });
  }

  async update(id: string, dto: NameOnlyDto) {
    await this.findOrThrow(id);
    return this.prisma.eixo.update({ where: { id }, data: { name: dto.name } });
  }

  async remove(id: string): Promise<void> {
    await this.findOrThrow(id);
    await this.prisma.eixo.delete({ where: { id } });
  }

  private async findOrThrow(id: string) {
    const eixo = await this.prisma.eixo.findUnique({ where: { id } });
    if (!eixo) {
      throw new NotFoundException('Eixo não encontrado');
    }
    return eixo;
  }
}
