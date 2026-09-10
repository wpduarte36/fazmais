import { useMemo, type ReactNode } from 'react';
import type { HomeFeed } from '@fazmais/shared';

function formatDuration(totalSeconds: number): string {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  if (hours === 0) return `${minutes}min`;
  return `${hours}h ${minutes}min`;
}

export interface AcervoStat {
  label: string;
  value: string | number;
  color: string;
  icon: ReactNode;
}

export function useAcervoStats(feed: HomeFeed): AcervoStat[] {
  return useMemo(() => {
    const conteudos = feed.rows.flatMap((row) => row.conteudos);
    const videoSeconds = conteudos
      .filter((c) => c.mediaType === 'VIDEO')
      .reduce((sum, c) => sum + (c.durationSeconds ?? 0), 0);

    return [
      {
        label: 'Horas de vídeo',
        value: formatDuration(videoSeconds),
        color: 'from-sky-400 to-sky-600',
        icon: (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10" />
            <path d="m10 8 6 4-6 4V8Z" fill="currentColor" stroke="none" />
          </svg>
        ),
      },
      {
        label: 'Total de eBooks',
        value: conteudos.filter((c) => c.mediaType === 'PDF').length,
        color: 'from-emerald-400 to-emerald-600',
        icon: (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
            <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2Z" />
          </svg>
        ),
      },
      {
        label: 'Total de Apps',
        value: conteudos.filter((c) => c.mediaType === 'APP').length,
        color: 'from-violet-400 to-violet-600',
        icon: (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="5" y="2" width="14" height="20" rx="2" />
            <path d="M12 18h.01" />
          </svg>
        ),
      },
      {
        label: 'Total de Artigos',
        value: conteudos.filter((c) => c.mediaType === 'ARTIGO').length,
        color: 'from-rose-400 to-rose-600',
        icon: (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M4 4h16v16H4z" />
            <path d="M8 8h8M8 12h8M8 16h5" />
          </svg>
        ),
      },
    ];
  }, [feed]);
}
