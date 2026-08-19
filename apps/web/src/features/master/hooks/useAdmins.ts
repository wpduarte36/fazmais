import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { CreateAdminRequest, UpdateAdminRequest } from '@fazmais/shared';
import { createAdmin, deleteAdmin, listAdmins, updateAdmin } from '../api/tenants.api';

const TENANTS_KEY = ['tenants'];
const adminsKey = (tenantId: string) => ['tenants', tenantId, 'admins'];

export function useAdmins(tenantId: string | null) {
  return useQuery({
    queryKey: adminsKey(tenantId ?? ''),
    queryFn: () => listAdmins(tenantId as string),
    enabled: Boolean(tenantId),
  });
}

export function useCreateAdmin(tenantId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (dto: CreateAdminRequest) => createAdmin(tenantId, dto),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: adminsKey(tenantId) });
      void queryClient.invalidateQueries({ queryKey: TENANTS_KEY });
    },
  });
}

export function useUpdateAdmin(tenantId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ userId, dto }: { userId: string; dto: UpdateAdminRequest }) => updateAdmin(tenantId, userId, dto),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: adminsKey(tenantId) }),
  });
}

export function useDeleteAdmin(tenantId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (userId: string) => deleteAdmin(tenantId, userId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: adminsKey(tenantId) });
      void queryClient.invalidateQueries({ queryKey: TENANTS_KEY });
    },
  });
}
