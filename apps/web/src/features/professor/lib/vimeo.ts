export interface VimeoRef {
  id: string;
  hash?: string;
}

// O mediaUrl migrado do legado é o link de GERENCIAMENTO do Vimeo
// (vimeo.com/manage/videos/{id}/{hash}), que exige login de dono do vídeo —
// não é embedável. Extrai id+hash pra montar a URL real do player
// (player.vimeo.com/video/{id}?h={hash}, formato usado por vídeos "unlisted").
export function parseVimeoUrl(url: string): VimeoRef | null {
  const manage = /vimeo\.com\/manage\/videos\/(\d+)(?:\/([a-zA-Z0-9]+))?/.exec(url);
  if (manage) return { id: manage[1], hash: manage[2] };

  const direct = /vimeo\.com\/(?:video\/)?(\d+)(?:\/([a-zA-Z0-9]+))?/.exec(url);
  if (direct) return { id: direct[1], hash: direct[2] };

  return null;
}

export function toPlayerUrl(ref: VimeoRef): `https://player.vimeo.com/video/${string}` {
  return `https://player.vimeo.com/video/${ref.id}${ref.hash ? `?h=${ref.hash}` : ''}`;
}
