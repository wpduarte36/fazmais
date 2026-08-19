import { useState } from 'react';
import type { CatalogoSummary } from '@fazmais/shared';
import { ApiError } from '../../../lib/apiClient';
import { useCreateCatalogo, useUpdateCatalogo } from '../hooks/useCatalogos';

type ModalState = { mode: 'create' } | { mode: 'edit'; catalogo: CatalogoSummary };

interface CatalogoModalProps {
  state: ModalState;
  onClose: () => void;
}

const ICON_OPTIONS = ['📗', '🧮', '🔬', '🎨', '🌎', '⚽', '🎭', '💻'];

export function CatalogoModal({ state, onClose }: CatalogoModalProps) {
  const isEdit = state.mode === 'edit';
  const [name, setName] = useState(isEdit ? state.catalogo.name : '');
  const [icon, setIcon] = useState(isEdit ? state.catalogo.icon : ICON_OPTIONS[0]);
  const [formError, setFormError] = useState<string | null>(null);
  const createCatalogo = useCreateCatalogo();
  const updateCatalogo = useUpdateCatalogo();
  const pending = createCatalogo.isPending || updateCatalogo.isPending;

  function handleSave() {
    setFormError(null);
    if (!name.trim()) {
      setFormError('Informe o nome do catálogo.');
      return;
    }
    const onError = (err: unknown) => {
      setFormError(err instanceof ApiError ? err.message : 'Não foi possível salvar o catálogo.');
    };

    if (isEdit) {
      updateCatalogo.mutate({ id: state.catalogo.id, dto: { name, icon } }, { onSuccess: onClose, onError });
    } else {
      createCatalogo.mutate({ name, icon }, { onSuccess: onClose, onError });
    }
  }

  return (
    <div className="fixed inset-0 z-20 flex items-center justify-center bg-black/55 p-4 backdrop-blur-[2px] light:bg-black/25" onClick={onClose}>
      <div
        className="w-full max-w-[420px] rounded-2xl border border-white/15 bg-[#0d0d14] p-6 shadow-2xl light:border-black/10 light:bg-white"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="mb-5 flex items-start justify-between gap-4">
          <div>
            <p className="mb-1 text-[11px] font-bold uppercase tracking-wider text-amber-300 light:text-amber-700">
              {isEdit ? 'Editar catálogo' : 'Novo catálogo'}
            </p>
            <h3 className="text-lg font-bold text-neutral-100 light:text-neutral-900">
              {isEdit ? state.catalogo.name : 'Cadastrar catálogo'}
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

        <p className="mb-5 text-sm leading-relaxed text-neutral-400 light:text-neutral-500">
          Publicado pelo Master, fica disponível pra qualquer município ativar por opt-in.
        </p>

        <div className="flex flex-col gap-5">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="catalogo-name" className="text-xs font-semibold text-neutral-300 light:text-neutral-600">
              Nome do catálogo
            </label>
            <input
              id="catalogo-name"
              value={name}
              onChange={(event) => setName(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === 'Enter') handleSave();
              }}
              placeholder="Ex.: Educação Física"
              className="w-full rounded-lg border border-white/10 bg-white/5 px-3.5 py-2.5 text-sm text-white outline-none transition focus:border-amber-400/60 focus:bg-white/[0.07] focus:ring-2 focus:ring-amber-400/20 light:border-black/10 light:bg-black/[0.03] light:text-neutral-900 light:focus:bg-white"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-neutral-300 light:text-neutral-600">Ícone</label>
            <div className="flex flex-wrap gap-2">
              {ICON_OPTIONS.map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => setIcon(option)}
                  className={
                    option === icon
                      ? 'flex h-10 w-10 items-center justify-center rounded-lg border border-amber-400 bg-amber-400/15 text-lg shadow-[0_0_0_2px_rgba(251,191,36,0.25)]'
                      : 'flex h-10 w-10 items-center justify-center rounded-lg border border-white/15 bg-white/[0.03] text-lg transition hover:bg-white/[0.06] light:border-black/15 light:bg-black/[0.02] light:hover:bg-black/[0.05]'
                  }
                >
                  {option}
                </button>
              ))}
            </div>
          </div>

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
