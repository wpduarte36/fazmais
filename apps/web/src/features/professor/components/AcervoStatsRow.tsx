import type { HomeFeed } from '@fazmais/shared';
import { useAcervoStats } from '../hooks/useAcervoStats';

export function AcervoStatsRow({ feed }: { feed: HomeFeed }) {
  const stats = useAcervoStats(feed);

  return (
    <div className="mb-4 grid grid-cols-4 gap-3">
      {stats.map((stat) => (
        <div
          key={stat.label}
          className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.035] px-4 py-3 light:border-black/10 light:bg-black/[0.02]"
        >
          <span
            className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br text-white ${stat.color}`}
          >
            {stat.icon}
          </span>
          <div className="min-w-0">
            <p className="truncate text-lg font-bold leading-tight text-neutral-100 light:text-neutral-900">
              {stat.value}
            </p>
            <p className="truncate text-[11px] text-neutral-400 light:text-neutral-600">{stat.label}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
