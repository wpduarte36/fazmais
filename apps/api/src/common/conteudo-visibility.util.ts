import { NotFoundException } from '@nestjs/common';
import type { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

// Monta o filtro Prisma dos conteúdos que um professor pode enxergar:
// - conteúdo do próprio tenant, OU conteúdo global de um catálogo que o
//   tenant ativou (TenantCatalogoAccess);
// - publicado — planoMinimoId nulo = rascunho, não aparece pra ninguém;
// - com planoMinimo.level <= o level do plano do professor. Professor sem
//   plano atribuído é tratado como Padrão (level 0) — só enxerga o acervo
//   básico, nunca conteúdo Bronze/Prata/Ouro sem um plano pago de verdade.
//   Admin (na "Área do Educador") enxerga como o plano mais alto que
//   existir (hoje Ouro) — decisão de produto: o Admin vê tudo o que o
//   município dele tem, independente do plano.
// É a MESMA regra usada em HomeService.getFeed pra montar a lista visível —
// as duas precisam andar juntas, por isso a lógica mora aqui.
export async function conteudoVisivelWhere(
  prisma: PrismaService,
  userId: string,
  tenantId: string,
): Promise<Prisma.ConteudoWhereInput> {
  const user = await prisma.user.findUniqueOrThrow({
    where: { id: userId },
    select: { role: true, plano: { select: { level: true } } },
  });
  let userPlanoLevel = user.plano?.level ?? 0;
  if (user.role === 'ADMIN') {
    const maior = await prisma.plano.aggregate({ _max: { level: true } });
    userPlanoLevel = maior._max.level ?? 0;
  }
  return visibilidadeWhere(prisma, tenantId, userPlanoLevel);
}

// A regra em si, sem depender de quem é o usuário: o que um educador do
// `tenantId` com plano de nível `planoLevel` enxerga. Usada direto pela
// "Área do Educador" do Master, que escolhe município e plano na mão.
export async function visibilidadeWhere(
  prisma: PrismaService,
  tenantId: string,
  planoLevel: number,
): Promise<Prisma.ConteudoWhereInput> {
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
    planoMinimo: { level: { lte: planoLevel } },
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
