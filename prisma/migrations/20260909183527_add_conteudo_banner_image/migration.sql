-- DropIndex
DROP INDEX "conteudos_tags_gin_idx";

-- AlterTable
ALTER TABLE "conteudos" ADD COLUMN     "banner_image_url" TEXT;

-- SQL Manual: reafirma o índice GIN de conteudos.tags, que o Prisma dropa
-- de novo sempre que uma migration muda algo perto de Conteudo (padrão já
-- visto antes, ver 20260828120907_fix_conteudo_tags_gin_index).
CREATE INDEX IF NOT EXISTS "conteudos_tags_gin_idx" ON "conteudos" USING GIN ("tags");
