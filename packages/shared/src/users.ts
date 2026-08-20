import type { Role, UserStatus } from './enums';

export type ManagedUserRole = Extract<Role, 'ADMIN' | 'PROFESSOR'>;

export interface UserSummary {
  id: string;
  name: string;
  login: string;
  email: string;
  whatsapp: string | null;
  role: ManagedUserRole;
  status: UserStatus;
  createdAt: string;
}

export interface UserStats {
  total: number;
  ativos: number;
  pendentes: number;
}

export interface CreateUserRequest {
  name: string;
  login: string;
  email: string;
  whatsapp?: string;
  role: ManagedUserRole;
}

export interface UpdateUserRequest {
  name?: string;
  email?: string;
  whatsapp?: string;
  status?: UserStatus;
}

export interface ResetPasswordResponse {
  token: string;
  expiresAt: string;
}
