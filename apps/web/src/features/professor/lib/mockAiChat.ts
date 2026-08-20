import type { ConteudoSummary, HomeFeed } from '@fazmais/shared';
import { extrairTermos, matchScore } from '../../../lib/textSearch';

export interface SugestaoIa {
  conteudo: ConteudoSummary;
  relevancia: number;
}

export interface RespostaIa {
  texto: string;
  sugestoes: SugestaoIa[];
}

const ABERTURAS_COM_RESULTADO = [
  'Encontrei alguns conteúdos do acervo que podem ajudar com isso:',
  'Aqui vão algumas sugestões relacionadas ao que você perguntou:',
  'Separei um pouco do que o acervo tem sobre esse assunto:',
];

const ABERTURAS_SEM_RESULTADO = [
  (pergunta: string) => `Não encontrei nada específico sobre "${pergunta}" no acervo, mas esses conteúdos estão em alta entre os professores:`,
  (pergunta: string) => `Ainda não temos algo direto sobre "${pergunta}", mas aqui estão alguns conteúdos populares que podem interessar:`,
];

function escolher<T>(opcoes: T[]): T {
  return opcoes[Math.floor(Math.random() * opcoes.length)];
}

// IA simulada: sem chamada de backend nem modelo de verdade — só rankeia o
// que já está carregado no feed pelo mesmo casamento de termos da busca
// local, e converte a proporção de termos batidos numa % que parece
// plausível. Fácil de trocar por uma chamada de API real depois sem mexer
// no AiChatModal (só troca essa função).
export function buildMockAiResponse(pergunta: string, feed: HomeFeed): RespostaIa {
  const termos = extrairTermos(pergunta);
  const todosConteudos = feed.rows.flatMap((row) => row.conteudos);

  const pontuados = termos.length
    ? todosConteudos
        .map((conteudo) => ({
          conteudo,
          score: matchScore(`${conteudo.title} ${conteudo.description} ${conteudo.tags.join(' ')}`, termos),
        }))
        .filter((item) => item.score > 0)
        .sort((a, b) => b.score - a.score)
    : [];

  if (pontuados.length > 0) {
    const top = pontuados.slice(0, 3);
    const sugestoes: SugestaoIa[] = top.map(({ conteudo, score }) => ({
      conteudo,
      relevancia: Math.round(60 + (score / termos.length) * 35),
    }));
    return { texto: escolher(ABERTURAS_COM_RESULTADO), sugestoes };
  }

  const populares = feed.populares.slice(0, 3).map((conteudo) => ({ conteudo, relevancia: 0 }));
  return { texto: escolher(ABERTURAS_SEM_RESULTADO)(pergunta.trim()), sugestoes: populares };
}
