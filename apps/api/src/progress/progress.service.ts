import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

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
    const conteudo = await this.prisma.conteudo.findUnique({
      where: { id: conteudoId },
    });
    if (!conteudo) {
      throw new NotFoundException('Conteúdo não encontrado');
    }
    await this.prisma.progress.upsert({
      where: { userId_conteudoId: { userId, conteudoId } },
      update: { progressPercent, lastPosition },
      create: { userId, conteudoId, tenantId, progressPercent, lastPosition },
    });
  }
}
