import { useRef, useState, type CSSProperties } from 'react';
import type { MarcaAdmin } from '@fazmais/shared';
import { ApiError } from '../../../lib/apiClient';
import { escalaDaCor } from '../../../lib/marcaTema';
import { useMarcas, useUpdateMarca } from '../hooks/useMarcas';
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

  return (
    <div>
      <div className="mb-3.5">
        <h2 className="text-sm font-bold">Empresas</h2>
        <p className="mt-1 text-sm text-neutral-400 light:text-neutral-500">
          A identidade visual muda conforme o endereço acessado. Endereço não cadastrado em nenhuma empresa usa a FazMais.
        </p>
      </div>

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
  const [dominiosTexto, setDominiosTexto] = useState(marca.dominios.join('\n'));
  const [formError, setFormError] = useState<string | null>(null);
  const [salvo, setSalvo] = useState(false);
  const logoInputRef = useRef<HTMLInputElement>(null);
  const updateMarca = useUpdateMarca();
  const uploadImage = useUploadImage();

  const corValida = /^#[0-9a-fA-F]{6}$/.test(cor);
  // Pré-visualização: as utilities brand-* lêem --brand-*, então sobrescrever
  // as variáveis só neste bloco pinta a prévia sem mexer no resto da tela.
  const estiloPrevia = (!usarCorPadrao && corValida ? escalaDaCor(cor) : null) as CSSProperties | null;

  function handleLogoSelected(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;
    setFormError(null);
    uploadImage.mutate(file, {
      onSuccess: (result) => setLogoUrl(result.url),
      onError: (err) => setFormError(err instanceof Error ? err.message : 'Não foi possível enviar o logo'),
    });
  }

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

          <div className="flex flex-col gap-1.5">
            <span className={LABEL_CLASS}>Logo</span>
            <div className="flex flex-wrap items-center gap-2.5">
              <button
                type="button"
                onClick={() => logoInputRef.current?.click()}
                disabled={uploadImage.isPending}
                className="rounded-lg border border-white/15 bg-white/[0.03] px-3 py-2 text-sm font-semibold text-neutral-100 transition hover:bg-white/[0.06] disabled:opacity-60 light:border-black/15 light:bg-black/[0.02] light:text-neutral-900 light:hover:bg-black/[0.05]"
              >
                {uploadImage.isPending ? 'Enviando...' : logoUrl ? 'Trocar logo' : 'Enviar logo'}
              </button>
              {logoUrl && (
                <button
                  type="button"
                  onClick={() => setLogoUrl(null)}
                  className="rounded-lg px-3 py-2 text-sm font-semibold text-neutral-400 transition hover:text-rose-300 light:text-neutral-500"
                >
                  Remover
                </button>
              )}
              <input
                ref={logoInputRef}
                type="file"
                accept="image/png,image/webp,image/jpeg"
                onChange={handleLogoSelected}
                className="hidden"
              />
              <span className="text-xs text-neutral-500">PNG ou WebP com fundo transparente, até 10 MB</span>
            </div>
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
            <span className="rounded-full border border-brand-400/30 bg-brand-400/5 px-3 py-1 text-xs font-medium text-brand-300 light:text-brand-700">
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
          disabled={updateMarca.isPending || uploadImage.isPending}
          className="rounded-lg bg-gradient-to-r from-brand-400 to-brand-500 px-5 py-2.5 text-sm font-semibold text-neutral-950 shadow-lg shadow-brand-500/20 transition hover:from-brand-300 hover:to-brand-400 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {updateMarca.isPending ? 'Salvando...' : 'Salvar empresa'}
        </button>
      </div>
    </div>
  );
}
