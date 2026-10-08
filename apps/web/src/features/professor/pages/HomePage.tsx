import { useMemo, useState } from 'react';
import { Navigate, useNavigate, useSearchParams } from 'react-router-dom';
import { MARCA_PADRAO_SLUG, Role, type ConteudoSummary } from '@fazmais/shared';
import { useAuthStore } from '../../../store/authStore';
import { useLogout } from '../../auth/hooks/useLogout';
import { ThemeToggle } from '../../../components/ThemeToggle';
import { BackButton } from '../../../components/BackButton';
import { BrandLogo } from '../../../components/BrandLogo';
import { useMarca } from '../../../store/marcaStore';
import { extrairTermos, matchScore } from '../../../lib/textSearch';
import { sanitizeHtml } from '../../../lib/sanitizeHtml';
import { useHomeFeed } from '../hooks/useHomeFeed';
import { useRegistrarView } from '../hooks/useRegistrarView';
import { useSomenteLeitura } from '../hooks/useSomenteLeitura';
import { ArtigoModal } from '../components/ArtigoModal';
import { VideoModal } from '../components/VideoModal';
import { PdfModal } from '../components/PdfModal';
import { AppModal } from '../components/AppModal';
import { AiChatModal } from '../components/AiChatModal';
import { imagensDoAssistente } from '../../../lib/imagensAssistente';
import { AcervoStatsRow } from '../components/AcervoStatsRow';
import { ConteudoCard } from '../components/ConteudoCard';
import { HeroCarousel } from '../components/HeroCarousel';
import { useTextoDaMarca } from '../../../lib/textoDaMarca';
import { BibliotecaAppsExterna } from '../components/BibliotecaAppsExterna';

const HOME_ID = '__home__';
// Opção fixa do menu (não é eixo do catálogo): Biblioteca de Apps externa incorporada.
const BIBLIOTECA_APPS_ID = 'biblioteca-apps';

export function HomePage() {
  const user = useAuthStore((state) => state.user);
  const marca = useMarca();
  const textoDaMarca = useTextoDaMarca();
  const imagensAssistente = imagensDoAssistente(marca);
  const handleLogout = useLogout();
  const navigate = useNavigate();
  // Admin chega aqui pelo link "Área do Educador" embaixo do nome no Painel Admin — vê o
  // acervo inteiro do município (plano mais alto, ver conteudo-visibility.util
  // na API); embaixo do nome aparece "Área do Educador" e, abaixo, o link "← Painel Admin".
  const isAdminPreview = user?.role === Role.ADMIN;
  // O eixo ativo mora na URL (?eixo=<id>), não em estado local: assim o
  // botão voltar do navegador/celular volta pro eixo anterior (ou pra Home)
  // em vez de sair da página, e um F5 mantém o educador onde estava.
  const [searchParams, setSearchParams] = useSearchParams();
  // Master chega aqui pela "Área do Educador" do Painel Master, escolhendo
  // município e plano — que vêm na URL (?tenant=&plano=) e vão pra API.
  const isMasterPreview = user?.role === Role.MASTER;
  const tenantParam = searchParams.get('tenant');
  const planoParam = searchParams.get('plano');
  const visaoMaster =
    isMasterPreview && tenantParam && planoParam ? { tenantId: tenantParam, planoId: planoParam } : undefined;
  const somenteLeitura = useSomenteLeitura();
  const { data: feed, isLoading, error } = useHomeFeed(visaoMaster);
  const [conteudoAberto, setConteudoAberto] = useState<ConteudoSummary | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [aiChatPergunta, setAiChatPergunta] = useState<string | null>(null);
  const registrarView = useRegistrarView();

  function abrirConteudo(conteudo: ConteudoSummary) {
    setConteudoAberto(conteudo);
    if (!somenteLeitura) registrarView.mutate(conteudo.id);
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
      // A página incorporada tem a marca Faz Educação no topo: só na FazMais,
      // pra não quebrar o white-label das outras empresas.
      ...(marca.slug === MARCA_PADRAO_SLUG ? [{ id: BIBLIOTECA_APPS_ID, name: 'Biblioteca de Apps', description: null }] : []),
    ];
  }, [feed, marca.slug]);

  // Eixo da URL que não existe (mais) no feed do educador — link antigo,
  // eixo removido, catálogo desativado — cai pra Home em vez de tela vazia.
  const eixoParam = searchParams.get('eixo');
  const eixoAtivoId = eixoParam && eixos.some((eixo) => eixo.id === eixoParam) ? eixoParam : HOME_ID;

  function setEixoAtivoId(id: string) {
    if (id === eixoAtivoId) return;
    // Mantém os outros parâmetros (município/plano da visão do Master).
    const next = new URLSearchParams(searchParams);
    if (id === HOME_ID) next.delete('eixo');
    else next.set('eixo', id);
    setSearchParams(next);
    window.scrollTo({ top: 0 });
  }

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


  // Master sem município/plano escolhidos (URL digitada, link antigo): volta
  // pro painel, onde fica a "Área do Educador".
  if (isMasterPreview && !visaoMaster) {
    return <Navigate to="/master" replace />;
  }

  return (
    <div className="min-h-screen bg-[#07070c] text-neutral-100 light:bg-[#f6f4ef] light:text-neutral-900">
      <header className="sticky top-0 z-20 border-b border-white/10 bg-[#07070c] light:border-black/10 light:bg-[#f6f4ef]">
      {/* No celular o cabeçalho quebra em duas linhas: logo + usuário em cima,
          busca embaixo na largura toda. */}
      <div className="flex flex-wrap items-center gap-x-4 gap-y-3 px-4 py-3 sm:flex-nowrap sm:px-7 sm:py-3.5">
        <div className="order-1 flex shrink-0 items-center">
          <BrandLogo className="h-10 w-auto sm:h-12" />
        </div>

        <div className="order-3 mx-auto flex w-full max-w-2xl items-center gap-2 sm:order-2">
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
              className="w-full rounded-full border border-white/10 bg-white/[0.04] py-1.5 pl-8 pr-8 text-sm text-neutral-100 outline-none transition placeholder:text-neutral-500 focus:border-brand-400/50 focus:bg-white/[0.07] light:border-black/10 light:bg-black/[0.03] light:text-neutral-900 light:placeholder:text-neutral-400"
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

        <div className="order-2 ml-auto flex min-w-0 shrink items-center gap-3 sm:order-3 sm:ml-0 sm:shrink-0">
          <ThemeToggle />
          <div className="flex min-w-0 items-center gap-2">
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-indigo-700 text-xs font-bold text-white">
              {user?.name.charAt(0).toUpperCase()}
            </span>
            <div className="min-w-0 max-w-[9rem] leading-tight sm:max-w-none">
              <div className="truncate text-sm font-semibold">{user?.name}</div>
              {isMasterPreview ? (
                <>
                  <div className="truncate text-[11px] text-neutral-500">
                    {feed?.visao ? `${feed.visao.tenantName} · ${feed.visao.planoName}` : 'Área do Educador'}
                  </div>
                  <button
                    type="button"
                    onClick={() => navigate('/master')}
                    className="mt-1 block text-[11px] font-semibold text-brand-400 transition hover:text-brand-300 hover:underline light:text-brand-600"
                  >
                    ← Painel Master
                  </button>
                </>
              ) : isAdminPreview ? (
                <>
                  <div className="text-[11px] text-neutral-500">Área do Educador</div>
                  <button
                    type="button"
                    onClick={() => navigate('/admin')}
                    className="mt-1 block text-[11px] font-semibold text-brand-400 transition hover:text-brand-300 hover:underline light:text-brand-600"
                  >
                    ← Painel Admin
                  </button>
                </>
              ) : (
                <div className="text-[11px] text-neutral-500">Educador</div>
              )}
            </div>
          </div>
          <button
            type="button"
            onClick={handleLogout}
            className="shrink-0 text-sm text-neutral-400 transition hover:text-neutral-100 light:text-neutral-500 light:hover:text-neutral-900"
          >
            Sair
          </button>
        </div>
      </div>

        {!isSearching && (
          <nav className="flex gap-1 overflow-x-auto px-4 pb-2 [scrollbar-width:none] sm:px-7 [&::-webkit-scrollbar]:hidden">
            {eixos.map((eixo) => (
              <button
                key={eixo.id}
                type="button"
                onClick={() => setEixoAtivoId(eixo.id)}
                className={
                  eixo.id === eixoAtivoId
                    ? 'shrink-0 whitespace-nowrap border-b-2 border-brand-400 px-3 py-1.5 text-xs font-semibold text-brand-400'
                    : 'shrink-0 whitespace-nowrap border-b-2 border-transparent px-3 py-1.5 text-xs font-semibold text-neutral-400 transition hover:text-neutral-100 light:text-neutral-500 light:hover:text-neutral-900'
                }
              >
                {eixo.name}
              </button>
            ))}
          </nav>
        )}
      </header>

      <main className="px-4 py-6 sm:px-7 sm:py-8">
        {(isSearching || !isHome) && (
          <div className="mb-6 flex justify-end">
            {isSearching ? (
              <BackButton onClick={() => setSearchQuery('')} />
            ) : (
              <BackButton label="Voltar para Home" onClick={() => setEixoAtivoId(HOME_ID)} />
            )}
          </div>
        )}

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
        ) : eixoAtivoId === BIBLIOTECA_APPS_ID ? (
          <BibliotecaAppsExterna />
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
                className="mb-8 max-w-5xl text-sm leading-relaxed text-neutral-400 [&_a]:text-brand-400 [&_a]:underline [&_p]:mb-4 [&_p:last-child]:mb-0 [&_strong]:text-neutral-200 [&_h1]:mb-3 [&_h1]:text-xl [&_h1]:font-bold [&_h1]:text-neutral-100 [&_h2]:mb-3 [&_h2]:text-lg [&_h2]:font-bold [&_h2]:text-neutral-100 [&_h3]:mb-2 [&_h3]:text-base [&_h3]:font-bold [&_h3]:text-neutral-100 [&_ul]:mb-4 [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:mb-4 [&_ol]:list-decimal [&_ol]:pl-5 [&_li]:mb-1 light:text-neutral-600 light:[&_strong]:text-neutral-800 light:[&_h1]:text-neutral-900 light:[&_h2]:text-neutral-900 light:[&_h3]:text-neutral-900"
                dangerouslySetInnerHTML={{ __html: sanitizeHtml(textoDaMarca(eixoAtivoDescription, 'html')) }}
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

      {/* Some na Biblioteca de Apps: o botão cobriria os apps da página incorporada. */}
      {!conteudoAberto && aiChatPergunta === null && eixoAtivoId !== BIBLIOTECA_APPS_ID && (
        <div className="group fixed bottom-6 right-6 z-30">
          <button
            type="button"
            onClick={() => setAiChatPergunta('')}
            aria-label={`Perguntar ao ${marca.nomeAssistente}`}
            className="relative flex h-14 w-14 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-brand-400 to-brand-500 shadow-lg shadow-brand-500/30 ring-2 ring-brand-400/60 transition hover:scale-105 hover:shadow-brand-500/50"
          >
            <img src={imagensAssistente.avatar} alt="" className={`h-full w-full object-cover ${imagensAssistente.avatarPosicao}`} />
          </button>
          <span className="pointer-events-none absolute bottom-full right-0 z-30 mb-2 w-max max-w-[220px] -translate-x-0 rounded-lg bg-neutral-900 px-3 py-1.5 text-center text-xs font-medium text-white opacity-0 shadow-lg transition group-hover:opacity-100 light:bg-neutral-800">
            Pergunte ao {marca.nomeAssistente} e encontre o conteúdo certo em segundos
          </span>
        </div>
      )}
    </div>
  );
}
