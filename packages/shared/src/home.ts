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
  // Preenchido só na "Área do Educador" do Master: qual município e plano
  // ele escolheu simular. Nulo pra educador e Admin.
  visao: { tenantName: string; planoName: string } | null;
}

// Escolha do Master ao entrar na "Área do Educador" — vai na URL da Home (?tenant=&plano=).
export interface VisaoEducadorParams {
  tenantId: string;
  planoId: string;
}
