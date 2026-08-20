import { useUserStats } from '../hooks/useUsers';

const CARDS: Array<{ key: 'total' | 'ativos' | 'pendentes'; label: string; gradient: string; icon: string }> = [
  { key: 'total', label: 'Total de usuários', gradient: 'from-indigo-500 to-indigo-700', icon: '👥' },
  { key: 'ativos', label: 'Ativos', gradient: 'from-emerald-500 to-emerald-700', icon: '✅' },
  { key: 'pendentes', label: 'Pendentes', gradient: 'from-amber-400 to-amber-600', icon: '⏳' },
];

const numberFormatter = new Intl.NumberFormat('pt-BR');

export function UserStatsCards() {
  const { data, isLoading, error } = useUserStats();

  if (error) {
    return (
      <div className="mb-6 rounded-lg border border-rose-500/30 bg-rose-500/10 px-3.5 py-2.5 text-sm text-rose-300 light:text-rose-700">
        Não foi possível carregar os totais de usuários.
      </div>
    );
  }

  return (
    <div className="mb-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
      {CARDS.map((card) => (
        <div
          key={card.key}
          className="rounded-xl border border-white/10 bg-white/[0.035] p-4 light:border-black/10 light:bg-white"
        >
          <span
            className={`mb-3 flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br ${card.gradient} text-sm`}
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
