import { useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { Role } from '@fazmais/shared';
import { login } from '../api/auth.api';
import { useAuthStore } from '../../../store/authStore';

const HOME_ROUTE_BY_ROLE: Record<string, string> = {
  [Role.MASTER]: '/master',
  [Role.ADMIN]: '/admin',
  [Role.PROFESSOR]: '/',
};

export function useLogin() {
  const navigate = useNavigate();
  const setSession = useAuthStore((state) => state.setSession);

  return useMutation({
    mutationFn: login,
    onSuccess: (data) => {
      setSession(data.user, data.accessToken);
      navigate(HOME_ROUTE_BY_ROLE[data.user.role] ?? '/', { replace: true });
    },
  });
}
