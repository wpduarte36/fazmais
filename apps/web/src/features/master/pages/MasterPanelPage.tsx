import { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { MasterShell } from '../components/MasterShell';
import { MunicipiosTab } from '../components/MunicipiosTab';
import { CatalogosTab } from '../components/CatalogosTab';

type MasterTab = 'municipios' | 'catalogos';

export function MasterPanelPage() {
  const location = useLocation();
  const initialTab = (location.state as { tab?: MasterTab } | null)?.tab ?? 'municipios';
  const [tab, setTab] = useState<MasterTab>(initialTab);

  return (
    <MasterShell>
      <div className="mb-6">
        <h1 className="text-xl font-bold tracking-tight">Painel Master</h1>
        <p className="text-sm text-neutral-400 light:text-neutral-600">
          Visão global da plataforma: municípios e catálogos compartilhados.
        </p>
      </div>

      <div className="mb-6 inline-flex gap-1 rounded-full border border-white/15 bg-white/[0.03] p-1 light:border-black/10 light:bg-black/[0.03]">
        <button
          type="button"
          onClick={() => setTab('municipios')}
          className={
            tab === 'municipios'
              ? 'rounded-full bg-gradient-to-r from-amber-400 to-amber-500 px-4 py-1.5 text-sm font-semibold text-neutral-950'
              : 'rounded-full px-4 py-1.5 text-sm font-semibold text-neutral-400 transition hover:text-neutral-100 light:text-neutral-500 light:hover:text-neutral-900'
          }
        >
          Municípios
        </button>
        <button
          type="button"
          onClick={() => setTab('catalogos')}
          className={
            tab === 'catalogos'
              ? 'rounded-full bg-gradient-to-r from-amber-400 to-amber-500 px-4 py-1.5 text-sm font-semibold text-neutral-950'
              : 'rounded-full px-4 py-1.5 text-sm font-semibold text-neutral-400 transition hover:text-neutral-100 light:text-neutral-500 light:hover:text-neutral-900'
          }
        >
          Catálogos
        </button>
      </div>

      {tab === 'municipios' && <MunicipiosTab />}
      {tab === 'catalogos' && <CatalogosTab />}
    </MasterShell>
  );
}
