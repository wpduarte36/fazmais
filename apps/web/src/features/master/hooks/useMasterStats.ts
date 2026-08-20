import { useQuery } from '@tanstack/react-query';
import { getMasterStats } from '../api/stats.api';

export function useMasterStats() {
  return useQuery({ queryKey: ['master', 'stats'], queryFn: getMasterStats });
}
