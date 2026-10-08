import type { MarcaPublica } from '@fazmais/shared';

// Escala gerada a partir da cor primária da marca. Mantém a luminosidade de
// cada degrau da escala amber padrão (os componentes foram desenhados em cima
// dela, ex: texto neutral-950 sobre brand-400) e pega da cor da marca só o
// matiz e a intensidade. Assim qualquer cor continua legível nos dois temas.
const DEGRAUS = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950] as const;
const LUMINOSIDADE = [98.7, 96.2, 92.4, 87.9, 82.8, 76.9, 66.6, 55.5, 47.3, 41.4, 27.9];
const CROMA_AMBER = [0.022, 0.059, 0.12, 0.169, 0.189, 0.188, 0.179, 0.163, 0.137, 0.112, 0.077];
const CROMA_AMBER_400 = 0.189;

function linearizar(canal: number): number {
  const c = canal / 255;
  return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
}

// sRGB hex -> OKLCH (só croma e matiz interessam aqui).
function hexParaOklch(hex: string): { c: number; h: number } | null {
  const m = /^#?([0-9a-f]{6})$/i.exec(hex.trim());
  if (!m) return null;
  const n = parseInt(m[1], 16);
  const r = linearizar((n >> 16) & 255);
  const g = linearizar((n >> 8) & 255);
  const b = linearizar(n & 255);

  const l = Math.cbrt(0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b);
  const mm = Math.cbrt(0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b);
  const s = Math.cbrt(0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b);

  const a = 1.9779984951 * l - 2.428592205 * mm + 0.4505937099 * s;
  const bb = 0.0259040371 * l + 0.7827717662 * mm - 0.808675766 * s;
  const h = (Math.atan2(bb, a) * 180) / Math.PI;
  return { c: Math.hypot(a, bb), h: h < 0 ? h + 360 : h };
}

// Cor nula/inválida remove as variáveis inline e volta pra paleta padrão do index.css.
export function aplicarCorDaMarca(corPrimaria: string | null): void {
  const raiz = document.documentElement.style;
  const cor = corPrimaria ? hexParaOklch(corPrimaria) : null;
  DEGRAUS.forEach((degrau, i) => {
    if (!cor) {
      raiz.removeProperty(`--brand-${degrau}`);
      return;
    }
    const croma = CROMA_AMBER[i] * (cor.c / CROMA_AMBER_400);
    raiz.setProperty(`--brand-${degrau}`, `oklch(${LUMINOSIDADE[i]}% ${croma.toFixed(3)} ${cor.h.toFixed(2)})`);
  });
}

export function aplicarMarcaNoDocumento(marca: MarcaPublica): void {
  aplicarCorDaMarca(marca.corPrimaria);
  document.title = marca.nomeExibicao;
  const favicon = document.querySelector<HTMLLinkElement>('link[rel="icon"]');
  if (favicon) {
    favicon.type = marca.logoUrl ? '' : 'image/svg+xml';
    favicon.href = marca.logoUrl ?? '/favicon.svg';
  }
}
