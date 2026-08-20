-- AlterTable
ALTER TABLE "conteudos" ADD COLUMN     "view_count" INTEGER NOT NULL DEFAULT 0;

-- SQL Manual: índice GIN de conteudos.tags não representável no schema.prisma
-- (ver nota igual nas migrations anteriores). Reafirmado aqui pelo mesmo
-- motivo: toda migration nova detecta esse índice como drift e tenta
-- derrubá-lo.
DROP INDEX IF EXISTS "conteudos_tags_gin_idx";
CREATE INDEX "conteudos_tags_gin_idx" ON "conteudos" USING GIN ("tags");
