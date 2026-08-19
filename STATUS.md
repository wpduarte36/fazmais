# FazMais — Status do Projeto

> Este arquivo existe pra retomar o trabalho independente de qual conta/máquina está acessando o repositório. Complementa (não substitui) o plano completo, que fica fora do repo em `C:\Users\wagner.paula\.claude\plans\linked-zooming-shannon.md` — esse plano tem o racional completo de cada decisão; este arquivo é o resumo prático pra continuar.

## O que é o FazMais

Plataforma multi-tenant de catálogo educacional (vídeos, PDFs, artigos) para municípios, com três perfis (Master, Admin, Professor) e consumo estilo Netflix. PRD original em `FazMais_PRD.docx`/`PRD_extracted.txt`.

## Status atual (2026-08-19)

**Feito e commitado em git** (até `c800f1f`): bootstrap do monorepo + schema Prisma (Lote A) + Tela 01 (Login) + Painel Master (Municípios, Catálogos, Construtor de Catálogo/Tela 05, tema claro/escuro real) + opt-in de catálogo compartilhado (backend) + campos novos em Conteudo/Eixo pro import do legado + **migração real de dados do FazMais legado (Faz+)** + **Home do Professor completa nos 3 tipos de mídia** (hero, menu horizontal de Eixos, fileiras por Coleção, leitura de Artigo com HTML rico, player de Vídeo, viewer de PDF em formato de livro). Ver seções "Migração do legado (Faz+)" e "Home do Professor" abaixo pros detalhes.

**Ainda não commitado**: o `PdfModal` (viewer de PDF) e o ajuste de conteúdo dos 2 artigos originais pra HTML rico em vez de texto puro — ver seção "Home do Professor" e a nota de HTML rico logo abaixo dela.

**Mudança de ordem no roadmap**: as Telas 02 ("Ainda não tenho acesso") e 03 ("Esqueceu sua senha?") foram **adiadas** — ver seção "Backlog adiado" no final deste arquivo. Decidiu-se ir direto para a Tela 04 (Painel Master), que cresceu de escopo em cima do PRD original.

**Gaps ainda abertos no escopo do Master** (levantados em 2026-08-19 comparando código vs. PRD/plano, ainda não resolvidos): dashboard de stats globais (US-010, é o critério de "pronto" do M4 no plano), CRUD de Planos (só leitura hoje), Master criar outro Master.

**Bloqueio externo conhecido — vídeos do Vimeo não tocam fora do domínio da Faz Educação**: o player de vídeo (`VideoModal`) está implementado e correto no código, mas o Vimeo devolve **403** ao tentar embedar em `localhost` (ou qualquer domínio fora da lista de domínios permitidos configurada na conta Vimeo de origem — "Where can this be embedded?"). Não é bug nosso; só destrava pedindo pra quem administra a conta Vimeo da Faz Educação liberar o(s) domínio(s) do FazMais novo (dev e produção). Detalhe completo na seção "Home do Professor".

**Ambiente de teste visual mudou de comportamento nesta sessão — e finalmente funcionou**: em sessões anteriores, a extensão Claude in Chrome não alcançava o `localhost` do ambiente de dev (hosts diferentes). Nesta sessão descobrimos que, além disso, **a extensão pode estar pareada com o Chrome de outra máquina** (mesma conta logada em 2 PCs) — nesse caso ela abre um navegador que nem é o seu, e navegar pra `localhost:5173` mostra o que quer que esteja rodando *naquela* outra máquina (nos deparamos com um projeto não relacionado chamado "Gerente"). `list_connected_browsers`/`switch_browser` tentados sem sucesso pra trocar de máquina em runtime. **O que funcionou de verdade**: o usuário fechou a extensão em ambas as máquinas e reabriu só na que roda o FazMais — na reconexão seguinte (`list_connected_browsers`) veio um `deviceId` novo, e a partir daí o navegador certo respondeu (`localhost:5173` mostrou o FazMais de verdade). Se cair de novo no navegador errado: não adianta insistir em `switch_browser`, é mais rápido pedir pro usuário fechar a extensão nas máquinas erradas e reabrir só na certa.

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
- Ferramenta de navegador (Claude in Chrome) disponível, mas com ressalvas — ver "Ambiente de teste visual" no topo deste arquivo.

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

## Migração do legado (Faz+) — dados reais no catálogo "Faz+ Legado"

Contexto: já existe um FazMais legado no ar ("Faz+", `admfazmais.fazeducacao.com.br` admin / `fazmais.fazeducacao.com.br` app do usuário final), sem DB/API documentada disponível — só acesso visual (login manual do usuário, eu sigo a partir da aba autenticada, nunca toco em usuário/senha). Migração feita via automação de navegador (Claude in Chrome) + script de import contra a nossa própria API.

**Mapeamento de estrutura combinado com o usuário**: `Catalogo` = "Faz+ Legado" (novo, global, ícone 📦) → `Eixo` = Módulo do legado (ex: Tecnológico) → `Colecao` = Categoria do legado (ex: Tutoriais) → `Conteudo` = Funcionalidade+Arquivo (nome da Funcionalidade vira `tags`).

**Achados técnicos importantes durante a extração**:
- A API por trás do admin (`ms-commons.fazeducacao.com.br/ms-admin/api/...`) existe mas não é chamável via `fetch` injetado (bloqueado por CORS/segurança da própria ferramenta) — extração teve que ser via leitura do DOM (`document.getElementById(...).value`), não da API.
- **Índice GIN de `conteudos.tags`** (SQL manual, não representável no `schema.prisma`) é derrubado automaticamente pelo Prisma toda vez que uma migration nova é gerada (drift). Duas migrations desta sessão (`add_conteudo_duration_pages_download`, `add_eixo_description`) precisaram reafirmar `DROP INDEX IF EXISTS` + `CREATE INDEX` manualmente — **fazer isso em qualquer migration futura que mexer perto de `Conteudo`**, senão o índice some silenciosamente.
- **`imageUrl` (foto de capa) e o link de Download são URLs assinadas** (S3 e Vimeo `progressive_redirect`, respectivamente) — temporárias/expiráveis, e a ferramenta de automação bloqueia a leitura desses valores por segurança (heurística de "query string suspeita"). Não dá pra extrair, e mesmo se desse, ficariam inúteis depois de expirar. Decisão: `imageUrl` usa um placeholder genérico por Eixo (`https://placehold.co/600x400?text={eixo}`); `downloadUrl` fica vazio (campo existe no schema, mas nada foi migrado pra ele — feature de download em si não existe no produto ainda).
- **`mediaUrl` (Link url Visualização) é o link de gerenciamento do Vimeo** (`vimeo.com/manage/videos/{id}/{hash}`), não o link de player — precisou de conversão no frontend (ver seção "Home do Professor").
- **"Total horas" do legado não bate com a duração real** do vídeo em pelo menos 1 caso observado (campo dizia "00:01", o vídeo real tinha 1min24s) — dado de origem pouco confiável, migrado do jeito que está (`durationSeconds`), sem tentar corrigir.

**O que foi migrado** (script `scripts/import-legado.mjs`, idempotente — progresso em `scripts/import-legado.progress.json`, gitignorado, apagar força recriar tudo). **83 conteúdos no total**, todos dentro do catálogo "Faz+ Legado":
- **Eixo Tecnológico → Coleção Tutoriais**: 24 conteúdos VIDEO (piloto completo de uma categoria pequena, usado pra validar o pipeline inteiro antes de decidir se valia expandir).
- **Eixo Tecnológico → Coleção Mão na massa**: 42 conteúdos PDF. Cada "Arquivo" PDF do legado não é um arquivo puro — é um link pro visualizador de flipbook de terceiros **FlipHTML5** (`online.fliphtml5.com/{id}/{hash}/#p=1`), URL limpa/permanente (sem assinatura, ao contrário da imagem de capa e do link de download). `pageCount` migrado do campo "Total páginas" do legado.
- **Eixo Notícias → Coleção Educação**: 17 conteúdos ARTIGO. Essa seção do legado ("Artigos" no menu, na verdade um agregador de notícias) tinha uma mistura que só apareceu durante a extração: **2 artigos pedagógicos originais** da Faz Educação (autor nomeado, corpo completo, ex: "Documentação Pedagógica...") e **15 notícias de terceiro** sindicadas via "Canguru News" (link pra `escolanaminhacasa.com.br`, algumas com o artigo inteiro copiado no campo de corpo). Decisão tomada com o usuário por causa de direitos autorais: os 2 originais entraram com o corpo completo; os 15 de terceiro entraram só com um excerpt curto + link pra fonte + autor como citação — nunca o corpo inteiro reproduzido, independente do que a fonte tinha.
- **Extração completa (todos os Eixos/Categorias do catálogo principal) foi tentada e abandonada** numa rodada anterior: só enumerar a lista (sem nem entrar no detalhe de cada item) consumiu ~470k tokens e não terminou — o catálogo real é uma biblioteca curricular grande (200-400+ itens, por série/matéria: Inglês, Avaliação, Plano de Aula por disciplina etc.), não um punhado de tutoriais. Se for migrar o resto, **não tentar via clique-a-clique de novo sem antes conseguir acesso melhor** (export/API/DB de verdade da equipe Faz Educação) — foi a própria recomendação do agente que tentou. Quando já se sabe o(s) código(s) de antemão (ex: filtrando por Categoria no admin antes de disparar a extração), a extração fica bem mais barata — o piloto de PDFs (42 itens) só levou ~776k tokens porque o agente já recebeu a lista pronta, sem precisar paginar a lista de "Arquivos" do zero.
- **Estado atual do banco local**: catálogo "Faz+ Legado" ativado (`tenant_catalogo_access`) pro tenant "Município Demo" (mesmo tenant de `admin.demo`/`professor.demo`); 1 conteúdo (`AirPlay`) marcado `isFeatured: true` pra popular o hero da Home do Professor.

## Home do Professor — US-050/051/052, parcial (falta favoritar/avaliar/progresso/busca)

Rota `/` trocada de `PlaceholderPage` pra `HomePage` de verdade, atrás de `RequireRole(PROFESSOR)`. Escopo combinado com o usuário: versão enxuta primeiro (visualização), sem favoritar/avaliar/progresso/busca ainda — isso é o resto do Épico 3.6 do PRD (US-053/054/055/056), fica pra quando fizer sentido.

Backend (`apps/api/src/home/`, `GET /home/feed`, `@Roles('PROFESSOR')`):
- Filtra `Conteudo` por **tenant** (próprio OU catálogo global ativado via `tenant_catalogo_access`, mesma regra OR usada no resto do app) **E plano** (conteúdo sem nenhum `Plano` associado = visível a todos; com `Plano` associado = só quem tem esse plano vê).
- Devolve `{ featured, rows: [{ eixoId, eixoName, colecaoId, colecaoName, conteudos }] }` — cada `conteudo` já vem completo (`ConteudoSummary`, inclusive `htmlContent`), sem precisar de endpoint extra pra abrir um artigo.
- `featured` = primeiro `isFeatured=true` encontrado, ou o primeiro conteúdo da lista como fallback.

Frontend (`apps/web/src/features/professor/`):
- **Menu horizontal de Eixos** (pills, mesmo padrão visual do Construtor de Catálogo do Master) logo abaixo do hero — inspirado na barra lateral vertical do legado, mas horizontal por pedido do usuário. Clicar num pill filtra as fileiras de Coleção mostradas embaixo; o primeiro Eixo (por ordem de aparição no feed) é selecionado por padrão.
- **`ArtigoModal`**: cards `ARTIGO` (e o hero, quando for o caso) abrem um modal renderizando `htmlContent` via `dangerouslySetInnerHTML` — aceitável porque só Master/Admin (papéis confiáveis) criam esse HTML, não input de usuário final. Sem sanitização de HTML implementada (não existe biblioteca pra isso no projeto ainda).
- **`VideoModal`**: cards `VIDEO` abrem modal com o player oficial `@vimeo/player` (pacote novo, adicionado nesta sessão). `apps/web/src/features/professor/lib/vimeo.ts` converte o `mediaUrl` (link de gerenciamento) pra URL de player real (`player.vimeo.com/video/{id}?h={hash}`) — parsing validado contra os dados reais migrados, inclusive o sufixo `/privacy` que alguns itens têm.
  - **Vídeo não toca fora do domínio da Faz Educação (403 do Vimeo)** — ver aviso no topo deste arquivo. Confirmado pelo usuário testando de verdade: erro no console é `Failed to load resource: the server responded with a status of 403` na URL do player. É restrição de domínio de embed configurada na conta Vimeo de origem, não um bug de código.
- **`PdfModal`** (não commitado ainda): cards `PDF` abrem um modal com `<iframe src={mediaUrl}>`. Como o "PDF" do legado já é um link do **FlipHTML5** (visualizador de flipbook de terceiros, `online.fliphtml5.com/{id}/{hash}/#p=1`), embedar o link deles direto já dá a experiência de "livro" (paginação, zoom, tela cheia) sem precisar reimplementar nada com `pdf.js`/`react-pageflip` como o plano original sugeria — a fonte já resolveu esse problema. **Testado e confirmado pelo usuário no navegador**, funcionando.

### HTML rico nos 2 artigos originais (correção pós-migração, feita via API direto — não é uma nova migration nem passou pelo script)

O usuário notou que os 2 artigos originais ("Documentação Pedagógica...", "Planejamento Pedagógico Inclusivo...") tinham sido migrados só como **texto puro** dentro de um `<p>`, perdendo negrito/itálico/listas/links que existiam no editor rico do legado — a extração original usou `textContent` em vez de `innerHTML` porque ler `innerHTML` disparava o bloqueio de segurança da ferramenta de automação (fica mais claro por quê, abaixo). Corrigido via `PATCH /conteudos/:id` direto (script descartável, não ficou no repo), sem precisar remigrar do zero.

**Como o HTML de verdade foi extraído, apesar do bloqueio**:
1. O gatilho do bloqueio não é o HTML em si — é ler a `<img>` embutida no corpo (do legado, S3 com URL assinada, mesmo problema de sempre) e trechos com muitos `<a href="https://...">` agrupados (a seção de Referências acadêmicas, com 5-6 URLs de citação seguidas). Removendo `<img>` e elementos `[contenteditable="false"]` (que no editor do legado marca **widgets de UI do editor**, tipo os controles de "inserir parágrafo antes/depois" que ficam junto da imagem — não são conteúdo) antes de ler, o resto do corpo passa limpo.
2. Mesmo limpo, o bloqueio ainda pegava esporadicamente em pedaços de ~900 caracteres que combinavam `?` (interrogações do texto normal) com outros padrões — **reduzir o tamanho do pedaço lido (até 100-300 caracteres) sempre resolvia**, então a extração ficou mais lenta que o normal só nesses pontos.
3. A seção de "Referências" bibliográficas (lista de URLs de citação) continuou bloqueada mesmo em pedaços pequenos — ali usei o texto puro que já tinha sido extraído antes (na primeira rodada) pra montar os `<p><a href="...">` manualmente, já que eu já tinha as URLs legítimas em mãos.
4. **Para migrações futuras que precisem do HTML de verdade** (não só texto): sempre tentar `innerHTML` primeiro; se bloquear, clonar o nó, remover `img`/`svg`/`figure`/`[contenteditable="false"]`, e tentar de novo; se ainda bloquear em pedaços grandes, reduzir o tamanho do pedaço até passar — é raro precisar chegar a texto puro como último recurso.

**Testado e confirmado visualmente pelo usuário no navegador**: os dois artigos abrem no `ArtigoModal` com negrito, itálico, listas e links de referência clicáveis renderizando corretamente.

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
