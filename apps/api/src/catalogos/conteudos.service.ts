import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateConteudoDto } from './dto/create-conteudo.dto';
import { UpdateConteudoDto } from './dto/update-conteudo.dto';
import { MoveConteudoDto } from './dto/move-conteudo.dto';
import { AiSuggestDto } from './dto/ai-suggest.dto';

@Injectable()
export class ConteudosService {
  constructor(private readonly prisma: PrismaService) {}

  async create(colecaoId: string, dto: CreateConteudoDto) {
    const colecao = await this.prisma.colecao.findFirst({
      where: { id: colecaoId, tenantId: null },
    });
    if (!colecao) {
      throw new NotFoundException('Coleção não encontrada');
    }

    const conteudo = await this.prisma.conteudo.create({
      data: {
        colecaoId,
        tenantId: colecao.tenantId,
        title: dto.title,
        description: dto.description,
        mediaType: dto.mediaType,
        mediaUrl: dto.mediaType === 'ARTIGO' ? null : dto.mediaUrl,
        htmlContent: dto.mediaType === 'ARTIGO' ? dto.htmlContent : null,
        imageUrl: dto.imageUrl,
        isFeatured: dto.isFeatured ?? false,
        tags: dto.tags ?? [],
        aiSummary: dto.aiSummary,
        durationSeconds: dto.durationSeconds,
        pageCount: dto.pageCount,
        downloadUrl: dto.downloadUrl,
        externalUrl: dto.externalUrl,
        sourceName: dto.sourceName,
      },
    });

    if (dto.planoIds?.length) {
      await this.prisma.conteudoPlano.createMany({
        data: dto.planoIds.map((planoId) => ({
          conteudoId: conteudo.id,
          planoId,
        })),
        skipDuplicates: true,
      });
    }

    return this.findOrThrow(conteudo.id);
  }

  async update(id: string, dto: UpdateConteudoDto) {
    const existing = await this.findOrThrow(id);
    const mediaType = dto.mediaType ?? existing.mediaType;

    await this.prisma.conteudo.update({
      where: { id },
      data: {
        title: dto.title,
        description: dto.description,
        mediaType: dto.mediaType,
        mediaUrl: mediaType === 'ARTIGO' ? null : (dto.mediaUrl ?? undefined),
        htmlContent:
          mediaType === 'ARTIGO' ? (dto.htmlContent ?? undefined) : null,
        imageUrl: dto.imageUrl,
        isFeatured: dto.isFeatured,
        tags: dto.tags,
        aiSummary: dto.aiSummary,
        durationSeconds: dto.durationSeconds,
        pageCount: dto.pageCount,
        downloadUrl: dto.downloadUrl,
        externalUrl: dto.externalUrl,
        sourceName: dto.sourceName,
      },
    });

    if (dto.planoIds) {
      await this.prisma.$transaction([
        this.prisma.conteudoPlano.deleteMany({ where: { conteudoId: id } }),
        this.prisma.conteudoPlano.createMany({
          data: dto.planoIds.map((planoId) => ({ conteudoId: id, planoId })),
          skipDuplicates: true,
        }),
      ]);
    }

    return this.findOrThrow(id);
  }

  async remove(id: string): Promise<void> {
    await this.findOrThrow(id);
    await this.prisma.conteudo.delete({ where: { id } });
  }

  async move(id: string, dto: MoveConteudoDto) {
    await this.findOrThrow(id);
    const targetColecao = await this.prisma.colecao.findFirst({
      where: { id: dto.colecaoId, tenantId: null },
    });
    if (!targetColecao) {
      throw new NotFoundException('Coleção de destino não encontrada');
    }
    return this.prisma.conteudo.update({
      where: { id },
      data: { colecaoId: dto.colecaoId, tenantId: targetColecao.tenantId },
    });
  }

  // Mock determinístico: nenhuma chamada de IA de verdade ainda (AI_MODE do
  // .env é sempre "mock" hoje — sem integração real com a Anthropic API).
  aiSuggest(dto: AiSuggestDto) {
    const words = `${dto.title} ${dto.description}`
      .toLowerCase()
      .normalize('NFD')
      .replace(/[̀-ͯ]/g, '')
      .replace(/[^a-z0-9\s]/g, ' ')
      .split(/\s+/)
      .filter((word) => word.length > 3);

    const stopwords = new Set([
      'sobre',
      'para',
      'como',
      'esse',
      'essa',
      'este',
      'esta',
      'pelo',
      'pela',
      'seus',
      'suas',
    ]);
    const uniqueWords = [
      ...new Set(words.filter((word) => !stopwords.has(word))),
    ];
    const tags = uniqueWords
      .slice(0, 4)
      .map((word) => word.replace(/\s+/g, '-'));

    return {
      tags: tags.length ? tags : ['conteudo-educacional'],
      summary: `${dto.title}: ${dto.description}`.slice(0, 220),
    };
  }

  // tenantId: null restringe a catálogos globais, único tipo alcançável por
  // essas rotas @Roles('MASTER') hoje — mesmo racional de
  // ColecoesService/EixosService.findOrThrow.
  private async findOrThrow(id: string) {
    const conteudo = await this.prisma.conteudo.findFirst({
      where: { id, tenantId: null },
      include: { planos: { select: { planoId: true } } },
    });
    if (!conteudo) {
      throw new NotFoundException('Conteúdo não encontrado');
    }
    return {
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
      createdAt: conteudo.createdAt,
    };
  }
}
