import { useEffect, useState } from 'react';
import type { ConteudoSummary } from '@fazmais/shared';
import { useRatings } from '../hooks/useRatings';

interface StarRatingProps {
  conteudo: ConteudoSummary;
  size?: number;
  className?: string;
}

export function StarRating({ conteudo, size = 13, className }: StarRatingProps) {
  const [rating, setRating] = useState(conteudo.myRating ?? 0);
  const { avaliar } = useRatings();

  useEffect(() => {
    setRating(conteudo.myRating ?? 0);
  }, [conteudo.id, conteudo.myRating]);

  function handleClick(score: number, event: React.MouseEvent) {
    event.stopPropagation();
    setRating(score);
    avaliar.mutate({ conteudoId: conteudo.id, score });
  }

  return (
    <div className={`flex items-center gap-0.5 ${className ?? ''}`} onClick={(event) => event.stopPropagation()}>
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={(event) => handleClick(star, event)}
          aria-label={`Avaliar com ${star} estrela${star > 1 ? 's' : ''}`}
          aria-pressed={star <= rating}
          className="text-neutral-500 transition hover:text-amber-400 aria-pressed:text-amber-400"
        >
          <svg width={size} height={size} viewBox="0 0 24 24" fill={star <= rating ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="1.5">
            <path d="m12 2 3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
          </svg>
        </button>
      ))}
    </div>
  );
}
