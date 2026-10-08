import { useRef, useState, type CSSProperties } from 'react';
import type { MarcaAdmin } from '@fazmais/shared';
import { ApiError } from '../../../lib/apiClient';
import { escalaDaCor } from '../../../lib/marcaTema';
import { imagensDoAssistente } from '../../../lib/imagensAssistente';
import { useCreateMarca, useMarcas, useUpdateMarca } from '../hooks/useMarcas';
import { useUploadImage } from '../hooks/useCatalogoBuilder';
import { BrandLogoView } from '../../../components/BrandLogo';
import { BrandName } from '../../../components/BrandName';

const INPUT_CLASS =
  'w-full rounded-lg border border-white/10 bg-white/5 px-3.5 py-2.5 text-sm text-white outline-none transition focus:border-brand-400/60 focus:bg-white/[0.07] focus:ring-2 focus:ring-brand-400/20 light:border-black/10 light:bg-black/[0.03] light:text-neutral-900 light:focus:bg-white';
const LABEL_CLASS = 'text-xs font-semibold text-neutral-300 light:text-neutral-600';
const COR_INICIAL_SUGERIDA = '#2563eb';

// Aceita o que a pessoa colar ("https://App.X.com.br/login") e guarda só o host.
function limparDominios(texto: string): string[] {
  return texto
    .split(/[\n,;]+/)
    .map((linha) =>
      linha
        .trim()
        .toLowerCase()
        .replace(/^https?:\/\//, '')
        .replace(/[/?#].*$/, '')
        .replace(/:\d+$/, ''),
    )
    .filter(Boolean);
}

export function MarcasTab() {
  const { data: marcas, isLoading, error } = useMarcas();
  const [criando, setCriando] = useState(false);

  return (
    <div>
      <div className="mb-3.5 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-sm font-bold">Empresas</h2>
          <p className="mt-1 text-sm text-neutral-400 light:text-neutral-500">
            A identidade visual muda conforme o endereço acessado. Endereço não cadastrado em nenhuma empresa usa a
            FazMais.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setCriando(true)}
          className="inline-flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-brand-400 to-brand-500 px-3.5 py-2 text-sm font-semibold text-neutral-950 shadow-lg shadow-brand-500/20 transition hover:from-brand-300 hover:to-brand-400"
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round">
            <path d="M12 5v14M5 12h14" />
          </svg>
          Nova empresa
        </button>
      </div>

      {criando && <NovaEmpresaModal onClose={() => setCriando(false)} />}

      {isLoading && <p className="text-sm text-neutral-500">Carregando...</p>}
      {error && <p className="text-sm text-rose-300 light:text-rose-700">Não foi possível carregar as empresas.</p>}

      <div className="flex flex-col gap-4">
        {marcas?.map((marca) => (
          <MarcaCard key={marca.id} marca={marca} />
        ))}
      </div>
    </div>
  );
}

function MarcaCard({ marca }: { marca: MarcaAdmin }) {
  const [nomeExibicao, setNomeExibicao] = useState(marca.nomeExibicao);
  const [nomeAssistente, setNomeAssistente] = useState(marca.nomeAssistente);
  const [usarCorPadrao, setUsarCorPadrao] = useState(marca.corPrimaria === null);
  const [cor, setCor] = useState(marca.corPrimaria ?? COR_INICIAL_SUGERIDA);
  const [logoUrl, setLogoUrl] = useState(marca.logoUrl);
  const [assistenteImagemUrl, setAssistenteImagemUrl] = useState(marca.assistenteImagemUrl);
  const [assistenteAvatarUrl, setAssistenteAvatarUrl] = useState(marca.assistenteAvatarUrl);
  const [enviandoImagens, setEnviandoImagens] = useState(0);
  const [dominiosTexto, setDominiosTexto] = useState(marca.dominios.join('\n'));
  const [formError, setFormError] = useState<string | null>(null);
  const [salvo, setSalvo] = useState(false);
  const updateMarca = useUpdateMarca();

  const corValida = /^#[0-9a-fA-F]{6}$/.test(cor);
  // Pré-visualização: as utilities brand-* lêem --brand-*, então sobrescrever
  // as variáveis só neste bloco pinta a prévia sem mexer no resto da tela.
  const estiloPrevia = (!usarCorPadrao && corValida ? escalaDaCor(cor) : null) as CSSProperties | null;
  const imagensPrevia = imagensDoAssistente({ assistenteImagemUrl, assistenteAvatarUrl });

  function handleSave() {
    setFormError(null);
    setSalvo(false);
    if (!nomeExibicao.trim() || !nomeAssistente.trim()) {
      setFormError('Informe o nome no portal e o nome do assistente.');
      return;
    }
    if (!usarCorPadrao && !corValida) {
      setFormError('A cor deve estar no formato #RRGGBB.');
      return;
    }
    const dominios = limparDominios(dominiosTexto);
    setDominiosTexto(dominios.join('\n'));
    updateMarca.mutate(
      {
        id: marca.id,
        dto: {
          nomeExibicao: nomeExibicao.trim(),
          nomeAssistente: nomeAssistente.trim(),
          corPrimaria: usarCorPadrao ? null : cor.toLowerCase(),
          logoUrl,
          assistenteImagemUrl,
          assistenteAvatarUrl,
          dominios,
        },
      },
      {
        onSuccess: () => setSalvo(true),
        onError: (err) => setFormError(err instanceof ApiError ? err.message : 'Não foi possível salvar a empresa.'),
      },
    );
  }

  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.035] p-5 light:border-black/10 light:bg-white">
      <div className="mb-4 flex flex-wrap items-baseline justify-between gap-2">
        <h3 className="text-base font-bold">{marca.nomeExibicao}</h3>
        <div className="flex items-center gap-3 text-xs text-neutral-500">
          <span>
            {marca.tenantsCount} {marca.tenantsCount === 1 ? 'município vinculado' : 'municípios vinculados'}
          </span>
          <a
            href={`/?marca=${marca.slug}`}
            target="_blank"
            rel="noreferrer"
            title="Abre o portal com a identidade desta empresa numa nova aba (sem precisar do domínio)"
            className="font-semibold text-brand-400 hover:underline light:text-brand-600"
          >
            Ver o portal desta empresa ↗
          </a>
        </div>
      </div>

      <div className="grid gap-5 md:grid-cols-[1fr_280px]">
        <div className="flex flex-col gap-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-1.5">
              <label htmlFor={`marca-nome-${marca.id}`} className={LABEL_CLASS}>
                Nome no portal
              </label>
              <input
                id={`marca-nome-${marca.id}`}
                value={nomeExibicao}
                onChange={(event) => setNomeExibicao(event.target.value)}
                maxLength={60}
                className={INPUT_CLASS}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label htmlFor={`marca-assistente-${marca.id}`} className={LABEL_CLASS}>
                Nome do assistente de IA
              </label>
              <input
                id={`marca-assistente-${marca.id}`}
                value={nomeAssistente}
                onChange={(event) => setNomeAssistente(event.target.value)}
                maxLength={40}
                className={INPUT_CLASS}
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <span className={LABEL_CLASS}>Cor principal</span>
            <div className="flex flex-wrap items-center gap-3">
              <label className="flex items-center gap-2 text-sm text-neutral-300 light:text-neutral-700">
                <input
                  type="checkbox"
                  checked={usarCorPadrao}
                  onChange={(event) => setUsarCorPadrao(event.target.checked)}
                  className="accent-brand-400"
                />
                Usar a cor padrão (âmbar)
              </label>
              {!usarCorPadrao && (
                <>
                  <input
                    type="color"
                    value={corValida ? cor : '#000000'}
                    onChange={(event) => setCor(event.target.value)}
                    aria-label="Escolher cor"
                    className="h-9 w-12 cursor-pointer rounded border border-white/15 bg-transparent light:border-black/15"
                  />
                  <input
                    value={cor}
                    onChange={(event) => setCor(event.target.value.trim())}
                    maxLength={7}
                    aria-label="Cor em hexadecimal"
                    className={`${INPUT_CLASS.replace('w-full', 'w-28')} font-mono`}
                  />
                </>
              )}
            </div>
            {!usarCorPadrao && (
              <p className="text-xs text-neutral-500">
                O portal usa o tom desta cor ajustado para manter a leitura nos temas claro e escuro, então botões e
                destaques podem sair um pouco mais claros que o código informado.
              </p>
            )}
          </div>

          <CampoImagem
            titulo="Logo"
            dica="PNG ou WebP com fundo transparente, até 10 MB"
            url={logoUrl}
            onChange={setLogoUrl}
            onEnviando={(ativo) => setEnviandoImagens((n) => n + (ativo ? 1 : -1))}
            onErro={setFormError}
          />

          <div className="grid gap-4 sm:grid-cols-2">
            <CampoImagem
              titulo="Imagem do assistente"
              dica="Corpo inteiro, fundo transparente. Vazio = Fabinho"
              url={assistenteImagemUrl}
              onChange={setAssistenteImagemUrl}
              onEnviando={(ativo) => setEnviandoImagens((n) => n + (ativo ? 1 : -1))}
            onErro={setFormError}
            />
            <CampoImagem
              titulo="Avatar do assistente (opcional)"
              dica="Rosto, quadrado. Vazio = topo da imagem ao lado"
              url={assistenteAvatarUrl}
              onChange={setAssistenteAvatarUrl}
              onEnviando={(ativo) => setEnviandoImagens((n) => n + (ativo ? 1 : -1))}
            onErro={setFormError}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor={`marca-dominios-${marca.id}`} className={LABEL_CLASS}>
              Endereços (um por linha)
            </label>
            <textarea
              id={`marca-dominios-${marca.id}`}
              value={dominiosTexto}
              onChange={(event) => setDominiosTexto(event.target.value)}
              rows={2}
              placeholder="app.plannetamais.com.br"
              className={`${INPUT_CLASS} font-mono text-xs`}
            />
            <p className="text-xs text-neutral-500">
              O primeiro endereço também é usado nos links de definir senha dos municípios desta empresa. O domínio
              precisa estar apontado para o portal (Vercel) para funcionar.
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <span className={LABEL_CLASS}>Prévia</span>
          <div
            style={estiloPrevia ?? undefined}
            className="flex flex-col items-center gap-3 rounded-xl border border-white/10 bg-[#07070c] p-5 light:border-black/10 light:bg-[#f6f4ef]"
          >
            <BrandLogoView
              marca={{ slug: marca.slug, logoUrl, nomeExibicao: nomeExibicao || '...' }}
              className="h-14 max-w-full"
            />
            <p className="text-sm font-bold text-neutral-100 light:text-neutral-900">
              Bem-vindo ao portal <BrandName nome={nomeExibicao} />
            </p>
            <span className="w-full rounded-lg bg-gradient-to-r from-brand-400 to-brand-500 px-4 py-2 text-center text-sm font-semibold text-neutral-950">
              Entrar
            </span>
            <img src={imagensPrevia.figura} alt="" className="h-24 w-auto drop-shadow-xl" />
            <span className="flex items-center gap-2 rounded-full border border-brand-400/30 bg-brand-400/5 py-1 pl-1 pr-3 text-xs font-medium text-brand-300 light:text-brand-700">
              <img
                src={imagensPrevia.avatar}
                alt=""
                className={`h-6 w-6 rounded-full object-cover ${imagensPrevia.avatarPosicao}`}
              />
              Pergunte ao {nomeAssistente || '...'}
            </span>
          </div>
        </div>
      </div>

      {formError && (
        <div className="mt-4 rounded-lg border border-rose-500/30 bg-rose-500/10 px-3.5 py-2.5 text-sm text-rose-300 light:text-rose-700">
          {formError}
        </div>
      )}

      <div className="mt-4 flex items-center justify-end gap-3">
        {salvo && !updateMarca.isPending && <span className="text-sm text-emerald-400 light:text-emerald-700">Empresa salva.</span>}
        <button
          type="button"
          onClick={handleSave}
          disabled={updateMarca.isPending || enviandoImagens > 0}
          className="rounded-lg bg-gradient-to-r from-brand-400 to-brand-500 px-5 py-2.5 text-sm font-semibold text-neutral-950 shadow-lg shadow-brand-500/20 transition hover:from-brand-300 hover:to-brand-400 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {updateMarca.isPending ? 'Salvando...' : 'Salvar empresa'}
        </button>
      </div>
    </div>
  );
}

// Envio de uma imagem (logo, figura ou avatar do assistente) com miniatura.
function CampoImagem({
  titulo,
  dica,
  url,
  onChange,
  onEnviando,
  onErro,
}: {
  titulo: string;
  dica: string;
  url: string | null;
  onChange: (url: string | null) => void;
  onEnviando: (ativo: boolean) => void;
  onErro: (mensagem: string | null) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const uploadImage = useUploadImage();

  function handleSelected(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;
    onErro(null);
    onEnviando(true);
    uploadImage.mutate(file, {
      onSuccess: (result) => onChange(result.url),
      onError: (err) => onErro(err instanceof Error ? err.message : 'Não foi possível enviar a imagem'),
      onSettled: () => onEnviando(false),
    });
  }

  return (
    <div className="flex flex-col gap-1.5">
      <span className={LABEL_CLASS}>{titulo}</span>
      <div className="flex flex-wrap items-center gap-2.5">
        {url && (
          <img
            src={url}
            alt=""
            className="h-10 w-10 rounded-md border border-white/10 bg-white/[0.04] object-contain light:border-black/10"
          />
        )}
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploadImage.isPending}
          className="rounded-lg border border-white/15 bg-white/[0.03] px-3 py-2 text-sm font-semibold text-neutral-100 transition hover:bg-white/[0.06] disabled:opacity-60 light:border-black/15 light:bg-black/[0.02] light:text-neutral-900 light:hover:bg-black/[0.05]"
        >
          {uploadImage.isPending ? 'Enviando...' : url ? 'Trocar' : 'Enviar'}
        </button>
        {url && (
          <button
            type="button"
            onClick={() => onChange(null)}
            className="rounded-lg px-2 py-2 text-sm font-semibold text-neutral-400 transition hover:text-rose-300 light:text-neutral-500"
          >
            Remover
          </button>
        )}
        <input
          ref={inputRef}
          type="file"
          accept="image/png,image/webp,image/jpeg"
          onChange={handleSelected}
          className="hidden"
        />
      </div>
      <span className="text-xs text-neutral-500">{dica}</span>
    </div>
  );
}

// "Planeta Mais" -> "planetamais": sugestão de identificador a partir do nome.
function sugerirSlug(nome: string): string {
  return nome
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '')
    .slice(0, 40);
}

function NovaEmpresaModal({ onClose }: { onClose: () => void }) {
  const [nomeExibicao, setNomeExibicao] = useState('');
  const [nomeAssistente, setNomeAssistente] = useState('');
  const [slug, setSlug] = useState('');
  const [slugEditado, setSlugEditado] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const createMarca = useCreateMarca();

  function handleSave() {
    setFormError(null);
    if (!nomeExibicao.trim() || !nomeAssistente.trim() || !slug.trim()) {
      setFormError('Preencha o nome no portal, o identificador e o nome do assistente.');
      return;
    }
    createMarca.mutate(
      { slug: slug.trim(), nomeExibicao: nomeExibicao.trim(), nomeAssistente: nomeAssistente.trim() },
      {
        onSuccess: onClose,
        onError: (err) => setFormError(err instanceof ApiError ? err.message : 'Não foi possível criar a empresa.'),
      },
    );
  }

  return (
    <div
      className="fixed inset-0 z-20 flex items-center justify-center bg-black/55 p-4 backdrop-blur-[2px] light:bg-black/25"
      onClick={onClose}
    >
      <div
        className="w-full max-w-[440px] rounded-2xl border border-white/15 bg-[#0d0d14] p-6 shadow-2xl light:border-black/10 light:bg-white"
        onClick={(event) => event.stopPropagation()}
      >
        <p className="mb-1 text-[11px] font-bold uppercase tracking-wider text-brand-300 light:text-brand-700">Nova empresa</p>
        <h3 className="mb-5 text-lg font-bold text-neutral-100 light:text-neutral-900">Cadastrar empresa</h3>

        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="nova-empresa-nome" className={LABEL_CLASS}>
              Nome no portal
            </label>
            <input
              id="nova-empresa-nome"
              value={nomeExibicao}
              onChange={(event) => {
                setNomeExibicao(event.target.value);
                if (!slugEditado) setSlug(sugerirSlug(event.target.value));
              }}
              maxLength={60}
              placeholder="Ex.: PlanetaMais"
              className={INPUT_CLASS}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label htmlFor="nova-empresa-slug" className={LABEL_CLASS}>
              Identificador
            </label>
            <input
              id="nova-empresa-slug"
              value={slug}
              onChange={(event) => {
                setSlug(event.target.value.toLowerCase());
                setSlugEditado(true);
              }}
              maxLength={40}
              className={`${INPUT_CLASS} font-mono`}
            />
            <p className="text-xs text-neutral-500">
              Usado no link de teste <span className="font-mono">?marca={slug || '...'}</span>. Não pode ser alterado
              depois.
            </p>
          </div>
          <div className="flex flex-col gap-1.5">
            <label htmlFor="nova-empresa-assistente" className={LABEL_CLASS}>
              Nome do assistente de IA
            </label>
            <input
              id="nova-empresa-assistente"
              value={nomeAssistente}
              onChange={(event) => setNomeAssistente(event.target.value)}
              maxLength={40}
              className={INPUT_CLASS}
            />
          </div>
          <p className="text-xs text-neutral-500">
            Cor, logo, imagens do assistente e endereços você configura no card da empresa depois de criar.
          </p>

          {formError && (
            <div className="rounded-lg border border-rose-500/30 bg-rose-500/10 px-3.5 py-2.5 text-sm text-rose-300 light:text-rose-700">
              {formError}
            </div>
          )}
        </div>

        <div className="mt-6 flex gap-2.5">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 rounded-lg border border-white/15 px-4 py-2.5 text-sm font-semibold text-neutral-400 transition hover:text-neutral-100 light:border-black/15 light:text-neutral-500 light:hover:text-neutral-900"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={createMarca.isPending}
            className="flex-1 rounded-lg bg-gradient-to-r from-brand-400 to-brand-500 px-4 py-2.5 text-sm font-semibold text-neutral-950 shadow-lg shadow-brand-500/20 transition hover:from-brand-300 hover:to-brand-400 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {createMarca.isPending ? 'Criando...' : 'Criar empresa'}
          </button>
        </div>
      </div>
    </div>
  );
}
