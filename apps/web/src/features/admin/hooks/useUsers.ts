import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { CreateUserRequest, UpdateUserRequest } from '@fazmais/shared';
import { createUser, deleteUser, getUserStats, listUsers, resetUserPassword, updateUser } from '../api/users.api';

const USERS_KEY = ['admin', 'users'];
const STATS_KEY = ['admin', 'users', 'stats'];

export function useUsers() {
  return useQuery({ queryKey: USERS_KEY, queryFn: listUsers });
}

export function useUserStats() {
  return useQuery({ queryKey: STATS_KEY, queryFn: getUserStats });
}

function useInvalidateUsers() {
  const queryClient = useQueryClient();
  return () => {
    void queryClient.invalidateQueries({ queryKey: USERS_KEY });
    void queryClient.invalidateQueries({ queryKey: STATS_KEY });
  };
}

export function useCreateUser() {
  const invalidate = useInvalidateUsers();
  return useMutation({
    mutationFn: (dto: CreateUserRequest) => createUser(dto),
    onSuccess: invalidate,
  });
}

export function useUpdateUser() {
  const invalidate = useInvalidateUsers();
  return useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: UpdateUserRequest }) => updateUser(id, dto),
    onSuccess: invalidate,
  });
}

export function useResetPassword() {
  return useMutation({
    mutationFn: (id: string) => resetUserPassword(id),
  });
}

export function useDeleteUser() {
  const invalidate = useInvalidateUsers();
  return useMutation({
    mutationFn: (id: string) => deleteUser(id),
    onSuccess: invalidate,
  });
}
