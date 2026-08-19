import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class HomeService {
  constructor(private readonly prisma: PrismaService) {}

  async getFeed(userId: string, tenantId: string) {
    const user = await this.prisma.user.findUniqueOrThrow({
      where: { id: userId },
      select: { planoId: true },
    });

    const access = await this.prisma.tenantCatalogoAccess.findMany({
      where: { tenantId },
      select: { catalogoId: true },
    });
    const catalogosAtivados = access.map((a) => a.catalogoId);

    const conteudos = await this.prisma.conteudo.findMany({
      where: {
        OR: [
          { tenantId },
          {
            tenantId: null,
            colecao: { eixo: { catalogoId: { in: catalogosAtivados } } },
          },
        ],
        ...(user.planoId
          ? {
              OR: [
                { planos: { none: {} } },
                { planos: { some: { planoId: user.planoId } } },
              ],
            }
          : {}),
      },
      include: {
        planos: { select: { planoId: true } },
        colecao: { include: { eixo: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    const toSummary = (conteudo: (typeof conteudos)[number]) => ({
      id: conteudo.id,
      colecaoId: conteudo.colecaoId,
      title: conteudo.title,
      description: conteudo.description,
      mediaType: conteudo.mediaType,
      mediaUrl: conteudo.mediaUrl,
      htmlContent: conteudo.htmlContent,
      imageUrl: conteudo.imageUrl,
      isFeatured: conteudo.isFeatured,
      tags: conteudo.tags,
      aiSummary: conteudo.aiSummary,
      durationSeconds: conteudo.durationSeconds,
      pageCount: conteudo.pageCount,
      downloadUrl: conteudo.downloadUrl,
      planoIds: conteudo.planos.map((p) => p.planoId),
      createdAt: conteudo.createdAt,
    });

    const rowsByColecao = new Map<
      string,
      { eixoId: string; eixoName: string; colecaoId: string; colecaoName: string; conteudos: ReturnType<typeof toSummary>[] }
    >();
    for (const conteudo of conteudos) {
      const row = rowsByColecao.get(conteudo.colecaoId) ?? {
        eixoId: conteudo.colecao.eixo.id,
        eixoName: conteudo.colecao.eixo.name,
        colecaoId: conteudo.colecaoId,
        colecaoName: conteudo.colecao.name,
        conteudos: [],
      };
      row.conteudos.push(toSummary(conteudo));
      rowsByColecao.set(conteudo.colecaoId, row);
    }

    const featuredSource = conteudos.find((c) => c.isFeatured) ?? conteudos[0] ?? null;

    return {
      featured: featuredSource ? toSummary(featuredSource) : null,
      rows: Array.from(rowsByColecao.values()),
    };
  }
}
