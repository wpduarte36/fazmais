import { useEffect, useState } from 'react';
import type { ConteudoSummary } from '@fazmais/shared';
import { useFavorites } from '../hooks/useFavorites';

interface FavoriteButtonProps {
  conteudo: ConteudoSummary;
  className?: string;
}

export function FavoriteButton({ conteudo, className }: FavoriteButtonProps) {
  const [isFavorito, setIsFavorito] = useState(conteudo.isFavorito);
  const { favoritar, desfavoritar } = useFavorites();

  useEffect(() => {
    setIsFavorito(conteudo.isFavorito);
  }, [conteudo.id, conteudo.isFavorito]);

  function toggle(event: React.MouseEvent) {
    event.stopPropagation();
    const proximoValor = !isFavorito;
    setIsFavorito(proximoValor);
    if (proximoValor) {
      favoritar.mutate(conteudo.id);
    } else {
      desfavoritar.mutate(conteudo.id);
    }
  }

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={isFavorito ? 'Remover dos favoritos' : 'Favoritar'}
      aria-pressed={isFavorito}
      className={className}
    >
      <svg
        width="15"
        height="15"
        viewBox="0 0 24 24"
        fill={isFavorito ? 'currentColor' : 'none'}
        stroke="currentColor"
        strokeWidth="2"
      >
        <path d="M12 21s-6.7-4.35-9.33-8.2C.9 10.1 1.4 6.6 4.2 5.1c2.3-1.24 4.9-.5 6.4 1.4l1.4 1.75 1.4-1.75c1.5-1.9 4.1-2.64 6.4-1.4 2.8 1.5 3.3 5 1.53 7.7C18.7 16.65 12 21 12 21z" />
      </svg>
    </button>
  );
}
