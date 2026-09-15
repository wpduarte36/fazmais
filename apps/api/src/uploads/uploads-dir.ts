import { join } from 'path';

// Onde as imagens de capa e PDFs enviados via UploadsController ficam gravados
// em disco. `main.ts` (useStaticAssets) e `uploads.controller.ts` (diskStorage)
// TÊM que apontar pro mesmo lugar — por isso a constante mora aqui.
//
// - Local: pasta do repo, `apps/api/uploads` (o `..` sobe de `dist/uploads`).
// - Produção (Railway): defina UPLOADS_DIR pro caminho de um volume persistente
//   (ex: `/data/uploads`). Sem volume, todo arquivo enviado some no próximo
//   deploy — o filesystem do container é efêmero.
export const UPLOADS_DIR =
  process.env.UPLOADS_DIR ?? join(__dirname, '..', '..', 'uploads');
