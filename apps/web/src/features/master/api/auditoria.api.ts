import type { AuditLogPage } from '@fazmais/shared';
import { apiRequest } from '../../../lib/apiClient';

export function listAuditoria(filtro: { tenantId?: string; cursor?: string }): Promise<AuditLogPage> {
  const params = new URLSearchParams();
  if (filtro.tenantId) params.set('tenantId', filtro.tenantId);
  if (filtro.cursor) params.set('cursor', filtro.cursor);
  const query = params.toString();
  return apiRequest<AuditLogPage>(`/auditoria${query ? `?${query}` : ''}`);
}
