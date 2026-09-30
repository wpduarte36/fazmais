import type { CatalogoDisponivel } from '@fazmais/shared';
import { apiRequest } from '../../../lib/apiClient';
import { comTenant } from '../tenantAlvo';

// tenantId só é passado quando o Master age como admin de um município.
export function listCatalogosDisponiveis(tenantId?: string): Promise<CatalogoDisponivel[]> {
  return apiRequest<CatalogoDisponivel[]>(comTenant('/tenant-catalogos', tenantId));
}

export function ativarCatalogo(catalogoId: string, tenantId?: string): Promise<void> {
  return apiRequest<void>(comTenant(`/tenant-catalogos/${catalogoId}`, tenantId), { method: 'POST' });
}

export function desativarCatalogo(catalogoId: string, tenantId?: string): Promise<void> {
  return apiRequest<void>(comTenant(`/tenant-catalogos/${catalogoId}`, tenantId), { method: 'DELETE' });
}
