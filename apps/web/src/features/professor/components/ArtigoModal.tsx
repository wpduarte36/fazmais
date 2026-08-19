import type { ConteudoSummary } from '@fazmais/shared';

interface ArtigoModalProps {
  conteudo: ConteudoSummary;
  onClose: () => void;
}

export function ArtigoModal({ conteudo, onClose }: ArtigoModalProps) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/70 p-4 py-10"
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl rounded-2xl border border-white/15 bg-[#0d0d14] p-7 shadow-2xl light:border-black/10 light:bg-white"
        onClick={(event) => event.stopPropagation()}
      >
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
          <button
            type="button"
            onClick={onClose}
            aria-label="Fechar"
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-white/15 text-neutral-400 transition hover:bg-white/[0.06] hover:text-neutral-100 light:border-black/15"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div
          className="max-h-[65vh] overflow-y-auto text-[15px] leading-relaxed text-neutral-300 [&_a]:text-amber-400 [&_a]:underline [&_em]:text-neutral-500 [&_p]:mb-4 [&_p:last-child]:mb-0 light:text-neutral-700"
          dangerouslySetInnerHTML={{ __html: conteudo.htmlContent ?? '' }}
        />
      </div>
    </div>
  );
}
