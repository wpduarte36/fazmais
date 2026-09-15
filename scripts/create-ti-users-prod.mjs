// Cria admin.ti / professor.ti / master.ti em produção reaproveitando o hash
// bcrypt de um usuário já existente com a mesma senha (fazmais123) — evita
// depender do log da Railway pra pegar o token de 1º acesso (que o endpoint
// POST /tenants/:id/admins não retorna no JSON, só loga). Idempotente
// (ON CONFLICT (login) DO NOTHING).
//
// Uso (PowerShell, na raiz do repo):
//   $env:PROD_DATABASE_URL='postgresql://postgres.gtavrukcrpgdcaxbxzfl:SENHA@aws-0-sa-east-1.pooler.supabase.com:5432/postgres'
//   node scripts/create-ti-users-prod.mjs

import { randomUUID } from 'node:crypto';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

const PROD = process.env.PROD_DATABASE_URL;
if (!PROD) {
  console.error('Defina PROD_DATABASE_URL.');
  process.exit(1);
}

const TENANT_TI_ID = '49965579-15ea-4ade-8e86-6fa597cc7bf5'; // "Empresa TI" em produção

const db = new PrismaClient({ adapter: new PrismaPg({ connectionString: PROD }) });

async function main() {
  try {
    const [master] = await db.$queryRawUnsafe(
      `select password from users where login = 'master' and password is not null`,
    );
    if (!master?.password) throw new Error('Não achei o hash de senha do usuário "master" em produção.');
    const hash = master.password;

    const [padrao] = await db.$queryRawUnsafe(`select id from planos where name = 'Padrão'`);
    if (!padrao) throw new Error('Plano "Padrão" não existe em produção.');

    const users = [
      {
        id: randomUUID(),
        tenant_id: TENANT_TI_ID,
        plano_id: null,
        name: 'Admin TI',
        login: 'admin.ti',
        email: 'admin@empresati.fazmais.dev',
        role: 'ADMIN',
      },
      {
        id: randomUUID(),
        tenant_id: TENANT_TI_ID,
        plano_id: padrao.id,
        name: 'Professor TI',
        login: 'professor.ti',
        email: 'professor@empresati.fazmais.dev',
        role: 'PROFESSOR',
      },
      {
        id: randomUUID(),
        tenant_id: null,
        plano_id: null,
        name: 'Master TI',
        login: 'master.ti',
        email: 'master.ti@fazmais.dev',
        role: 'MASTER',
      },
    ];

    for (const u of users) {
      const res = await db.$executeRawUnsafe(
        `insert into users (id, tenant_id, plano_id, name, login, email, password, role, status, created_at, updated_at)
         values ($1, $2, $3, $4, $5, $6, $7, $8::"Role", 'ATIVO'::"UserStatus", now(), now())
         on conflict (login) do nothing`,
        u.id, u.tenant_id, u.plano_id, u.name, u.login, u.email, hash, u.role,
      );
      console.log(`${u.login}: ${res > 0 ? 'criado' : 'já existia, pulado'}`);
    }

    const check = await db.$queryRawUnsafe(
      `select login, role, status, tenant_id from users where login in ('admin.ti','professor.ti','master.ti') order by login`,
    );
    console.table(check);
  } finally {
    await db.$disconnect();
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
