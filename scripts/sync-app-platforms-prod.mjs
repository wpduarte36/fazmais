// Copia SÓ as colunas novas dos Apps (app_platforms, web_url) do banco local
// pra produção, casando por id. Uso único pós-migration 20260924120000 — não
// mexe em mais nada do acervo (o clone-content-to-prod.mjs sobrescreveria
// tudo, inclusive edições feitas direto em produção).
//
// Uso (na raiz do repo):
//   LOCAL_DATABASE_URL='postgresql://fazmais:fazmais_dev@localhost:5432/fazmais_dev?schema=public' \
//   PROD_DATABASE_URL='postgresql://...pooler.supabase.com:5432/postgres' \
//   node scripts/sync-app-platforms-prod.mjs

import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

const LOCAL = process.env.LOCAL_DATABASE_URL;
const PROD = process.env.PROD_DATABASE_URL;
if (!LOCAL || !PROD) {
  console.error('Defina LOCAL_DATABASE_URL e PROD_DATABASE_URL.');
  process.exit(1);
}

const db = (url) => new PrismaClient({ adapter: new PrismaPg({ connectionString: url }) });
const local = db(LOCAL);
const prod = db(PROD);

try {
  const [{ ok }] = await prod.$queryRawUnsafe(
    `select count(*)::int = 2 as ok from information_schema.columns
     where table_name = 'conteudos' and column_name in ('app_platforms', 'web_url')`,
  );
  if (!ok) throw new Error('Produção ainda sem a migration 20260924120000 — espere o deploy da Railway terminar.');

  const apps = await local.$queryRawUnsafe(
    `select id, title, app_platforms, web_url from conteudos where media_type = 'APP' order by title`,
  );
  let atualizados = 0;
  for (const app of apps) {
    const n = await prod.$executeRawUnsafe(
      `update conteudos set app_platforms = $2::"AppPlatform"[], web_url = $3, updated_at = now()
       where id = $1 and media_type = 'APP'`,
      app.id,
      app.app_platforms,
      app.web_url,
    );
    console.log(`${n ? 'ok       ' : 'NÃO ACHOU'} ${app.title} ${app.app_platforms} ${app.web_url ?? ''}`);
    atualizados += n;
  }
  console.log(`\n${atualizados}/${apps.length} Apps atualizados em produção.`);
} finally {
  await local.$disconnect();
  await prod.$disconnect();
}
