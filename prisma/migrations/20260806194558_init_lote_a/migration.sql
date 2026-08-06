-- CreateEnum
CREATE TYPE "Role" AS ENUM ('MASTER', 'ADMIN', 'PROFESSOR');

-- CreateEnum
CREATE TYPE "UserStatus" AS ENUM ('PENDENTE', 'ATIVO', 'INATIVO');

-- CreateEnum
CREATE TYPE "MediaType" AS ENUM ('VIDEO', 'PDF', 'ARTIGO');

-- CreateEnum
CREATE TYPE "PasswordTokenType" AS ENUM ('FIRST_ACCESS', 'RESET');

-- CreateTable
CREATE TABLE "tenants" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tenants_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "planos" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "planos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT,
    "plano_id" TEXT,
    "name" TEXT NOT NULL,
    "login" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "whatsapp" TEXT,
    "password" TEXT,
    "role" "Role" NOT NULL DEFAULT 'PROFESSOR',
    "status" "UserStatus" NOT NULL DEFAULT 'PENDENTE',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "catalogos" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT,
    "name" TEXT NOT NULL,
    "icon" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "catalogos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "eixos" (
    "id" TEXT NOT NULL,
    "catalogo_id" TEXT NOT NULL,
    "tenant_id" TEXT,
    "name" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "eixos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "colecoes" (
    "id" TEXT NOT NULL,
    "eixo_id" TEXT NOT NULL,
    "tenant_id" TEXT,
    "name" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "colecoes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "conteudos" (
    "id" TEXT NOT NULL,
    "colecao_id" TEXT NOT NULL,
    "tenant_id" TEXT,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "media_type" "MediaType" NOT NULL,
    "media_url" TEXT,
    "html_content" TEXT,
    "image_url" TEXT NOT NULL,
    "is_featured" BOOLEAN NOT NULL DEFAULT false,
    "tags" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "ai_summary" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "conteudos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "conteudo_planos" (
    "id" TEXT NOT NULL,
    "conteudo_id" TEXT NOT NULL,
    "plano_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "conteudo_planos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tenant_catalogo_access" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "catalogo_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "tenant_catalogo_access_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "favorites" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "conteudo_id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "favorites_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ratings" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "conteudo_id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "score" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ratings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "progress" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "conteudo_id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "progress_percent" INTEGER NOT NULL DEFAULT 0,
    "last_position" INTEGER NOT NULL DEFAULT 0,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "progress_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "refresh_tokens" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "token_hash" TEXT NOT NULL,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "revoked_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "refresh_tokens_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "password_reset_tokens" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "token_hash" TEXT NOT NULL,
    "type" "PasswordTokenType" NOT NULL DEFAULT 'FIRST_ACCESS',
    "expires_at" TIMESTAMP(3) NOT NULL,
    "used_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "password_reset_tokens_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "planos_name_key" ON "planos"("name");

-- CreateIndex
CREATE INDEX "users_tenant_id_idx" ON "users"("tenant_id");

-- CreateIndex
CREATE INDEX "users_tenant_id_role_idx" ON "users"("tenant_id", "role");

-- CreateIndex
CREATE INDEX "users_tenant_id_status_idx" ON "users"("tenant_id", "status");

-- CreateIndex
CREATE INDEX "users_plano_id_idx" ON "users"("plano_id");

-- CreateIndex
CREATE UNIQUE INDEX "users_login_key" ON "users"("login");

-- CreateIndex
CREATE UNIQUE INDEX "users_tenant_id_email_key" ON "users"("tenant_id", "email");

-- CreateIndex
CREATE INDEX "catalogos_tenant_id_idx" ON "catalogos"("tenant_id");

-- CreateIndex
CREATE INDEX "eixos_tenant_id_idx" ON "eixos"("tenant_id");

-- CreateIndex
CREATE INDEX "eixos_catalogo_id_idx" ON "eixos"("catalogo_id");

-- CreateIndex
CREATE INDEX "colecoes_tenant_id_idx" ON "colecoes"("tenant_id");

-- CreateIndex
CREATE INDEX "colecoes_eixo_id_idx" ON "colecoes"("eixo_id");

-- CreateIndex
CREATE INDEX "conteudos_tenant_id_idx" ON "conteudos"("tenant_id");

-- CreateIndex
CREATE INDEX "conteudos_colecao_id_idx" ON "conteudos"("colecao_id");

-- CreateIndex
CREATE INDEX "conteudos_tenant_id_is_featured_idx" ON "conteudos"("tenant_id", "is_featured");

-- CreateIndex
CREATE INDEX "conteudo_planos_plano_id_idx" ON "conteudo_planos"("plano_id");

-- CreateIndex
CREATE UNIQUE INDEX "conteudo_planos_conteudo_id_plano_id_key" ON "conteudo_planos"("conteudo_id", "plano_id");

-- CreateIndex
CREATE INDEX "tenant_catalogo_access_catalogo_id_idx" ON "tenant_catalogo_access"("catalogo_id");

-- CreateIndex
CREATE UNIQUE INDEX "tenant_catalogo_access_tenant_id_catalogo_id_key" ON "tenant_catalogo_access"("tenant_id", "catalogo_id");

-- CreateIndex
CREATE INDEX "favorites_conteudo_id_idx" ON "favorites"("conteudo_id");

-- CreateIndex
CREATE UNIQUE INDEX "favorites_user_id_conteudo_id_key" ON "favorites"("user_id", "conteudo_id");

-- CreateIndex
CREATE INDEX "ratings_conteudo_id_idx" ON "ratings"("conteudo_id");

-- CreateIndex
CREATE UNIQUE INDEX "ratings_user_id_conteudo_id_key" ON "ratings"("user_id", "conteudo_id");

-- CreateIndex
CREATE INDEX "progress_user_id_idx" ON "progress"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "progress_user_id_conteudo_id_key" ON "progress"("user_id", "conteudo_id");

-- CreateIndex
CREATE UNIQUE INDEX "refresh_tokens_token_hash_key" ON "refresh_tokens"("token_hash");

-- CreateIndex
CREATE INDEX "refresh_tokens_user_id_idx" ON "refresh_tokens"("user_id");

-- CreateIndex
CREATE INDEX "refresh_tokens_expires_at_idx" ON "refresh_tokens"("expires_at");

-- CreateIndex
CREATE UNIQUE INDEX "password_reset_tokens_token_hash_key" ON "password_reset_tokens"("token_hash");

-- CreateIndex
CREATE INDEX "password_reset_tokens_user_id_idx" ON "password_reset_tokens"("user_id");

-- CreateIndex
CREATE INDEX "password_reset_tokens_expires_at_idx" ON "password_reset_tokens"("expires_at");

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_plano_id_fkey" FOREIGN KEY ("plano_id") REFERENCES "planos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "catalogos" ADD CONSTRAINT "catalogos_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "eixos" ADD CONSTRAINT "eixos_catalogo_id_fkey" FOREIGN KEY ("catalogo_id") REFERENCES "catalogos"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "eixos" ADD CONSTRAINT "eixos_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "colecoes" ADD CONSTRAINT "colecoes_eixo_id_fkey" FOREIGN KEY ("eixo_id") REFERENCES "eixos"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "colecoes" ADD CONSTRAINT "colecoes_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "conteudos" ADD CONSTRAINT "conteudos_colecao_id_fkey" FOREIGN KEY ("colecao_id") REFERENCES "colecoes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "conteudos" ADD CONSTRAINT "conteudos_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "conteudo_planos" ADD CONSTRAINT "conteudo_planos_conteudo_id_fkey" FOREIGN KEY ("conteudo_id") REFERENCES "conteudos"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "conteudo_planos" ADD CONSTRAINT "conteudo_planos_plano_id_fkey" FOREIGN KEY ("plano_id") REFERENCES "planos"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tenant_catalogo_access" ADD CONSTRAINT "tenant_catalogo_access_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tenant_catalogo_access" ADD CONSTRAINT "tenant_catalogo_access_catalogo_id_fkey" FOREIGN KEY ("catalogo_id") REFERENCES "catalogos"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "favorites" ADD CONSTRAINT "favorites_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "favorites" ADD CONSTRAINT "favorites_conteudo_id_fkey" FOREIGN KEY ("conteudo_id") REFERENCES "conteudos"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "favorites" ADD CONSTRAINT "favorites_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ratings" ADD CONSTRAINT "ratings_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ratings" ADD CONSTRAINT "ratings_conteudo_id_fkey" FOREIGN KEY ("conteudo_id") REFERENCES "conteudos"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ratings" ADD CONSTRAINT "ratings_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "progress" ADD CONSTRAINT "progress_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "progress" ADD CONSTRAINT "progress_conteudo_id_fkey" FOREIGN KEY ("conteudo_id") REFERENCES "conteudos"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "progress" ADD CONSTRAINT "progress_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "refresh_tokens" ADD CONSTRAINT "refresh_tokens_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "password_reset_tokens" ADD CONSTRAINT "password_reset_tokens_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- SQL Manual (1/5): tenant_id só pode ser nulo quando role = 'MASTER'
ALTER TABLE "users" ADD CONSTRAINT "users_tenant_id_master_check"
  CHECK ((role = 'MASTER' AND tenant_id IS NULL) OR (role <> 'MASTER' AND tenant_id IS NOT NULL));

-- SQL Manual (2/5): email único entre os Masters (tenant_id IS NULL) — unique
-- constraint composta (tenant_id, email) não pega duplicidade quando tenant_id
-- é NULL para múltiplas linhas, por isso o índice parcial cobre só esse caso.
CREATE UNIQUE INDEX "users_master_email_unique" ON "users"("email") WHERE "tenant_id" IS NULL;

-- SQL Manual (3/5): nota de avaliação só entre 1 e 5
ALTER TABLE "ratings" ADD CONSTRAINT "ratings_score_check"
  CHECK (score BETWEEN 1 AND 5);

-- SQL Manual (4/5): índice GIN para busca por tag em conteudos.tags
CREATE INDEX "conteudos_tags_gin_idx" ON "conteudos" USING GIN ("tags");

-- SQL Manual (5/5): consistência entre media_type e o campo de mídia preenchido
-- VIDEO/PDF usam media_url; ARTIGO usa html_content — nunca os dois nem nenhum.
ALTER TABLE "conteudos" ADD CONSTRAINT "conteudos_media_type_content_check"
  CHECK (
    (media_type IN ('VIDEO', 'PDF') AND media_url IS NOT NULL AND html_content IS NULL)
    OR
    (media_type = 'ARTIGO' AND html_content IS NOT NULL AND media_url IS NULL)
  );
