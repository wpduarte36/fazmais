import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { ConteudoSummary } from '@fazmais/shared';
import { useAuthStore } from '../../../store/authStore';
import { ThemeToggle } from '../../../components/ThemeToggle';
import { useHomeFeed } from '../hooks/useHomeFeed';
import { useRegistrarView } from '../hooks/useRegistrarView';
import { ArtigoModal } from '../components/ArtigoModal';
import { VideoModal } from '../components/VideoModal';
import { PdfModal } from '../components/PdfModal';
import { FavoriteButton } from '../components/FavoriteButton';
import { StarRating } from '../components/StarRating';

const MEDIA_BADGE: Record<string, string> = { VIDEO: '▶ Vídeo', PDF: '📄 PDF', ARTIGO: '📰 Artigo' };
const OPENABLE_TYPES = new Set(['ARTIGO', 'VIDEO', 'PDF']);
const OPEN_HINT: Record<string, string> = { ARTIGO: 'Ler', VIDEO: 'Assistir', PDF: 'Abrir' };
const GRADIENTS = [
  'linear-gradient(135deg,#6366f1,#312e81)',
  'linear-gradient(135deg,#f59e0b,#92400e)',
  'linear-gradient(135deg,#10b981,#064e3b)',
  'linear-gradient(135deg,#ec4899,#831843)',
];

function normalize(text: string): string {
  return text.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
}

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
      className={`group w-44 shrink-0 overflow-hidden rounded-xl border border-white/10 bg-white/[0.035] transition duration-200 hover:z-10 hover:scale-110 hover:border-white/30 hover:shadow-2xl light:border-black/10 light:bg-white ${isOpenable ? 'cursor-pointer' : ''}`}
    >
      <div className="relative flex h-24 items-start justify-between overflow-hidden p-2.5" style={{ background: GRADIENTS[index % GRADIENTS.length] }}>
        <img src={conteudo.imageUrl} alt="" className="absolute inset-0 h-full w-full object-cover" loading="lazy" />
        <span className="relative rounded-full bg-black/50 px-2 py-0.5 text-[10px] font-bold text-white">
          {MEDIA_BADGE[conteudo.mediaType]}
        </span>
        {isOpenable && (
          <span className="relative rounded-full bg-black/50 px-2 py-0.5 text-[10px] font-bold text-white opacity-0 transition group-hover:opacity-100">
            {OPEN_HINT[conteudo.mediaType]}
          </span>
        )}
        <FavoriteButton
          conteudo={conteudo}
          className="absolute bottom-2 right-2 flex h-6 w-6 items-center justify-center rounded-full bg-black/50 text-white transition hover:text-rose-400 aria-pressed:text-rose-400"
        />
      </div>
      <div className="p-2.5">
        <p className="line-clamp-2 text-xs font-semibold">{conteudo.title}</p>
        {conteudo.tags.length > 0 && (
          <p className="mt-1.5 truncate text-[10px] text-neutral-500">{conteudo.tags.join(', ')}</p>
        )}
        <StarRating conteudo={conteudo} size={11} className="mt-1.5" />
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
  const [eixoAtivoId, setEixoAtivoId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const registrarView = useRegistrarView();

  function abrirConteudo(conteudo: ConteudoSummary) {
    setConteudoAberto(conteudo);
    registrarView.mutate(conteudo.id);
  }

  function handleLogout() {
    clearSession();
    navigate('/login', { replace: true });
  }

  const eixos = useMemo(() => {
    const vistos = new Map<string, string>();
    for (const row of feed?.rows ?? []) {
      if (!vistos.has(row.eixoId)) vistos.set(row.eixoId, row.eixoName);
    }
    return Array.from(vistos, ([id, name]) => ({ id, name }));
  }, [feed]);

  useEffect(() => {
    if (!eixoAtivoId && eixos.length > 0) {
      setEixoAtivoId(eixos[0].id);
    }
  }, [eixos, eixoAtivoId]);

  const rowsDoEixo = feed?.rows.filter((row) => row.eixoId === eixoAtivoId) ?? [];

  const heroIsOpenable = feed?.featured ? OPENABLE_TYPES.has(feed.featured.mediaType) : false;

  const isSearching = searchQuery.trim().length > 0;
  const searchResults = useMemo(() => {
    const termos = normalize(searchQuery.trim()).split(/\s+/).filter(Boolean);
    if (termos.length === 0) return [];
    const todosConteudos = feed?.rows.flatMap((row) => row.conteudos) ?? [];
    return todosConteudos.filter((conteudo) => {
      const texto = normalize(`${conteudo.title} ${conteudo.description}`);
      return termos.every((termo) => texto.includes(termo));
    });
  }, [feed, searchQuery]);

  return (
    <div className="min-h-screen bg-[#07070c] text-neutral-100 light:bg-[#f6f4ef] light:text-neutral-900">
      <header className="flex items-center gap-4 border-b border-white/10 px-7 py-3.5 light:border-black/10">
        <div className="flex shrink-0 items-center gap-2.5">
          <span className="flex h-7 w-7 items-center justify-center rounded-md bg-gradient-to-br from-amber-400 to-amber-600 text-sm font-black text-neutral-950">
            F
          </span>
          <span className="text-base font-bold tracking-tight">
            Faz<span className="text-amber-400">Mais</span>
          </span>
        </div>

        <div className="relative mx-auto w-full max-w-xs">
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500"
          >
            <circle cx="11" cy="11" r="7" />
            <path d="m21 21-4.35-4.35" />
          </svg>
          <input
            type="text"
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            placeholder="Buscar conteúdos..."
            className="w-full rounded-full border border-white/10 bg-white/[0.04] py-1.5 pl-8 pr-8 text-sm text-neutral-100 outline-none transition placeholder:text-neutral-500 focus:border-amber-400/50 focus:bg-white/[0.07] light:border-black/10 light:bg-black/[0.03] light:text-neutral-900 light:placeholder:text-neutral-400"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              aria-label="Limpar busca"
              className="absolute right-2.5 top-1/2 flex h-4 w-4 -translate-y-1/2 items-center justify-center rounded-full text-neutral-500 transition hover:text-neutral-100"
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M18 6 6 18M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>

        <div className="flex shrink-0 items-center gap-3">
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

        {isSearching ? (
          <section>
            <h2 className="mb-4 text-sm font-bold">
              {searchResults.length > 0
                ? `Resultados para "${searchQuery.trim()}"`
                : `Nenhum resultado para "${searchQuery.trim()}"`}
            </h2>
            <div className="flex flex-wrap gap-3 py-2">
              {searchResults.map((conteudo, index) => (
                <ConteudoCard key={conteudo.id} conteudo={conteudo} index={index} onOpen={abrirConteudo} />
              ))}
            </div>
          </section>
        ) : (
          <>
            {eixos.length > 0 && (
              <div className="mb-7 flex gap-2 overflow-x-auto pb-1">
                {eixos.map((eixo) => (
                  <button
                    key={eixo.id}
                    type="button"
                    onClick={() => setEixoAtivoId(eixo.id)}
                    className={
                      eixo.id === eixoAtivoId
                        ? 'shrink-0 rounded-full bg-gradient-to-r from-amber-400 to-amber-500 px-4 py-1.5 text-sm font-semibold text-neutral-950'
                        : 'shrink-0 rounded-full border border-white/15 bg-white/[0.03] px-4 py-1.5 text-sm font-semibold text-neutral-400 transition hover:text-neutral-100 light:border-black/15 light:bg-black/[0.02] light:text-neutral-500'
                    }
                  >
                    {eixo.name}
                  </button>
                ))}
              </div>
            )}

            {feed?.featured && (
              <div
                role={heroIsOpenable ? 'button' : undefined}
                tabIndex={heroIsOpenable ? 0 : undefined}
                onClick={heroIsOpenable ? () => abrirConteudo(feed.featured!) : undefined}
                className={`relative mb-8 flex h-64 flex-col justify-end overflow-hidden rounded-2xl border border-white/10 p-6 light:border-black/10 ${heroIsOpenable ? 'cursor-pointer' : ''}`}
                style={{ background: GRADIENTS[0] }}
              >
                <img src={feed.featured.imageUrl} alt="" className="absolute inset-0 h-full w-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent" />
                <FavoriteButton
                  conteudo={feed.featured}
                  className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full bg-black/40 text-white transition hover:text-rose-400 aria-pressed:text-rose-400"
                />
                <span className="relative mb-2 w-fit rounded-full bg-black/40 px-2.5 py-0.5 text-[11px] font-bold text-white">
                  {MEDIA_BADGE[feed.featured.mediaType]} · destaque
                </span>
                <h1 className="relative max-w-xl text-2xl font-bold text-white">{feed.featured.title}</h1>
                <p className="relative mt-1 max-w-xl line-clamp-2 text-sm text-white/80">{feed.featured.description}</p>
                <StarRating conteudo={feed.featured} size={17} className="relative mt-2" />
              </div>
            )}

            {feed && feed.populares.length > 0 && (
              <section className="mb-8">
                <h2 className="mb-3 text-sm font-bold">🔥 Mais assistidos</h2>
                <div className="-mx-2 flex gap-3 overflow-x-auto px-2 py-4">
                  {feed.populares.map((conteudo, index) => (
                    <ConteudoCard key={conteudo.id} conteudo={conteudo} index={index} onOpen={abrirConteudo} />
                  ))}
                </div>
              </section>
            )}

            {rowsDoEixo.map((row) => (
              <section key={row.colecaoId} className="mb-8">
                <h2 className="mb-3 text-sm font-bold">{row.colecaoName}</h2>
                <div className="-mx-2 flex gap-3 overflow-x-auto px-2 py-4">
                  {row.conteudos.map((conteudo, index) => (
                    <ConteudoCard key={conteudo.id} conteudo={conteudo} index={index} onOpen={abrirConteudo} />
                  ))}
                </div>
              </section>
            ))}
          </>
        )}
      </main>

      {conteudoAberto?.mediaType === 'ARTIGO' && (
        <ArtigoModal conteudo={conteudoAberto} onClose={() => setConteudoAberto(null)} />
      )}
      {conteudoAberto?.mediaType === 'VIDEO' && (
        <VideoModal conteudo={conteudoAberto} onClose={() => setConteudoAberto(null)} />
      )}
      {conteudoAberto?.mediaType === 'PDF' && (
        <PdfModal conteudo={conteudoAberto} onClose={() => setConteudoAberto(null)} />
      )}
    </div>
  );
}
