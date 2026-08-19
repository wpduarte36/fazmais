-- AlterTable
ALTER TABLE "conteudos" ADD COLUMN     "download_url" TEXT,
ADD COLUMN     "duration_seconds" INTEGER,
ADD COLUMN     "page_count" INTEGER;

-- SQL Manual: o índice GIN de conteudos.tags não é representável no schema.prisma
-- (por isso "prisma migrate dev" o detecta como drift e gera um DROP INDEX
-- automático toda vez que uma migration nova é criada, inclusive ao reaplicar
-- este arquivo do zero num shadow database onde ele já existe desde a
-- migration init_lote_a). DROP IF EXISTS + CREATE deixa idempotente nos dois
-- cenários; precisa ser reafirmado manualmente em toda migration futura que
-- mexer em Conteudo, até esse índice ser modelado de outra forma.
DROP INDEX IF EXISTS "conteudos_tags_gin_idx";
CREATE INDEX "conteudos_tags_gin_idx" ON "conteudos" USING GIN ("tags");
