import type { UserStatus } from './enums';

export interface TenantSummary {
  id: string;
  name: string;
  createdAt: string;
  usersCount: number;
  adminsCount: number;
  marcaId: string | null; // nulo = marca padrão (FazMais)
  marcaNome: string | null;
}

export interface CreateTenantRequest {
  name: string;
  marcaId?: string | null;
}

export interface UpdateTenantRequest {
  name: string;
  marcaId?: string | null;
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
