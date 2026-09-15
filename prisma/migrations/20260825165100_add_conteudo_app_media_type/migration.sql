-- AlterEnum
ALTER TYPE "MediaType" ADD VALUE 'APP';

-- DropIndex
DROP INDEX "conteudos_tags_gin_idx";

-- AlterTable
ALTER TABLE "conteudos" ADD COLUMN     "app_store_url" TEXT,
ADD COLUMN     "play_store_url" TEXT;
