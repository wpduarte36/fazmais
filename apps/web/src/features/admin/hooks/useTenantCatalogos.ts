import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ativarCatalogo, desativarCatalogo, listCatalogosDisponiveis } from '../api/catalogos.api';
import { useTenantAlvo } from '../tenantAlvo';

const tenantCatalogosKey = (tenantId?: string) => ['admin', 'tenant-catalogos', tenantId ?? null];

export function useTenantCatalogos() {
  const tenantId = useTenantAlvo();
  return useQuery({ queryKey: tenantCatalogosKey(tenantId), queryFn: () => listCatalogosDisponiveis(tenantId) });
}

function useInvalidateTenantCatalogos() {
  const queryClient = useQueryClient();
  const tenantId = useTenantAlvo();
  return () => queryClient.invalidateQueries({ queryKey: tenantCatalogosKey(tenantId) });
}

export function useAtivarCatalogo() {
  const tenantId = useTenantAlvo();
  const invalidate = useInvalidateTenantCatalogos();
  return useMutation({
    mutationFn: (catalogoId: string) => ativarCatalogo(catalogoId, tenantId),
    onSuccess: invalidate,
  });
}

export function useDesativarCatalogo() {
  const tenantId = useTenantAlvo();
  const invalidate = useInvalidateTenantCatalogos();
  return useMutation({
    mutationFn: (catalogoId: string) => desativarCatalogo(catalogoId, tenantId),
    onSuccess: invalidate,
  });
}
