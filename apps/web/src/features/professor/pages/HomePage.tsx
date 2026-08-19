import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { ConteudoSummary } from '@fazmais/shared';
import { useAuthStore } from '../../../store/authStore';
import { ThemeToggle } from '../../../components/ThemeToggle';
import { useHomeFeed } from '../hooks/useHomeFeed';
import { ArtigoModal } from '../components/ArtigoModal';
import { VideoModal } from '../components/VideoModal';

const MEDIA_BADGE: Record<string, string> = { VIDEO: '▶ Vídeo', PDF: '📄 PDF', ARTIGO: '📰 Artigo' };
const OPENABLE_TYPES = new Set(['ARTIGO', 'VIDEO']);
const OPEN_HINT: Record<string, string> = { ARTIGO: 'Ler', VIDEO: 'Assistir' };
const GRADIENTS = [
  'linear-gradient(135deg,#6366f1,#312e81)',
  'linear-gradient(135deg,#f59e0b,#92400e)',
  'linear-gradient(135deg,#10b981,#064e3b)',
  'linear-gradient(135deg,#ec4899,#831843)',
];

function ConteudoCard({
  conteudo,
  index,
  onOpen,
}: {
  conteudo: ConteudoSummary;
  index: number;
  onOpen: (conteudo: ConteudoSummary) => void;
}) {
  const isOpenable = OPENABLE_TYPES.has(conteudo.mediaType);
  return (
    <div
      role={isOpenable ? 'button' : undefined}
      tabIndex={isOpenable ? 0 : undefined}
      onClick={isOpenable ? () => onOpen(conteudo) : undefined}
      onKeyDown={isOpenable ? (event) => event.key === 'Enter' && onOpen(conteudo) : undefined}
      className={`group w-44 shrink-0 overflow-hidden rounded-xl border border-white/10 bg-white/[0.035] transition hover:border-white/20 light:border-black/10 light:bg-white ${isOpenable ? 'cursor-pointer' : ''}`}
    >
      <div
        className="flex h-24 items-start justify-between p-2.5"
        style={{ background: GRADIENTS[index % GRADIENTS.length] }}
      >
        <span className="rounded-full bg-black/40 px-2 py-0.5 text-[10px] font-bold text-white">
          {MEDIA_BADGE[conteudo.mediaType]}
        </span>
        {isOpenable && (
          <span className="rounded-full bg-black/40 px-2 py-0.5 text-[10px] font-bold text-white opacity-0 transition group-hover:opacity-100">
            {OPEN_HINT[conteudo.mediaType]}
          </span>
        )}
      </div>
      <div className="p-2.5">
        <p className="line-clamp-2 text-xs font-semibold">{conteudo.title}</p>
        {conteudo.tags.length > 0 && (
          <p className="mt-1.5 truncate text-[10px] text-neutral-500">{conteudo.tags.join(', ')}</p>
        )}
      </div>
    </div>
  );
}

export function HomePage() {
  const user = useAuthStore((state) => state.user);
  const clearSession = useAuthStore((state) => state.clearSession);
  const navigate = useNavigate();
  const { data: feed, isLoading, error } = useHomeFeed();
  const [conteudoAberto, setConteudoAberto] = useState<ConteudoSummary | null>(null);

  function handleLogout() {
    clearSession();
    navigate('/login', { replace: true });
  }

  const heroIsOpenable = feed?.featured ? OPENABLE_TYPES.has(feed.featured.mediaType) : false;

  return (
    <div className="min-h-screen bg-[#07070c] text-neutral-100 light:bg-[#f6f4ef] light:text-neutral-900">
      <header className="flex items-center justify-between border-b border-white/10 px-7 py-3.5 light:border-black/10">
        <div className="flex items-center gap-2.5">
          <span className="flex h-7 w-7 items-center justify-center rounded-md bg-gradient-to-br from-amber-400 to-amber-600 text-sm font-black text-neutral-950">
            F
          </span>
          <span className="text-base font-bold tracking-tight">
            Faz<span className="text-amber-400">Mais</span>
          </span>
        </div>
        <div className="flex items-center gap-3">
          <ThemeToggle />
          <div className="flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-indigo-700 text-xs font-bold text-white">
              {user?.name.charAt(0).toUpperCase()}
            </span>
            <div className="leading-tight">
              <div className="text-sm font-semibold">{user?.name}</div>
              <div className="text-[11px] text-neutral-500">Professor</div>
            </div>
          </div>
          <button
            type="button"
            onClick={handleLogout}
            className="text-sm text-neutral-400 transition hover:text-neutral-100 light:text-neutral-500 light:hover:text-neutral-900"
          >
            Sair
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-7 py-8">
        {isLoading && <p className="text-sm text-neutral-400">Carregando...</p>}
        {error && <p className="text-sm text-rose-300">Não foi possível carregar o catálogo.</p>}

        {feed && !feed.featured && feed.rows.length === 0 && (
          <p className="text-sm text-neutral-500">
            Nenhum conteúdo disponível ainda para o seu município e plano.
          </p>
        )}

        {feed?.featured && (
          <div
            role={heroIsOpenable ? 'button' : undefined}
            tabIndex={heroIsOpenable ? 0 : undefined}
            onClick={heroIsOpenable ? () => setConteudoAberto(feed.featured) : undefined}
            className={`relative mb-8 flex h-64 flex-col justify-end overflow-hidden rounded-2xl border border-white/10 p-6 light:border-black/10 ${heroIsOpenable ? 'cursor-pointer' : ''}`}
            style={{ background: GRADIENTS[0] }}
          >
            <span className="mb-2 w-fit rounded-full bg-black/40 px-2.5 py-0.5 text-[11px] font-bold text-white">
              {MEDIA_BADGE[feed.featured.mediaType]} · destaque
            </span>
            <h1 className="max-w-xl text-2xl font-bold text-white">{feed.featured.title}</h1>
            <p className="mt-1 max-w-xl line-clamp-2 text-sm text-white/80">{feed.featured.description}</p>
          </div>
        )}

        {feed?.rows.map((row) => (
          <section key={row.title} className="mb-8">
            <h2 className="mb-3 text-sm font-bold">{row.title}</h2>
            <div className="-mx-2 flex gap-3 overflow-x-auto p-2">
              {row.conteudos.map((conteudo, index) => (
                <ConteudoCard key={conteudo.id} conteudo={conteudo} index={index} onOpen={setConteudoAberto} />
              ))}
            </div>
          </section>
        ))}
      </main>

      {conteudoAberto?.mediaType === 'ARTIGO' && (
        <ArtigoModal conteudo={conteudoAberto} onClose={() => setConteudoAberto(null)} />
      )}
      {conteudoAberto?.mediaType === 'VIDEO' && (
        <VideoModal conteudo={conteudoAberto} onClose={() => setConteudoAberto(null)} />
      )}
    </div>
  );
}
