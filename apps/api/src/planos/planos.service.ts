import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class PlanosService {
  constructor(private readonly prisma: PrismaService) {}

  list() {
    return this.prisma.plano.findMany({
      orderBy: { level: 'asc' },
      select: { id: true, name: true, level: true, description: true },
    });
  }
}
