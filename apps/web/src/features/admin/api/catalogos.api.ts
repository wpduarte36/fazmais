import type { CatalogoDisponivel } from '@fazmais/shared';
import { apiRequest } from '../../../lib/apiClient';

export function listCatalogosDisponiveis(): Promise<CatalogoDisponivel[]> {
  return apiRequest<CatalogoDisponivel[]>('/tenant-catalogos');
}

export function ativarCatalogo(catalogoId: string): Promise<void> {
  return apiRequest<void>(`/tenant-catalogos/${catalogoId}`, { method: 'POST' });
}

export function desativarCatalogo(catalogoId: string): Promise<void> {
  return apiRequest<void>(`/tenant-catalogos/${catalogoId}`, { method: 'DELETE' });
}
