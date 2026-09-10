-- SQL Manual: atualiza o CHECK de consistência entre media_type e o campo de
-- mídia preenchido para incluir o novo MediaType APP.
-- VIDEO/PDF usam media_url; ARTIGO usa html_content; APP não usa nenhum dos
-- dois (usa app_store_url/play_store_url em vez disso).
ALTER TABLE "conteudos" DROP CONSTRAINT "conteudos_media_type_content_check";

ALTER TABLE "conteudos" ADD CONSTRAINT "conteudos_media_type_content_check"
  CHECK (
    (media_type IN ('VIDEO', 'PDF') AND media_url IS NOT NULL AND html_content IS NULL)
    OR
    (media_type = 'ARTIGO' AND html_content IS NOT NULL AND media_url IS NULL)
    OR
    (media_type = 'APP' AND media_url IS NULL AND html_content IS NULL)
  );
