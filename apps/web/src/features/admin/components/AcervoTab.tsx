import { useState } from 'react';
import type { CatalogoDisponivel } from '@fazmais/shared';
import { ApiError } from '../../../lib/apiClient';
import { useAtivarCatalogo, useDesativarCatalogo, useTenantCatalogos } from '../hooks/useTenantCatalogos';

export function AcervoTab() {
  const { data: catalogos, isLoading } = useTenantCatalogos();
  const ativar = useAtivarCatalogo();
  const desativar = useDesativarCatalogo();
  const [error, setError] = useState<string | null>(null);
  const [pendingId, setPendingId] = useState<string | null>(null);

  function handleToggle(catalogo: CatalogoDisponivel) {
    setError(null);
    setPendingId(catalogo.id);
    const mutation = catalogo.ativo ? desativar : ativar;
    mutation.mutate(catalogo.id, {
      onError: (err) =>
        setError(err instanceof ApiError ? err.message : 'Não foi possível atualizar o catálogo.'),
      onSettled: () => setPendingId(null),
    });
  }

  return (
    <div>
      <p className="mb-4 text-sm text-neutral-400 light:text-neutral-600">
        Catálogos disponíveis, montados pelo Painel Master. Ative os que devem aparecer pros professores do seu
        município.
      </p>

      {error && (
        <div className="mb-3 rounded-lg border border-rose-500/30 bg-rose-500/10 px-3.5 py-2.5 text-sm text-rose-300 light:text-rose-700">
          {error}
        </div>
      )}

      {isLoading && <p className="text-sm text-neutral-500">Carregando...</p>}

      {catalogos && catalogos.length === 0 && (
        <div className="rounded-xl border border-white/10 bg-white/[0.035] px-6 py-14 text-center light:border-black/10 light:bg-white">
          <p className="text-sm text-neutral-500">Nenhum catálogo disponível ainda.</p>
        </div>
      )}

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {catalogos?.map((catalogo) => (
          <div
            key={catalogo.id}
            className="rounded-xl border border-white/10 bg-white/[0.035] p-4 light:border-black/10 light:bg-white"
          >
            <div className="mb-3 flex items-start justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white/[0.06] text-lg light:bg-black/[0.04]">
                  {catalogo.icon}
                </span>
                <div>
                  <p className="text-sm font-semibold text-neutral-100 light:text-neutral-900">{catalogo.name}</p>
                  <p className="text-xs text-neutral-500">
                    {catalogo.eixosCount} eixos · {catalogo.colecoesCount} coleções · {catalogo.conteudosCount}{' '}
                    conteúdos
                  </p>
                </div>
              </div>
              <ToggleSwitch
                checked={catalogo.ativo}
                disabled={pendingId === catalogo.id}
                onChange={() => handleToggle(catalogo)}
                label={`${catalogo.ativo ? 'Desativar' : 'Ativar'} ${catalogo.name}`}
              />
            </div>
            <span
              className={
                catalogo.ativo
                  ? 'inline-flex rounded-full border border-emerald-400/30 bg-emerald-400/10 px-2.5 py-1 text-xs font-semibold text-emerald-400 light:text-emerald-700'
                  : 'inline-flex rounded-full border border-white/15 bg-white/[0.04] px-2.5 py-1 text-xs font-semibold text-neutral-400 light:border-black/15 light:bg-black/[0.03] light:text-neutral-500'
              }
            >
              {catalogo.ativo ? 'Ativo pro seu município' : 'Inativo'}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function ToggleSwitch({
  checked,
  disabled,
  onChange,
  label,
}: {
  checked: boolean;
  disabled: boolean;
  onChange: () => void;
  label: string;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      disabled={disabled}
      onClick={onChange}
      className={`relative h-6 w-11 shrink-0 rounded-full border transition disabled:cursor-not-allowed disabled:opacity-60 ${
        checked
          ? 'border-amber-400/60 bg-gradient-to-r from-amber-400 to-amber-500'
          : 'border-white/15 bg-white/[0.08] light:border-black/15 light:bg-black/[0.08]'
      }`}
    >
      <span
        className={`absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${
          checked ? 'translate-x-5' : 'translate-x-0'
        }`}
      />
    </button>
  );
}
