import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class RatingsService {
  constructor(private readonly prisma: PrismaService) {}

  async avaliar(userId: string, tenantId: string, conteudoId: string, score: number): Promise<void> {
    const conteudo = await this.prisma.conteudo.findUnique({
      where: { id: conteudoId },
    });
    if (!conteudo) {
      throw new NotFoundException('Conteúdo não encontrado');
    }
    await this.prisma.rating.upsert({
      where: { userId_conteudoId: { userId, conteudoId } },
      update: { score },
      create: { userId, conteudoId, tenantId, score },
    });
  }
}
