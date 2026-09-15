import { useRef, useState } from 'react';
import type { ConteudoSummary, CreateConteudoRequest, MediaType, UpdateConteudoRequest } from '@fazmais/shared';
import { RichTextEditor } from '../../../components/RichTextEditor';
import { usePlanos } from '../hooks/usePlanos';
import { useAiSuggest, useUploadImage, useUploadPdf } from '../hooks/useCatalogoBuilder';

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
  const uploadImage = useUploadImage();
  const uploadPdf = useUploadPdf();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const bannerFileInputRef = useRef<HTMLInputElement>(null);
  const pdfInputRef = useRef<HTMLInputElement>(null);

  const [title, setTitle] = useState(conteudo?.title ?? '');
  const [description, setDescription] = useState(conteudo?.description ?? '');
  const [mediaType, setMediaType] = useState<MediaType>(conteudo?.mediaType ?? 'VIDEO');
  const [mediaUrl, setMediaUrl] = useState(conteudo?.mediaUrl ?? '');
  const [htmlContent, setHtmlContent] = useState(conteudo?.htmlContent ?? '');
  const [imageUrl, setImageUrl] = useState(conteudo?.imageUrl ?? '');
  const [bannerImageUrl, setBannerImageUrl] = useState(conteudo?.bannerImageUrl ?? '');
  const [isFeatured, setIsFeatured] = useState(conteudo?.isFeatured ?? false);
  const [planoMinimoId, setPlanoMinimoId] = useState<string | null>(conteudo?.planoMinimoId ?? null);
  const [tags, setTags] = useState<string[]>(conteudo?.tags ?? []);
  const [tagInput, setTagInput] = useState('');
  const [aiSummary, setAiSummary] = useState(conteudo?.aiSummary ?? '');
  const [formError, setFormError] = useState<string | null>(null);

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

  function handleFileSelected(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = ''; // permite selecionar o mesmo arquivo de novo depois
    if (!file) return;
    setFormError(null);
    uploadImage.mutate(file, {
      onSuccess: (result) => setImageUrl(result.url),
      onError: (error) => setFormError(error instanceof Error ? error.message : 'Não foi possível enviar a imagem'),
    });
  }

  function handleBannerFileSelected(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;
    setFormError(null);
    uploadImage.mutate(file, {
      onSuccess: (result) => setBannerImageUrl(result.url),
      onError: (error) => setFormError(error instanceof Error ? error.message : 'Não foi possível enviar a imagem'),
    });
  }

  function handlePdfSelected(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;
    setFormError(null);
    uploadPdf.mutate(file, {
      onSuccess: (result) => setMediaUrl(result.url),
      onError: (error) => setFormError(error instanceof Error ? error.message : 'Não foi possível enviar o PDF'),
    });
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
      bannerImageUrl: bannerImageUrl.trim() || undefined,
      isFeatured,
      tags,
      planoMinimoId,
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
              <RichTextEditor value={htmlContent} onChange={setHtmlContent} placeholder="Texto do artigo" />
            </Field>
          ) : mediaType === 'PDF' ? (
            <Field label="Arquivo PDF">
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => pdfInputRef.current?.click()}
                    disabled={uploadPdf.isPending}
                    className="rounded-lg border border-white/15 bg-white/[0.04] px-3.5 py-2 text-sm font-semibold text-neutral-100 transition hover:bg-white/[0.08] disabled:cursor-wait disabled:opacity-60 light:border-black/15 light:bg-black/[0.02] light:text-neutral-900"
                  >
                    {uploadPdf.isPending ? 'Enviando...' : 'Selecionar PDF'}
                  </button>
                  <input ref={pdfInputRef} type="file" accept="application/pdf" onChange={handlePdfSelected} className="hidden" />
                  {mediaUrl && (
                    <span className="truncate text-xs text-neutral-400 light:text-neutral-500" title={mediaUrl}>
                      📄 {mediaUrl.split('/').pop()}
                    </span>
                  )}
                </div>
                <input
                  value={mediaUrl}
                  onChange={(event) => setMediaUrl(event.target.value)}
                  placeholder="ou cole uma URL: https://..."
                  className="w-full rounded-lg border border-white/10 bg-white/5 px-3.5 py-2 text-xs text-white outline-none transition focus:border-amber-400/60 focus:ring-2 focus:ring-amber-400/20 light:border-black/10 light:bg-black/[0.03] light:text-neutral-900"
                />
              </div>
            </Field>
          ) : (
            <Field label="URL da mídia (Vimeo)">
              <input
                value={mediaUrl}
                onChange={(event) => setMediaUrl(event.target.value)}
                placeholder="https://..."
                className="w-full rounded-lg border border-white/10 bg-white/5 px-3.5 py-2.5 text-sm text-white outline-none transition focus:border-amber-400/60 focus:ring-2 focus:ring-amber-400/20 light:border-black/10 light:bg-black/[0.03] light:text-neutral-900"
              />
            </Field>
          )}

          <Field label="Imagem de capa">
            <div className="flex items-center gap-4">
              <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-white/10 bg-white/5 light:border-black/10 light:bg-black/[0.03]">
                {imageUrl ? (
                  <img src={imageUrl} alt="" className="h-full w-full object-cover" />
                ) : (
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-neutral-500">
                    <rect x="3" y="5" width="18" height="14" rx="2" />
                    <circle cx="8.5" cy="10" r="1.5" />
                    <path d="m3 16 5-4 4 3 3-2 6 5" />
                  </svg>
                )}
              </div>
              <div className="flex flex-1 flex-col gap-2">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploadImage.isPending}
                    className="rounded-lg border border-white/15 bg-white/[0.04] px-3.5 py-2 text-sm font-semibold text-neutral-100 transition hover:bg-white/[0.08] disabled:cursor-wait disabled:opacity-60 light:border-black/15 light:bg-black/[0.02] light:text-neutral-900"
                  >
                    {uploadImage.isPending ? 'Enviando...' : 'Selecionar foto'}
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={handleFileSelected}
                    className="hidden"
                  />
                  <span className="text-xs text-neutral-500">JPEG, PNG ou WebP, até 10 MB</span>
                </div>
                <input
                  value={imageUrl}
                  onChange={(event) => setImageUrl(event.target.value)}
                  placeholder="ou cole uma URL: https://..."
                  className="w-full rounded-lg border border-white/10 bg-white/5 px-3.5 py-2 text-xs text-white outline-none transition focus:border-amber-400/60 focus:ring-2 focus:ring-amber-400/20 light:border-black/10 light:bg-black/[0.03] light:text-neutral-900"
                />
              </div>
            </div>
          </Field>

          <Field label="Imagem para banner (opcional)">
            <div className="flex items-center gap-4">
              <div className="flex h-20 w-32 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-white/10 bg-white/5 light:border-black/10 light:bg-black/[0.03]">
                {bannerImageUrl ? (
                  <img src={bannerImageUrl} alt="" className="h-full w-full object-cover" />
                ) : (
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-neutral-500">
                    <rect x="3" y="5" width="18" height="14" rx="2" />
                    <circle cx="8.5" cy="10" r="1.5" />
                    <path d="m3 16 5-4 4 3 3-2 6 5" />
                  </svg>
                )}
              </div>
              <div className="flex flex-1 flex-col gap-2">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => bannerFileInputRef.current?.click()}
                    disabled={uploadImage.isPending}
                    className="rounded-lg border border-white/15 bg-white/[0.04] px-3.5 py-2 text-sm font-semibold text-neutral-100 transition hover:bg-white/[0.08] disabled:cursor-wait disabled:opacity-60 light:border-black/15 light:bg-black/[0.02] light:text-neutral-900"
                  >
                    {uploadImage.isPending ? 'Enviando...' : 'Selecionar foto'}
                  </button>
                  <input
                    ref={bannerFileInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={handleBannerFileSelected}
                    className="hidden"
                  />
                  <span className="text-xs text-neutral-500">Formato mais largo, usado no hero de destaque</span>
                </div>
                <input
                  value={bannerImageUrl}
                  onChange={(event) => setBannerImageUrl(event.target.value)}
                  placeholder="ou cole uma URL: https://... — vazio usa a imagem de capa"
                  className="w-full rounded-lg border border-white/10 bg-white/5 px-3.5 py-2 text-xs text-white outline-none transition focus:border-amber-400/60 focus:ring-2 focus:ring-amber-400/20 light:border-black/10 light:bg-black/[0.03] light:text-neutral-900"
                />
              </div>
            </div>
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

          <Field label="Plano mínimo">
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setPlanoMinimoId(null)}
                className={
                  planoMinimoId === null
                    ? 'rounded-full border border-amber-400/50 bg-amber-400/15 px-3.5 py-1.5 text-sm font-semibold text-amber-300 light:text-amber-700'
                    : 'rounded-full border border-white/15 bg-white/[0.03] px-3.5 py-1.5 text-sm font-semibold text-neutral-400 light:border-black/15 light:bg-black/[0.02] light:text-neutral-500'
                }
              >
                Sem plano (rascunho)
              </button>
              {planos?.map((plano) => (
                <button
                  key={plano.id}
                  type="button"
                  onClick={() => setPlanoMinimoId(plano.id)}
                  className={
                    planoMinimoId === plano.id
                      ? 'rounded-full border border-amber-400/50 bg-amber-400/15 px-3.5 py-1.5 text-sm font-semibold text-amber-300 light:text-amber-700'
                      : 'rounded-full border border-white/15 bg-white/[0.03] px-3.5 py-1.5 text-sm font-semibold text-neutral-400 light:border-black/15 light:bg-black/[0.02] light:text-neutral-500'
                  }
                >
                  {plano.name}
                </button>
              ))}
            </div>
            <p className="mt-1 text-xs text-neutral-500">
              Visível pra quem tem esse plano ou um superior (ex.: marcar "Prata" também libera pra quem é Ouro). "Sem plano" deixa como
              rascunho, invisível pra qualquer professor.
            </p>
          </Field>

          <div className="rounded-xl border border-violet-400/30 bg-violet-400/10 p-4 light:border-violet-600/25 light:bg-violet-600/5">
            <div className="mb-2 flex items-center justify-between gap-3">
              <span className="text-sm font-bold text-violet-300 light:text-violet-700">✨ Informações para IA</span>
              <button
                type="button"
                onClick={runAiSuggest}
                disabled={aiSuggest.isPending}
                className="rounded-lg bg-gradient-to-r from-violet-400 to-violet-600 px-3 py-1.5 text-xs font-semibold text-white disabled:cursor-wait disabled:opacity-70"
              >
                {aiSuggest.isPending ? 'Gerando...' : 'Gerar tags e texto'}
              </button>
            </div>
            <p className="mb-3 text-xs text-neutral-400 light:text-neutral-500">
              Preencha as tags e o resumo abaixo você mesmo, do jeito que preferir. O botão "Gerar tags e texto" é só uma opção pra
              começar mais rápido, a partir do título + descrição — nunca é obrigatório usar.
            </p>
            <p className="mb-3 text-xs text-neutral-400 light:text-neutral-500">
              É por título, descrição, tags e resumo que o chat de IA do professor (Fabinho) encontra e entende esse conteúdo quando
              alguém pergunta algo relacionado — quanto mais completos e relevantes, maior a chance de aparecer numa resposta.
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
