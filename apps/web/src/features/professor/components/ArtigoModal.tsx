import type { ConteudoSummary } from '@fazmais/shared';
import { sanitizeHtml } from '../../../lib/sanitizeHtml';
import { FavoriteButton } from './FavoriteButton';
import { StarRating } from './StarRating';

const iconButtonClass =
  'flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-white/15 text-neutral-400 transition hover:bg-white/[0.06] hover:text-neutral-100 light:border-black/15 aria-pressed:border-rose-400/40 aria-pressed:bg-rose-400/10 aria-pressed:text-rose-400';

interface ArtigoModalProps {
  conteudo: ConteudoSummary;
  onClose: () => void;
}

export function ArtigoModal({ conteudo, onClose }: ArtigoModalProps) {
  const isExternal = Boolean(conteudo.externalUrl);
  const sanitizedHtml = sanitizeHtml(conteudo.htmlContent);

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/70 p-4 py-10"
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl overflow-hidden rounded-2xl border border-white/15 bg-[#0d0d14] shadow-2xl light:border-black/10 light:bg-white"
        onClick={(event) => event.stopPropagation()}
      >
        {conteudo.imageUrl && (
          <img
            src={conteudo.imageUrl}
            alt=""
            className="h-48 w-full object-cover"
          />
        )}

        <div className="p-7">
          <div className="mb-4 flex items-start justify-between gap-4">
            <div>
              <span className="mb-1.5 inline-block rounded-full bg-amber-400/10 px-2.5 py-0.5 text-[11px] font-semibold text-amber-300 light:text-amber-700">
                📰 Artigo
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

          <div
            className="max-h-[65vh] overflow-y-auto text-[15px] leading-relaxed text-neutral-300 [&_a]:text-amber-400 [&_a]:underline [&_em]:text-neutral-500 [&_p]:mb-4 [&_p:last-child]:mb-0 [&_h1]:mb-3 [&_h1]:text-xl [&_h1]:font-bold [&_h1]:text-neutral-100 [&_h2]:mb-3 [&_h2]:text-lg [&_h2]:font-bold [&_h2]:text-neutral-100 [&_h3]:mb-2 [&_h3]:text-base [&_h3]:font-bold [&_h3]:text-neutral-100 [&_ul]:mb-4 [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:mb-4 [&_ol]:list-decimal [&_ol]:pl-5 [&_li]:mb-1 light:text-neutral-700 light:[&_h1]:text-neutral-900 light:[&_h2]:text-neutral-900 light:[&_h3]:text-neutral-900"
            dangerouslySetInnerHTML={{ __html: sanitizedHtml }}
          />

          {isExternal && (
            <a
              href={conteudo.externalUrl ?? undefined}
              target="_blank"
              rel="noopener"
              className="mt-5 flex items-center justify-center gap-2 rounded-xl bg-amber-400 px-4 py-2.5 text-sm font-bold text-neutral-950 transition hover:bg-amber-300"
            >
              Ler matéria inteira
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M7 17 17 7M9 7h8v8" />
              </svg>
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
