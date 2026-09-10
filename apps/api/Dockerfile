# syntax=docker/dockerfile:1
#
# Imagem de produção da API (@fazmais/api) para a Railway.
# Contexto de build = raiz do monorepo (a Railway usa a raiz do repo por
# padrão; `railway.toml` aponta pra este arquivo via dockerfilePath).
#
# Testar localmente, a partir da raiz do repo:
#   docker build -f apps/api/Dockerfile -t fazmais-api .
#   docker run --rm -p 3000:3000 --env-file apps/api/.env fazmais-api

FROM node:22-slim

# openssl: exigido pelo Prisma. ca-certificates: TLS até o Supabase.
RUN apt-get update -y \
  && apt-get install -y --no-install-recommends openssl ca-certificates \
  && rm -rf /var/lib/apt/lists/*

ENV PNPM_HOME="/pnpm" PATH="/pnpm:$PATH" NODE_ENV=production \
    COREPACK_ENABLE_DOWNLOAD_PROMPT=0
RUN corepack enable

WORKDIR /app

# 1) Só os manifests primeiro — a camada de `pnpm install` fica em cache
#    enquanto as dependências não mudam, mesmo que o código mude.
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/api/package.json apps/api/
COPY apps/web/package.json apps/web/
COPY packages/shared/package.json packages/shared/
COPY packages/ui/package.json packages/ui/
COPY packages/config/package.json packages/config/

# --prod=false: NODE_ENV é production, mas precisamos das devDeps (nest-cli,
# prisma, typescript) pra compilar. Elas ficam na imagem — a CLI do Prisma
# é usada de novo no start pra rodar `migrate deploy`.
RUN pnpm install --frozen-lockfile --prod=false

# 2) Código. O .dockerignore corta node_modules/dist/.git/logs/binários.
COPY . .

# 3) Gera o Prisma Client e compila a API.
RUN pnpm exec prisma generate \
  && pnpm --filter @fazmais/api build

# Volume persistente de uploads é montado aqui pela Railway (ver DEPLOY.md).
ENV UPLOADS_DIR=/data/uploads
RUN mkdir -p /data/uploads

EXPOSE 3000

# migrate deploy roda a cada boot (idempotente); se falhar, o container não
# sobe — que é o comportamento desejado (não servir com schema defasado).
CMD ["sh", "-c", "pnpm exec prisma migrate deploy && node apps/api/dist/main.js"]
