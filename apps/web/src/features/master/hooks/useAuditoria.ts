import { useInfiniteQuery } from '@tanstack/react-query';
import { listAuditoria } from '../api/auditoria.api';

export function useAuditoria(tenantId?: string) {
  return useInfiniteQuery({
    queryKey: ['auditoria', tenantId ?? 'todos'],
    queryFn: ({ pageParam }) => listAuditoria({ tenantId, cursor: pageParam }),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (pagina) => pagina.proximo ?? undefined,
  });
}
