# FazMais — Status do Projeto

> Este arquivo existe pra retomar o trabalho independente de qual conta/máquina está acessando o repositório. Complementa (não substitui) o plano completo, que fica fora do repo em `C:\Users\wagner.paula\.claude\plans\linked-zooming-shannon.md` — esse plano tem o racional completo de cada decisão; este arquivo é o resumo prático pra continuar.

## O que é o FazMais

Plataforma multi-tenant de catálogo educacional (vídeos, PDFs, artigos) para municípios, com três perfis (Master, Admin, Professor) e consumo estilo Netflix. PRD original em `FazMais_PRD.docx`/`PRD_extracted.txt`.

## Status atual (2026-08-06)

**Feito**: bootstrap do monorepo (Turborepo/pnpm) + schema Prisma (Lote A, 14 tabelas) aprovado e aplicado no Postgres local + Tela 01 (Login) completa, backend e frontend, testada ponta a ponta. Tudo commitado em git.

**Próximo passo combinado**: Tela 02 — modal "Ainda não tenho acesso" (ver seção abaixo).

## Como subir o ambiente

1. Postgres 15 roda como serviço nativo do Windows (`postgresql-x64-15`, porta 5432) — não usamos Docker, apesar do `docker-compose.yml` existir no repo como alternativa. Banco `fazmais_dev`, role `fazmais`.
2. Arquivos `.env` (gitignorados, não estão no repo) precisam existir em `C:\fazmais\.env`, `apps\api\.env`, `apps\web\.env`. Use os `.env.example` correspondentes como base — só falta a senha do Postgres e os segredos JWT.
3. `pnpm install` na raiz, depois `pnpm turbo run dev` (web em `:5173`, api em `:3000`).
4. Se o banco for recriado do zero: `pnpm exec prisma migrate dev` (aplica a migration já commitada em `prisma/migrations/`) e depois `pnpm db:seed`.
5. Logins de teste (seed, senha `fazmais123` para todos): `master` (MASTER), `admin.demo` (ADMIN), `professor.demo` (PROFESSOR).

## Pegadinhas de ambiente já resolvidas

- `corepack enable`/`prepare` falha por permissão em `Program Files` no Windows — usar `npm install -g pnpm`.
- Prisma resolveu para **v7.9.1**, não 5.x. A arquitetura mudou: a URL de conexão saiu do `datasource` do `schema.prisma` e foi para `prisma.config.ts`; `PrismaClient` exige um **driver adapter** (`@prisma/adapter-pg` + `pg`). `@prisma/client`/`@prisma/adapter-pg` precisam estar instalados **na raiz** do workspace (não só em `apps/api`), senão `prisma generate` não resolve o pacote.
- bcrypt exige aprovação de build script no pnpm (`pnpm-workspace.yaml` → `allowBuilds`).
- Sem ferramenta de navegador neste ambiente de desenvolvimento — verificação visual de UI é manual.

## Decisões de arquitetura importantes (resumo)

Todas já refletidas em `prisma/schema.prisma` (com comentários inline) e nas migrations. Racional completo no plano externo, seções 1/1a/1b/1c.

- **Multi-tenancy com catálogo compartilhado**: `Catalogo` (era "Acervo" no PRD original) tem `tenantId` nullable — `null` = catálogo global publicado por um Master, disponível pra qualquer município ativar via opt-in (tabela `tenant_catalogo_access`). Um Admin pode combinar catálogo próprio + catálogos globais ativados. Catálogo global é somente leitura pra quem ativa.
- **Hierarquia de 4 níveis**: `Catalogo → Eixo → Colecao → Conteudo`. Conteúdo pode ser `VIDEO`, `PDF` ou `ARTIGO` (HTML salvo no próprio banco, campo `htmlContent`).
- **Planos (estilo Netflix)**: entidade global `Plano`, só o Master gerencia. Todo usuário tem um plano individual (`User.planoId`). Todo conteúdo (privado ou compartilhado) tem uma lista de planos permitidos (`ConteudoPlano`, N:N). Visibilidade final = acesso ao catálogo **E** plano do usuário estar na lista do conteúdo.
- **Múltiplos Masters**: um Master pode criar outro Master (não só Admins).
- **Login global**: campo `login` (não `username`, não é e-mail) é único no **sistema inteiro**, não por tenant — por isso a Tela 01 não tem seletor de município, só login + senha. `email` continua único só por tenant.
- **RN-01 (senha definida pelo usuário)**: `User.password` é nullable; usuário criado por Admin/Master recebe token de "1º acesso" (`password_reset_tokens`) e define a própria senha depois.

## Próximo passo: Tela 02 — "Ainda não tenho acesso"

US-002 do PRD. Formulário: nome, e-mail, WhatsApp, município (select) — sem senha.

- Backend novo: `GET /tenants/public` (lista `{id, name}` pra popular o select, endpoint público) e `POST /auth/register-pending` (cria `User` com `status=PENDENTE`, `role=PROFESSOR`, `password=null`, vinculado ao `tenantId` escolhido).
- Frontend: primeiro modal real da aplicação, abre a partir do botão "Ainda não tenho acesso" da Tela 01 (hoje só mostra um aviso de placeholder). Precisa de estado de confirmação após o envio.
- `AuthService.validateUser` já bloqueia login de usuário `PENDENTE` (RN-05) — nada a fazer ali.
- Infra reaproveitável sem recriar: `apiClient.ts`, `queryClient.ts`, `PrismaService`, padrão de módulo Nest (`auth/`).
