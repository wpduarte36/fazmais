import type { LoginRequest, LoginResponse } from '@fazmais/shared';
import { apiRequest } from '../../../lib/apiClient';

export function login(dto: LoginRequest): Promise<LoginResponse> {
  return apiRequest<LoginResponse>('/auth/login', { method: 'POST', body: dto });
}
