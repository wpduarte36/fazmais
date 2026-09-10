import { useNavigate } from 'react-router-dom';
import { logout } from '../api/auth.api';
import { useAuthStore } from '../../../store/authStore';

// Revoga o refresh token no backend antes de limpar a sessão local — sem
// isso, o cookie httpOnly continua válido e o próximo carregamento de
// página (bootstrap em App.tsx) logaria o usuário de volta sozinho.
export function useLogout() {
  const clearSession = useAuthStore((state) => state.clearSession);
  const navigate = useNavigate();

  return async function handleLogout() {
    try {
      await logout();
    } catch {
      // Mesmo se a chamada falhar (rede, backend fora do ar), ainda
      // limpamos a sessão local — o usuário não pode ficar preso logado.
    }
    clearSession();
    navigate('/login', { replace: true });
  };
}
