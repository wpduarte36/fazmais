# Changelog de Migrations

## 20260806194558_init_lote_a

- **Aprovado por**: PO (po-tic@vitaebrasil.com.br), em conversa no chat, 2026-08-06.
- **Aplicado em**: 2026-08-06, banco local `fazmais_dev` (PostgreSQL 15 nativo).
- **Resumo**: Lote A completo — 14 tabelas de negócio: `tenants`, `users`, `planos`,
  `catalogos`, `eixos`, `colecoes`, `conteudos`, `conteudo_planos`,
  `tenant_catalogo_access`, `favorites`, `ratings`, `progress`, `refresh_tokens`,
  `password_reset_tokens`.
- **SQL manual incluído nesta migration** (não expressável no `schema.prisma`):
  1. `users_tenant_id_master_check` — `tenant_id` só nulo quando `role='MASTER'`.
  2. `users_master_email_unique` — índice único parcial de `email` para `tenant_id IS NULL` (Master).
  3. `ratings_score_check` — `score` entre 1 e 5.
  4. `conteudos_tags_gin_idx` — índice GIN em `tags` para busca.
  5. `conteudos_media_type_content_check` — VIDEO/PDF exigem `media_url` (sem `html_content`); ARTIGO exige `html_content` (sem `media_url`).
- **Não incluído neste lote**: RLS (Row Level Security) — fica para o Checkpoint 5 (M16), migration separada.
