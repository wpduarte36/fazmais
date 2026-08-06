import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import bcrypt from 'bcrypt';

if (!process.env.DATABASE_URL) {
  process.loadEnvFile('.env');
}

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
});

async function main() {
  const tenant = await prisma.tenant.upsert({
    where: { id: '00000000-0000-0000-0000-000000000001' },
    update: {},
    create: {
      id: '00000000-0000-0000-0000-000000000001',
      name: 'Município Demo',
    },
  });

  const planoPadrao = await prisma.plano.upsert({
    where: { name: 'Padrão' },
    update: {},
    create: { name: 'Padrão', description: 'Plano padrão de acesso ao acervo educacional' },
  });

  const passwordHash = await bcrypt.hash('fazmais123', 10);

  const master = await prisma.user.upsert({
    where: { login: 'master' },
    update: {},
    create: {
      login: 'master',
      name: 'Master Demo',
      email: 'master@fazmais.dev',
      password: passwordHash,
      role: 'MASTER',
      status: 'ATIVO',
      tenantId: null,
      planoId: null,
    },
  });

  const admin = await prisma.user.upsert({
    where: { login: 'admin.demo' },
    update: {},
    create: {
      login: 'admin.demo',
      name: 'Admin Demo',
      email: 'admin@municipiodemo.fazmais.dev',
      password: passwordHash,
      role: 'ADMIN',
      status: 'ATIVO',
      tenantId: tenant.id,
      planoId: planoPadrao.id,
    },
  });

  const professor = await prisma.user.upsert({
    where: { login: 'professor.demo' },
    update: {},
    create: {
      login: 'professor.demo',
      name: 'Professor Demo',
      email: 'professor@municipiodemo.fazmais.dev',
      password: passwordHash,
      role: 'PROFESSOR',
      status: 'ATIVO',
      tenantId: tenant.id,
      planoId: planoPadrao.id,
    },
  });

  console.log('Seed concluído:');
  console.log({ tenant: tenant.name, planoPadrao: planoPadrao.name });
  console.log({ master: master.login, admin: admin.login, professor: professor.login });
  console.log('Senha de todos os usuários de seed: fazmais123');
}

main()
  .catch((error: unknown) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => {
    void prisma.$disconnect();
  });
