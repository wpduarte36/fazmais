import { useMutation, useQueryClient } from '@tanstack/react-query';
import { registrarView } from '../api/home.api';

const HOME_FEED_KEY = ['home', 'feed'];

export function useRegistrarView() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (conteudoId: string) => registrarView(conteudoId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: HOME_FEED_KEY });
    },
  });
}
