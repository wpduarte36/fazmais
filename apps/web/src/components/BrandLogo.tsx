import { MARCA_PADRAO_SLUG } from '@fazmais/shared';
import { useMarca } from '../store/marcaStore';
import { FazMaisLegacyLogo } from './FazMaisLegacyLogo';

// Logo da marca da URL. Sem logo cadastrado: a marca padrão usa o logo
// FazMais; as outras mostram o nome em texto, na cor da marca, até subirem um.
export function BrandLogo({ className = '' }: { className?: string }) {
  const marca = useMarca();

  if (marca.logoUrl) {
    return <img src={marca.logoUrl} alt={marca.nomeExibicao} className={`object-contain ${className}`} />;
  }
  if (marca.slug === MARCA_PADRAO_SLUG) {
    return <FazMaisLegacyLogo className={className} />;
  }

  // viewBox proporcional ao tamanho do nome, pra o texto respeitar a mesma
  // classe de altura (h-9, h-16...) que o logo usa.
  const largura = Math.max(marca.nomeExibicao.length * 30, 120);
  return (
    <svg
      viewBox={`0 0 ${largura} 70`}
      className={`text-brand-400 light:text-brand-600 ${className}`}
      role="img"
      aria-label={marca.nomeExibicao}
    >
      <text
        x={largura / 2}
        y="50"
        textAnchor="middle"
        fontFamily="Arial, sans-serif"
        fontWeight="900"
        fontStyle="italic"
        fontSize="48"
        fill="currentColor"
        textLength={largura - 8}
        lengthAdjust="spacingAndGlyphs"
      >
        {marca.nomeExibicao}
      </text>
    </svg>
  );
}
