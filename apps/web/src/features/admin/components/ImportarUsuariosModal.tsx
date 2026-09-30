import { useMemo, useRef, useState, type DragEvent } from 'react';
import type { PlanoSummary, UserSummary } from '@fazmais/shared';

// Importação em massa — POR ENQUANTO SÓ NO NAVEGADOR: baixa o modelo, lê o
// CSV e valida linha a linha com as mesmas regras do cadastro individual
// (CreateUserDto na API). O botão final fica desabilitado até existir o
// endpoint de cadastro em lote; nada é enviado pro servidor.

interface ImportarUsuariosModalProps {
  usuariosExistentes: UserSummary[];
  planos: PlanoSummary[];
  onClose: () => void;
}

interface LinhaImportacao {
  numero: number; // linha na planilha (a 1 é o cabeçalho)
  nome: string;
  login: string;
  email: string;
  whatsapp: string;
  perfil: 'Educador' | 'Admin';
  plano: string;
  erros: string[];
}

const COLUNAS = ['nome', 'login', 'email', 'whatsapp', 'perfil', 'plano'] as const;
const MAX_LINHAS = 1000;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function normalizar(texto: string): string {
  return texto.normalize('NFD').replace(/[̀-ͯ]/g, '').trim().toLowerCase();
}

// CSV simples com aspas: Excel em pt-BR salva com ";", Google Planilhas com ",".
function lerCsv(texto: string): string[][] {
  const limpo = texto.replace(/^﻿/, '');
  const primeiraLinha = limpo.split(/\r?\n/, 1)[0] ?? '';
  const separador = [';', ',', '\t'].reduce((melhor, sep) =>
    primeiraLinha.split(sep).length > primeiraLinha.split(melhor).length ? sep : melhor,
  );

  const linhas: string[][] = [];
  let campo = '';
  let linha: string[] = [];
  let entreAspas = false;
  for (let i = 0; i < limpo.length; i++) {
    const c = limpo[i];
    if (entreAspas) {
      if (c === '"' && limpo[i + 1] === '"') {
        campo += '"';
        i++;
      } else if (c === '"') {
        entreAspas = false;
      } else {
        campo += c;
      }
    } else if (c === '"') {
      entreAspas = true;
    } else if (c === separador) {
      linha.push(campo);
      campo = '';
    } else if (c === '\n' || c === '\r') {
      if (c === '\r' && limpo[i + 1] === '\n') i++;
      linha.push(campo);
      linhas.push(linha);
      linha = [];
      campo = '';
    } else {
      campo += c;
    }
  }
  if (campo || linha.length) {
    linha.push(campo);
    linhas.push(linha);
  }
  return linhas.filter((l) => l.some((valor) => valor.trim() !== ''));
}

function validar(
  linhas: string[][],
  usuariosExistentes: UserSummary[],
  planos: PlanoSummary[],
): { linhas: LinhaImportacao[]; erroGeral: string | null } {
  if (linhas.length === 0) return { linhas: [], erroGeral: 'A planilha está vazia.' };

  const cabecalho = linhas[0].map(normalizar);
  const faltando = COLUNAS.filter((col) => col !== 'whatsapp' && col !== 'plano' && !cabecalho.includes(col));
  if (faltando.length > 0) {
    return {
      linhas: [],
      erroGeral: `Faltam colunas no cabeçalho: ${faltando.join(', ')}. Use o modelo pra conferir.`,
    };
  }
  const dados = linhas.slice(1);
  if (dados.length === 0) return { linhas: [], erroGeral: 'A planilha só tem o cabeçalho, sem nenhum usuário.' };
  if (dados.length > MAX_LINHAS) {
    return { linhas: [], erroGeral: `A planilha tem ${dados.length} usuários; o limite por arquivo é ${MAX_LINHAS}.` };
  }

  const idx = (col: string) => cabecalho.indexOf(col);
  const loginsExistentes = new Set(usuariosExistentes.map((u) => normalizar(u.login)));
  const emailsExistentes = new Set(usuariosExistentes.map((u) => normalizar(u.email)));
  const planoPorNome = new Map(planos.map((p) => [normalizar(p.name), p.name]));
  const loginsNoArquivo = new Map<string, number>();
  const emailsNoArquivo = new Map<string, number>();

  const resultado = dados.map((valores, i): LinhaImportacao => {
    const get = (col: string) => (idx(col) >= 0 ? (valores[idx(col)] ?? '').trim() : '');
    const numero = i + 2;
    const erros: string[] = [];

    const nome = get('nome');
    const login = get('login');
    const email = get('email');
    const whatsapp = get('whatsapp');
    const perfilBruto = normalizar(get('perfil'));
    const planoBruto = get('plano');

    if (!nome) erros.push('Nome obrigatório');
    else if (nome.length > 120) erros.push('Nome com mais de 120 caracteres');

    if (!login) erros.push('Login obrigatório');
    else if (/\s/.test(login)) erros.push('Login não pode ter espaços');
    else if (login.length > 60) erros.push('Login com mais de 60 caracteres');
    else if (loginsExistentes.has(normalizar(login))) erros.push('Login já cadastrado neste município');
    else if (loginsNoArquivo.has(normalizar(login))) erros.push(`Login repetido (linha ${loginsNoArquivo.get(normalizar(login))})`);

    if (!email) erros.push('E-mail obrigatório');
    else if (!EMAIL_RE.test(email)) erros.push('E-mail inválido');
    else if (emailsExistentes.has(normalizar(email))) erros.push('E-mail já cadastrado neste município');
    else if (emailsNoArquivo.has(normalizar(email))) erros.push(`E-mail repetido (linha ${emailsNoArquivo.get(normalizar(email))})`);

    if (whatsapp.length > 30) erros.push('WhatsApp com mais de 30 caracteres');

    let perfil: LinhaImportacao['perfil'] = 'Educador';
    if (perfilBruto === 'admin' || perfilBruto === 'administrador') perfil = 'Admin';
    else if (perfilBruto && !['educador', 'professor'].includes(perfilBruto)) {
      erros.push('Perfil deve ser Educador ou Admin');
    }

    let plano = '';
    if (perfil === 'Educador' && planoBruto) {
      const encontrado = planoPorNome.get(normalizar(planoBruto));
      if (encontrado) plano = encontrado;
      else erros.push(`Plano "${planoBruto}" não existe (use: ${planos.map((p) => p.name).join(', ')})`);
    }

    if (login && !loginsNoArquivo.has(normalizar(login))) loginsNoArquivo.set(normalizar(login), numero);
    if (email && !emailsNoArquivo.has(normalizar(email))) emailsNoArquivo.set(normalizar(email), numero);

    return { numero, nome, login, email, whatsapp, perfil, plano, erros };
  });

  return { linhas: resultado, erroGeral: null };
}

function baixarModelo(planos: PlanoSummary[]) {
  const planoExemplo = [...planos].sort((a, b) => a.level - b.level)[0]?.name ?? 'Padrão';
  const conteudo = [
    COLUNAS.join(';'),
    `Maria da Silva;maria.silva;maria.silva@escola.gov.br;(11) 91234-5678;Educador;${planoExemplo}`,
    'João Souza;joao.souza;joao.souza@escola.gov.br;;Admin;',
  ].join('\r\n');
  // BOM pra o Excel abrir os acentos certos.
  const blob = new Blob(['﻿' + conteudo], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'modelo-importacao-usuarios.csv';
  link.click();
  URL.revokeObjectURL(url);
}

export function ImportarUsuariosModal({ usuariosExistentes, planos, onClose }: ImportarUsuariosModalProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [arquivoNome, setArquivoNome] = useState<string | null>(null);
  const [conteudoCsv, setConteudoCsv] = useState<string | null>(null);
  const [arrastando, setArrastando] = useState(false);
  const [soComErro, setSoComErro] = useState(false);
  const [erroLeitura, setErroLeitura] = useState<string | null>(null);

  const validacao = useMemo(
    () => (conteudoCsv === null ? null : validar(lerCsv(conteudoCsv), usuariosExistentes, planos)),
    [conteudoCsv, usuariosExistentes, planos],
  );
  const comErro = validacao?.linhas.filter((l) => l.erros.length > 0).length ?? 0;
  const prontos = (validacao?.linhas.length ?? 0) - comErro;
  const linhasVisiveis = (validacao?.linhas ?? []).filter((l) => !soComErro || l.erros.length > 0);

  function carregarArquivo(arquivo: File | undefined) {
    setErroLeitura(null);
    if (!arquivo) return;
    if (!/\.(csv|txt)$/i.test(arquivo.name)) {
      setErroLeitura('Envie um arquivo .csv. No Excel: Arquivo › Salvar como › "CSV UTF-8".');
      return;
    }
    const leitor = new FileReader();
    leitor.onload = () => {
      setArquivoNome(arquivo.name);
      setConteudoCsv(String(leitor.result ?? ''));
      setSoComErro(false);
    };
    leitor.onerror = () => setErroLeitura('Não foi possível ler o arquivo.');
    leitor.readAsText(arquivo, 'utf-8');
  }

  function onDrop(event: DragEvent) {
    event.preventDefault();
    setArrastando(false);
    carregarArquivo(event.dataTransfer.files[0]);
  }

  function trocarArquivo() {
    setArquivoNome(null);
    setConteudoCsv(null);
    setErroLeitura(null);
    if (inputRef.current) inputRef.current.value = '';
  }

  return (
    <div className="fixed inset-0 z-30 flex items-center justify-center bg-black/55 p-4 backdrop-blur-[2px] light:bg-black/25" onClick={onClose}>
      <div
        className="flex max-h-[88vh] w-full max-w-4xl flex-col rounded-2xl border border-white/15 bg-[#0d0d14] shadow-2xl light:border-black/10 light:bg-white"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4 px-6 pt-6">
          <div>
            <p className="mb-1 text-[11px] font-bold uppercase tracking-wider text-amber-300 light:text-amber-700">Usuários</p>
            <h3 className="text-lg font-bold text-neutral-100 light:text-neutral-900">Importar usuários em massa</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Fechar"
            className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md border border-white/10 bg-white/[0.03] text-neutral-400 transition hover:bg-white/[0.08] hover:text-neutral-100 light:border-black/10 light:bg-black/[0.03] light:text-neutral-500 light:hover:bg-black/[0.06] light:hover:text-neutral-900"
          >
            ✕
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-4">
          {!validacao ? (
            <>
              <ol className="mb-5 flex flex-col gap-2 text-sm text-neutral-300 light:text-neutral-600">
                <li>
                  <span className="font-semibold text-amber-400">1.</span> Baixe o modelo e preencha um usuário por linha
                  (nome, login, e-mail, WhatsApp, perfil e plano).{' '}
                  <button
                    type="button"
                    onClick={() => baixarModelo(planos)}
                    className="font-semibold text-amber-400 underline-offset-2 hover:underline light:text-amber-600"
                  >
                    ↓ Baixar modelo (CSV)
                  </button>
                </li>
                <li>
                  <span className="font-semibold text-amber-400">2.</span> Salve como CSV (no Excel: "CSV UTF-8") e envie
                  abaixo.
                </li>
                <li>
                  <span className="font-semibold text-amber-400">3.</span> Confira a prévia: cada linha é validada antes de
                  importar.
                </li>
              </ol>

              <div
                onDragOver={(event) => {
                  event.preventDefault();
                  setArrastando(true);
                }}
                onDragLeave={() => setArrastando(false)}
                onDrop={onDrop}
                onClick={() => inputRef.current?.click()}
                className={`flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed px-6 py-10 text-center transition ${
                  arrastando
                    ? 'border-amber-400 bg-amber-400/10'
                    : 'border-white/15 hover:border-amber-400/50 hover:bg-white/[0.03] light:border-black/15 light:hover:bg-black/[0.02]'
                }`}
              >
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="text-amber-400">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12" />
                </svg>
                <p className="text-sm font-semibold text-neutral-200 light:text-neutral-800">Arraste o arquivo CSV aqui</p>
                <p className="text-xs text-neutral-500">ou clique para escolher · até {MAX_LINHAS} usuários por arquivo</p>
                <input
                  ref={inputRef}
                  type="file"
                  accept=".csv,text/csv"
                  className="hidden"
                  onChange={(event) => carregarArquivo(event.target.files?.[0])}
                />
              </div>

              {erroLeitura && <p className="mt-3 text-sm text-rose-300 light:text-rose-700">{erroLeitura}</p>}

              <p className="mt-4 text-xs leading-relaxed text-neutral-500">
                Perfil: <strong>Educador</strong> (padrão se ficar vazio) ou <strong>Admin</strong>. Plano só vale pra
                Educador: {planos.map((p) => p.name).join(', ')} — vazio fica no plano mais básico.
              </p>
            </>
          ) : (
            <>
              <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
                <div className="text-sm">
                  <span className="font-semibold text-neutral-200 light:text-neutral-800">{arquivoNome}</span>
                  {!validacao.erroGeral && (
                    <span className="ml-2 text-neutral-400">
                      <span className="font-semibold text-emerald-400">{prontos} prontos</span>
                      {comErro > 0 && (
                        <>
                          {' · '}
                          <span className="font-semibold text-rose-300">{comErro} com erro</span>
                        </>
                      )}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-3">
                  {comErro > 0 && (
                    <label className="flex cursor-pointer items-center gap-1.5 text-xs text-neutral-400">
                      <input type="checkbox" checked={soComErro} onChange={(e) => setSoComErro(e.target.checked)} />
                      Mostrar só linhas com erro
                    </label>
                  )}
                  <button
                    type="button"
                    onClick={trocarArquivo}
                    className="text-xs font-semibold text-amber-400 hover:underline light:text-amber-600"
                  >
                    Trocar arquivo
                  </button>
                </div>
              </div>

              {validacao.erroGeral ? (
                <div className="rounded-lg border border-rose-500/30 bg-rose-500/10 px-3.5 py-2.5 text-sm text-rose-300 light:text-rose-700">
                  {validacao.erroGeral}
                </div>
              ) : (
                <div className="overflow-hidden rounded-xl border border-white/10 light:border-black/10">
                  <div className="max-h-[45vh] overflow-auto">
                    <table className="w-full min-w-[720px] border-collapse text-sm">
                      <thead className="sticky top-0 bg-[#13131c] light:bg-neutral-50">
                        <tr>
                          {['Linha', 'Nome', 'Login', 'E-mail', 'Perfil', 'Plano', 'Situação'].map((titulo) => (
                            <th
                              key={titulo}
                              className="border-b border-white/10 px-3 py-2 text-left text-[11px] font-semibold uppercase tracking-wider text-neutral-500 light:border-black/10"
                            >
                              {titulo}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {linhasVisiveis.map((linha) => (
                          <tr
                            key={linha.numero}
                            className={`border-b border-white/10 last:border-b-0 light:border-black/10 ${
                              linha.erros.length > 0 ? 'bg-rose-500/[0.06]' : ''
                            }`}
                          >
                            <td className="px-3 py-2 tabular-nums text-neutral-500">{linha.numero}</td>
                            <td className="px-3 py-2">{linha.nome || '—'}</td>
                            <td className="px-3 py-2 text-neutral-400">{linha.login || '—'}</td>
                            <td className="px-3 py-2 text-neutral-400">{linha.email || '—'}</td>
                            <td className="px-3 py-2 text-neutral-400">{linha.perfil}</td>
                            <td className="px-3 py-2 text-neutral-400">{linha.perfil === 'Admin' ? '—' : linha.plano || 'Básico'}</td>
                            <td className="px-3 py-2">
                              {linha.erros.length === 0 ? (
                                <span className="font-semibold text-emerald-400">✓ Pronto</span>
                              ) : (
                                <ul className="text-xs text-rose-300 light:text-rose-700">
                                  {linha.erros.map((erro) => (
                                    <li key={erro}>• {erro}</li>
                                  ))}
                                </ul>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-3 border-t border-white/10 px-6 py-4 light:border-black/10">
          <p className="mr-auto text-xs text-amber-300/90 light:text-amber-700">
            ⚠ Importação ainda não disponível: por enquanto dá pra validar a planilha aqui. O cadastro em lote chega em
            breve.
          </p>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-white/15 px-4 py-2.5 text-sm font-semibold text-neutral-400 transition hover:text-neutral-100 light:border-black/15 light:text-neutral-500 light:hover:text-neutral-900"
          >
            Fechar
          </button>
          <button
            type="button"
            disabled
            title="Importação ainda não disponível"
            className="cursor-not-allowed rounded-lg bg-gradient-to-r from-amber-400 to-amber-500 px-4 py-2.5 text-sm font-semibold text-neutral-950 opacity-50"
          >
            Importar {prontos > 0 ? `${prontos} usuário${prontos > 1 ? 's' : ''}` : 'usuários'}
          </button>
        </div>
      </div>
    </div>
  );
}
