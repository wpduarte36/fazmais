import { existsSync } from 'node:fs'
import { defineConfig } from 'prisma/config'

// Local: as variáveis vêm do .env do repo. Em CI / Railway / Vercel o arquivo
// não existe — as variáveis já estão no process.env injetadas pela plataforma,
// então só carrega o arquivo se ele estiver presente (senão loadEnvFile lança).
if (existsSync('.env')) {
  process.loadEnvFile('.env')
}

export default defineConfig({
  schema: 'prisma/schema.prisma',
  datasource: {
    // migrate/introspect usam conexão DIRETA (Supabase: porta 5432 do pooler
    // em modo session, ou a connection string "Direct connection"). O runtime
    // da API (PrismaService) usa DATABASE_URL — que pode ser o pooler de
    // transação. Local, só DATABASE_URL existe e o fallback resolve.
    url: process.env.DIRECT_URL ?? process.env.DATABASE_URL,
  },
  migrations: {
    path: 'prisma/migrations',
    seed: 'node --experimental-strip-types prisma/seeds/seed.ts',
  },
})
