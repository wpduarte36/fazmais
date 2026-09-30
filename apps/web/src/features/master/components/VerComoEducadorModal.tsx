import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTenants } from '../hooks/useTenants';
import { usePlanos } from '../hooks/usePlanos';

interface VerComoEducadorModalProps {
  onClose: () => void;
  // Já vem escolhido quando aberto de dentro do "Acessar como admin".
  tenantIdInicial?: string;
}

const selectClassName =
  'w-full rounded-lg border border-white/10 bg-white/5 px-3.5 py-2.5 text-sm text-white outline-none transition focus:border-amber-400/60 focus:bg-white/[0.07] focus:ring-2 focus:ring-amber-400/20 light:border-black/10 light:bg-black/[0.03] light:text-neutral-900 light:focus:bg-white [&_option]:text-neutral-900';

// Master não tem município nem plano: pra ver a plataforma como educador ele
// escolhe os dois aqui, e a Home abre com ?tenant=&plano= (ver HomePage).
export function VerComoEducadorModal({ onClose, tenantIdInicial }: VerComoEducadorModalProps) {
  const navigate = useNavigate();
  const { data: tenants, isLoading: loadingTenants } = useTenants();
  const { data: planos, isLoading: loadingPlanos } = usePlanos();
  const [tenantId, setTenantId] = useState(tenantIdInicial ?? '');
  const [planoId, setPlanoId] = useState('');

  // Defaults: primeiro município da lista e o plano mais alto (vê tudo).
  useEffect(() => {
    if (!tenantId && tenants && tenants.length > 0) setTenantId(tenants[0].id);
  }, [tenants, tenantId]);
  useEffect(() => {
    if (!planoId && planos && planos.length > 0) {
      const maisAlto = [...planos].sort((a, b) => b.level - a.level)[0];
      setPlanoId(maisAlto.id);
    }
  }, [planos, planoId]);

  const planosOrdenados = [...(planos ?? [])].sort((a, b) => a.level - b.level);
  const semMunicipios = !loadingTenants && (tenants?.length ?? 0) === 0;

  function abrir() {
    if (!tenantId || !planoId) return;
    navigate(`/?${new URLSearchParams({ tenant: tenantId, plano: planoId }).toString()}`);
  }

  return (
    <div className="fixed inset-0 z-30 flex items-center justify-center bg-black/55 p-4 backdrop-blur-[2px] light:bg-black/25" onClick={onClose}>
      <div
        className="flex w-full max-w-[400px] flex-col rounded-2xl border border-white/15 bg-[#0d0d14] shadow-2xl light:border-black/10 light:bg-white"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4 px-6 pt-6">
          <div>
            <p className="mb-1 text-[11px] font-bold uppercase tracking-wider text-amber-300 light:text-amber-700">Visão do educador</p>
            <h3 className="text-lg font-bold text-neutral-100 light:text-neutral-900">Ver como educador</h3>
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
            Veja a plataforma exatamente como um educador desse município e plano vê. É só visualização: nada que
            você fizer lá fica salvo.
          </p>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="visao-municipio" className="text-xs font-medium text-neutral-300 light:text-neutral-600">
              Município
            </label>
            <select
              id="visao-municipio"
              value={tenantId}
              onChange={(event) => setTenantId(event.target.value)}
              disabled={loadingTenants || semMunicipios}
              className={selectClassName}
            >
              {loadingTenants && <option value="">Carregando...</option>}
              {semMunicipios && <option value="">Nenhum município cadastrado</option>}
              {tenants?.map((tenant) => (
                <option key={tenant.id} value={tenant.id}>
                  {tenant.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="visao-plano" className="text-xs font-medium text-neutral-300 light:text-neutral-600">
              Plano
            </label>
            <select
              id="visao-plano"
              value={planoId}
              onChange={(event) => setPlanoId(event.target.value)}
              disabled={loadingPlanos}
              className={selectClassName}
            >
              {loadingPlanos && <option value="">Carregando...</option>}
              {planosOrdenados.map((plano) => (
                <option key={plano.id} value={plano.id}>
                  {plano.name}
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
            disabled={!tenantId || !planoId}
            className="flex-1 rounded-lg bg-gradient-to-r from-amber-400 to-amber-500 px-4 py-2.5 text-sm font-semibold text-neutral-950 shadow-lg shadow-amber-500/20 transition hover:from-amber-300 hover:to-amber-400 disabled:cursor-not-allowed disabled:opacity-60"
          >
            Abrir
          </button>
        </div>
      </div>
    </div>
  );
}
