import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { NameOnlyDto } from './dto/name-only.dto';

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
    return this.prisma.colecao.create({
      data: { eixoId, tenantId: eixo.tenantId, name: dto.name },
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
