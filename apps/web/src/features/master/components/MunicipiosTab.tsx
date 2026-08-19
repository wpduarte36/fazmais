import { useState } from 'react';
import type { TenantSummary } from '@fazmais/shared';
import { ApiError } from '../../../lib/apiClient';
import { useDeleteTenant, useTenants } from '../hooks/useTenants';
import { MunicipioModal } from './MunicipioModal';

type ModalState = { mode: 'create' } | { mode: 'edit'; tenant: TenantSummary } | null;

const dateFormatter = new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });

export function MunicipiosTab() {
  const { data: tenants, isLoading, error } = useTenants();
  const deleteTenant = useDeleteTenant();
  const [modal, setModal] = useState<ModalState>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  function handleDelete(tenant: TenantSummary) {
    setDeleteError(null);
    if (!window.confirm(`Excluir o município "${tenant.name}"? Essa ação não pode ser desfeita.`)) {
      return;
    }
    deleteTenant.mutate(tenant.id, {
      onError: (err) => {
        setDeleteError(err instanceof ApiError ? err.message : 'Não foi possível excluir o município.');
      },
    });
  }

  return (
    <div>
      <div className="mb-3.5 flex items-center justify-between gap-3">
        <div className="flex items-baseline gap-2">
          <h2 className="text-sm font-bold">Municípios</h2>
          <span className="rounded-full border border-white/10 bg-white/[0.05] px-2 py-0.5 text-xs font-semibold text-neutral-400 light:border-black/10 light:bg-black/[0.04] light:text-neutral-500">
            {tenants?.length ?? 0}
          </span>
        </div>
        <button
          type="button"
          onClick={() => setModal({ mode: 'create' })}
          className="inline-flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-amber-400 to-amber-500 px-3.5 py-2 text-sm font-semibold text-neutral-950 shadow-lg shadow-amber-500/20 transition hover:from-amber-300 hover:to-amber-400"
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round">
            <path d="M12 5v14M5 12h14" />
          </svg>
          Novo município
        </button>
      </div>

      {deleteError && (
        <div className="mb-3 rounded-lg border border-rose-500/30 bg-rose-500/10 px-3.5 py-2.5 text-sm text-rose-300 light:text-rose-700">
          {deleteError}
        </div>
      )}

      <div className="overflow-hidden rounded-xl border border-white/10 bg-white/[0.035] light:border-black/10 light:bg-white">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[560px] border-collapse text-sm">
            <thead>
              <tr>
                <th className="border-b border-white/10 px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-neutral-500 light:border-black/10">
                  Nome
                </th>
                <th className="border-b border-white/10 px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-neutral-500 light:border-black/10">
                  Admins
                </th>
                <th className="border-b border-white/10 px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-neutral-500 light:border-black/10">
                  Usuários
                </th>
                <th className="border-b border-white/10 px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-neutral-500 light:border-black/10">
                  Criado em
                </th>
                <th className="border-b border-white/10 px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-neutral-500 light:border-black/10">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody>
              {isLoading && (
                <tr>
                  <td colSpan={5} className="px-4 py-6 text-center text-neutral-500">
                    Carregando...
                  </td>
                </tr>
              )}
              {error && (
                <tr>
                  <td colSpan={5} className="px-4 py-6 text-center text-rose-300 light:text-rose-700">
                    Não foi possível carregar os municípios.
                  </td>
                </tr>
              )}
              {!isLoading && tenants?.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-6 text-center text-neutral-500">
                    Nenhum município cadastrado ainda.
                  </td>
                </tr>
              )}
              {tenants?.map((tenant) => (
                <tr
                  key={tenant.id}
                  onClick={() => setModal({ mode: 'edit', tenant })}
                  className="cursor-pointer border-b border-white/10 last:border-b-0 hover:bg-white/[0.02] light:border-black/10 light:hover:bg-black/[0.02]"
                >
                  <td className="px-4 py-3 font-semibold">{tenant.name}</td>
                  <td className="px-4 py-3 tabular-nums text-neutral-400">{tenant.adminsCount}</td>
                  <td className="px-4 py-3 tabular-nums text-neutral-400">{tenant.usersCount}</td>
                  <td className="px-4 py-3 text-neutral-400">{dateFormatter.format(new Date(tenant.createdAt))}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1.5" onClick={(event) => event.stopPropagation()}>
                      <button
                        type="button"
                        onClick={() => setModal({ mode: 'edit', tenant })}
                        aria-label="Editar"
                        className="flex h-7 w-7 items-center justify-center rounded-md border border-white/10 text-neutral-400 transition hover:bg-white/[0.05] hover:text-neutral-100 light:border-black/10 light:hover:bg-black/[0.05] light:hover:text-neutral-900"
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                          <path d="M12 20h9" />
                          <path d="M16.5 3.5a2.12 2.12 0 013 3L7 19l-4 1 1-4 12.5-12.5z" />
                        </svg>
                      </button>
                      <button
                        type="button"
                        disabled={tenant.usersCount > 0}
                        title={tenant.usersCount > 0 ? 'Bloqueado: há usuários vinculados' : 'Excluir'}
                        onClick={() => handleDelete(tenant)}
                        aria-label="Excluir"
                        className="flex h-7 w-7 items-center justify-center rounded-md border border-white/10 text-neutral-400 transition hover:bg-rose-500/10 hover:text-rose-300 disabled:cursor-not-allowed disabled:opacity-35 disabled:hover:bg-transparent disabled:hover:text-neutral-400 light:border-black/10"
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                          <path d="M3 6h18M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2m3 0l-1 14a2 2 0 01-2 2H7a2 2 0 01-2-2L4 6" />
                        </svg>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <p className="mt-2.5 flex items-center gap-1.5 text-xs text-neutral-500">
        Excluir fica bloqueado quando o município tem usuários vinculados. Clique numa linha (ou no lápis) pra editar.
      </p>

      {modal && <MunicipioModal state={modal} onClose={() => setModal(null)} />}
    </div>
  );
}
