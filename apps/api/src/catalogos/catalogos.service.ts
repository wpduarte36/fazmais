import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { bulkSetOrdem } from '../common/bulk-ordem.util';
import { CreateCatalogoDto } from './dto/create-catalogo.dto';
import { UpdateCatalogoDto } from './dto/update-catalogo.dto';
import { ReorderEixosDto } from './dto/reorder-eixos.dto';

@Injectable()
export class CatalogosService {
  constructor(private readonly prisma: PrismaService) {}

  async list() {
    const catalogos = await this.prisma.catalogo.findMany({
      where: { tenantId: null },
      orderBy: { name: 'asc' },
      include: {
        eixos: {
          select: {
            id: true,
            colecoes: {
              select: { id: true, _count: { select: { conteudos: true } } },
            },
          },
        },
        _count: { select: { tenantAccess: true } },
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
        createdAt: catalogo.createdAt,
        eixosCount: catalogo.eixos.length,
        colecoesCount: colecoes.length,
        conteudosCount,
        municipiosAtivos: catalogo._count.tenantAccess,
      };
    });
  }

  async create(dto: CreateCatalogoDto) {
    return this.prisma.catalogo.create({
      data: { name: dto.name, icon: dto.icon, tenantId: null },
    });
  }

  async update(id: string, dto: UpdateCatalogoDto) {
    await this.findOrThrow(id);
    return this.prisma.catalogo.update({
      where: { id },
      data: { name: dto.name, icon: dto.icon },
    });
  }

  async remove(id: string): Promise<void> {
    await this.findOrThrow(id);
    const accessCount = await this.prisma.tenantCatalogoAccess.count({
      where: { catalogoId: id },
    });
    if (accessCount > 0) {
      throw new ConflictException(
        'Não é possível excluir um catálogo que algum município já ativou',
      );
    }
    await this.prisma.catalogo.delete({ where: { id } });
  }

  async getTree(id: string) {
    const catalogo = await this.prisma.catalogo.findFirst({
      where: { id, tenantId: null },
      include: {
        eixos: {
          orderBy: [{ ordem: 'asc' }, { createdAt: 'asc' }],
          include: {
            colecoes: {
              orderBy: [{ ordem: 'asc' }, { createdAt: 'asc' }],
              include: {
                conteudos: {
                  orderBy: [{ ordem: 'asc' }, { createdAt: 'asc' }],
                },
              },
            },
          },
        },
      },
    });
    if (!catalogo) {
      throw new NotFoundException('Catálogo não encontrado');
    }

    return {
      id: catalogo.id,
      name: catalogo.name,
      icon: catalogo.icon,
      createdAt: catalogo.createdAt,
      eixos: catalogo.eixos.map((eixo) => ({
        id: eixo.id,
        name: eixo.name,
        description: eixo.description,
        colecoes: eixo.colecoes.map((colecao) => ({
          id: colecao.id,
          name: colecao.name,
          conteudos: colecao.conteudos.map((conteudo) => ({
            id: conteudo.id,
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
            appStoreUrl: conteudo.appStoreUrl,
            playStoreUrl: conteudo.playStoreUrl,
            webUrl: conteudo.webUrl,
            appPlatforms: conteudo.appPlatforms,
            planoMinimoId: conteudo.planoMinimoId,
            isFavorito: false,
            myRating: null,
            viewCount: conteudo.viewCount,
            createdAt: conteudo.createdAt,
          })),
        })),
      })),
    };
  }

  // Mesmo racional de EixosService.reorderColecoes: recebe a lista de ids de
  // eixo na ordem final desejada (Home não é um Eixo real, então nunca entra
  // nessa lista — o frontend sempre a mantém fixa antes de tudo) e confere
  // que todo id pertence mesmo a esse catálogo antes de gravar.
  async reorderEixos(catalogoId: string, dto: ReorderEixosDto) {
    await this.findOrThrow(catalogoId);
    const eixos = await this.prisma.eixo.findMany({
      where: { catalogoId },
      select: { id: true },
    });
    const idsValidos = new Set(eixos.map((e) => e.id));
    const idsRecebidos = new Set(dto.eixoIds);
    if (
      dto.eixoIds.length !== idsValidos.size ||
      dto.eixoIds.some((id) => !idsValidos.has(id)) ||
      idsValidos.size !== idsRecebidos.size
    ) {
      throw new BadRequestException(
        'A lista precisa conter exatamente os eixos desse catálogo, sem repetir nem faltar nenhum.',
      );
    }

    await bulkSetOrdem(this.prisma, 'eixos', dto.eixoIds);
  }

  async findOrThrow(id: string) {
    const catalogo = await this.prisma.catalogo.findFirst({
      where: { id, tenantId: null },
    });
    if (!catalogo) {
      throw new NotFoundException('Catálogo não encontrado');
    }
    return catalogo;
  }
}
