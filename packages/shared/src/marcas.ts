// Identidade visual (white-label) resolvida pela URL de acesso. Pública: a
// tela de login já precisa dela, antes de qualquer autenticação.
export interface MarcaPublica {
  slug: string;
  nomeExibicao: string;
  nomeAssistente: string;
  corPrimaria: string | null; // hex #rrggbb; nulo = paleta padrão
  logoUrl: string | null; // nulo = logo padrão
}

export const MARCA_PADRAO_SLUG = 'fazmais';
