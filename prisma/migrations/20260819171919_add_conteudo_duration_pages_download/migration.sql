-- AlterTable
ALTER TABLE "conteudos" ADD COLUMN     "download_url" TEXT,
ADD COLUMN     "duration_seconds" INTEGER,
ADD COLUMN     "page_count" INTEGER;

-- SQL Manual: o índice GIN de conteudos.tags não é representável no schema.prisma
-- (por isso "prisma migrate dev" o detecta como drift e gera um DROP INDEX
-- automático toda vez que uma migration nova é criada). Recriado aqui pra não
-- perder o índice; precisa ser reafirmado manualmente em toda migration futura
-- que mexer em Conteudo, até esse índice ser modelado de outra forma.
CREATE INDEX "conteudos_tags_gin_idx" ON "conteudos" USING GIN ("tags");
