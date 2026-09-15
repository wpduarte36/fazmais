import { NotFoundException } from '@nestjs/common';
import type { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

// Monta o filtro Prisma dos conteúdos que um professor pode enxergar:
// - conteúdo do próprio tenant, OU conteúdo global de um catálogo que o
//   tenant ativou (TenantCatalogoAccess);
// - publicado — planoMinimoId nulo = rascunho, não aparece pra ninguém;
// - com planoMinimo.level <= o level do plano do professor (professor sem
//   plano não filtra por nível, mesmo comportamento histórico do feed).
// É a MESMA regra usada em HomeService.getFeed pra montar a lista visível —
// as duas precisam andar juntas, por isso a lógica mora aqui.
export async function conteudoVisivelWhere(
  prisma: PrismaService,
  userId: string,
  tenantId: string,
): Promise<Prisma.ConteudoWhereInput> {
  const user = await prisma.user.findUniqueOrThrow({
    where: { id: userId },
    select: { plano: { select: { level: true } } },
  });
  const userPlanoLevel = user.plano?.level ?? null;

  const access = await prisma.tenantCatalogoAccess.findMany({
    where: { tenantId },
    select: { catalogoId: true },
  });
  const catalogosAtivados = access.map((a) => a.catalogoId);

  return {
    OR: [
      { tenantId },
      {
        tenantId: null,
        colecao: { eixo: { catalogoId: { in: catalogosAtivados } } },
      },
    ],
    planoMinimoId: { not: null },
    ...(userPlanoLevel !== null
      ? { planoMinimo: { level: { lte: userPlanoLevel } } }
      : {}),
  };
}

// Garante que `conteudoId` é visível pro professor antes de qualquer escrita
// que referencie um conteúdo por id vindo da URL (favoritar, avaliar,
// progresso, registrar view). Sem isso, um professor de um tenant consegue
// tocar em conteúdo de outro tenant, em rascunho ou em catálogo que o
// município dele não ativou. Responde 404 tanto pra "não existe" quanto pra
// "existe mas fora do seu escopo" — não revela conteúdo de outro tenant.
export async function assertConteudoVisivel(
  prisma: PrismaService,
  userId: string,
  tenantId: string,
  conteudoId: string,
): Promise<void> {
  const where = await conteudoVisivelWhere(prisma, userId, tenantId);
  const conteudo = await prisma.conteudo.findFirst({
    where: { AND: [{ id: conteudoId }, where] },
    select: { id: true },
  });
  if (!conteudo) {
    throw new NotFoundException('Conteúdo não encontrado');
  }
}
