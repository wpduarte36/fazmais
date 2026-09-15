import type { ConteudoSummary } from './catalogos';

export interface HomeRow {
  eixoId: string;
  eixoName: string;
  eixoDescription: string | null;
  eixoOrdem: number;
  colecaoId: string;
  colecaoName: string;
  conteudos: ConteudoSummary[];
}

export interface HomeFeed {
  featured: ConteudoSummary[];
  populares: ConteudoSummary[];
  recentes: ConteudoSummary[];
  continuarAssistindo: ConteudoSummary[];
  recomendados: ConteudoSummary[];
  rows: HomeRow[];
}
