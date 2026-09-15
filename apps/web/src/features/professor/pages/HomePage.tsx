import { useMemo, useState } from 'react';
import type { ConteudoSummary } from '@fazmais/shared';
import { useAuthStore } from '../../../store/authStore';
import { useLogout } from '../../auth/hooks/useLogout';
import { ThemeToggle } from '../../../components/ThemeToggle';
import { FazMaisLegacyLogo } from '../../../components/FazMaisLegacyLogo';
import { extrairTermos, matchScore } from '../../../lib/textSearch';
import { sanitizeHtml } from '../../../lib/sanitizeHtml';
import { useHomeFeed } from '../hooks/useHomeFeed';
import { useRegistrarView } from '../hooks/useRegistrarView';
import { ArtigoModal } from '../components/ArtigoModal';
import { VideoModal } from '../components/VideoModal';
import { PdfModal } from '../components/PdfModal';
import { AppModal } from '../components/AppModal';
import { AiChatModal } from '../components/AiChatModal';
import fabinhoAvatar from '../../../assets/fabinho-avatar.webp';
import { AcervoStatsRow } from '../components/AcervoStatsRow';
import { ConteudoCard } from '../components/ConteudoCard';
import { HeroCarousel } from '../components/HeroCarousel';

const HOME_ID = '__home__';

export function HomePage() {
  const user = useAuthStore((state) => state.user);
  const handleLogout = useLogout();
  const { data: feed, isLoading, error } = useHomeFeed();
  const [conteudoAberto, setConteudoAberto] = useState<ConteudoSummary | null>(null);
  const [eixoAtivoId, setEixoAtivoId] = useState<string>(HOME_ID);
  const [searchQuery, setSearchQuery] = useState('');
  const [aiChatPergunta, setAiChatPergunta] = useState<string | null>(null);
  const registrarView = useRegistrarView();

  function abrirConteudo(conteudo: ConteudoSummary) {
    setConteudoAberto(conteudo);
    registrarView.mutate(conteudo.id);
  }

  const eixos = useMemo(() => {
    // `feed.rows` já vem do backend ordenado por eixo.ordem (ver
    // home.service.ts) — então só precisa pegar a primeira ocorrência de
    // cada eixo, na ordem em que aparecem, sem reordenar de novo aqui.
    const vistos = new Map<string, { name: string; description: string | null }>();
    for (const row of feed?.rows ?? []) {
      if (!vistos.has(row.eixoId)) {
        vistos.set(row.eixoId, { name: row.eixoName, description: row.eixoDescription });
      }
    }
    return [
      { id: HOME_ID, name: 'Home', description: null },
      ...Array.from(vistos, ([id, { name, description }]) => ({ id, name, description })),
    ];
  }, [feed]);

  const isHome = eixoAtivoId === HOME_ID;
  const rowsDoEixo = feed?.rows.filter((row) => row.eixoId === eixoAtivoId) ?? [];
  const eixoAtivoDescription = eixos.find((eixo) => eixo.id === eixoAtivoId)?.description ?? null;

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
      <header className="sticky top-0 z-20 border-b border-white/10 bg-[#07070c] light:border-black/10 light:bg-[#f6f4ef]">
      <div className="flex items-center gap-4 px-7 py-3.5">
        <div className="flex shrink-0 items-center">
          <FazMaisLegacyLogo className="h-12 w-auto" />
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
      </div>

        {!isSearching && (
          <nav className="flex gap-1 overflow-x-auto px-7 pb-2">
            {eixos.map((eixo) => (
              <button
                key={eixo.id}
                type="button"
                onClick={() => setEixoAtivoId(eixo.id)}
                className={
                  eixo.id === eixoAtivoId
                    ? 'shrink-0 whitespace-nowrap border-b-2 border-amber-400 px-3 py-1.5 text-xs font-semibold text-amber-400'
                    : 'shrink-0 whitespace-nowrap border-b-2 border-transparent px-3 py-1.5 text-xs font-semibold text-neutral-400 transition hover:text-neutral-100 light:text-neutral-500 light:hover:text-neutral-900'
                }
              >
                {eixo.name}
              </button>
            ))}
          </nav>
        )}
      </header>

      <main className="px-7 py-8">
        {isLoading && <p className="text-sm text-neutral-400">Carregando...</p>}
        {error && <p className="text-sm text-rose-300">Não foi possível carregar o catálogo.</p>}

        {feed && feed.featured.length === 0 && feed.rows.length === 0 && (
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
            {isHome && feed && feed.featured.length > 0 && (
              <div className="mb-8">
                <AcervoStatsRow feed={feed} />
                <HeroCarousel items={feed.featured} onOpen={abrirConteudo} />
              </div>
            )}

            {isHome && feed && feed.populares.length > 0 && (
              <section className="mb-8">
                <h2 className="mb-3 text-sm font-bold">🔥 Top 10 mais acessados</h2>
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

            {isHome && feed && feed.recentes.length > 0 && (
              <section className="mb-8">
                <h2 className="mb-3 text-sm font-bold">🆕 Adicionados recentemente</h2>
                <div className="-mx-2 flex gap-3 overflow-x-auto px-2 py-4">
                  {feed.recentes.map((conteudo, index) => (
                    <ConteudoCard key={conteudo.id} conteudo={conteudo} index={index} onOpen={abrirConteudo} showDate />
                  ))}
                </div>
              </section>
            )}

            {isHome && feed && feed.recomendados.length > 0 && (
              <section className="mb-8">
                <h2 className="mb-3 text-sm font-bold">✨ Recomendados para você</h2>
                <div className="-mx-2 flex gap-3 overflow-x-auto px-2 py-4">
                  {feed.recomendados.map((conteudo, index) => (
                    <ConteudoCard key={conteudo.id} conteudo={conteudo} index={index} onOpen={abrirConteudo} />
                  ))}
                </div>
              </section>
            )}

            {isHome && feed && feed.continuarAssistindo.length > 0 && (
              <section className="mb-8">
                <h2 className="mb-3 text-sm font-bold">▶ Continuar assistindo</h2>
                <div className="-mx-2 flex gap-3 overflow-x-auto px-2 py-4">
                  {feed.continuarAssistindo.map((conteudo, index) => (
                    <ConteudoCard key={conteudo.id} conteudo={conteudo} index={index} onOpen={abrirConteudo} />
                  ))}
                </div>
              </section>
            )}

            {!isHome && eixoAtivoDescription && (
              <div
                className="mb-8 max-w-5xl text-sm leading-relaxed text-neutral-400 [&_a]:text-amber-400 [&_a]:underline [&_p]:mb-4 [&_p:last-child]:mb-0 [&_strong]:text-neutral-200 [&_h1]:mb-3 [&_h1]:text-xl [&_h1]:font-bold [&_h1]:text-neutral-100 [&_h2]:mb-3 [&_h2]:text-lg [&_h2]:font-bold [&_h2]:text-neutral-100 [&_h3]:mb-2 [&_h3]:text-base [&_h3]:font-bold [&_h3]:text-neutral-100 [&_ul]:mb-4 [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:mb-4 [&_ol]:list-decimal [&_ol]:pl-5 [&_li]:mb-1 light:text-neutral-600 light:[&_strong]:text-neutral-800 light:[&_h1]:text-neutral-900 light:[&_h2]:text-neutral-900 light:[&_h3]:text-neutral-900"
                dangerouslySetInnerHTML={{ __html: sanitizeHtml(eixoAtivoDescription) }}
              />
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
      {conteudoAberto?.mediaType === 'APP' && (
        <AppModal conteudo={conteudoAberto} onClose={() => setConteudoAberto(null)} />
      )}

      {aiChatPergunta !== null && feed && (
        <AiChatModal
          perguntaInicial={aiChatPergunta}
          feed={feed}
          onAbrirConteudo={abrirConteudo}
          onClose={() => setAiChatPergunta(null)}
        />
      )}

      {!conteudoAberto && aiChatPergunta === null && (
        <div className="group fixed bottom-6 right-6 z-30">
          <button
            type="button"
            onClick={() => setAiChatPergunta('')}
            aria-label="Perguntar ao Fabinho"
            className="relative flex h-14 w-14 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-amber-400 to-amber-500 shadow-lg shadow-amber-500/30 ring-2 ring-amber-400/60 transition hover:scale-105 hover:shadow-amber-500/50"
          >
            <img src={fabinhoAvatar} alt="" className="h-full w-full object-cover" />
          </button>
          <span className="pointer-events-none absolute bottom-full right-0 z-30 mb-2 w-max max-w-[220px] -translate-x-0 rounded-lg bg-neutral-900 px-3 py-1.5 text-center text-xs font-medium text-white opacity-0 shadow-lg transition group-hover:opacity-100 light:bg-neutral-800">
            Pergunte ao Fabinho e encontre o conteúdo certo em segundos
          </span>
        </div>
      )}
    </div>
  );
}
