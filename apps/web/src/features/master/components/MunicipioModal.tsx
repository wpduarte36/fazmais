import { useState } from 'react';
import { MARCA_PADRAO_SLUG, type TenantSummary } from '@fazmais/shared';
import { ApiError } from '../../../lib/apiClient';
import { useCreateTenant, useUpdateTenant } from '../hooks/useTenants';
import { useMarcas } from '../hooks/useMarcas';
import { AdminsPopup } from './AdminsPopup';

type ModalState = { mode: 'create' } | { mode: 'edit'; tenant: TenantSummary };

interface MunicipioModalProps {
  state: ModalState;
  onClose: () => void;
}

export function MunicipioModal({ state, onClose }: MunicipioModalProps) {
  const isEdit = state.mode === 'edit';
  const [name, setName] = useState(isEdit ? state.tenant.name : '');
  // '' = marca padrão (marcaId nulo)
  const [marcaId, setMarcaId] = useState(isEdit ? (state.tenant.marcaId ?? '') : '');
  const { data: marcas } = useMarcas();
  const [adminsOpen, setAdminsOpen] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const createTenant = useCreateTenant();
  const updateTenant = useUpdateTenant();
  const pending = createTenant.isPending || updateTenant.isPending;

  function handleSave() {
    setFormError(null);
    if (!name.trim()) {
      setFormError('Informe o nome do município.');
      return;
    }
    const onError = (err: unknown) => {
      setFormError(err instanceof ApiError ? err.message : 'Não foi possível salvar o município.');
    };

    if (isEdit) {
      updateTenant.mutate({ id: state.tenant.id, dto: { name, marcaId: marcaId || null } }, { onSuccess: onClose, onError });
    } else {
      createTenant.mutate({ name, marcaId: marcaId || null }, { onSuccess: onClose, onError });
    }
  }

  return (
    <>
      <div
        className="fixed inset-0 z-20 flex items-center justify-center bg-black/55 p-4 backdrop-blur-[2px] light:bg-black/25"
        onClick={onClose}
      >
        <div
          className="w-full max-w-[420px] rounded-2xl border border-white/15 bg-[#0d0d14] p-6 shadow-2xl light:border-black/10 light:bg-white"
          onClick={(event) => event.stopPropagation()}
        >
          <div className="mb-5 flex items-start justify-between gap-4">
            <div>
              <p className="mb-1 text-[11px] font-bold uppercase tracking-wider text-brand-300 light:text-brand-700">
                {isEdit ? 'Editar município' : 'Novo município'}
              </p>
              <h3 className="text-lg font-bold text-neutral-100 light:text-neutral-900">
                {isEdit ? state.tenant.name : 'Cadastrar município'}
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

          <div className="flex flex-col gap-5">
            <div className="flex flex-col gap-1.5">
              <label htmlFor="tenant-name" className="text-xs font-semibold text-neutral-300 light:text-neutral-600">
                Nome do município
              </label>
              <input
                id="tenant-name"
                value={name}
                onChange={(event) => setName(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter') handleSave();
                }}
                placeholder="Ex.: Presidente Prudente"
                className="w-full rounded-lg border border-white/10 bg-white/5 px-3.5 py-2.5 text-sm text-white outline-none transition focus:border-brand-400/60 focus:bg-white/[0.07] focus:ring-2 focus:ring-brand-400/20 light:border-black/10 light:bg-black/[0.03] light:text-neutral-900 light:focus:bg-white"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label htmlFor="tenant-marca" className="text-xs font-semibold text-neutral-300 light:text-neutral-600">
                Empresa
              </label>
              <select
                id="tenant-marca"
                value={marcaId}
                onChange={(event) => setMarcaId(event.target.value)}
                className="w-full rounded-lg border border-white/10 bg-white/5 px-3.5 py-2.5 text-sm text-white outline-none transition focus:border-brand-400/60 focus:ring-2 focus:ring-brand-400/20 light:border-black/10 light:bg-black/[0.03] light:text-neutral-900 [&>option]:bg-neutral-900 light:[&>option]:bg-white"
              >
                {marcas?.map((marca) => (
                  <option key={marca.id} value={marca.slug === MARCA_PADRAO_SLUG ? '' : marca.id}>
                    {marca.nomeExibicao}
                    {marca.slug === MARCA_PADRAO_SLUG ? ' (padrão)' : ''}
                  </option>
                ))}
              </select>
              <p className="text-xs text-neutral-500">
                Usada nos links de definir senha enviados aos usuários deste município. O visual de cada tela segue o
                endereço acessado.
              </p>
            </div>

            {formError && (
              <div className="rounded-lg border border-rose-500/30 bg-rose-500/10 px-3.5 py-2.5 text-sm text-rose-300 light:text-rose-700">
                {formError}
              </div>
            )}

            {isEdit ? (
              <div className="rounded-xl border border-white/10 bg-white/[0.035] p-4 light:border-black/10 light:bg-black/[0.02]">
                <div className="mb-3 flex items-center justify-between">
                  <h4 className="text-sm font-bold text-neutral-100 light:text-neutral-900">Administradores</h4>
                  <span className="rounded-full border border-white/10 bg-white/[0.05] px-2 py-0.5 text-xs font-semibold text-neutral-400 light:border-black/10 light:bg-black/[0.04] light:text-neutral-500">
                    {state.tenant.adminsCount}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setAdminsOpen(true)}
                  className="w-full rounded-lg border border-white/15 bg-white/[0.03] px-3 py-2 text-sm font-semibold text-neutral-100 transition hover:bg-white/[0.06] light:border-black/15 light:bg-black/[0.02] light:text-neutral-900 light:hover:bg-black/[0.05]"
                >
                  Ver administradores
                </button>
              </div>
            ) : (
              <div className="rounded-xl border border-white/10 bg-white/[0.035] p-4 text-sm leading-relaxed text-neutral-400 light:border-black/10 light:bg-black/[0.02] light:text-neutral-500">
                Salve o município primeiro. Depois de criado, volte aqui para vincular administradores.
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
              className="flex-1 rounded-lg bg-gradient-to-r from-brand-400 to-brand-500 px-4 py-2.5 text-sm font-semibold text-neutral-950 shadow-lg shadow-brand-500/20 transition hover:from-brand-300 hover:to-brand-400 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {pending ? 'Salvando...' : 'Salvar'}
            </button>
          </div>
        </div>
      </div>

      {isEdit && adminsOpen && (
        <AdminsPopup tenantId={state.tenant.id} tenantName={state.tenant.name} onClose={() => setAdminsOpen(false)} />
      )}
    </>
  );
}
