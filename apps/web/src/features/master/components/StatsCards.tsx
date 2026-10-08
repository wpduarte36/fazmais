import type { ReactNode } from 'react';
import { useMasterStats } from '../hooks/useMasterStats';

const CARDS: Array<{
  key: 'empresas' | 'municipios' | 'admins' | 'professores' | 'conteudos';
  label: string;
  gradient: string;
  icon: ReactNode;
}> = [
  {
    key: 'empresas',
    label: 'Empresas',
    gradient: 'from-sky-500 to-sky-700',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="3" y="7" width="18" height="13" rx="2" />
        <path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M3 13h18" />
      </svg>
    ),
  },
  {
    key: 'municipios',
    label: 'Municípios',
    gradient: 'from-brand-400 to-brand-600',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M3 21h18M5 21V7l7-4 7 4v14M9 9h1m4 0h1m-6 4h1m4 0h1m-6 4h1m4 0h1" />
      </svg>
    ),
  },
  {
    key: 'admins',
    label: 'Admins',
    gradient: 'from-indigo-500 to-indigo-700',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M12 2 4 6v6c0 5 3.5 8.5 8 10 4.5-1.5 8-5 8-10V6l-8-4Z" />
      </svg>
    ),
  },
  {
    key: 'professores',
    label: 'Educadores',
    gradient: 'from-emerald-500 to-emerald-700',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="12" cy="8" r="4" />
        <path d="M4 21c0-4.4 3.6-8 8-8s8 3.6 8 8" />
      </svg>
    ),
  },
  {
    key: 'conteudos',
    label: 'Conteúdos',
    gradient: 'from-rose-500 to-rose-700',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="4" y="3" width="16" height="18" rx="2" />
        <path d="M8 8h8M8 12h8M8 16h5" />
      </svg>
    ),
  },
];

const numberFormatter = new Intl.NumberFormat('pt-BR');

export function StatsCards() {
  const { data, isLoading, error } = useMasterStats();

  if (error) {
    return (
      <div className="mb-6 rounded-lg border border-rose-500/30 bg-rose-500/10 px-3.5 py-2.5 text-sm text-rose-300 light:text-rose-700">
        Não foi possível carregar os totais globais.
      </div>
    );
  }

  return (
    <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
      {CARDS.map((card) => (
        <div
          key={card.key}
          className="rounded-xl border border-white/10 bg-white/[0.035] p-4 light:border-black/10 light:bg-white"
        >
          <span
            className={`mb-3 flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br ${card.gradient} text-white`}
          >
            {card.icon}
          </span>
          <div className="text-2xl font-bold tabular-nums">
            {isLoading || !data ? (
              <span className="inline-block h-7 w-12 animate-pulse rounded bg-white/10 light:bg-black/10" />
            ) : (
              numberFormatter.format(data[card.key])
            )}
          </div>
          <div className="mt-0.5 text-xs font-medium text-neutral-400 light:text-neutral-500">{card.label}</div>
        </div>
      ))}
    </div>
  );
}
