import type { AppPlatform, MediaType } from './enums';

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

export interface EixoRequest {
  name: string;
  description?: string;
}

export interface CatalogoDisponivel {
  id: string;
  name: string;
  icon: string;
  eixosCount: number;
  colecoesCount: number;
  conteudosCount: number;
  ativo: boolean;
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
  bannerImageUrl: string | null;
  isFeatured: boolean;
  tags: string[];
  aiSummary: string | null;
  durationSeconds: number | null;
  pageCount: number | null;
  downloadUrl: string | null;
  externalUrl: string | null;
  sourceName: string | null;
  appStoreUrl: string | null;
  playStoreUrl: string | null;
  webUrl: string | null;
  appPlatforms: AppPlatform[];
  planoMinimoId: string | null;
  isFavorito: boolean;
  myRating: number | null;
  viewCount: number;
  progressPercent: number;
  lastPosition: number;
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
  description: string | null;
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
  bannerImageUrl?: string;
  isFeatured?: boolean;
  tags?: string[];
  planoMinimoId?: string | null;
  aiSummary?: string;
  durationSeconds?: number;
  pageCount?: number;
  downloadUrl?: string;
  // null limpa o campo na edição (undefined = não mexe).
  externalUrl?: string | null;
  sourceName?: string | null;
  appStoreUrl?: string | null;
  playStoreUrl?: string | null;
  webUrl?: string | null;
  appPlatforms?: AppPlatform[];
}

export type UpdateConteudoRequest = Partial<CreateConteudoRequest>;

export interface MoveConteudoRequest {
  colecaoId: string;
}

export interface ReorderColecoesRequest {
  colecaoIds: string[];
}

export interface ReorderEixosRequest {
  eixoIds: string[];
}

export interface ReorderConteudosRequest {
  conteudoIds: string[];
}

export interface AiSuggestRequest {
  title: string;
  description: string;
}

export interface AiSuggestResponse {
  tags: string[];
  summary: string;
}
