import { useMutation, useQueryClient } from '@tanstack/react-query';
import { avaliar } from '../api/ratings.api';

const HOME_FEED_KEY = ['home', 'feed'];

export function useRatings() {
  const queryClient = useQueryClient();

  const avaliarMutation = useMutation({
    mutationFn: ({ conteudoId, score }: { conteudoId: string; score: number }) => avaliar(conteudoId, score),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: HOME_FEED_KEY });
    },
  });

  return { avaliar: avaliarMutation };
}
