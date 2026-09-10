-- SQL Manual: reafirma o índice GIN de conteudos.tags, derrubado pela
-- migration add_conteudo_app_media_type (ALTER TYPE MediaType exige
-- recriar índices dependentes da coluna que o Prisma às vezes remove sem
-- recriar). Ver nota em STATUS.md: qualquer migration futura que mexa perto
-- de Conteudo precisa reafirmar esse índice, senão ele some silenciosamente.
CREATE INDEX IF NOT EXISTS "conteudos_tags_gin_idx" ON "conteudos" USING GIN ("tags");
