import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { assertConteudoVisivel } from '../common/conteudo-visibility.util';

@Injectable()
export class ProgressService {
  constructor(private readonly prisma: PrismaService) {}

  async atualizar(
    userId: string,
    tenantId: string,
    conteudoId: string,
    progressPercent: number,
    lastPosition: number,
  ): Promise<void> {
    await assertConteudoVisivel(this.prisma, userId, tenantId, conteudoId);
    await this.prisma.progress.upsert({
      where: { userId_conteudoId: { userId, conteudoId } },
      update: { progressPercent, lastPosition },
      create: { userId, conteudoId, tenantId, progressPercent, lastPosition },
    });
  }
}
