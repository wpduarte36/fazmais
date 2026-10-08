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

// Visão completa, só pro Painel Master.
export interface MarcaAdmin extends MarcaPublica {
  id: string;
  dominios: string[];
  tenantsCount: number;
}

export interface UpdateMarcaRequest {
  nomeExibicao: string;
  nomeAssistente: string;
  corPrimaria: string | null;
  logoUrl: string | null;
  dominios: string[];
}
