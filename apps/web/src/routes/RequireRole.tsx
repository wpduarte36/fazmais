import type { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import type { Role } from '@fazmais/shared';
import { useAuthStore } from '../store/authStore';

interface RequireRoleProps {
  role: Role;
  children: ReactNode;
}

export function RequireRole({ role, children }: RequireRoleProps) {
  const user = useAuthStore((state) => state.user);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  if (!isAuthenticated || !user || user.role !== role) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}
