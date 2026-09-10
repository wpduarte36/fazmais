import type { PlanoSummary } from '@fazmais/shared';
import { apiRequest } from '../../../lib/apiClient';

export function listPlanos(): Promise<PlanoSummary[]> {
  return apiRequest<PlanoSummary[]>('/planos');
}
