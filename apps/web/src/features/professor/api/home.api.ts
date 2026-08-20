import type { HomeFeed } from '@fazmais/shared';
import { apiRequest } from '../../../lib/apiClient';

export function getHomeFeed(): Promise<HomeFeed> {
  return apiRequest<HomeFeed>('/home/feed');
}

export function registrarView(conteudoId: string): Promise<void> {
  return apiRequest<void>(`/home/view/${conteudoId}`, { method: 'POST' });
}
