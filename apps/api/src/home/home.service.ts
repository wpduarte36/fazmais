import { Injectable, NotFoundException } from '@nestjs/common';
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

    const favoritos = await this.prisma.favorite.findMany({
      where: { userId },
      select: { conteudoId: true },
    });
    const favoritoIds = new Set(favoritos.map((f) => f.conteudoId));

    const ratings = await this.prisma.rating.findMany({
      where: { userId },
      select: { conteudoId: true, score: true },
    });
    const ratingByConteudoId = new Map(ratings.map((r) => [r.conteudoId, r.score]));

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
      externalUrl: conteudo.externalUrl,
      sourceName: conteudo.sourceName,
      planoIds: conteudo.planos.map((p) => p.planoId),
      isFavorito: favoritoIds.has(conteudo.id),
      myRating: ratingByConteudoId.get(conteudo.id) ?? null,
      viewCount: conteudo.viewCount,
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

    const populares = [...conteudos]
      .filter((c) => c.viewCount > 0)
      .sort((a, b) => b.viewCount - a.viewCount)
      .slice(0, 10)
      .map(toSummary);

    return {
      featured: featuredSource ? toSummary(featuredSource) : null,
      populares,
      rows: Array.from(rowsByColecao.values()),
    };
  }

  async registrarView(conteudoId: string): Promise<void> {
    const conteudo = await this.prisma.conteudo.findUnique({
      where: { id: conteudoId },
    });
    if (!conteudo) {
      throw new NotFoundException('Conteúdo não encontrado');
    }
    await this.prisma.conteudo.update({
      where: { id: conteudoId },
      data: { viewCount: { increment: 1 } },
    });
  }
}
