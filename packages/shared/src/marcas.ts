// Identidade visual (white-label) resolvida pela URL de acesso. Pública: a
// tela de login já precisa dela, antes de qualquer autenticação.
export interface MarcaPublica {
  slug: string;
  nomeExibicao: string;
  nomeAssistente: string;
  corPrimaria: string | null; // hex #rrggbb; nulo = paleta padrão
  logoUrl: string | null; // nulo = logo padrão
  assistenteImagemUrl: string | null; // nulo = Fabinho
  assistenteAvatarUrl: string | null; // nulo = topo da imagem acima (ou Fabinho)
}

export const MARCA_PADRAO_SLUG = 'fazmais';

// Visão completa, só pro Painel Master.
export interface MarcaAdmin extends MarcaPublica {
  id: string;
  dominios: string[];
  tenantsCount: number;
}

export interface CreateMarcaRequest {
  slug: string;
  nomeExibicao: string;
  nomeAssistente: string;
}

export interface UpdateMarcaRequest {
  nomeExibicao: string;
  nomeAssistente: string;
  corPrimaria: string | null;
  logoUrl: string | null;
  assistenteImagemUrl: string | null;
  assistenteAvatarUrl: string | null;
  dominios: string[];
}
