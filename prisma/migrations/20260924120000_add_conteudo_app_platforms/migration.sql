-- CreateEnum
CREATE TYPE "AppPlatform" AS ENUM ('APP_STORE', 'PLAY_STORE', 'WEB');

-- AlterTable
ALTER TABLE "conteudos" ADD COLUMN     "app_platforms" "AppPlatform"[] DEFAULT ARRAY[]::"AppPlatform"[],
ADD COLUMN     "web_url" TEXT;

-- SQL Manual: escrita à mão (sem `migrate dev`) pra não derrubar o índice GIN
-- de conteudos.tags de novo — reafirmado aqui pelo mesmo motivo das
-- migrations 20260828120907 e 20260909183527.
CREATE INDEX IF NOT EXISTS "conteudos_tags_gin_idx" ON "conteudos" USING GIN ("tags");
