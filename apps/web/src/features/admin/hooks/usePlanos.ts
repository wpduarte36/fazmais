import { useQuery } from '@tanstack/react-query';
import { listPlanos } from '../api/planos.api';

export function usePlanos() {
  return useQuery({ queryKey: ['planos'], queryFn: listPlanos, staleTime: 5 * 60_000 });
}
