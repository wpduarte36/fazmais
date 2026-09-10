import { useId } from 'react';

export function FazMaisLegacyLogo({ className = '' }: { className?: string }) {
  const shadowId = useId();

  return (
    <svg viewBox="0 0 210 140" className={className} aria-label="FazMais">
      <defs>
        <filter id={shadowId} x="-40%" y="-40%" width="180%" height="180%">
          <feDropShadow dx="0" dy="3" stdDeviation="3" floodColor="#000" floodOpacity="0.25" />
        </filter>
      </defs>

      {/* Cartão de trás, só contorno verde */}
      <rect
        x="16" y="32" width="128" height="78" rx="14"
        fill="none" stroke="#90C024" strokeWidth="4"
        transform="rotate(-13 80 71)"
      />

      {/* Cartão do meio, amarelo */}
      <rect
        x="12" y="24" width="130" height="80" rx="14"
        fill="#FCCC0C" stroke="white" strokeWidth="3.5"
        transform="rotate(-7 77 64)"
        filter={`url(#${shadowId})`}
      />

      {/* Cartão da frente, azul, com o texto */}
      <g transform="rotate(-2 78 62)" filter={`url(#${shadowId})`}>
        <rect x="8" y="16" width="136" height="86" rx="16" fill="#00B4F0" stroke="white" strokeWidth="4" />
        <text
          x="76"
          y="76"
          textAnchor="middle"
          fontFamily="Arial, sans-serif"
          fontWeight="900"
          fontStyle="italic"
          fontSize="46"
          fill="white"
          letterSpacing="-1"
        >
          faz
        </text>
      </g>

      {/* Badge amarelo com "+" */}
      <g filter={`url(#${shadowId})`}>
        <path d="M156 66 L142 92 L172 78 Z" fill="#FCCC0C" />
        <circle cx="176" cy="42" r="30" fill="#FCCC0C" stroke="white" strokeWidth="5" />
        <path d="M176 28 V56 M162 42 H190" stroke="white" strokeWidth="8" strokeLinecap="round" />
      </g>
    </svg>
  );
}
