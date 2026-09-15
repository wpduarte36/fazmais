import { useEffect, useRef, useState } from 'react';
import type { ConteudoSummary, HomeFeed } from '@fazmais/shared';
import { buildMockAiResponse, type SugestaoIa } from '../lib/mockAiChat';
import { ConteudoCard } from './ConteudoCard';
import fabinhoFigura from '../../../assets/fabinho.webp';
import fabinhoAvatar from '../../../assets/fabinho-avatar.webp';

interface Mensagem {
  autor: 'usuario' | 'ia';
  texto: string;
  sugestoes?: SugestaoIa[];
}

interface AiChatModalProps {
  perguntaInicial: string;
  feed: HomeFeed;
  onAbrirConteudo: (conteudo: ConteudoSummary) => void;
  onClose: () => void;
}

const DELAY_RESPOSTA_MS = 700;

const SAUDACAO = 'Oi! Eu sou o Fabinho, assistente do Faz+. Me conta o que você está planejando ensinar e eu busco os melhores materiais do acervo pra sua aula. Pode perguntar com suas palavras, tipo:';

const PERGUNTAS_SUGERIDAS = [
  'Quero uma atividade sobre o ciclo da borboleta',
  'Tem algo sobre fotossíntese pros alunos?',
  'Preciso de conteúdo sobre o sistema solar',
  'Como uso o iPad em sala de aula?',
];

export function AiChatModal({ perguntaInicial, feed, onAbrirConteudo, onClose }: AiChatModalProps) {
  const [mensagens, setMensagens] = useState<Mensagem[]>([]);
  const [isThinking, setIsThinking] = useState(false);
  const [novaPergunta, setNovaPergunta] = useState('');
  const fimDaListaRef = useRef<HTMLDivElement>(null);
  const perguntaInicialEnviada = useRef(false);

  function enviarPergunta(pergunta: string) {
    const texto = pergunta.trim();
    if (!texto) return;
    setMensagens((atual) => [...atual, { autor: 'usuario', texto }]);
    setIsThinking(true);
    setTimeout(() => {
      const resposta = buildMockAiResponse(texto, feed);
      setMensagens((atual) => [...atual, { autor: 'ia', texto: resposta.texto, sugestoes: resposta.sugestoes }]);
      setIsThinking(false);
    }, DELAY_RESPOSTA_MS);
  }

  useEffect(() => {
    if (perguntaInicialEnviada.current) return;
    perguntaInicialEnviada.current = true;
    enviarPergunta(perguntaInicial);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    fimDaListaRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [mensagens, isThinking]);

  function handleAbrirSugestao(conteudo: ConteudoSummary) {
    onAbrirConteudo(conteudo);
    onClose();
  }

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    enviarPergunta(novaPergunta);
    setNovaPergunta('');
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4" onClick={onClose}>
      <div
        className="flex h-[min(680px,90vh)] w-full max-w-lg flex-col rounded-2xl border border-white/15 bg-[#0d0d14] p-5 shadow-2xl light:border-black/10 light:bg-white"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="mb-3 flex shrink-0 items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <img
              src={fabinhoAvatar}
              alt=""
              className="h-8 w-8 shrink-0 rounded-full object-cover ring-1 ring-white/15 light:ring-black/10"
            />
            <h1 className="text-base font-bold">Fabinho</h1>
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

        <div className="flex-1 space-y-4 overflow-y-auto pr-1">
          {mensagens.length === 0 && !isThinking && (
            <div className="space-y-3">
              <img
                src={fabinhoFigura}
                alt="Fabinho, a IA do Faz+"
                className="mx-auto h-36 w-auto drop-shadow-xl"
              />
              <div className="flex justify-start">
                <div className="max-w-[90%] rounded-2xl rounded-bl-sm bg-white/[0.06] px-3.5 py-2.5 text-sm text-neutral-200 light:bg-black/[0.04] light:text-neutral-800">
                  <p>{SAUDACAO}</p>
                  <div className="mt-2.5 flex flex-wrap gap-1.5">
                    {PERGUNTAS_SUGERIDAS.map((pergunta) => (
                      <button
                        key={pergunta}
                        type="button"
                        onClick={() => enviarPergunta(pergunta)}
                        className="rounded-full border border-amber-400/30 bg-amber-400/5 px-3 py-1 text-xs font-medium text-amber-300 transition hover:bg-amber-400/15 light:text-amber-700"
                      >
                        {pergunta}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {mensagens.map((mensagem, index) => (
            <div key={index} className={mensagem.autor === 'usuario' ? 'flex justify-end' : 'flex justify-start gap-2'}>
              {mensagem.autor === 'ia' && (
                <img
                  src={fabinhoAvatar}
                  alt=""
                  className="mt-0.5 h-7 w-7 shrink-0 rounded-full object-cover ring-1 ring-white/15 light:ring-black/10"
                />
              )}
              <div
                className={
                  mensagem.autor === 'usuario'
                    ? 'max-w-[80%] rounded-2xl rounded-br-sm bg-gradient-to-r from-amber-400 to-amber-500 px-3.5 py-2 text-sm font-medium text-neutral-950'
                    : 'max-w-[85%] rounded-2xl rounded-bl-sm bg-white/[0.06] px-3.5 py-2 text-sm text-neutral-200 light:bg-black/[0.04] light:text-neutral-800'
                }
              >
                <p>{mensagem.texto}</p>
                {mensagem.sugestoes && mensagem.sugestoes.length > 0 && (
                  <div className="-mx-1 mt-3 flex gap-3 overflow-x-auto px-1 pb-1">
                    {mensagem.sugestoes.map((sugestao, sugestaoIndex) => (
                      <div key={sugestao.conteudo.id} className="flex w-44 shrink-0 flex-col items-center gap-1.5">
                        <ConteudoCard conteudo={sugestao.conteudo} index={sugestaoIndex} onOpen={handleAbrirSugestao} />
                        {sugestao.relevancia > 0 && (
                          <span className="rounded-full bg-amber-400/10 px-2 py-0.5 text-[10px] font-bold text-amber-400">
                            {sugestao.relevancia}% relevante
                          </span>
                        )}
                        <p className="text-center text-[10.5px] leading-snug text-neutral-400 light:text-neutral-500">
                          {sugestao.comentario}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}

          {isThinking && (
            <div className="flex justify-start gap-2">
              <img
                src={fabinhoAvatar}
                alt=""
                className="mt-0.5 h-7 w-7 shrink-0 rounded-full object-cover ring-1 ring-white/15 light:ring-black/10"
              />
              <div className="rounded-2xl rounded-bl-sm bg-white/[0.06] px-3.5 py-2.5 text-sm text-neutral-400 light:bg-black/[0.04]">
                <span className="inline-flex gap-1">
                  <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-current [animation-delay:-0.3s]" />
                  <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-current [animation-delay:-0.15s]" />
                  <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-current" />
                </span>
              </div>
            </div>
          )}

          <div ref={fimDaListaRef} />
        </div>

        <form onSubmit={handleSubmit} className="mt-3 flex shrink-0 gap-2">
          <input
            type="text"
            value={novaPergunta}
            onChange={(event) => setNovaPergunta(event.target.value)}
            placeholder="Pergunte ao Fabinho..."
            className="w-full flex-1 rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-sm text-neutral-100 outline-none transition placeholder:text-neutral-500 focus:border-amber-400/50 focus:bg-white/[0.07] light:border-black/10 light:bg-black/[0.03] light:text-neutral-900 light:placeholder:text-neutral-400"
          />
          <button
            type="submit"
            disabled={!novaPergunta.trim() || isThinking}
            aria-label="Enviar"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-amber-400 text-neutral-950 transition hover:bg-amber-300 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="m5 12 14-7-4 7 4 7-14-7Z" />
            </svg>
          </button>
        </form>
      </div>
    </div>
  );
}
