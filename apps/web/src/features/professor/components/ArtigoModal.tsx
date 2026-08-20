import DOMPurify from 'dompurify';
import type { ConteudoSummary } from '@fazmais/shared';
import { FavoriteButton } from './FavoriteButton';

const iconButtonClass =
  'flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-white/15 text-neutral-400 transition hover:bg-white/[0.06] hover:text-neutral-100 light:border-black/15 aria-pressed:border-rose-400/40 aria-pressed:bg-rose-400/10 aria-pressed:text-rose-400';

// Reforça rel="noopener noreferrer" em qualquer link com target="_blank" que
// sobreviver à sanitização — evita reverse tabnabbing mesmo se o HTML de
// origem esquecer o rel (import-legado.mjs já inclui, mas não dá pra confiar
// nisso pra todo htmlContent futuro).
DOMPurify.addHook('afterSanitizeAttributes', (node) => {
  if (node.tagName === 'A' && node.getAttribute('target') === '_blank') {
    node.setAttribute('rel', 'noopener noreferrer');
  }
});

interface ArtigoModalProps {
  conteudo: ConteudoSummary;
  onClose: () => void;
}

export function ArtigoModal({ conteudo, onClose }: ArtigoModalProps) {
  const isExternal = Boolean(conteudo.externalUrl);
  // htmlContent é autoral (hoje só MASTER cria conteúdo), mas sanitizamos
  // mesmo assim: defesa em profundidade contra um MASTER comprometido e
  // contra o dia em que Admins também puderem publicar conteúdo.
  const sanitizedHtml = DOMPurify.sanitize(conteudo.htmlContent ?? '');

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
            className="max-h-[65vh] overflow-y-auto text-[15px] leading-relaxed text-neutral-300 [&_a]:text-amber-400 [&_a]:underline [&_em]:text-neutral-500 [&_p]:mb-4 [&_p:last-child]:mb-0 light:text-neutral-700"
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
