import type {
  AdminSummary,
  CreateAdminRequest,
  CreateTenantRequest,
  TenantSummary,
  UpdateAdminRequest,
  UpdateTenantRequest,
} from '@fazmais/shared';
import { apiRequest } from '../../../lib/apiClient';

export function listTenants(): Promise<TenantSummary[]> {
  return apiRequest<TenantSummary[]>('/tenants');
}

export function createTenant(dto: CreateTenantRequest): Promise<TenantSummary> {
  return apiRequest<TenantSummary>('/tenants', { method: 'POST', body: dto });
}

export function updateTenant(id: string, dto: UpdateTenantRequest): Promise<TenantSummary> {
  return apiRequest<TenantSummary>(`/tenants/${id}`, { method: 'PATCH', body: dto });
}

export function deleteTenant(id: string): Promise<void> {
  return apiRequest<void>(`/tenants/${id}`, { method: 'DELETE' });
}

export function listAdmins(tenantId: string): Promise<AdminSummary[]> {
  return apiRequest<AdminSummary[]>(`/tenants/${tenantId}/admins`);
}

export function createAdmin(tenantId: string, dto: CreateAdminRequest): Promise<AdminSummary> {
  return apiRequest<AdminSummary>(`/tenants/${tenantId}/admins`, { method: 'POST', body: dto });
}

export function updateAdmin(tenantId: string, userId: string, dto: UpdateAdminRequest): Promise<AdminSummary> {
  return apiRequest<AdminSummary>(`/tenants/${tenantId}/admins/${userId}`, { method: 'PATCH', body: dto });
}

export function deleteAdmin(tenantId: string, userId: string): Promise<void> {
  return apiRequest<void>(`/tenants/${tenantId}/admins/${userId}`, { method: 'DELETE' });
}
