import { PrismaService } from '../prisma/prisma.service';

// Grava a coluna `ordem` de várias linhas numa única query, em vez de N
// updates sequenciais dentro de um `$transaction` em lote (que tem timeout
// padrão de 5s no Prisma) — com latência de rede real até o banco em
// produção, uma coleção com dezenas de conteúdos passava desse limite e a
// transação inteira era desfeita (P2028 timeout). `table` vem sempre de um
// literal fixo no código, nunca de input do usuário.
export async function bulkSetOrdem(
  prisma: PrismaService,
  table: 'eixos' | 'colecoes' | 'conteudos',
  orderedIds: string[],
): Promise<void> {
  const ordens = orderedIds.map((_, index) => index);
  // id é `text` no Postgres (Prisma usa String sem @db.Uuid) — castear pra
  // uuid[] aqui dava "operator does not exist: text = uuid" na comparação.
  await prisma.$executeRawUnsafe(
    `update "${table}" as t set ordem = data.ordem
     from (select unnest($1::text[]) as id, unnest($2::int[]) as ordem) as data
     where t.id = data.id`,
    orderedIds,
    ordens,
  );
}
