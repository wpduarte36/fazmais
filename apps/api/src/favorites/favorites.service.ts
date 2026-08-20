import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class FavoritesService {
  constructor(private readonly prisma: PrismaService) {}

  async favoritar(userId: string, tenantId: string, conteudoId: string): Promise<void> {
    const conteudo = await this.prisma.conteudo.findUnique({
      where: { id: conteudoId },
    });
    if (!conteudo) {
      throw new NotFoundException('Conteúdo não encontrado');
    }
    await this.prisma.favorite.upsert({
      where: { userId_conteudoId: { userId, conteudoId } },
      update: {},
      create: { userId, conteudoId, tenantId },
    });
  }

  async desfavoritar(userId: string, conteudoId: string): Promise<void> {
    await this.prisma.favorite.deleteMany({ where: { userId, conteudoId } });
  }
}
