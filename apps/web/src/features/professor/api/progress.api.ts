import { apiRequest } from '../../../lib/apiClient';

export function atualizarProgresso(conteudoId: string, progressPercent: number, lastPosition: number): Promise<void> {
  return apiRequest<void>(`/progress/${conteudoId}`, {
    method: 'POST',
    body: { progressPercent, lastPosition },
  });
}
