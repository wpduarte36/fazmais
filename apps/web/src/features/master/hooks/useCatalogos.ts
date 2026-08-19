import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { CreateCatalogoRequest, UpdateCatalogoRequest } from '@fazmais/shared';
import { createCatalogo, deleteCatalogo, listCatalogos, updateCatalogo } from '../api/catalogos.api';

const CATALOGOS_KEY = ['catalogos'];

export function useCatalogos() {
  return useQuery({ queryKey: CATALOGOS_KEY, queryFn: listCatalogos });
}

export function useCreateCatalogo() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (dto: CreateCatalogoRequest) => createCatalogo(dto),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: CATALOGOS_KEY }),
  });
}

export function useUpdateCatalogo() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: UpdateCatalogoRequest }) => updateCatalogo(id, dto),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: CATALOGOS_KEY }),
  });
}

export function useDeleteCatalogo() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteCatalogo(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: CATALOGOS_KEY }),
  });
}
