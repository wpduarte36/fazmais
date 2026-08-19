import type {
  AiSuggestRequest,
  AiSuggestResponse,
  CatalogoSummary,
  CatalogoTree,
  ColecaoNode,
  ConteudoSummary,
  CreateCatalogoRequest,
  CreateConteudoRequest,
  EixoNode,
  MoveConteudoRequest,
  NameOnlyRequest,
  UpdateCatalogoRequest,
  UpdateConteudoRequest,
} from '@fazmais/shared';
import { apiRequest } from '../../../lib/apiClient';

export function listCatalogos(): Promise<CatalogoSummary[]> {
  return apiRequest<CatalogoSummary[]>('/catalogos');
}

export function createCatalogo(dto: CreateCatalogoRequest): Promise<CatalogoSummary> {
  return apiRequest<CatalogoSummary>('/catalogos', { method: 'POST', body: dto });
}

export function updateCatalogo(id: string, dto: UpdateCatalogoRequest): Promise<CatalogoSummary> {
  return apiRequest<CatalogoSummary>(`/catalogos/${id}`, { method: 'PATCH', body: dto });
}

export function deleteCatalogo(id: string): Promise<void> {
  return apiRequest<void>(`/catalogos/${id}`, { method: 'DELETE' });
}

export function getCatalogoTree(id: string): Promise<CatalogoTree> {
  return apiRequest<CatalogoTree>(`/catalogos/${id}`);
}

export function createEixo(catalogoId: string, dto: NameOnlyRequest): Promise<EixoNode> {
  return apiRequest<EixoNode>(`/catalogos/${catalogoId}/eixos`, { method: 'POST', body: dto });
}

export function updateEixo(id: string, dto: NameOnlyRequest): Promise<EixoNode> {
  return apiRequest<EixoNode>(`/eixos/${id}`, { method: 'PATCH', body: dto });
}

export function deleteEixo(id: string): Promise<void> {
  return apiRequest<void>(`/eixos/${id}`, { method: 'DELETE' });
}

export function createColecao(eixoId: string, dto: NameOnlyRequest): Promise<ColecaoNode> {
  return apiRequest<ColecaoNode>(`/eixos/${eixoId}/colecoes`, { method: 'POST', body: dto });
}

export function updateColecao(id: string, dto: NameOnlyRequest): Promise<ColecaoNode> {
  return apiRequest<ColecaoNode>(`/colecoes/${id}`, { method: 'PATCH', body: dto });
}

export function deleteColecao(id: string): Promise<void> {
  return apiRequest<void>(`/colecoes/${id}`, { method: 'DELETE' });
}

export function createConteudo(colecaoId: string, dto: CreateConteudoRequest): Promise<ConteudoSummary> {
  return apiRequest<ConteudoSummary>(`/colecoes/${colecaoId}/conteudos`, { method: 'POST', body: dto });
}

export function updateConteudo(id: string, dto: UpdateConteudoRequest): Promise<ConteudoSummary> {
  return apiRequest<ConteudoSummary>(`/conteudos/${id}`, { method: 'PATCH', body: dto });
}

export function deleteConteudo(id: string): Promise<void> {
  return apiRequest<void>(`/conteudos/${id}`, { method: 'DELETE' });
}

export function moveConteudo(id: string, dto: MoveConteudoRequest): Promise<ConteudoSummary> {
  return apiRequest<ConteudoSummary>(`/conteudos/${id}/move`, { method: 'PATCH', body: dto });
}

export function aiSuggest(dto: AiSuggestRequest): Promise<AiSuggestResponse> {
  return apiRequest<AiSuggestResponse>('/conteudos/ai-suggestions', { method: 'POST', body: dto });
}
