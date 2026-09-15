import type {
  CreateUserRequest,
  CreateUserResponse,
  ResetPasswordResponse,
  UpdateUserRequest,
  UserStats,
  UserSummary,
} from '@fazmais/shared';
import { apiRequest } from '../../../lib/apiClient';

export function listUsers(): Promise<UserSummary[]> {
  return apiRequest<UserSummary[]>('/users');
}

export function getUserStats(): Promise<UserStats> {
  return apiRequest<UserStats>('/users/stats');
}

export function createUser(dto: CreateUserRequest): Promise<CreateUserResponse> {
  return apiRequest<CreateUserResponse>('/users', { method: 'POST', body: dto });
}

export function updateUser(id: string, dto: UpdateUserRequest): Promise<UserSummary> {
  return apiRequest<UserSummary>(`/users/${id}`, { method: 'PATCH', body: dto });
}

export function resetUserPassword(id: string): Promise<ResetPasswordResponse> {
  return apiRequest<ResetPasswordResponse>(`/users/${id}/reset-password`, { method: 'POST' });
}

export function deleteUser(id: string): Promise<void> {
  return apiRequest<void>(`/users/${id}`, { method: 'DELETE' });
}
