import type { MediaType } from './enums';

export interface CatalogoSummary {
  id: string;
  name: string;
  icon: string;
  createdAt: string;
  eixosCount: number;
  colecoesCount: number;
  conteudosCount: number;
  municipiosAtivos: number;
}

export interface CreateCatalogoRequest {
  name: string;
  icon: string;
}

export interface UpdateCatalogoRequest {
  name?: string;
  icon?: string;
}

export interface NameOnlyRequest {
  name: string;
}

export interface ConteudoSummary {
  id: string;
  colecaoId: string;
  title: string;
  description: string;
  mediaType: MediaType;
  mediaUrl: string | null;
  htmlContent: string | null;
  imageUrl: string;
  isFeatured: boolean;
  tags: string[];
  aiSummary: string | null;
  planoIds: string[];
  createdAt: string;
}

export interface ColecaoNode {
  id: string;
  name: string;
  conteudos: ConteudoSummary[];
}

export interface EixoNode {
  id: string;
  name: string;
  colecoes: ColecaoNode[];
}

export interface CatalogoTree {
  id: string;
  name: string;
  icon: string;
  createdAt: string;
  eixos: EixoNode[];
}

export interface CreateConteudoRequest {
  title: string;
  description: string;
  mediaType: MediaType;
  mediaUrl?: string;
  htmlContent?: string;
  imageUrl: string;
  isFeatured?: boolean;
  tags?: string[];
  planoIds?: string[];
  aiSummary?: string;
}

export type UpdateConteudoRequest = Partial<CreateConteudoRequest>;

export interface MoveConteudoRequest {
  colecaoId: string;
}

export interface AiSuggestRequest {
  title: string;
  description: string;
}

export interface AiSuggestResponse {
  tags: string[];
  summary: string;
}
