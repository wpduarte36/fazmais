import { BadRequestException, NotFoundException } from '@nestjs/common';
import type { JwtPayload } from '../auth/strategies/jwt.strategy';
import { PrismaService } from '../prisma/prisma.service';

// Município sobre o qual uma rota do Painel Admin age. Admin: sempre o
// próprio (qualquer ?tenantId é ignorado — não dá pra escapar do seu
// município). Master: não tem município, então precisa dizer qual, via
// ?tenantId= ("Área do Admin" na aba Municípios); validado aqui.
export async function resolverTenantAlvo(
  prisma: PrismaService,
  user: JwtPayload,
  tenantIdInformado?: string,
): Promise<string> {
  if (user.role !== 'MASTER') {
    return user.tenantId as string;
  }
  if (!tenantIdInformado) {
    throw new BadRequestException('Informe o município');
  }
  const tenant = await prisma.tenant.findUnique({
    where: { id: tenantIdInformado },
    select: { id: true },
  });
  if (!tenant) {
    throw new NotFoundException('Município não encontrado');
  }
  return tenant.id;
}
