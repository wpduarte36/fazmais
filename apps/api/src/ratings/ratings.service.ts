import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { assertConteudoVisivel } from '../common/conteudo-visibility.util';

@Injectable()
export class RatingsService {
  constructor(private readonly prisma: PrismaService) {}

  async avaliar(
    userId: string,
    tenantId: string,
    conteudoId: string,
    score: number,
  ): Promise<void> {
    await assertConteudoVisivel(this.prisma, userId, tenantId, conteudoId);
    await this.prisma.rating.upsert({
      where: { userId_conteudoId: { userId, conteudoId } },
      update: { score },
      create: { userId, conteudoId, tenantId, score },
    });
  }
}
