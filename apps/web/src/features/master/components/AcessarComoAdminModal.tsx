import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTenants } from '../hooks/useTenants';

interface AcessarComoAdminModalProps {
  onClose: () => void;
}

// Escolha do município pra "Área do Admin" a partir do nome no header
// (a aba Municípios tem o mesmo atalho por linha). Abre /admin?tenant=.
export function AcessarComoAdminModal({ onClose }: AcessarComoAdminModalProps) {
  const navigate = useNavigate();
  const { data: tenants, isLoading } = useTenants();
  const [tenantId, setTenantId] = useState('');

  useEffect(() => {
    if (!tenantId && tenants && tenants.length > 0) setTenantId(tenants[0].id);
  }, [tenants, tenantId]);

  const semMunicipios = !isLoading && (tenants?.length ?? 0) === 0;

  function abrir() {
    if (!tenantId) return;
    navigate(`/admin?${new URLSearchParams({ tenant: tenantId }).toString()}`);
  }

  return (
    <div className="fixed inset-0 z-30 flex items-center justify-center bg-black/55 p-4 backdrop-blur-[2px] light:bg-black/25" onClick={onClose}>
      <div
        className="flex w-full max-w-[400px] flex-col rounded-2xl border border-white/15 bg-[#0d0d14] shadow-2xl light:border-black/10 light:bg-white"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4 px-6 pt-6">
          <div>
            <p className="mb-1 text-[11px] font-bold uppercase tracking-wider text-amber-300 light:text-amber-700">Painel Master</p>
            <h3 className="text-lg font-bold text-neutral-100 light:text-neutral-900">Área do Admin</h3>
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

        <div className="flex flex-col gap-4 px-6 py-4">
          <p className="text-sm leading-relaxed text-neutral-400 light:text-neutral-500">
            Abre o Painel Admin do município escolhido. Você gerencia o município como o admin dele: o que mudar lá vale de verdade e fica registrado na auditoria.
          </p>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="admin-municipio" className="text-xs font-medium text-neutral-300 light:text-neutral-600">
              Município
            </label>
            <select
              id="admin-municipio"
              value={tenantId}
              onChange={(event) => setTenantId(event.target.value)}
              disabled={isLoading || semMunicipios}
              className="w-full rounded-lg border border-white/10 bg-white/5 px-3.5 py-2.5 text-sm text-white outline-none transition focus:border-amber-400/60 focus:bg-white/[0.07] focus:ring-2 focus:ring-amber-400/20 light:border-black/10 light:bg-black/[0.03] light:text-neutral-900 light:focus:bg-white [&_option]:text-neutral-900"
            >
              {isLoading && <option value="">Carregando...</option>}
              {semMunicipios && <option value="">Nenhum município cadastrado</option>}
              {tenants?.map((tenant) => (
                <option key={tenant.id} value={tenant.id}>
                  {tenant.name}
                </option>
              ))}
            </select>
          </div>
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
            onClick={abrir}
            disabled={!tenantId}
            className="flex-1 rounded-lg bg-gradient-to-r from-amber-400 to-amber-500 px-4 py-2.5 text-sm font-semibold text-neutral-950 shadow-lg shadow-amber-500/20 transition hover:from-amber-300 hover:to-amber-400 disabled:cursor-not-allowed disabled:opacity-60"
          >
            Abrir
          </button>
        </div>
      </div>
    </div>
  );
}
