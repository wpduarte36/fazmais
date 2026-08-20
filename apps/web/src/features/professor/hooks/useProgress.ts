import { useMutation, useQueryClient } from '@tanstack/react-query';
import { atualizarProgresso } from '../api/progress.api';

const HOME_FEED_KEY = ['home', 'feed'];

export function useProgress() {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: ({ conteudoId, progressPercent, lastPosition }: { conteudoId: string; progressPercent: number; lastPosition: number }) =>
      atualizarProgresso(conteudoId, progressPercent, lastPosition),
  });

  // invalidarFeed só deve ir true na atualização final (ex: fechar o modal) —
  // chamando isso a cada poucos segundos de vídeo assistido recarregaria o
  // feed inteiro sem necessidade, sem nenhum ganho visível pro usuário.
  function salvar(conteudoId: string, progressPercent: number, lastPosition: number, invalidarFeed = false) {
    mutation.mutate(
      { conteudoId, progressPercent: Math.round(progressPercent), lastPosition: Math.round(lastPosition) },
      { onSuccess: invalidarFeed ? () => void queryClient.invalidateQueries({ queryKey: HOME_FEED_KEY }) : undefined },
    );
  }

  return { salvarProgresso: salvar };
}
