import type { ConteudoSummary } from './catalogos';

export interface HomeRow {
  title: string;
  conteudos: ConteudoSummary[];
}

export interface HomeFeed {
  featured: ConteudoSummary | null;
  rows: HomeRow[];
}
