import { useState } from 'react';
import type { ConteudoSummary, CreateConteudoRequest, MediaType, UpdateConteudoRequest } from '@fazmais/shared';
import { usePlanos } from '../hooks/usePlanos';
import { useAiSuggest } from '../hooks/useCatalogoBuilder';

interface ConteudoModalProps {
  mode: 'create' | 'edit';
  breadcrumb: string;
  conteudo?: ConteudoSummary;
  saving: boolean;
  onClose: () => void;
  onCreate: (dto: CreateConteudoRequest) => void;
  onUpdate: (dto: UpdateConteudoRequest) => void;
}

const MEDIA_OPTIONS: { value: MediaType; label: string }[] = [
  { value: 'VIDEO', label: 'Vídeo' },
  { value: 'PDF', label: 'PDF' },
  { value: 'ARTIGO', label: 'Artigo' },
];

export function ConteudoModal({ mode, breadcrumb, conteudo, saving, onClose, onCreate, onUpdate }: ConteudoModalProps) {
  const isEdit = mode === 'edit';
  const { data: planos } = usePlanos();
  const aiSuggest = useAiSuggest();

  const [title, setTitle] = useState(conteudo?.title ?? '');
  const [description, setDescription] = useState(conteudo?.description ?? '');
  const [mediaType, setMediaType] = useState<MediaType>(conteudo?.mediaType ?? 'VIDEO');
  const [mediaUrl, setMediaUrl] = useState(conteudo?.mediaUrl ?? '');
  const [htmlContent, setHtmlContent] = useState(conteudo?.htmlContent ?? '');
  const [imageUrl, setImageUrl] = useState(conteudo?.imageUrl ?? '');
  const [isFeatured, setIsFeatured] = useState(conteudo?.isFeatured ?? false);
  const [planoIds, setPlanoIds] = useState<string[]>(conteudo?.planoIds ?? []);
  const [tags, setTags] = useState<string[]>(conteudo?.tags ?? []);
  const [tagInput, setTagInput] = useState('');
  const [aiSummary, setAiSummary] = useState(conteudo?.aiSummary ?? '');
  const [formError, setFormError] = useState<string | null>(null);

  function togglePlano(id: string) {
    setPlanoIds((current) => (current.includes(id) ? current.filter((p) => p !== id) : [...current, id]));
  }

  function addTag() {
    const value = tagInput.trim();
    if (value && !tags.includes(value)) {
      setTags((current) => [...current, value]);
    }
    setTagInput('');
  }

  function removeTag(tag: string) {
    setTags((current) => current.filter((t) => t !== tag));
  }

  function runAiSuggest() {
    if (!title.trim() || !description.trim()) {
      setFormError('Preencha título e descrição antes de gerar sugestões com IA.');
      return;
    }
    setFormError(null);
    aiSuggest.mutate(
      { title, description },
      {
        onSuccess: (result) => {
          setTags((current) => [...new Set([...current, ...result.tags])]);
          setAiSummary(result.summary);
        },
      },
    );
  }

  function handleSave() {
    setFormError(null);
    if (!title.trim() || !description.trim()) {
      setFormError('Título e descrição são obrigatórios.');
      return;
    }
    if (!imageUrl.trim()) {
      setFormError('Informe a URL da imagem de capa.');
      return;
    }
    if (mediaType === 'ARTIGO' && !htmlContent.trim()) {
      setFormError('Informe o conteúdo do artigo.');
      return;
    }
    if (mediaType !== 'ARTIGO' && !mediaUrl.trim()) {
      setFormError('Informe a URL da mídia.');
      return;
    }

    const payload = {
      title,
      description,
      mediaType,
      mediaUrl: mediaType === 'ARTIGO' ? undefined : mediaUrl,
      htmlContent: mediaType === 'ARTIGO' ? htmlContent : undefined,
      imageUrl,
      isFeatured,
      tags,
      planoIds,
      aiSummary: aiSummary || undefined,
    };

    if (isEdit) {
      onUpdate(payload);
    } else {
      onCreate(payload as CreateConteudoRequest);
    }
  }

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/60 p-4 backdrop-blur-[3px] light:bg-black/30" onClick={onClose}>
      <div
        className="flex max-h-[88vh] w-full max-w-2xl flex-col rounded-2xl border border-white/15 bg-[#0d0d14] shadow-2xl light:border-black/10 light:bg-white"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4 border-b border-white/10 px-6 py-5 light:border-black/10">
          <div>
            <p className="mb-1 text-xs text-neutral-500">{breadcrumb}</p>
            <p className="mb-1 text-[11px] font-bold uppercase tracking-wider text-amber-300 light:text-amber-700">
              {isEdit ? 'Editar conteúdo' : 'Novo conteúdo'}
            </p>
            <h3 className="text-lg font-bold text-neutral-100 light:text-neutral-900">
              {isEdit ? conteudo?.title : 'Cadastrar conteúdo'}
            </h3>
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

        <div className="flex flex-1 flex-col gap-5 overflow-y-auto px-6 py-5">
          <Field label="Título">
            <input
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="Ex.: A Cigarra e a Formiga"
              className="w-full rounded-lg border border-white/10 bg-white/5 px-3.5 py-2.5 text-sm text-white outline-none transition focus:border-amber-400/60 focus:ring-2 focus:ring-amber-400/20 light:border-black/10 light:bg-black/[0.03] light:text-neutral-900"
            />
          </Field>

          <Field label="Descrição">
            <textarea
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              rows={3}
              placeholder="1-2 frases sobre o conteúdo"
              className="w-full rounded-lg border border-white/10 bg-white/5 px-3.5 py-2.5 text-sm text-white outline-none transition focus:border-amber-400/60 focus:ring-2 focus:ring-amber-400/20 light:border-black/10 light:bg-black/[0.03] light:text-neutral-900"
            />
          </Field>

          <Field label="Tipo de mídia">
            <div className="inline-flex gap-1 rounded-lg border border-white/15 bg-white/[0.03] p-1 light:border-black/15 light:bg-black/[0.03]">
              {MEDIA_OPTIONS.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setMediaType(option.value)}
                  className={
                    mediaType === option.value
                      ? 'rounded-md bg-white/[0.08] px-3.5 py-1.5 text-sm font-semibold text-neutral-100 light:bg-white light:text-neutral-900 light:shadow'
                      : 'rounded-md px-3.5 py-1.5 text-sm font-semibold text-neutral-400 light:text-neutral-500'
                  }
                >
                  {option.label}
                </button>
              ))}
            </div>
          </Field>

          {mediaType === 'ARTIGO' ? (
            <Field label="Conteúdo do artigo">
              <textarea
                value={htmlContent}
                onChange={(event) => setHtmlContent(event.target.value)}
                rows={5}
                placeholder="Texto do artigo — editor de verdade fica pra depois, isso aqui é texto simples"
                className="w-full rounded-lg border border-white/10 bg-white/5 px-3.5 py-2.5 text-sm text-white outline-none transition focus:border-amber-400/60 focus:ring-2 focus:ring-amber-400/20 light:border-black/10 light:bg-black/[0.03] light:text-neutral-900"
              />
            </Field>
          ) : (
            <Field label="URL da mídia">
              <input
                value={mediaUrl}
                onChange={(event) => setMediaUrl(event.target.value)}
                placeholder="https://..."
                className="w-full rounded-lg border border-white/10 bg-white/5 px-3.5 py-2.5 text-sm text-white outline-none transition focus:border-amber-400/60 focus:ring-2 focus:ring-amber-400/20 light:border-black/10 light:bg-black/[0.03] light:text-neutral-900"
              />
            </Field>
          )}

          <Field label="Imagem de capa (URL)">
            <input
              value={imageUrl}
              onChange={(event) => setImageUrl(event.target.value)}
              placeholder="https://... (upload de arquivo ainda não existe, é só URL colada)"
              className="w-full rounded-lg border border-white/10 bg-white/5 px-3.5 py-2.5 text-sm text-white outline-none transition focus:border-amber-400/60 focus:ring-2 focus:ring-amber-400/20 light:border-black/10 light:bg-black/[0.03] light:text-neutral-900"
            />
          </Field>

          <div className="flex items-center justify-between gap-4 rounded-lg border border-white/10 bg-white/[0.03] px-4 py-3 light:border-black/10 light:bg-black/[0.02]">
            <div>
              <p className="text-sm font-semibold text-neutral-100 light:text-neutral-900">Destacar no catálogo</p>
              <p className="text-xs text-neutral-400 light:text-neutral-500">Vira candidato a hero na Home do professor</p>
            </div>
            <button
              type="button"
              onClick={() => setIsFeatured((v) => !v)}
              className={`relative h-6 w-10 shrink-0 rounded-full border transition ${
                isFeatured ? 'border-amber-400/50 bg-amber-400/25' : 'border-white/15 bg-white/5'
              }`}
            >
              <span
                className={`absolute top-0.5 h-4 w-4 rounded-full transition ${isFeatured ? 'left-5 bg-amber-400' : 'left-0.5 bg-neutral-500'}`}
              />
            </button>
          </div>

          <Field label="Planos habilitados">
            <div className="flex flex-wrap gap-2">
              {planos?.map((plano) => (
                <button
                  key={plano.id}
                  type="button"
                  onClick={() => togglePlano(plano.id)}
                  className={
                    planoIds.includes(plano.id)
                      ? 'rounded-full border border-amber-400/50 bg-amber-400/15 px-3.5 py-1.5 text-sm font-semibold text-amber-300 light:text-amber-700'
                      : 'rounded-full border border-white/15 bg-white/[0.03] px-3.5 py-1.5 text-sm font-semibold text-neutral-400 light:border-black/15 light:bg-black/[0.02] light:text-neutral-500'
                  }
                >
                  {plano.name}
                </button>
              ))}
            </div>
            <p className="mt-1 text-xs text-neutral-500">Sem plano marcado, ninguém vê esse conteúdo mesmo com acesso ao catálogo.</p>
          </Field>

          <div className="rounded-xl border border-violet-400/30 bg-violet-400/10 p-4 light:border-violet-600/25 light:bg-violet-600/5">
            <div className="mb-2 flex items-center justify-between gap-3">
              <span className="text-sm font-bold text-violet-300 light:text-violet-700">✨ Sugestões com IA</span>
              <button
                type="button"
                onClick={runAiSuggest}
                disabled={aiSuggest.isPending}
                className="rounded-lg bg-gradient-to-r from-violet-400 to-violet-600 px-3 py-1.5 text-xs font-semibold text-white disabled:cursor-wait disabled:opacity-70"
              >
                {aiSuggest.isPending ? 'Gerando...' : tags.length || aiSummary ? 'Gerar de novo' : 'Gerar sugestões'}
              </button>
            </div>
            <p className="mb-3 text-xs text-neutral-400 light:text-neutral-500">
              Usa título + descrição pra sugerir tags e um resumo — os dois continuam editáveis.
            </p>

            <div className="mb-3 flex flex-wrap items-center gap-1.5">
              {tags.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-[#0d0d14] px-2.5 py-1 text-xs font-semibold text-neutral-100 light:border-black/15 light:bg-white light:text-neutral-900"
                >
                  {tag}
                  <button type="button" onClick={() => removeTag(tag)} className="text-neutral-500 hover:text-rose-400">
                    ✕
                  </button>
                </span>
              ))}
              <input
                value={tagInput}
                onChange={(event) => setTagInput(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter') {
                    event.preventDefault();
                    addTag();
                  }
                }}
                onBlur={addTag}
                placeholder="+ tag"
                className="w-20 rounded-full border border-dashed border-white/25 bg-transparent px-2.5 py-1 text-xs text-neutral-300 outline-none placeholder:text-neutral-500 light:border-black/25 light:text-neutral-600"
              />
            </div>

            <textarea
              value={aiSummary}
              onChange={(event) => setAiSummary(event.target.value)}
              rows={2}
              placeholder="Resumo (aparece aqui depois de gerar com IA, mas pode escrever também)"
              className="w-full rounded-lg border border-white/10 bg-[#0d0d14] px-3 py-2 text-sm text-white outline-none light:border-black/10 light:bg-white light:text-neutral-900"
            />
          </div>

          {formError && (
            <div className="rounded-lg border border-rose-500/30 bg-rose-500/10 px-3.5 py-2.5 text-sm text-rose-300 light:text-rose-700">
              {formError}
            </div>
          )}
        </div>

        <div className="flex gap-2.5 border-t border-white/10 px-6 py-4 light:border-black/10">
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
            disabled={saving}
            className="flex-1 rounded-lg bg-gradient-to-r from-amber-400 to-amber-500 px-4 py-2.5 text-sm font-semibold text-neutral-950 shadow-lg shadow-amber-500/20 transition hover:from-amber-300 hover:to-amber-400 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {saving ? 'Salvando...' : 'Salvar conteúdo'}
          </button>
        </div>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-semibold text-neutral-300 light:text-neutral-600">{label}</label>
      {children}
    </div>
  );
}
