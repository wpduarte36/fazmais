import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ativarCatalogo, desativarCatalogo, listCatalogosDisponiveis } from '../api/catalogos.api';

const TENANT_CATALOGOS_KEY = ['admin', 'tenant-catalogos'];

export function useTenantCatalogos() {
  return useQuery({ queryKey: TENANT_CATALOGOS_KEY, queryFn: listCatalogosDisponiveis });
}

function useInvalidateTenantCatalogos() {
  const queryClient = useQueryClient();
  return () => queryClient.invalidateQueries({ queryKey: TENANT_CATALOGOS_KEY });
}

export function useAtivarCatalogo() {
  const invalidate = useInvalidateTenantCatalogos();
  return useMutation({
    mutationFn: (catalogoId: string) => ativarCatalogo(catalogoId),
    onSuccess: invalidate,
  });
}

export function useDesativarCatalogo() {
  const invalidate = useInvalidateTenantCatalogos();
  return useMutation({
    mutationFn: (catalogoId: string) => desativarCatalogo(catalogoId),
    onSuccess: invalidate,
  });
}
