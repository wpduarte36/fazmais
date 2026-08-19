-- AlterTable
ALTER TABLE "conteudos" ADD COLUMN     "external_url" TEXT,
ADD COLUMN     "source_name" TEXT;

-- SQL Manual: índice GIN de conteudos.tags não representável no schema.prisma
-- (ver nota igual nas migrations 20260819171919 e 20260819180151).
-- Reafirmado aqui pelo mesmo motivo: toda migration nova detecta esse índice
-- como drift e tenta derrubá-lo.
DROP INDEX IF EXISTS "conteudos_tags_gin_idx";
CREATE INDEX "conteudos_tags_gin_idx" ON "conteudos" USING GIN ("tags");
