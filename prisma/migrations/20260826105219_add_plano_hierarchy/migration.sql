-- Plano ganha hierarquia por nível (0 = Padrão, o mais básico). A única linha
-- existente hoje ("Padrão") assume level 0 via DEFAULT; o DEFAULT é removido
-- em seguida pra não incentivar novos planos criados sem level explícito.
ALTER TABLE "planos" ADD COLUMN "level" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "planos" ALTER COLUMN "level" DROP DEFAULT;
CREATE UNIQUE INDEX "planos_level_key" ON "planos"("level");

-- Conteudo troca o vínculo N:N com Plano (conteudo_planos) por um único
-- "plano mínimo" — nulo = rascunho, não visível pra ninguém.
ALTER TABLE "conteudos" ADD COLUMN "plano_minimo_id" TEXT;

-- Backfill: hoje nenhum conteúdo tem ConteudoPlano vinculado, e a regra atual
-- já deixa esse caso visível pra todo mundo. Pra preservar esse
-- comportamento após a virada (em vez de virar rascunho oculto), todo
-- conteúdo existente recebe o plano Padrão.
UPDATE "conteudos" SET "plano_minimo_id" = (SELECT "id" FROM "planos" WHERE "name" = 'Padrão' LIMIT 1);

DROP TABLE "conteudo_planos";

CREATE INDEX "conteudos_plano_minimo_id_idx" ON "conteudos"("plano_minimo_id");

ALTER TABLE "conteudos" ADD CONSTRAINT "conteudos_plano_minimo_id_fkey" FOREIGN KEY ("plano_minimo_id") REFERENCES "planos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
