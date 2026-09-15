import { useState } from 'react';
import { ApiError } from '../../../lib/apiClient';
import { RichTextEditor } from '../../../components/RichTextEditor';

interface NameOnlyModalProps {
  eyebrow: string;
  title: string;
  lede: string;
  placeholder: string;
  initialName?: string;
  showDescription?: boolean;
  initialDescription?: string;
  descriptionPlaceholder?: string;
  pending: boolean;
  onSave: (name: string, description?: string) => void;
  onClose: () => void;
}

export function NameOnlyModal({
  eyebrow,
  title,
  lede,
  placeholder,
  initialName = '',
  showDescription = false,
  initialDescription = '',
  descriptionPlaceholder,
  pending,
  onSave,
  onClose,
}: NameOnlyModalProps) {
  const [name, setName] = useState(initialName);
  const [description, setDescription] = useState(initialDescription);
  const [error, setError] = useState<string | null>(null);

  function handleSave() {
    setError(null);
    if (!name.trim()) {
      setError('Informe um nome.');
      return;
    }
    try {
      onSave(name, showDescription ? description : undefined);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Não foi possível salvar.');
    }
  }

  return (
    <div className="fixed inset-0 z-30 flex items-center justify-center bg-black/55 p-4 backdrop-blur-[2px] light:bg-black/25" onClick={onClose}>
      <div
        className={`flex max-h-[88vh] w-full flex-col rounded-2xl border border-white/15 bg-[#0d0d14] shadow-2xl light:border-black/10 light:bg-white ${showDescription ? 'max-w-2xl' : 'max-w-[400px]'}`}
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4 px-6 pt-6">
          <div>
            <p className="mb-1 text-[11px] font-bold uppercase tracking-wider text-amber-300 light:text-amber-700">{eyebrow}</p>
            <h3 className="text-lg font-bold text-neutral-100 light:text-neutral-900">{title}</h3>
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
          <p className="mb-4 text-sm leading-relaxed text-neutral-400 light:text-neutral-500">{lede}</p>

          <input
            value={name}
            onChange={(event) => setName(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Enter') handleSave();
            }}
            placeholder={placeholder}
            autoFocus
            className="w-full rounded-lg border border-white/10 bg-white/5 px-3.5 py-2.5 text-sm text-white outline-none transition focus:border-amber-400/60 focus:bg-white/[0.07] focus:ring-2 focus:ring-amber-400/20 light:border-black/10 light:bg-black/[0.03] light:text-neutral-900 light:focus:bg-white"
          />

          {showDescription && (
            <div className="mt-3">
              <RichTextEditor value={description} onChange={setDescription} placeholder={descriptionPlaceholder} />
            </div>
          )}

          {error && <p className="mt-3 text-sm text-rose-300 light:text-rose-700">{error}</p>}
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
            disabled={pending}
            className="flex-1 rounded-lg bg-gradient-to-r from-amber-400 to-amber-500 px-4 py-2.5 text-sm font-semibold text-neutral-950 shadow-lg shadow-amber-500/20 transition hover:from-amber-300 hover:to-amber-400 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {pending ? 'Salvando...' : 'Salvar'}
          </button>
        </div>
      </div>
    </div>
  );
}
