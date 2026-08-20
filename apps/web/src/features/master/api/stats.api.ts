import type { MasterStats } from '@fazmais/shared';
import { apiRequest } from '../../../lib/apiClient';

export function getMasterStats(): Promise<MasterStats> {
  return apiRequest<MasterStats>('/stats/master');
}
