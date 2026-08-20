import { useMutation, useQueryClient } from '@tanstack/react-query';
import { desfavoritar, favoritar } from '../api/favorites.api';

const HOME_FEED_KEY = ['home', 'feed'];

export function useFavorites() {
  const queryClient = useQueryClient();

  function invalidate() {
    void queryClient.invalidateQueries({ queryKey: HOME_FEED_KEY });
  }

  const favoritarMutation = useMutation({
    mutationFn: (conteudoId: string) => favoritar(conteudoId),
    onSuccess: invalidate,
  });
  const desfavoritarMutation = useMutation({
    mutationFn: (conteudoId: string) => desfavoritar(conteudoId),
    onSuccess: invalidate,
  });

  return { favoritar: favoritarMutation, desfavoritar: desfavoritarMutation };
}
