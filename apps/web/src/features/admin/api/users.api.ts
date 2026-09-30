import type {
  CreateUserRequest,
  CreateUserResponse,
  ResetPasswordResponse,
  UpdateUserRequest,
  UserStats,
  UserSummary,
} from '@fazmais/shared';
import { apiRequest } from '../../../lib/apiClient';
import { comTenant } from '../tenantAlvo';

// tenantId só é passado quando o Master age como admin de um município.
export function listUsers(tenantId?: string): Promise<UserSummary[]> {
  return apiRequest<UserSummary[]>(comTenant('/users', tenantId));
}

export function getUserStats(tenantId?: string): Promise<UserStats> {
  return apiRequest<UserStats>(comTenant('/users/stats', tenantId));
}

export function createUser(dto: CreateUserRequest, tenantId?: string): Promise<CreateUserResponse> {
  return apiRequest<CreateUserResponse>(comTenant('/users', tenantId), { method: 'POST', body: dto });
}

export function updateUser(id: string, dto: UpdateUserRequest, tenantId?: string): Promise<UserSummary> {
  return apiRequest<UserSummary>(comTenant(`/users/${id}`, tenantId), { method: 'PATCH', body: dto });
}

export function resetUserPassword(id: string, tenantId?: string): Promise<ResetPasswordResponse> {
  return apiRequest<ResetPasswordResponse>(comTenant(`/users/${id}/reset-password`, tenantId), { method: 'POST' });
}

export function deleteUser(id: string, tenantId?: string): Promise<void> {
  return apiRequest<void>(comTenant(`/users/${id}`, tenantId), { method: 'DELETE' });
}
