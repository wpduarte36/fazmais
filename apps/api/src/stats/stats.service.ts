import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class StatsService {
  constructor(private readonly prisma: PrismaService) {}

  async getMasterStats() {
    const [empresas, municipios, admins, professores, conteudos] = await Promise.all([
      this.prisma.marca.count(),
      this.prisma.tenant.count(),
      this.prisma.user.count({ where: { role: 'ADMIN' } }),
      this.prisma.user.count({ where: { role: 'PROFESSOR' } }),
      this.prisma.conteudo.count(),
    ]);

    return { empresas, municipios, admins, professores, conteudos };
  }
}
