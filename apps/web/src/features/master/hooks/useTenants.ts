import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { CreateTenantRequest, UpdateTenantRequest } from '@fazmais/shared';
import { createTenant, deleteTenant, listTenants, updateTenant } from '../api/tenants.api';

const TENANTS_KEY = ['tenants'];

// enabled=false deixa montar o hook em tela que Admin também usa (a rota
// /tenants é só do Master).
export function useTenants(enabled = true) {
  return useQuery({ queryKey: TENANTS_KEY, queryFn: listTenants, enabled });
}

export function useCreateTenant() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (dto: CreateTenantRequest) => createTenant(dto),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: TENANTS_KEY }),
  });
}

export function useUpdateTenant() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: UpdateTenantRequest }) => updateTenant(id, dto),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: TENANTS_KEY }),
  });
}

export function useDeleteTenant() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteTenant(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: TENANTS_KEY }),
  });
}
