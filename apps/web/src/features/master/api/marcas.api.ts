import type { CreateMarcaRequest, MarcaAdmin, UpdateMarcaRequest } from '@fazmais/shared';
import { apiRequest } from '../../../lib/apiClient';

export function listMarcas(): Promise<MarcaAdmin[]> {
  return apiRequest<MarcaAdmin[]>('/marcas');
}

export function createMarca(dto: CreateMarcaRequest): Promise<MarcaAdmin> {
  return apiRequest<MarcaAdmin>('/marcas', { method: 'POST', body: dto });
}

export function updateMarca(id: string, dto: UpdateMarcaRequest): Promise<MarcaAdmin> {
  return apiRequest<MarcaAdmin>(`/marcas/${id}`, { method: 'PATCH', body: dto });
}
