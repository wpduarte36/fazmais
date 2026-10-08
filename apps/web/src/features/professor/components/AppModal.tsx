import type { AppPlatform, ConteudoSummary } from '@fazmais/shared';
import { FavoriteButton } from './FavoriteButton';
import { StarRating } from './StarRating';
import { useTextoDaMarca } from '../../../lib/textoDaMarca';

const iconButtonClass =
  'flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-white/15 text-neutral-400 transition hover:bg-white/[0.06] hover:text-neutral-100 light:border-black/15 aria-pressed:border-rose-400/40 aria-pressed:bg-rose-400/10 aria-pressed:text-rose-400';

const PLATFORM_ORDER: AppPlatform[] = ['APP_STORE', 'PLAY_STORE', 'WEB'];

const PLATFORM_ACTION: Record<AppPlatform, string> = {
  APP_STORE: 'Baixar na App Store',
  PLAY_STORE: 'Baixar na Play Store',
  WEB: 'Abrir no navegador',
};

const PLATFORM_ONDE: Record<AppPlatform, string> = {
  APP_STORE: 'na App Store',
  PLAY_STORE: 'na Play Store',
  WEB: 'na versão web',
};

function linkDa(conteudo: ConteudoSummary, platform: AppPlatform): string | null {
  if (platform === 'APP_STORE') return conteudo.appStoreUrl;
  if (platform === 'PLAY_STORE') return conteudo.playStoreUrl;
  return conteudo.webUrl;
}

type Aparelho = 'android' | 'ios' | 'outro';

// iPadOS se apresenta como Mac ("Macintosh") — o toque é o que denuncia.
function detectarAparelho(): Aparelho {
  const ua = navigator.userAgent;
  if (/android/i.test(ua)) return 'android';
  if (/iPhone|iPad|iPod/i.test(ua) || (/Macintosh/i.test(ua) && navigator.maxTouchPoints > 1)) return 'ios';
  return 'outro';
}

// A loja que o aparelho consegue usar; a outra vira só um aviso em texto.
const LOJA_DO_APARELHO: Record<Exclude<Aparelho, 'outro'>, AppPlatform> = {
  android: 'PLAY_STORE',
  ios: 'APP_STORE',
};

const NOME_DO_APARELHO: Record<Exclude<Aparelho, 'outro'>, string> = {
  android: 'Android',
  ios: 'iPhone e iPad',
};

const PARA_QUEM: Partial<Record<AppPlatform, string>> = {
  APP_STORE: 'para iPhone e iPad',
  PLAY_STORE: 'para Android',
};

// ["na App Store", "na Play Store"] -> "na App Store e na Play Store"
function juntar(partes: string[]): string {
  if (partes.length <= 1) return partes.join('');
  return `${partes.slice(0, -1).join(', ')} e ${partes[partes.length - 1]}`;
}

interface AppModalProps {
  conteudo: ConteudoSummary;
  onClose: () => void;
}

export function AppModal({ conteudo, onClose }: AppModalProps) {
  const textoDaMarca = useTextoDaMarca();
  // Mostra só as plataformas marcadas no cadastro — com link vira botão, sem
  // link vira texto. Nenhuma marcada (ex.: App migrado ainda não revisado) =
  // não afirma nada sobre onde está disponível.
  const disponibilidade = PLATFORM_ORDER.filter((platform) => conteudo.appPlatforms.includes(platform)).map(
    (platform) => ({ platform, url: linkDa(conteudo, platform) }),
  );
  // No celular, botão de baixar só da loja daquele aparelho (e a versão web,
  // que abre em qualquer um); a loja do outro sistema aparece como aviso.
  // No computador (ou aparelho não identificado) mostra tudo, como antes.
  const aparelho = detectarAparelho();
  const minhaLoja = aparelho === 'outro' ? null : LOJA_DO_APARELHO[aparelho];
  const outraLoja = disponibilidade.find(
    (item) => minhaLoja && item.platform !== 'WEB' && item.platform !== minhaLoja,
  );
  const visiveis = disponibilidade.filter((item) => item !== outraLoja);
  const comLink = visiveis.filter((item) => item.url);
  const semLink = visiveis.filter((item) => !item.url);
  const temMinhaLoja = visiveis.some((item) => item.platform === minhaLoja);

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/70 p-4 py-10"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md overflow-hidden rounded-2xl border border-white/15 bg-[#0d0d14] shadow-2xl light:border-black/10 light:bg-white"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="p-7">
          <div className="mb-4 flex items-center justify-between gap-4">
            {/* Ícone inteiro e pequeno ao lado do nome, como na Biblioteca de
                Apps externa — esticado como capa (object-cover) ficava ruim. */}
            {conteudo.imageUrl && (
              <img
                src={conteudo.imageUrl}
                alt=""
                className="h-28 w-28 shrink-0 rounded-3xl bg-white object-contain shadow-md"
              />
            )}
            <div className="flex min-w-0 flex-1 flex-col items-center text-center">
              <span className="mb-1.5 inline-block rounded-full bg-brand-400/10 px-2.5 py-0.5 text-[11px] font-semibold text-brand-300 light:text-brand-700">
                📱 App
              </span>
              <h1 className="text-xl font-bold leading-tight">{conteudo.title}</h1>
              {conteudo.tags.length > 0 && (
                <p className="mt-1 text-xs text-neutral-500">{conteudo.tags.join(', ')}</p>
              )}
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

          <p className="text-[15px] leading-relaxed text-neutral-300 light:text-neutral-700">
            {textoDaMarca(conteudo.description)}
          </p>

          {disponibilidade.length > 0 && (
            <div className="mt-5 flex flex-col gap-2.5">
              {comLink.length > 0 && (
                <div className="flex flex-col gap-2.5 sm:flex-row">
                  {comLink.map(({ platform, url }, index) => (
                    <a
                      key={platform}
                      href={url!}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={
                        index === 0
                          ? 'flex flex-1 items-center justify-center gap-2 rounded-xl bg-brand-400 px-4 py-2.5 text-sm font-bold text-neutral-950 transition hover:bg-brand-300'
                          : 'flex flex-1 items-center justify-center gap-2 rounded-xl border border-brand-400/40 px-4 py-2.5 text-sm font-bold text-brand-300 transition hover:bg-brand-400/10 light:text-brand-700'
                      }
                    >
                      {PLATFORM_ACTION[platform]}
                    </a>
                  ))}
                </div>
              )}
              {semLink.length > 0 && (
                <p className="text-xs text-neutral-500">
                  Disponível {juntar(semLink.map(({ platform }) => PLATFORM_ONDE[platform]))}.
                </p>
              )}
              {outraLoja && aparelho !== 'outro' && (
                <p className="text-xs text-neutral-500">
                  {temMinhaLoja ? 'Também disponível' : `Não disponível para ${NOME_DO_APARELHO[aparelho]}. Disponível`}{' '}
                  {PLATFORM_ONDE[outraLoja.platform]}, {PARA_QUEM[outraLoja.platform]}.
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
