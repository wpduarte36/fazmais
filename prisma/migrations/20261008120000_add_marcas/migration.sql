-- AlterTable
ALTER TABLE "tenants" ADD COLUMN     "marca_id" TEXT;

-- CreateTable
CREATE TABLE "marcas" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "nome_exibicao" TEXT NOT NULL,
    "nome_assistente" TEXT NOT NULL,
    "cor_primaria" TEXT,
    "logo_url" TEXT,
    "dominios" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "marcas_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "marcas_slug_key" ON "marcas"("slug");

-- AddForeignKey
ALTER TABLE "tenants" ADD CONSTRAINT "tenants_marca_id_fkey" FOREIGN KEY ("marca_id") REFERENCES "marcas"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Marcas iniciais. Cor/logo nulos = paleta e logo padrão; domínios entram
-- quando forem definidos (host desconhecido cai na marca padrão "fazmais").
INSERT INTO "marcas" ("id", "slug", "nome_exibicao", "nome_assistente", "updated_at") VALUES
    (gen_random_uuid()::text, 'fazmais', 'FazMais', 'Fabinho', CURRENT_TIMESTAMP),
    (gen_random_uuid()::text, 'plannetamais', 'PlannetaMais', 'Planinho', CURRENT_TIMESTAMP);
