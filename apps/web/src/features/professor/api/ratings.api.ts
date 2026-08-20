import { apiRequest } from '../../../lib/apiClient';

export function avaliar(conteudoId: string, score: number): Promise<void> {
  return apiRequest<void>(`/ratings/${conteudoId}`, {
    method: 'POST',
    body: { score },
  });
}
