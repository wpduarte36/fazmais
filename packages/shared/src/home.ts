import type { ConteudoSummary } from './catalogos';

export interface HomeRow {
  eixoId: string;
  eixoName: string;
  colecaoId: string;
  colecaoName: string;
  conteudos: ConteudoSummary[];
}

export interface HomeFeed {
  featured: ConteudoSummary | null;
  populares: ConteudoSummary[];
  continuarAssistindo: ConteudoSummary[];
  rows: HomeRow[];
}
