-- AlterTable
ALTER TABLE "eixos" ADD COLUMN     "description" TEXT;

-- SQL Manual: índice GIN de conteudos.tags não representável no schema.prisma
-- (ver nota igual na migration 20260819171919_add_conteudo_duration_pages_download).
-- Reafirmado aqui pelo mesmo motivo: toda migration nova detecta esse índice
-- como drift e tenta derrubá-lo.
DROP INDEX IF EXISTS "conteudos_tags_gin_idx";
CREATE INDEX "conteudos_tags_gin_idx" ON "conteudos" USING GIN ("tags");
