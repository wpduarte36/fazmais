import type { HomeFeed, VisaoEducadorParams } from '@fazmais/shared';
import { apiRequest } from '../../../lib/apiClient';

export function getHomeFeed(visao?: VisaoEducadorParams): Promise<HomeFeed> {
  if (!visao) return apiRequest<HomeFeed>('/home/feed');
  const query = new URLSearchParams({ tenantId: visao.tenantId, planoId: visao.planoId });
  return apiRequest<HomeFeed>(`/home/feed?${query.toString()}`);
}

export function registrarView(conteudoId: string): Promise<void> {
  return apiRequest<void>(`/home/view/${conteudoId}`, { method: 'POST' });
}
