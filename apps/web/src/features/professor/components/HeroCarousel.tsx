import { useEffect, useState } from 'react';
import type { ConteudoSummary } from '@fazmais/shared';
import { FavoriteButton } from './FavoriteButton';
import { StarRating } from './StarRating';
import { GRADIENTS, MEDIA_BADGE, OPENABLE_TYPES } from './ConteudoCard';

const AUTO_ADVANCE_MS = 7000;

export function HeroCarousel({
  items,
  onOpen,
}: {
  items: ConteudoSummary[];
  onOpen: (conteudo: ConteudoSummary) => void;
}) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    if (items.length <= 1 || isPaused) return;
    const timer = setInterval(() => {
      setActiveIndex((current) => (current + 1) % items.length);
    }, AUTO_ADVANCE_MS);
    return () => clearInterval(timer);
  }, [items.length, isPaused, activeIndex]);

  useEffect(() => {
    if (activeIndex >= items.length) setActiveIndex(0);
  }, [items.length, activeIndex]);

  if (items.length === 0) return null;

  function goTo(index: number) {
    setActiveIndex((index + items.length) % items.length);
  }

  return (
    <div
      className="group relative h-64 flex-1 overflow-hidden rounded-2xl border border-white/10 light:border-black/10"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {items.map((conteudo, index) => {
        const isActive = index === activeIndex;
        const isOpenable = isActive && OPENABLE_TYPES.has(conteudo.mediaType);
        const hasBanner = Boolean(conteudo.bannerImageUrl);
        return (
          <div
            key={conteudo.id}
            role={isOpenable ? 'button' : undefined}
            tabIndex={isOpenable ? 0 : undefined}
            onClick={isOpenable ? () => onOpen(conteudo) : undefined}
            className={`absolute inset-0 flex flex-col justify-end p-6 transition-opacity duration-700 ${
              isActive ? 'z-10 opacity-100' : 'pointer-events-none opacity-0'
            } ${isOpenable ? 'cursor-pointer' : ''}`}
            style={{ background: GRADIENTS[index % GRADIENTS.length] }}
          >
            {hasBanner ? (
              // Arte específica pra esse formato largo, cadastrada pelo Master — mostra
              // em tela cheia, sem recorte nem fundo desfocado (já vem composta pra isso).
              <img src={conteudo.bannerImageUrl ?? undefined} alt="" className="absolute inset-0 h-full w-full object-cover" />
            ) : (
              <>
                {/* Fundo: mesma foto de capa, borrada e escurecida, só pra preencher a
                    lateral sem deixar vazio. Escala 110% evita a borda clara que o blur
                    cria nos cantos da imagem. */}
                <img
                  src={conteudo.imageUrl}
                  alt=""
                  aria-hidden="true"
                  className="absolute inset-0 h-full w-full scale-110 object-cover object-center blur-2xl brightness-[0.45]"
                />
                {/* Foto de capa, num recorte 4:3 (bem mais suave que o 5:1 do hero inteiro) —
                    perde só uma faixa fina de cima/baixo em vez da lateral toda borrada. */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="h-full aspect-[4/3] overflow-hidden">
                    <img src={conteudo.imageUrl} alt="" className="h-full w-full object-cover" />
                  </div>
                </div>
              </>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent" />

            <FavoriteButton
              conteudo={conteudo}
              className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full bg-black/40 text-white transition hover:text-rose-400 aria-pressed:text-rose-400"
            />
            <span className="relative mb-2 w-fit rounded-full bg-black/40 px-2.5 py-0.5 text-[11px] font-bold text-white">
              {MEDIA_BADGE[conteudo.mediaType]} · destaque
            </span>
            <h1 className="relative max-w-xl text-2xl font-bold text-white">{conteudo.title}</h1>
            <p className="relative mt-1 max-w-xl line-clamp-2 text-sm text-white/80">{conteudo.description}</p>
            <StarRating conteudo={conteudo} size={17} className="relative mt-2" />
          </div>
        );
      })}

      {items.length > 1 && (
        <>
          <button
            type="button"
            onClick={() => goTo(activeIndex - 1)}
            aria-label="Destaque anterior"
            className="absolute left-3 top-1/2 z-20 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-black/40 text-white opacity-0 transition hover:bg-black/60 group-hover:opacity-100"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="m15 18-6-6 6-6" />
            </svg>
          </button>
          <button
            type="button"
            onClick={() => goTo(activeIndex + 1)}
            aria-label="Próximo destaque"
            className="absolute right-3 top-1/2 z-20 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-black/40 text-white opacity-0 transition hover:bg-black/60 group-hover:opacity-100"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="m9 18 6-6-6-6" />
            </svg>
          </button>

          <div className="absolute bottom-3 left-1/2 z-20 flex -translate-x-1/2 gap-1.5">
            {items.map((conteudo, index) => (
              <button
                key={conteudo.id}
                type="button"
                onClick={() => goTo(index)}
                aria-label={`Ir para destaque ${index + 1}`}
                className={`h-1.5 rounded-full transition-all ${
                  index === activeIndex ? 'w-6 bg-amber-400' : 'w-1.5 bg-white/40 hover:bg-white/60'
                }`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
