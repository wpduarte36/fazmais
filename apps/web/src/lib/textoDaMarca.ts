import { MARCA_PADRAO_SLUG } from '@fazmais/shared';
import { useMarca } from '../store/marcaStore';

// Textos cadastrados no catálogo (descrição de eixo, de conteúdo, artigos)
// citam a FazMais pelo nome. Numa outra empresa, troca na exibição pelo nome
// dela — o texto gravado não muda. Só pega o nome próprio, com maiúsculas
// ("FazMais", "Faz Mais", "Faz+"), pra não mexer em frases como "faz mais sentido".
const MENCAO_FAZMAIS = /\bFaz ?Mais\b|\bFaz\+/g;

function escaparHtml(texto: string): string {
  return texto.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

export function useTextoDaMarca(): (texto: string, formato?: 'texto' | 'html') => string {
  const marca = useMarca();
  return (texto, formato = 'texto') => {
    if (marca.slug === MARCA_PADRAO_SLUG) return texto;
    const nome = formato === 'html' ? escaparHtml(marca.nomeExibicao) : marca.nomeExibicao;
    return texto.replace(MENCAO_FAZMAIS, nome);
  };
}
