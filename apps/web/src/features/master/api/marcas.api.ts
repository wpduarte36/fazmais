import type { MarcaAdmin, UpdateMarcaRequest } from '@fazmais/shared';
import { apiRequest } from '../../../lib/apiClient';

export function listMarcas(): Promise<MarcaAdmin[]> {
  return apiRequest<MarcaAdmin[]>('/marcas');
}

export function updateMarca(id: string, dto: UpdateMarcaRequest): Promise<MarcaAdmin> {
  return apiRequest<MarcaAdmin>(`/marcas/${id}`, { method: 'PATCH', body: dto });
}
