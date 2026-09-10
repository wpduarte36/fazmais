import type { Role } from './enums';

export interface LoginRequest {
  login: string;
  password: string;
}

export interface AuthenticatedUser {
  id: string;
  name: string;
  login: string;
  role: Role;
  tenantId: string | null;
  planoId: string | null;
}

export interface LoginResponse {
  accessToken: string;
  user: AuthenticatedUser;
}

export interface SetPasswordRequest {
  token: string;
  password: string;
}
