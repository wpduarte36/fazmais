// Copia o CONTEÚDO (catálogo/eixos/coleções/conteúdos) do banco local pro
// banco de produção (Supabase). Idempotente (upsert por id). NÃO copia
// usuários, favoritos, avaliações, progresso nem tokens — só o acervo.
//
// Pré: as 13 migrations já aplicadas no Supabase (prisma migrate deploy) e o
// seed rodado (tenant "Município Demo" + planos Padrão/Bronze/Prata/Ouro).
//
// Uso (PowerShell, na raiz do repo):
//   $env:LOCAL_DATABASE_URL='postgresql://fazmais:fazmais_dev@localhost:5432/fazmais_dev?schema=public'
//   $env:PROD_DATABASE_URL='postgresql://postgres.gtavrukcrpgdcaxbxzfl:SENHA@aws-0-sa-east-1.pooler.supabase.com:5432/postgres'
//   node scripts/clone-content-to-prod.mjs
//
// (a senha vai com o `*` codificado como %2A)

import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

const LOCAL = process.env.LOCAL_DATABASE_URL;
const PROD = process.env.PROD_DATABASE_URL;
if (!LOCAL || !PROD) {
  console.error('Defina LOCAL_DATABASE_URL e PROD_DATABASE_URL.');
  process.exit(1);
}

// localhost -> URLs públicas. Os arquivos estáticos (public/legado/*) são
// servidos pela Vercel; os 3 uploads reais foram copiados pra lá também.
const REWRITES = [
  ['http://localhost:5173/legado/', 'https://fazmais-web.vercel.app/legado/'],
  ['http://localhost:3001/uploads/', 'https://fazmais-web.vercel.app/legado/'],
];
const rewrite = (v) => {
  if (typeof v !== 'string') return v;
  let out = v;
  for (const [from, to] of REWRITES) out = out.split(from).join(to);
  return out;
};

// Ordem de FK: catálogo -> eixo -> coleção -> conteúdo -> acesso do tenant.
const TABLES = ['catalogos', 'eixos', 'colecoes', 'conteudos', 'tenant_catalogo_access'];
const URL_COLS = new Set(['image_url', 'media_url', 'banner_image_url', 'download_url', 'html_content']);

const db = (url) => new PrismaClient({ adapter: new PrismaPg({ connectionString: url }) });

async function columnsOf(client, table) {
  const rows = await client.$queryRawUnsafe(
    `select column_name from information_schema.columns
     where table_schema = 'public' and table_name = $1 order by ordinal_position`,
    table,
  );
  return rows.map((r) => r.column_name);
}

async function main() {
  const local = db(LOCAL);
  const prod = db(PROD);

  try {
    // 1) mapa de planos: id local -> id de produção, casando por `name`.
    const localPlanos = await local.$queryRawUnsafe('select id, name from planos');
    const prodPlanos = await prod.$queryRawUnsafe('select id, name from planos');
    const planoMap = new Map();
    for (const lp of localPlanos) {
      const pp = prodPlanos.find((x) => x.name === lp.name);
      if (pp) planoMap.set(lp.id, pp.id);
    }
    const prodPadrao = prodPlanos.find((p) => p.name === 'Padrão');
    console.log(`planos mapeados: ${planoMap.size}/${localPlanos.length}`);
    if (!prodPadrao) throw new Error('Plano "Padrão" não existe em produção — rode o seed antes.');

    let total = 0;
    for (const table of TABLES) {
      const cols = await columnsOf(prod, table);
      const localRows = await local.$queryRawUnsafe(`select * from "${table}"`);

      for (const row of localRows) {
        const values = cols.map((col) => {
          let v = row[col];
          if (table === 'conteudos') {
            if (col === 'plano_minimo_id') v = v ? planoMap.get(v) ?? prodPadrao.id : null;
            else if (URL_COLS.has(col)) v = rewrite(v);
          }
          return v === undefined ? null : v;
        });
        const ph = cols.map((_, i) => `$${i + 1}`).join(', ');
        const upd = cols.filter((c) => c !== 'id').map((c) => `"${c}" = excluded."${c}"`).join(', ');
        await prod.$executeRawUnsafe(
          `insert into "${table}" (${cols.map((c) => `"${c}"`).join(', ')})
           values (${ph}) on conflict (id) do update set ${upd}`,
          ...values,
        );
        total++;
      }
      console.log(`${table}: ${localRows.length} linhas`);
    }

    console.log(`\nOK — ${total} linhas copiadas/atualizadas.`);
    const [chk] = await prod.$queryRawUnsafe(
      `select
         (select count(*)::int from catalogos) c,
         (select count(*)::int from eixos) e,
         (select count(*)::int from colecoes) col,
         (select count(*)::int from conteudos) cont,
         (select count(*)::int from conteudos where image_url ilike '%localhost%' or media_url ilike '%localhost%') strays`,
    );
    console.log('produção agora:', chk);
  } finally {
    await local.$disconnect();
    await prod.$disconnect();
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
