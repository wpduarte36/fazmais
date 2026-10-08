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
  planoId: string | null;
  planoName: string | null;
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
  planoId?: string;
}

export interface UpdateUserRequest {
  name?: string;
  email?: string;
  whatsapp?: string;
  status?: UserStatus;
  planoId?: string | null;
}

// appUrl: endereço da marca do município (ex: https://app.plannetamais.com.br)
// pra montar o link de definir senha; nulo = usar o endereço atual.
export interface ResetPasswordResponse {
  token: string;
  expiresAt: string;
  appUrl: string | null;
}

export interface CreateUserResponse extends UserSummary {
  firstAccessToken: string;
  firstAccessExpiresAt: string;
  appUrl: string | null;
}
