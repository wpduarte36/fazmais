import type { AppPlatform, ConteudoSummary } from '@fazmais/shared';
import { FavoriteButton } from './FavoriteButton';
import { StarRating } from './StarRating';

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
  // Mostra só as plataformas marcadas no cadastro — com link vira botão, sem
  // link vira texto. Nenhuma marcada (ex.: App migrado ainda não revisado) =
  // não afirma nada sobre onde está disponível.
  const disponibilidade = PLATFORM_ORDER.filter((platform) => conteudo.appPlatforms.includes(platform)).map(
    (platform) => ({ platform, url: linkDa(conteudo, platform) }),
  );
  const comLink = disponibilidade.filter((item) => item.url);
  const semLink = disponibilidade.filter((item) => !item.url);

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/70 p-4 py-10"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg overflow-hidden rounded-2xl border border-white/15 bg-[#0d0d14] shadow-2xl light:border-black/10 light:bg-white"
        onClick={(event) => event.stopPropagation()}
      >
        {conteudo.imageUrl && (
          <img src={conteudo.imageUrl} alt="" className="h-40 w-full object-cover" />
        )}

        <div className="p-7">
          <div className="mb-4 flex items-start justify-between gap-4">
            <div>
              <span className="mb-1.5 inline-block rounded-full bg-amber-400/10 px-2.5 py-0.5 text-[11px] font-semibold text-amber-300 light:text-amber-700">
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
            {conteudo.description}
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
                          ? 'flex flex-1 items-center justify-center gap-2 rounded-xl bg-amber-400 px-4 py-2.5 text-sm font-bold text-neutral-950 transition hover:bg-amber-300'
                          : 'flex flex-1 items-center justify-center gap-2 rounded-xl border border-amber-400/40 px-4 py-2.5 text-sm font-bold text-amber-300 transition hover:bg-amber-400/10 light:text-amber-700'
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
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
