import { useEffect, useRef, useState } from 'react';
import Player from '@vimeo/player';
import type { ConteudoSummary } from '@fazmais/shared';
import { parseVimeoUrl, toPlayerUrl } from '../lib/vimeo';
import { useProgress } from '../hooks/useProgress';
import { FavoriteButton } from './FavoriteButton';
import { StarRating } from './StarRating';

const INTERVALO_SALVAR_PROGRESSO_MS = 10_000;

const iconButtonClass =
  'flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-white/15 text-neutral-400 transition hover:bg-white/[0.06] hover:text-neutral-100 light:border-black/15 aria-pressed:border-rose-400/40 aria-pressed:bg-rose-400/10 aria-pressed:text-rose-400';

interface VideoModalProps {
  conteudo: ConteudoSummary;
  onClose: () => void;
}

export function VideoModal({ conteudo, onClose }: VideoModalProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [error, setError] = useState<string | null>(null);
  const vimeoRef = conteudo.mediaUrl ? parseVimeoUrl(conteudo.mediaUrl) : null;
  const { salvarProgresso } = useProgress();

  useEffect(() => {
    if (!containerRef.current || !vimeoRef) return;

    const player = new Player(containerRef.current, {
      url: toPlayerUrl(vimeoRef),
      responsive: true,
    });

    // Progresso real de vídeo: acompanha timeupdate do player e salva
    // periodicamente (sem invalidar o feed a cada tick — só na saída/final,
    // pra não recarregar a Home enquanto o professor ainda está assistindo).
    const ultimoProgresso = { percent: 0, seconds: 0 };
    let terminou = false;

    player.on('timeupdate', (data: { percent: number; seconds: number }) => {
      ultimoProgresso.percent = data.percent * 100;
      ultimoProgresso.seconds = data.seconds;
    });

    player.on('ended', () => {
      terminou = true;
      salvarProgresso(conteudo.id, 100, ultimoProgresso.seconds, true);
    });

    const intervalo = setInterval(() => {
      if (ultimoProgresso.seconds > 0 && !terminou) {
        salvarProgresso(conteudo.id, ultimoProgresso.percent, ultimoProgresso.seconds, false);
      }
    }, INTERVALO_SALVAR_PROGRESSO_MS);

    player
      .ready()
      .then(() => {
        if (conteudo.lastPosition > 0 && conteudo.progressPercent < 100) {
          void player.setCurrentTime(conteudo.lastPosition);
        }
      })
      .catch(() => {
        setError('Não foi possível carregar este vídeo.');
      });

    return () => {
      clearInterval(intervalo);
      if (!terminou && ultimoProgresso.seconds > 0) {
        salvarProgresso(conteudo.id, ultimoProgresso.percent, ultimoProgresso.seconds, true);
      }
      void player.destroy();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [vimeoRef]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4" onClick={onClose}>
      <div
        className="w-full max-w-3xl rounded-2xl border border-white/15 bg-[#0d0d14] p-5 shadow-2xl light:border-black/10 light:bg-white"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="mb-3 flex items-start justify-between gap-4">
          <div>
            <span className="mb-1.5 inline-block rounded-full bg-amber-400/10 px-2.5 py-0.5 text-[11px] font-semibold text-amber-300 light:text-amber-700">
              ▶ Vídeo
            </span>
            <h1 className="text-lg font-bold leading-tight">{conteudo.title}</h1>
            <StarRating conteudo={conteudo} size={15} className="mt-2" />
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <FavoriteButton conteudo={conteudo} className={iconButtonClass} />
            <button
              type="button"
              onClick={onClose}
              aria-label="Fechar"
              className={iconButtonClass}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M18 6 6 18M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {!vimeoRef && (
          <p className="rounded-lg border border-rose-500/30 bg-rose-500/10 px-3.5 py-2.5 text-sm text-rose-300 light:text-rose-700">
            Link de vídeo inválido.
          </p>
        )}
        {vimeoRef && error && (
          <p className="rounded-lg border border-rose-500/30 bg-rose-500/10 px-3.5 py-2.5 text-sm text-rose-300 light:text-rose-700">
            {error}
          </p>
        )}
        {vimeoRef && <div ref={containerRef} className="aspect-video w-full overflow-hidden rounded-xl" />}

        {conteudo.description && (
          <p className="mt-4 text-sm text-neutral-400 light:text-neutral-600">{conteudo.description}</p>
        )}
      </div>
    </div>
  );
}
