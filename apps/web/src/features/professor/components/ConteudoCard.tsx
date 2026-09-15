import type { ConteudoSummary } from '@fazmais/shared';
import { FavoriteButton } from './FavoriteButton';

export const MEDIA_BADGE: Record<string, string> = { VIDEO: '▶ Vídeo', PDF: '📄 eBook', ARTIGO: '📰 Artigo', APP: '📱 App' };
export const OPENABLE_TYPES = new Set(['ARTIGO', 'VIDEO', 'PDF', 'APP']);
export const OPEN_HINT: Record<string, string> = { ARTIGO: 'Ler', VIDEO: 'Assistir', PDF: 'Abrir', APP: 'Saiba mais' };
export const GRADIENTS = [
  'linear-gradient(135deg,#6366f1,#312e81)',
  'linear-gradient(135deg,#f59e0b,#92400e)',
  'linear-gradient(135deg,#10b981,#064e3b)',
  'linear-gradient(135deg,#ec4899,#831843)',
];

const dateFormatter = new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: 'short' });

export function ConteudoCard({
  conteudo,
  index,
  onOpen,
  showDate,
}: {
  conteudo: ConteudoSummary;
  index: number;
  onOpen: (conteudo: ConteudoSummary) => void;
  showDate?: boolean;
}) {
  const isOpenable = OPENABLE_TYPES.has(conteudo.mediaType);
  return (
    <div
      role={isOpenable ? 'button' : undefined}
      tabIndex={isOpenable ? 0 : undefined}
      onClick={isOpenable ? () => onOpen(conteudo) : undefined}
      onKeyDown={isOpenable ? (event) => event.key === 'Enter' && onOpen(conteudo) : undefined}
      className={`group w-44 shrink-0 overflow-hidden rounded-xl border border-white/10 bg-white/[0.035] transition duration-200 hover:z-10 hover:scale-[1.18] hover:border-white/30 hover:shadow-2xl light:border-black/10 light:bg-white ${isOpenable ? 'cursor-pointer' : ''}`}
    >
      <div className="relative flex h-40 items-start justify-between overflow-hidden p-2.5" style={{ background: GRADIENTS[index % GRADIENTS.length] }}>
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
          className="absolute bottom-2 right-9 flex h-6 w-6 items-center justify-center rounded-full bg-black/50 text-white transition hover:text-rose-400 aria-pressed:text-rose-400"
        />
        {conteudo.mediaType === 'PDF' && conteudo.downloadUrl && (
          <a
            href={conteudo.downloadUrl}
            download
            target="_blank"
            rel="noreferrer"
            onClick={(event) => event.stopPropagation()}
            aria-label="Baixar eBook"
            title="Baixar eBook"
            className="absolute bottom-2 right-2 flex h-6 w-6 items-center justify-center rounded-full bg-black/50 text-white transition hover:text-amber-400"
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 3v12" />
              <path d="m7 10 5 5 5-5" />
              <path d="M5 21h14" />
            </svg>
          </a>
        )}
        {conteudo.progressPercent > 0 && conteudo.progressPercent < 100 && (
          <div className="absolute inset-x-0 bottom-0 h-1 bg-black/40">
            <div className="h-full bg-amber-400" style={{ width: `${conteudo.progressPercent}%` }} />
          </div>
        )}
      </div>
      <div className="p-2.5">
        <p className="line-clamp-2 text-xs font-semibold">{conteudo.title}</p>
        {showDate ? (
          <p className="mt-1.5 text-[10px] text-neutral-500">{dateFormatter.format(new Date(conteudo.createdAt))}</p>
        ) : (
          conteudo.tags.length > 0 && (
            <p className="mt-1.5 truncate text-[10px] text-neutral-500">{conteudo.tags.join(', ')}</p>
          )
        )}
      </div>
    </div>
  );
}
