import { useQuery } from '@tanstack/react-query';
import type { VisaoEducadorParams } from '@fazmais/shared';
import { getHomeFeed } from '../api/home.api';

// A chave começa com ['home', 'feed'] pra continuar sendo invalidada pelos
// hooks de favoritar/avaliar/progresso; município/plano do Master entram
// no fim pra cada escolha ter o próprio cache.
export function useHomeFeed(visao?: VisaoEducadorParams) {
  return useQuery({
    queryKey: ['home', 'feed', visao?.tenantId ?? null, visao?.planoId ?? null],
    queryFn: () => getHomeFeed(visao),
  });
}
