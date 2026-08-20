import { apiRequest } from '../../../lib/apiClient';

export function favoritar(conteudoId: string): Promise<void> {
  return apiRequest<void>(`/favorites/${conteudoId}`, { method: 'POST' });
}

export function desfavoritar(conteudoId: string): Promise<void> {
  return apiRequest<void>(`/favorites/${conteudoId}`, { method: 'DELETE' });
}
