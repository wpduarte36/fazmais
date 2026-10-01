import { Role } from '@fazmais/shared';
import { useAuthStore } from '../../../store/authStore';

// Master na "Área do Educador" só olha: não tem município, então não
// favorita, não avalia, não grava progresso nem conta visualização (a API
// também recusa essas escritas pra ele). Os componentes somem com os
// controles em vez de mostrar um botão que daria erro.
export function useSomenteLeitura(): boolean {
  return useAuthStore((state) => state.user?.role === Role.MASTER);
}
