import type { UserStatus } from './enums';

export interface TenantSummary {
  id: string;
  name: string;
  createdAt: string;
  usersCount: number;
  adminsCount: number;
}

export interface CreateTenantRequest {
  name: string;
}

export interface UpdateTenantRequest {
  name: string;
}

export interface AdminSummary {
  id: string;
  name: string;
  login: string;
  email: string;
  whatsapp: string | null;
  status: UserStatus;
  createdAt: string;
}

export interface CreateAdminRequest {
  name: string;
  login: string;
  email: string;
  whatsapp?: string;
}

export interface UpdateAdminRequest {
  name?: string;
  email?: string;
  whatsapp?: string;
  status?: UserStatus;
}
