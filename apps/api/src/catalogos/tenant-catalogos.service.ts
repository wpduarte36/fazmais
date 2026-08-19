import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class TenantCatalogosService {
  constructor(private readonly prisma: PrismaService) {}

  async listDisponiveis(tenantId: string) {
    const catalogos = await this.prisma.catalogo.findMany({
      where: { tenantId: null },
      orderBy: { name: 'asc' },
      include: {
        eixos: {
          select: {
            id: true,
            colecoes: { select: { id: true, _count: { select: { conteudos: true } } } },
          },
        },
        tenantAccess: { where: { tenantId }, select: { id: true } },
      },
    });

    return catalogos.map((catalogo) => {
      const colecoes = catalogo.eixos.flatMap((eixo) => eixo.colecoes);
      const conteudosCount = colecoes.reduce(
        (sum, colecao) => sum + colecao._count.conteudos,
        0,
      );
      return {
        id: catalogo.id,
        name: catalogo.name,
        icon: catalogo.icon,
        eixosCount: catalogo.eixos.length,
        colecoesCount: colecoes.length,
        conteudosCount,
        ativo: catalogo.tenantAccess.length > 0,
      };
    });
  }

  async ativar(tenantId: string, catalogoId: string): Promise<void> {
    const catalogo = await this.prisma.catalogo.findFirst({
      where: { id: catalogoId, tenantId: null },
    });
    if (!catalogo) {
      throw new NotFoundException('Catálogo não encontrado');
    }
    await this.prisma.tenantCatalogoAccess.upsert({
      where: { tenantId_catalogoId: { tenantId, catalogoId } },
      update: {},
      create: { tenantId, catalogoId },
    });
  }

  async desativar(tenantId: string, catalogoId: string): Promise<void> {
    await this.prisma.tenantCatalogoAccess.deleteMany({
      where: { tenantId, catalogoId },
    });
  }
}
