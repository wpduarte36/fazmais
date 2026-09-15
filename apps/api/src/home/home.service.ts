import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  assertConteudoVisivel,
  conteudoVisivelWhere,
} from '../common/conteudo-visibility.util';

@Injectable()
export class HomeService {
  constructor(private readonly prisma: PrismaService) {}

  async getFeed(userId: string, tenantId: string) {
    // Filtro do que esse professor pode enxergar (tenant + catálogos
    // ativados + nível de plano, rascunho de fora) — mesma regra que
    // assertConteudoVisivel aplica nas rotas de escrita.
    const conteudos = await this.prisma.conteudo.findMany({
      where: await conteudoVisivelWhere(this.prisma, userId, tenantId),
      include: {
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
    const ratingByConteudoId = new Map(
      ratings.map((r) => [r.conteudoId, r.score]),
    );

    const progressos = await this.prisma.progress.findMany({
      where: { userId },
      select: {
        conteudoId: true,
        progressPercent: true,
        lastPosition: true,
        updatedAt: true,
      },
    });
    const progressByConteudoId = new Map(
      progressos.map((p) => [p.conteudoId, p]),
    );

    const toSummary = (conteudo: (typeof conteudos)[number]) => ({
      id: conteudo.id,
      colecaoId: conteudo.colecaoId,
      title: conteudo.title,
      description: conteudo.description,
      mediaType: conteudo.mediaType,
      mediaUrl: conteudo.mediaUrl,
      htmlContent: conteudo.htmlContent,
      imageUrl: conteudo.imageUrl,
      bannerImageUrl: conteudo.bannerImageUrl,
      isFeatured: conteudo.isFeatured,
      tags: conteudo.tags,
      aiSummary: conteudo.aiSummary,
      durationSeconds: conteudo.durationSeconds,
      pageCount: conteudo.pageCount,
      downloadUrl: conteudo.downloadUrl,
      externalUrl: conteudo.externalUrl,
      sourceName: conteudo.sourceName,
      planoMinimoId: conteudo.planoMinimoId,
      isFavorito: favoritoIds.has(conteudo.id),
      myRating: ratingByConteudoId.get(conteudo.id) ?? null,
      viewCount: conteudo.viewCount,
      progressPercent:
        progressByConteudoId.get(conteudo.id)?.progressPercent ?? 0,
      lastPosition: progressByConteudoId.get(conteudo.id)?.lastPosition ?? 0,
      createdAt: conteudo.createdAt,
    });

    const rowsByColecao = new Map<
      string,
      {
        eixoId: string;
        eixoName: string;
        eixoDescription: string | null;
        eixoOrdem: number;
        colecaoId: string;
        colecaoName: string;
        colecaoOrdem: number;
        conteudos: ReturnType<typeof toSummary>[];
      }
    >();
    for (const conteudo of conteudos) {
      const row = rowsByColecao.get(conteudo.colecaoId) ?? {
        eixoId: conteudo.colecao.eixo.id,
        eixoName: conteudo.colecao.eixo.name,
        eixoDescription: conteudo.colecao.eixo.description,
        eixoOrdem: conteudo.colecao.eixo.ordem,
        colecaoId: conteudo.colecaoId,
        colecaoName: conteudo.colecao.name,
        colecaoOrdem: conteudo.colecao.ordem,
        conteudos: [],
      };
      row.conteudos.push(toSummary(conteudo));
      rowsByColecao.set(conteudo.colecaoId, row);
    }
    const ordemByConteudoId = new Map(conteudos.map((c) => [c.id, c.ordem]));
    for (const row of rowsByColecao.values()) {
      row.conteudos.sort(
        (a, b) =>
          (ordemByConteudoId.get(a.id) ?? 0) -
          (ordemByConteudoId.get(b.id) ?? 0),
      );
    }
    const rows = Array.from(rowsByColecao.values()).sort(
      (a, b) => a.eixoOrdem - b.eixoOrdem || a.colecaoOrdem - b.colecaoOrdem,
    );

    const featuredMarcados = conteudos.filter((c) => c.isFeatured);
    const featuredSource =
      featuredMarcados.length > 0 ? featuredMarcados : conteudos.slice(0, 1);

    const populares = [...conteudos]
      .filter((c) => c.viewCount > 0)
      .sort((a, b) => b.viewCount - a.viewCount)
      .slice(0, 10)
      .map(toSummary);

    // `conteudos` já vem ordenado por createdAt desc (orderBy da query
    // principal), então os primeiros já são os mais recentes. APP fica de
    // fora — é só um atalho pra loja, sem "conteúdo" pra destacar aqui.
    const recentes = conteudos
      .filter((c) => c.mediaType !== 'APP')
      .slice(0, 10)
      .map(toSummary);

    const continuarAssistindo = [...conteudos]
      .filter((c) => {
        const progresso = progressByConteudoId.get(c.id);
        return (
          progresso &&
          progresso.progressPercent > 0 &&
          progresso.progressPercent < 100
        );
      })
      .sort((a, b) => {
        const atualizadoA = progressByConteudoId.get(a.id)!.updatedAt.getTime();
        const atualizadoB = progressByConteudoId.get(b.id)!.updatedAt.getTime();
        return atualizadoB - atualizadoA;
      })
      .slice(0, 10)
      .map(toSummary);

    // Sem motor de recomendação de verdade: usa como sinal de interesse os
    // Eixos onde o professor já se engajou (favoritou, avaliou bem, ou tem
    // progresso), recomendando o resto desses Eixos que ele ainda não tocou.
    // Sem nenhum sinal (cold start), cai pra conteúdo novo ainda não visto.
    const eixoIdsDeInteresse = new Set<string>();
    for (const c of conteudos) {
      const favoritado = favoritoIds.has(c.id);
      const bemAvaliado = (ratingByConteudoId.get(c.id) ?? 0) >= 4;
      const progresso = progressByConteudoId.get(c.id);
      const engajado =
        favoritado ||
        bemAvaliado ||
        (progresso && progresso.progressPercent > 0);
      if (engajado) {
        eixoIdsDeInteresse.add(c.colecao.eixo.id);
      }
    }

    const jaEngajado = new Set([
      ...favoritoIds,
      ...ratingByConteudoId.keys(),
      ...progressByConteudoId.keys(),
    ]);

    // App é só um atalho pra loja, sem "conteúdo" pra recomendar — mesma
    // regra de exclusão usada em `recentes`.
    let recomendadosSource = conteudos.filter(
      (c) =>
        c.mediaType !== 'APP' &&
        eixoIdsDeInteresse.has(c.colecao.eixo.id) &&
        !jaEngajado.has(c.id),
    );
    if (recomendadosSource.length === 0) {
      recomendadosSource = conteudos.filter(
        (c) => c.mediaType !== 'APP' && !jaEngajado.has(c.id),
      );
    }

    const recomendados = recomendadosSource
      .sort(
        (a, b) =>
          b.viewCount - a.viewCount ||
          b.createdAt.getTime() - a.createdAt.getTime(),
      )
      .slice(0, 10)
      .map(toSummary);

    return {
      featured: featuredSource.slice(0, 5).map(toSummary),
      populares,
      recentes,
      continuarAssistindo,
      recomendados,
      rows,
    };
  }

  // PDF/Artigo não têm um sinal real de "quanto foi consumido" (PDF é um
  // iframe sem contagem de página; Artigo muitas vezes é só um link externo)
  // — decisão do usuário foi tratar "abrir = concluído" pra esses dois tipos,
  // só o vídeo reporta progresso real via ProgressController (player do Vimeo).
  async registrarView(
    conteudoId: string,
    userId: string,
    tenantId: string,
  ): Promise<void> {
    await assertConteudoVisivel(this.prisma, userId, tenantId, conteudoId);
    const conteudo = await this.prisma.conteudo.findUniqueOrThrow({
      where: { id: conteudoId },
      select: { mediaType: true },
    });
    await this.prisma.conteudo.update({
      where: { id: conteudoId },
      data: { viewCount: { increment: 1 } },
    });

    if (conteudo.mediaType === 'PDF' || conteudo.mediaType === 'ARTIGO') {
      await this.prisma.progress.upsert({
        where: { userId_conteudoId: { userId, conteudoId } },
        update: { progressPercent: 100, lastPosition: 0 },
        create: {
          userId,
          conteudoId,
          tenantId,
          progressPercent: 100,
          lastPosition: 0,
        },
      });
    }
  }
}
