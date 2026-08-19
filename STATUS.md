# FazMais — Status do Projeto

> Este arquivo existe pra retomar o trabalho independente de qual conta/máquina está acessando o repositório. Complementa (não substitui) o plano completo, que fica fora do repo em `C:\Users\wagner.paula\.claude\plans\linked-zooming-shannon.md` — esse plano tem o racional completo de cada decisão; este arquivo é o resumo prático pra continuar.

## O que é o FazMais

Plataforma multi-tenant de catálogo educacional (vídeos, PDFs, artigos) para municípios, com três perfis (Master, Admin, Professor) e consumo estilo Netflix. PRD original em `FazMais_PRD.docx`/`PRD_extracted.txt`.

## Status atual (2026-08-19)

**Feito e commitado em git** (até `e20c3bf`): bootstrap do monorepo + schema Prisma (Lote A) + Tela 01 (Login) + Painel Master (Municípios, Catálogos, Construtor de Catálogo/Tela 05, tema claro/escuro real).

**Mudança de ordem no roadmap**: as Telas 02 ("Ainda não tenho acesso") e 03 ("Esqueceu sua senha?") foram **adiadas** — ver seção "Backlog adiado" no final deste arquivo. Decidiu-se ir direto para a Tela 04 (Painel Master), que cresceu de escopo em cima do PRD original.

**Trabalho em progresso, ainda não commitado**: o opt-in de catálogo compartilhado (M5.5 do plano — Admin ativa/desativa um catálogo global do Master pro próprio município) foi implementado só no backend. Ver seção "M5.5 — Opt-in de Catálogo Compartilhado" abaixo.

**Gaps ainda abertos no escopo do Master** (levantados em 2026-08-19 comparando código vs. PRD/plano): dashboard de stats globais (US-010, é o critério de "pronto" do M4 no plano), CRUD de Planos (só leitura hoje), Master criar outro Master. Priorização sugerida ao usuário nesta ordem: opt-in (feito agora) → stats globais → CRUD de Planos → Master criar Master.

**Testado via API (2026-08-19)**: subi o ambiente (`pnpm turbo run dev`) e validei por `curl`/Prisma todas as rotas novas de Catálogos/Eixos/Coleções/Conteúdos logado como `master` — criar/editar/excluir catálogo, criar eixo/coleção, criar conteúdo com `planoIds` (confirmado vínculo N:N com `Plano`), mover conteúdo entre coleções (`PATCH /conteudos/:id/move`), `POST /conteudos/ai-suggestions` (confirmado que é mock determinístico, tags batem com as palavras do título/descrição), e a regra de bloqueio de exclusão de catálogo (409) — inseri uma linha em `tenant_catalogo_access` direto via `prisma db execute` pra forçar o cenário "município já ativou" e confirmei o 409; depois removi a linha e o DELETE passou a dar 204. Tudo funcionou como esperado, nenhum bug encontrado no backend.

**Não testado ainda**: a UI no navegador (tema, drag & drop visual no construtor). Tentei usar a extensão Claude in Chrome, mas ela controla o navegador real da sua máquina, que é um host diferente do ambiente isolado onde os servidores de dev deste projeto foram subidos — os dois `localhost` não se enxergam. Pra testar visualmente, suba o ambiente na sua própria máquina (seção abaixo) e acesse `http://localhost:5173` no seu navegador.

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

- **Multi-tenancy com catálogo compartilhado**: `Eixo` é o "Acervo" do PRD original (nome + carrossel de pills, sem ícone próprio) — não mudou de comportamento, só de nome. `Catalogo` é um nível **novo, que não existe no PRD**, criado como wrapper acima do Eixo especificamente pra viabilizar compartilhamento cross-tenant: tem `tenantId` nullable (`null` = catálogo global publicado por um Master, disponível pra qualquer município ativar via opt-in na tabela `tenant_catalogo_access`) e é o `Catalogo` (não o `Eixo`) que carrega nome + ícone exibidos na lista/pill de alto nível. Um Admin pode combinar catálogo próprio + catálogos globais ativados; catálogo global é somente leitura pra quem ativa. **Confirmado com o usuário em 2026-08-07** — ver [[project-paineis-planos-tema]] na memória.
- **Hierarquia de 4 níveis**: `Catalogo → Eixo → Colecao → Conteudo`. Catálogo é o nível novo (ver acima); os outros três mapeiam 1:1 pro modelo original de 3 níveis do PRD (Acervo→Eixo, Coleção, Conteúdo). Conteúdo pode ser `VIDEO`, `PDF` ou `ARTIGO` (HTML salvo no próprio banco, campo `htmlContent`).
- **Planos (estilo Netflix)**: entidade global `Plano`, só o Master gerencia. Todo usuário tem um plano individual (`User.planoId`). Todo conteúdo (privado ou compartilhado) tem uma lista de planos permitidos (`ConteudoPlano`, N:N). Visibilidade final = acesso ao catálogo **E** plano do usuário estar na lista do conteúdo.
- **Múltiplos Masters**: um Master pode criar outro Master (não só Admins).
- **Login global**: campo `login` (não `username`, não é e-mail) é único no **sistema inteiro**, não por tenant — por isso a Tela 01 não tem seletor de município, só login + senha. `email` continua único só por tenant.
- **RN-01 (senha definida pelo usuário)**: `User.password` é nullable; usuário criado por Admin/Master recebe token de "1º acesso" (`password_reset_tokens`) e define a própria senha depois.

## Tela 04 — Painel Master

Cobre US-010 a US-015 do PRD (dashboard global, CRUD de municípios, CRUD de admins) **mais duas seções que não estavam no PRD original** (Catálogos, Planos), adicionadas por decisão do usuário em 2026-08-07. Mockup completo em Artifact (link não persiste entre sessões — o HTML-fonte não ficou salvo no repo).

### Implementado em código (2026-08-07) — só a fatia "Municípios"

Backend (`apps/api/src/tenants/`, tudo `@Roles('MASTER')`):
- `GET/POST/PATCH/DELETE /tenants` — CRUD de município. Excluir bloqueado (409) se houver qualquer usuário vinculado (`Tenant.users` também tem `onDelete: Restrict` no schema, então o banco já protegeria mesmo sem a checagem em código).
- `GET/POST/PATCH/DELETE /tenants/:id/admins` — CRUD de admins escopado por tenant. Criar admin gera `User` com `role=ADMIN`, `status=ATIVO`, `password=null` + um `PasswordResetToken` (`type=FIRST_ACCESS`, 7 dias) — **sem envio de e-mail** (não existe serviço de e-mail no projeto ainda); o token é só logado no console da API (`Logger.log`), então dá pra testar o fluxo manualmente pegando o token no log.
- Infra nova que não existia: `JwtStrategy`/`JwtAuthGuard` (passport-jwt) + `RolesGuard`/`@Roles()`/`@CurrentUser()` — até então nenhuma rota da API era protegida, só o login existia. Precisou instalar `@nestjs/passport` (não estava no `package.json`, só `passport`/`passport-jwt` crus).

Frontend (`apps/web/src/features/master/`):
- `/master` agora é protegido por `RequireRole` (redireciona pra `/login` se não for MASTER autenticado) e renderiza `MasterPanelPage` de verdade em vez do placeholder.
- **Menu em abas**: "Municípios" e "Catálogos" — nesta rodada (2026-08-07) só a de Municípios tinha conteúdo, a de Catálogos era um placeholder desabilitado ("Em breve"). **Atualizado depois** (ver seção "Aba Catálogos" abaixo): a aba Catálogos já tem conteúdo funcional.
- Tabela de Municípios + drawer lateral de criar/editar + popup de Administradores escopado por tenant (criar/editar/excluir), replicando a UX do mockup.

**Testado via API (2026-08-07)**: subi o ambiente (`pnpm turbo run dev`, Postgres local já rodando) e bati em todas as rotas com `curl` logado como `master` — criar/editar/excluir município, bloqueio de exclusão com usuários vinculados (409), criar/editar/excluir admin, conflito de login/e-mail duplicado (409), guard de role bloqueando `admin.demo` (403), token de 1º acesso aparecendo no console. Achei e corrigi 1 bug real nesse processo: no Prisma 7 com driver adapter (`@prisma/adapter-pg`), o erro `P2002` não preenche mais `error.meta.target` — o campo do índice único violado vem aninhado em `error.meta.driverAdapterError.cause.constraint.fields`. `TenantsService.runUniqueCheckedWrite` estava sempre caindo na mensagem genérica "Registro duplicado"; corrigido pra ler o campo certo (com fallback pro formato antigo).

**Não testado**: a UI de verdade no navegador (clicar no drawer, no popup, validação de formulário) — não tem ferramenta de navegador neste ambiente de dev, só verificação de API. Os servidores ficaram rodando (`web` em `:5173`, `api` em `:3000`) pra quem for testar visualmente.

### Aba Catálogos (Tela 04) — implementada em código (não commitado)

Backend (`apps/api/src/catalogos/catalogos.controller.ts`, `@Roles('MASTER')`, montado em `CatalogosModule`):
- `GET/POST/PATCH/DELETE /catalogos` — CRUD de catálogo global (`tenantId` sempre `null` aqui; catálogo de tenant específico não tem UI ainda). `GET /catalogos` já devolve contagem de eixos/coleções/conteúdos e de municípios que ativaram (`tenantAccess`), usada na tabela. Excluir bloqueado (409) se algum município já tiver ativado o catálogo (`tenant_catalogo_access`).
- `GET /catalogos/:id` (`getTree`) — devolve a árvore completa `Catalogo → Eixo → Colecao → Conteudo` de uma vez, usada pelo construtor (Tela 05).

Frontend (`apps/web/src/features/master/components/CatalogosTab.tsx` + `CatalogoModal.tsx`):
- Tabela de catálogos globais (ícone, nome, contagens, "Criado em", ações). Clicar na linha ou no lápis navega pra `/master/catalogos/:id` (Tela 05). Botão excluir fica desabilitado com tooltip quando `municipiosAtivos > 0`.
- Modal de criar/editar só pede nome + ícone (emoji), único par de campos que `Catalogo` tem hoje.

### Planos — só leitura, ainda sem gestão

- Backend: `GET /planos` (`@Roles('MASTER')`) devolve a lista de `Plano` (id/name/description). **Sem POST/PATCH/DELETE** — criar/editar/excluir plano não foi implementado.
- Frontend: `usePlanos()` é consumido dentro do `ConteudoModal` (Tela 05) só pra popular o multi-select de planos permitidos de um conteúdo. Não existe aba/tela de gestão de Planos no Painel Master ainda.
- **Tem seed**: `prisma/seeds/seed.ts` já cria um `Plano` "Padrão" (correção: uma versão anterior deste arquivo dizia que a tabela estava vazia — não está). Confirmado em 2026-08-19 via `GET /planos` e testado o vínculo `ConteudoPlano` ponta a ponta com esse plano. Também existe hoje um `Catalogo` "Padrão" (📗) no banco local — não vem do `seed.ts`, então provavelmente foi criado manualmente numa sessão anterior de teste manual.

### Tema claro/escuro — implementado de verdade

Deixou de ser hardcoded/pendente:
- `apps/web/src/store/themeStore.ts` (zustand) guarda o tema (`dark` por padrão) e alterna a classe `.light` na `<html>`.
- `apps/web/src/index.css` define `@custom-variant light (&:where(.light, .light *))` — todo componente usa classes `light:` do Tailwind lado a lado com as escuras.
- `ThemeToggle.tsx` (botão sol/lua) já está tanto na Tela 01 (Login, canto superior direito) quanto no header do `MasterShell` (todas as telas do Painel Master).

**Falta decidir/fazer antes do próximo passo**: CRUD de Planos (criar/editar/excluir, regra de exclusão se algum conteúdo/usuário usa o plano); seed de Planos de exemplo; extender o construtor (Tela 05) e o tema pra fora do Painel Master (Admin ainda não tem nenhuma tela real).

## Tela 05 — Construtor de Catálogo: saiu de mockup e virou código de verdade (não commitado)

Antes só existia como mockup em Artifact; agora é `apps/web/src/features/master/pages/CatalogoBuilderPage.tsx` (rota `/master/catalogos/:id`, só Master) ligado a um backend real. A versão do Admin (catálogo do próprio município) ainda não existe — vai reaproveitar a mesma tela depois.

Backend novo (`apps/api/src/catalogos/`, tudo `@Roles('MASTER')`):
- `eixos.controller.ts` — `POST /catalogos/:id/eixos`, `PATCH/DELETE /eixos/:id`.
- `colecoes.controller.ts` — `POST /eixos/:id/colecoes`, `PATCH/DELETE /colecoes/:id`.
- `conteudos.controller.ts` — `POST /colecoes/:id/conteudos`, `PATCH/DELETE /conteudos/:id`, `PATCH /conteudos/:id/move` (move entre coleções, usado pelo drag & drop), `POST /conteudos/ai-suggestions`.
- **`ai-suggestions` é mock determinístico**, não é chamada real de IA: extrai palavras do título/descrição por regex e devolve como tags + um resumo truncado (`conteudos.service.ts:103`). `.env` já tem `AI_MODE="mock"` e `ANTHROPIC_API_KEY` vazio, preparados pra uma integração real futura, mas nada chama a Anthropic API hoje.
- Nenhuma migration nova foi necessária — `Catalogo`/`Eixo`/`Colecao`/`Conteudo`/`Plano`/`ConteudoPlano` já existiam desde a migration `20260806194558_init_lote_a` (Lote A).

Frontend (`useCatalogoBuilder.ts`, `useCatalogoTree`, `ConteudoModal.tsx`, `NameOnlyModal.tsx`):
- **Mapeamento com o PRD confirmado**: o carrossel de pills desta tela é o nível **Eixo**, "Acervo" do texto original da Tela 05 (só mudou de nome). `Catalogo` (Tela 04) é o nível novo acima do Eixo que não existe no PRD.
- Drag & drop real (não só visual): mover conteúdo entre coleções do mesmo eixo (US-033) arrastando o card; soltar sobre outra pill de eixo move entre eixos (US-034), com modal de escolha de coleção quando o eixo destino tem mais de uma.
- Eixo e Coleção: CRUD mínimo (só nome — duplo clique na pill/título renomeia inline via `NameOnlyModal`). Excluir eixo/coleção pede confirmação nativa (`window.confirm`) e avisa que remove tudo dentro.
- `ConteudoModal` cobre criação/edição de conteúdo (título, descrição, tipo de mídia VIDEO/PDF/ARTIGO, URL ou `htmlContent`, imagem, destaque, tags, planos, botão "Sugerir com IA" que chama o mock acima) — isso cobre boa parte do que seria a Tela 08 standalone, sem precisar dela como tela separada por enquanto.

**Infra reaproveitável sem recriar**: `apiClient.ts`, `queryClient.ts`, `PrismaService`, padrão de módulo Nest (`auth/`, `tenants/`); o padrão de modal + toast + tokens de tema vale pras telas seguintes (Acervo do Admin, Usuários).

## M5.5 — Opt-in de Catálogo Compartilhado (só backend, commit `d19c0e8`)

Fecha a lacuna que existia entre o commit anterior (`e20c3bf`) e o critério de "pronto" do M5.5 do plano: até aqui um Master conseguia criar um catálogo global, mas nenhum município tinha como ativá-lo — o bloqueio de exclusão em `CatalogosService.remove` (`tenant_catalogo_access`) só era alcançável inserindo a linha manualmente no banco. Agora existe o fluxo real.

Backend novo (`apps/api/src/catalogos/tenant-catalogos.controller.ts` + `.service.ts`, registrado em `CatalogosModule`, `@Roles('ADMIN')`, sem UI ainda — decisão consciente, ver abaixo):
- `GET /tenant-catalogos` — lista os catálogos globais (`tenantId: null`) com contagens (eixos/coleções/conteúdos) e um campo `ativo: boolean` indicando se o **tenant do usuário logado** (lido do JWT, nunca do body) já ativou aquele catálogo.
- `POST /tenant-catalogos/:catalogoId` — ativa (idempotente via `upsert`, chamar duas vezes não duplica nem erra).
- `DELETE /tenant-catalogos/:catalogoId` — desativa (idempotente via `deleteMany`, chamar já desativado não erra).
- Tipo novo em `packages/shared/src/catalogos.ts`: `CatalogoDisponivel`.

**Testado via API (2026-08-19)** logado como `admin.demo`: listar com `ativo:false` → ativar (204, idempotente) → listar com `ativo:true` → confirmar que `DELETE /catalogos/:id` como Master agora dá 409 de verdade (sem precisar inserir linha manualmente) → desativar (204, idempotente) → listar volta `ativo:false` → `POST` em catálogo inexistente dá 404 → `master` chamando `/tenant-catalogos` dá 403 (guard de role confirmado). `pnpm --filter @fazmais/api typecheck` limpo.

**Decisão consciente de escopo**: só backend nesta rodada — o Painel Admin ainda não existe (`/admin/acervo` continua `PlaceholderPage`), então não há onde encaixar um toggle de UI ainda sem construir uma tela nova fora de escopo. Quando o Painel Admin de verdade for construído, esses três endpoints já estão prontos pra consumir.

## Backlog adiado

Adiado em 2026-08-07 pra depois da Tela 04. Ficam aqui pra não perder o levantamento já feito.

### Tela 02 — "Ainda não tenho acesso"

US-002 do PRD. Formulário: nome, e-mail, WhatsApp, município (select) — sem senha.

- Backend novo: `GET /tenants/public` (lista `{id, name}` pra popular o select, endpoint público) e `POST /auth/register-pending` (cria `User` com `status=PENDENTE`, `role=PROFESSOR`, `password=null`, vinculado ao `tenantId` escolhido).
- Frontend: primeiro modal real da aplicação, abre a partir do botão "Ainda não tenho acesso" da Tela 01 (hoje só mostra um aviso de placeholder). Precisa de estado de confirmação após o envio.
- `AuthService.validateUser` já bloqueia login de usuário `PENDENTE` (RN-05) — nada a fazer ali.

### Tela 03 — "Esqueceu sua senha?"

US-005 do PRD (parcial). Modal informativo no MVP — o botão da Tela 01 hoje já mostra um aviso de placeholder ("A recuperação de senha por e-mail ainda não está disponível nesta versão."); a Tela 03 formaliza isso como modal de verdade. No produto final, envia link de redefinição por e-mail (fora do escopo do MVP).

### Deploy em produção

Adiado em 2026-08-07. Hoje o projeto só tem ambiente de desenvolvimento local — sem Dockerfile das apps, sem CI/CD (`.github/` não existe), sem hospedagem decidida. O `docker-compose.yml` do repo só sobe o Postgres, não as apps. Quando for a hora:

- Dockerfile pra `apps/api` (build do Nest, rodar `dist/main.js`) e pra `apps/web` (build do Vite, servir o `dist/`).
- Decidir onde hospedar (VPS, Railway, Fly.io etc.) — trava o resto das decisões.
- Gerar `JWT_ACCESS_SECRET`/`JWT_REFRESH_SECRET` de produção de verdade (não os placeholders do `.env.example`) e um jeito de guardá-los fora do repo.
- Banco de produção separado do local + `prisma migrate deploy` (não `migrate dev`) contra ele.
- Ajustar `CORS_ORIGIN` (hoje fixo em `localhost:5173`) pro domínio real.
- Checklist completo de "subir em outra máquina" (só ambiente de dev, não produção) já está na seção "Como subir o ambiente" no topo deste arquivo.
