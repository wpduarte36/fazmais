# Deploy — FazMais

Arquitetura de produção:

| Parte | Onde | O que hospeda |
|---|---|---|
| Banco | **Supabase** | Postgres (só o banco — sem Auth/Storage/RLS) |
| API (`apps/api`) | **Railway** | NestJS + Prisma, container Docker, volume p/ uploads |
| Web (`apps/web`) | **Vercel** | SPA Vite/React (estático) |

Web e API ficam em **domínios diferentes** → o cookie de refresh usa
`sameSite=none; secure` quando `NODE_ENV=production` (local continua `strict`).

---

## 0. Rodar local (não mudou)

Nada no fluxo local mudou. Continua:

```bash
pnpm install
pnpm turbo run dev          # web :5173, api :3000 (nesta máquina, :3001)
```

Pré-requisitos e detalhes em `STATUS.md` → "Como subir o ambiente". Os
arquivos `.env` locais (`/.env`, `apps/api/.env`, `apps/web/.env`) continuam
iguais — todas as variáveis novas de deploy têm default local, então se elas
não existirem o comportamento é exatamente o de antes.

Variáveis novas (todas opcionais no local):

| Var | Default local | Pra que serve em produção |
|---|---|---|
| `NODE_ENV` | `development` | `production` liga HSTS + cookie `secure`/`none` |
| `DIRECT_URL` | cai em `DATABASE_URL` | conexão direta p/ `migrate`/`seed` |
| `UPLOADS_DIR` | `apps/api/uploads` | caminho do volume persistente na Railway |
| `CORS_ORIGIN` | `http://localhost:5173` | aceita lista separada por vírgula |

Testar a imagem de produção da API localmente (precisa de Docker):

```bash
docker build -f apps/api/Dockerfile -t fazmais-api .
docker run --rm -p 3000:3000 --env-file apps/api/.env fazmais-api
```

---

## 1. Supabase (banco)

1. Crie um projeto novo em supabase.com. Guarde a senha do banco.
2. **Connection string:** projeto → _Connect_ → aba _ORMs_ (ou _Connection string_).
   Use a do **Session pooler** (host `...pooler.supabase.com`, porta `5432`):
   é IPv4 (a Railway precisa) e serve tanto pro runtime quanto pras migrations.
   Formato:
   ```
   postgresql://postgres.<ref>:<senha>@aws-0-<região>.pooler.supabase.com:5432/postgres
   ```
3. Não precisa criar tabela nenhuma pela UI — as migrations do Prisma fazem isso.
4. **Rodar as migrations + seed** (uma vez, da sua máquina):
   ```bash
   # na raiz do repo, com a connection string do Supabase:
   DATABASE_URL="postgresql://postgres.<ref>:<senha>@...pooler.supabase.com:5432/postgres" \
     pnpm exec prisma migrate deploy

   DATABASE_URL="postgresql://postgres.<ref>:<senha>@...pooler.supabase.com:5432/postgres" \
     pnpm exec prisma db seed
   ```
   O seed cria os usuários `master` / `admin.demo` / `professor.demo`
   (senha `fazmais123`) e o tenant "Município Demo". **Troque a senha do
   `master` depois do primeiro login** (ou edite o seed antes de rodar).

   > A partir do 2º deploy a Railway roda `migrate deploy` sozinha no boot
   > (ver abaixo). O passo manual acima é só pra popular o banco a 1ª vez.

---

## 2. Railway (API)

1. Novo projeto → _Deploy from GitHub repo_ → escolha este repo.
2. **Settings do serviço:**
   - _Root Directory_: `/` (raiz do repo — o Dockerfile monta o monorepo inteiro).
   - _Config as code_: a Railway detecta `railway.toml` e usa `apps/api/Dockerfile`.
   - _Networking_ → _Generate Domain_ (anote a URL, ex: `fazmais-api.up.railway.app`).
3. **Volume** (senão todo upload some a cada deploy):
   - _New_ → _Volume_ → _Mount path_: `/data`
   - O Dockerfile já usa `UPLOADS_DIR=/data/uploads`.
4. **Variables:**
   ```
   NODE_ENV=production
   DATABASE_URL=<Session pooler string do Supabase>
   JWT_ACCESS_SECRET=<openssl rand -hex 32>
   JWT_REFRESH_SECRET=<openssl rand -hex 32>
   JWT_ACCESS_EXPIRES=15m
   JWT_REFRESH_EXPIRES=7d
   CORS_ORIGIN=https://<seu-dominio-na-vercel>
   AI_MODE=mock
   ```
   `PORT` a Railway injeta sozinha. `UPLOADS_DIR` já vem do Dockerfile
   (só sobrescreva se mudar o mount path).
5. Deploy. O container roda `prisma migrate deploy` no boot e sobe a API.
   Healthcheck: `GET /health`.
6. Teste: `curl https://<api>/health` → `{"status":"ok"}`.

### Domínios de preview da Vercel (opcional)

`CORS_ORIGIN` aceita lista: `https://fazmais.vercel.app,https://fazmais-git-x.vercel.app`.
Cada preview tem URL própria — se precisar testar previews contra a API de
produção, adicione as URLs aqui.

---

## 3. Vercel (web)

1. _Add New_ → _Project_ → importe o repo.
2. **Root Directory: `apps/web`** (a Vercel detecta o pnpm workspace e roda
   `pnpm install` na raiz sozinha).
3. Framework: _Vite_ (auto). Build/Output: deixe no automático
   (`apps/web/vercel.json` já traz o rewrite de SPA).
4. **Environment Variables:**
   ```
   VITE_API_BASE_URL=https://<sua-api-na-railway>
   ```
   (Production e Preview.) É embutida no bundle **no build** — mudou a URL da
   API, tem que **rebuildar** o front.
5. Deploy. Anote o domínio e **volte na Railway** pra pôr ele em `CORS_ORIGIN`,
   depois _Redeploy_ a API.

---

## 4. Depois do deploy

- **Primeiro login:** `master` / `fazmais123` → troque a senha.
- **Criar Admin/Professor:** o token de 1º acesso **não é enviado por e-mail**
  (não existe serviço de e-mail).
  - Pelo **Painel Admin → Usuários**: o link `/definir-senha?token=...` aparece
    num modal na hora — é só copiar e mandar pra pessoa.
  - Pelo **Master criando o 1º Admin de um tenant**: o token só sai no **log da
    API na Railway** — copie de lá e monte a URL na mão.
  É um gap conhecido pra produção de verdade (ver `STATUS.md`).
- **Vídeos do Vimeo:** dão **403** fora dos domínios liberados na conta Vimeo
  da Faz Educação. Peça pra quem administra a conta adicionar o domínio da
  Vercel em _Settings → Privacy → Where can this be embedded_. (Não é bug — ver
  `STATUS.md`.)
- **Cold start:** o plano free da Railway pode dormir/limitar; a 1ª request
  depois de ocioso demora alguns segundos.

---

## 5. Redeploy

- **Web** e **API**: `git push` na branch conectada → Vercel e Railway
  buildam sozinhas.
- **Migration nova:** faça o commit do arquivo em `prisma/migrations/`. A
  Railway roda `prisma migrate deploy` no próximo boot automaticamente.
- **Mudou `VITE_API_BASE_URL`:** precisa _Redeploy_ na Vercel (a var entra no
  bundle no build).

---

## 6. Pendências pra "produção de verdade"

Não bloqueiam o deploy, mas valem antes de abrir pra usuário externo:

1. **Envio de e-mail** pro fluxo de 1º acesso / esqueci a senha.
2. **Uploads em object storage** (Supabase Storage / R2) em vez de volume —
   volume não escala além de 1 instância e não tem CDN.
3. **Rate limit distribuído** — o `@nestjs/throttler` é em memória; com mais de
   1 instância da API o limite de login vira por-instância.
4. As 2 correções de segurança menores que ficaram pendentes (ver `STATUS.md`).
