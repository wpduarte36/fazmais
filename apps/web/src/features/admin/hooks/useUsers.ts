import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { CreateUserRequest, UpdateUserRequest } from '@fazmais/shared';
import { createUser, deleteUser, getUserStats, listUsers, resetUserPassword, updateUser } from '../api/users.api';
import { useTenantAlvo } from '../tenantAlvo';

// O município alvo entra na chave pra cada município (na "Área do
// Admin" do Master) ter o próprio cache.
const usersKey = (tenantId?: string) => ['admin', 'users', tenantId ?? null];
const statsKey = (tenantId?: string) => ['admin', 'users', 'stats', tenantId ?? null];

export function useUsers() {
  const tenantId = useTenantAlvo();
  return useQuery({ queryKey: usersKey(tenantId), queryFn: () => listUsers(tenantId) });
}

export function useUserStats() {
  const tenantId = useTenantAlvo();
  return useQuery({ queryKey: statsKey(tenantId), queryFn: () => getUserStats(tenantId) });
}

function useInvalidateUsers() {
  const queryClient = useQueryClient();
  const tenantId = useTenantAlvo();
  return () => {
    void queryClient.invalidateQueries({ queryKey: usersKey(tenantId) });
    void queryClient.invalidateQueries({ queryKey: statsKey(tenantId) });
  };
}

export function useCreateUser() {
  const tenantId = useTenantAlvo();
  const invalidate = useInvalidateUsers();
  return useMutation({
    mutationFn: (dto: CreateUserRequest) => createUser(dto, tenantId),
    onSuccess: invalidate,
  });
}

export function useUpdateUser() {
  const tenantId = useTenantAlvo();
  const invalidate = useInvalidateUsers();
  return useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: UpdateUserRequest }) => updateUser(id, dto, tenantId),
    onSuccess: invalidate,
  });
}

export function useResetPassword() {
  const tenantId = useTenantAlvo();
  return useMutation({
    mutationFn: (id: string) => resetUserPassword(id, tenantId),
  });
}

export function useDeleteUser() {
  const tenantId = useTenantAlvo();
  const invalidate = useInvalidateUsers();
  return useMutation({
    mutationFn: (id: string) => deleteUser(id, tenantId),
    onSuccess: invalidate,
  });
}
