import type { ConteudoSummary } from '@fazmais/shared';
import { FavoriteButton } from './FavoriteButton';

const iconButtonClass =
  'flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-white/15 text-neutral-400 transition hover:bg-white/[0.06] hover:text-neutral-100 light:border-black/15 aria-pressed:border-rose-400/40 aria-pressed:bg-rose-400/10 aria-pressed:text-rose-400';

interface PdfModalProps {
  conteudo: ConteudoSummary;
  onClose: () => void;
}

export function PdfModal({ conteudo, onClose }: PdfModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4" onClick={onClose}>
      <div
        className="flex h-full max-h-[96vh] w-full max-w-4xl flex-col rounded-2xl border border-white/15 bg-[#0d0d14] p-3 shadow-2xl light:border-black/10 light:bg-white"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="relative mb-2 flex shrink-0 items-center justify-center">
          <h1 className="max-w-[75%] truncate text-center text-sm font-semibold text-neutral-300 light:text-neutral-600">
            {conteudo.title}
          </h1>
          <div className="absolute right-0 flex items-center gap-2">
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

        {conteudo.mediaUrl ? (
          <iframe
            src={conteudo.mediaUrl}
            title={conteudo.title}
            className="min-h-0 w-full flex-1 rounded-xl border border-white/10 light:border-black/10"
            allow="fullscreen"
            allowFullScreen
            // Sem allow-same-origin: se o mediaUrl apontar pra algo hospedado
            // na própria origem da API (PDF em /uploads), o conteúdo roda num
            // origin opaco e não alcança o cookie de refresh. allow-scripts +
            // popups/forms mantêm visualizadores de PDF em JS funcionando.
            sandbox="allow-scripts allow-popups allow-popups-to-escape-sandbox allow-forms allow-downloads"
          />
        ) : (
          <p className="rounded-lg border border-rose-500/30 bg-rose-500/10 px-3.5 py-2.5 text-sm text-rose-300 light:text-rose-700">
            Link do eBook inválido.
          </p>
        )}
      </div>
    </div>
  );
}
