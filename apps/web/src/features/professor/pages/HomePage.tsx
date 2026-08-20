import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { ConteudoSummary } from '@fazmais/shared';
import { useAuthStore } from '../../../store/authStore';
import { ThemeToggle } from '../../../components/ThemeToggle';
import { extrairTermos, matchScore } from '../../../lib/textSearch';
import { useHomeFeed } from '../hooks/useHomeFeed';
import { useRegistrarView } from '../hooks/useRegistrarView';
import { ArtigoModal } from '../components/ArtigoModal';
import { VideoModal } from '../components/VideoModal';
import { PdfModal } from '../components/PdfModal';
import { FavoriteButton } from '../components/FavoriteButton';
import { StarRating } from '../components/StarRating';
import { AiChatModal } from '../components/AiChatModal';
import { ConteudoCard, GRADIENTS, MEDIA_BADGE, OPENABLE_TYPES } from '../components/ConteudoCard';

export function HomePage() {
  const user = useAuthStore((state) => state.user);
  const clearSession = useAuthStore((state) => state.clearSession);
  const navigate = useNavigate();
  const { data: feed, isLoading, error } = useHomeFeed();
  const [conteudoAberto, setConteudoAberto] = useState<ConteudoSummary | null>(null);
  const [eixoAtivoId, setEixoAtivoId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [aiQuestion, setAiQuestion] = useState('');
  const [aiChatPergunta, setAiChatPergunta] = useState<string | null>(null);
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
    const termos = extrairTermos(searchQuery);
    if (termos.length === 0) return [];
    const todosConteudos = feed?.rows.flatMap((row) => row.conteudos) ?? [];
    return todosConteudos.filter(
      (conteudo) => matchScore(`${conteudo.title} ${conteudo.description}`, termos) === termos.length,
    );
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

        <div className="mx-auto flex w-full max-w-2xl items-center gap-2">
          <div className="relative flex-1">
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

          <div className="relative flex-1">
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500"
            >
              <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5Z" />
            </svg>
            <input
              type="text"
              value={aiQuestion}
              onChange={(event) => setAiQuestion(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === 'Enter' && aiQuestion.trim()) {
                  setAiChatPergunta(aiQuestion.trim());
                  setAiQuestion('');
                }
              }}
              placeholder="Consulte a IA"
              className="w-full rounded-full border border-white/10 bg-white/[0.04] py-1.5 pl-8 pr-3 text-sm text-neutral-100 outline-none transition placeholder:text-neutral-500 focus:border-amber-400/50 focus:bg-white/[0.07] light:border-black/10 light:bg-black/[0.03] light:text-neutral-900 light:placeholder:text-neutral-400"
            />
          </div>
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

      <div className="flex">
        {eixos.length > 0 && !isSearching && (
          <aside className="w-52 shrink-0 border-r border-white/10 p-4 light:border-black/10">
            <nav className="sticky top-4 flex flex-col gap-1">
              {eixos.map((eixo) => (
                <button
                  key={eixo.id}
                  type="button"
                  onClick={() => setEixoAtivoId(eixo.id)}
                  className={
                    eixo.id === eixoAtivoId
                      ? 'rounded-lg bg-gradient-to-r from-amber-400 to-amber-500 px-4 py-2.5 text-left text-sm font-semibold text-neutral-950'
                      : 'rounded-lg px-4 py-2.5 text-left text-sm font-semibold text-neutral-400 transition hover:bg-white/[0.05] hover:text-neutral-100 light:text-neutral-500 light:hover:bg-black/[0.03]'
                  }
                >
                  {eixo.name}
                </button>
              ))}
            </nav>
          </aside>
        )}

      <main className="min-w-0 flex-1 px-7 py-8">
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
                <div className="-mx-2 flex gap-1 overflow-x-auto overflow-y-hidden px-2 py-4">
                  {feed.populares.slice(0, 10).map((conteudo, index) => (
                    <div key={conteudo.id} className="flex shrink-0 items-stretch">
                      <span
                        className="-mr-6 flex select-none items-center justify-center text-[170px] font-black leading-none text-transparent [-webkit-text-stroke:2px_rgba(255,255,255,0.35)] light:[-webkit-text-stroke:2px_rgba(0,0,0,0.25)]"
                        aria-hidden="true"
                      >
                        {index + 1}
                      </span>
                      <ConteudoCard conteudo={conteudo} index={index} onOpen={abrirConteudo} />
                    </div>
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
      </div>

      {conteudoAberto?.mediaType === 'ARTIGO' && (
        <ArtigoModal conteudo={conteudoAberto} onClose={() => setConteudoAberto(null)} />
      )}
      {conteudoAberto?.mediaType === 'VIDEO' && (
        <VideoModal conteudo={conteudoAberto} onClose={() => setConteudoAberto(null)} />
      )}
      {conteudoAberto?.mediaType === 'PDF' && (
        <PdfModal conteudo={conteudoAberto} onClose={() => setConteudoAberto(null)} />
      )}

      {aiChatPergunta !== null && feed && (
        <AiChatModal
          perguntaInicial={aiChatPergunta}
          feed={feed}
          onAbrirConteudo={abrirConteudo}
          onClose={() => setAiChatPergunta(null)}
        />
      )}
    </div>
  );
}
