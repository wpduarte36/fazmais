import type { LoginRequest, LoginResponse, SetPasswordRequest } from '@fazmais/shared';
import { apiRequest } from '../../../lib/apiClient';

export function login(dto: LoginRequest): Promise<LoginResponse> {
  return apiRequest<LoginResponse>('/auth/login', { method: 'POST', body: dto });
}

export function setPassword(dto: SetPasswordRequest): Promise<void> {
  return apiRequest<void>('/auth/set-password', { method: 'POST', body: dto });
}

export function logout(): Promise<void> {
  return apiRequest<void>('/auth/logout', { method: 'POST' });
}
