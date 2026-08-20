import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCatalogoDto } from './dto/create-catalogo.dto';
import { UpdateCatalogoDto } from './dto/update-catalogo.dto';

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
          orderBy: { createdAt: 'asc' },
          include: {
            colecoes: {
              orderBy: { createdAt: 'asc' },
              include: {
                conteudos: {
                  orderBy: { createdAt: 'asc' },
                  include: { planos: { select: { planoId: true } } },
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
            isFeatured: conteudo.isFeatured,
            tags: conteudo.tags,
            aiSummary: conteudo.aiSummary,
            durationSeconds: conteudo.durationSeconds,
            pageCount: conteudo.pageCount,
            downloadUrl: conteudo.downloadUrl,
            externalUrl: conteudo.externalUrl,
            sourceName: conteudo.sourceName,
            planoIds: conteudo.planos.map((p) => p.planoId),
            isFavorito: false,
            myRating: null,
            createdAt: conteudo.createdAt,
          })),
        })),
      })),
    };
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
