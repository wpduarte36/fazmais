import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class StatsService {
  constructor(private readonly prisma: PrismaService) {}

  async getMasterStats() {
    const [municipios, admins, professores, conteudos] = await Promise.all([
      this.prisma.tenant.count(),
      this.prisma.user.count({ where: { role: 'ADMIN' } }),
      this.prisma.user.count({ where: { role: 'PROFESSOR' } }),
      this.prisma.conteudo.count(),
    ]);

    return { municipios, admins, professores, conteudos };
  }
}
