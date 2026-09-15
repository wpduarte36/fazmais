import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { assertConteudoVisivel } from '../common/conteudo-visibility.util';

@Injectable()
export class FavoritesService {
  constructor(private readonly prisma: PrismaService) {}

  async favoritar(
    userId: string,
    tenantId: string,
    conteudoId: string,
  ): Promise<void> {
    await assertConteudoVisivel(this.prisma, userId, tenantId, conteudoId);
    await this.prisma.favorite.upsert({
      where: { userId_conteudoId: { userId, conteudoId } },
      update: {},
      create: { userId, conteudoId, tenantId },
    });
  }

  async desfavoritar(userId: string, tenantId: string, conteudoId: string): Promise<void> {
    await assertConteudoVisivel(this.prisma, userId, tenantId, conteudoId);
    await this.prisma.favorite.deleteMany({ where: { userId, conteudoId } });
  }
}
