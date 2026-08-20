export function normalize(text: string): string {
  return text.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
}

// Mesma lista usada no mock de IA do Master (ConteudosService.aiSuggest) —
// sem isso, palavras curtas tipo "a"/"o"/"sobre" batem como substring em
// praticamente qualquer texto e inflam a relevância de itens não relacionados.
const STOPWORDS = new Set([
  'sobre', 'para', 'como', 'esse', 'essa', 'este', 'esta',
  'pelo', 'pela', 'seus', 'suas',
]);

// Normaliza e quebra em termos de busca, descartando stopwords e palavras
// muito curtas (que batem como substring em quase qualquer texto).
export function extrairTermos(texto: string): string[] {
  return normalize(texto.trim())
    .split(/\s+/)
    .filter((termo) => termo.length > 2 && !STOPWORDS.has(termo));
}

// Quantos dos termos aparecem em texto (0 a termos.length). Usado tanto pra
// filtrar a busca (score > 0) quanto pra rankear as sugestões do chat de IA.
export function matchScore(texto: string, termos: string[]): number {
  const textoNormalizado = normalize(texto);
  return termos.filter((termo) => textoNormalizado.includes(termo)).length;
}
