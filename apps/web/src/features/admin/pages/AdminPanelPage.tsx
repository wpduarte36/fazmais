import { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { AdminShell } from '../components/AdminShell';
import { UserStatsCards } from '../components/UserStatsCards';
import { UsuariosTab } from '../components/UsuariosTab';
import { AcervoTab } from '../components/AcervoTab';

type AdminTab = 'acervo' | 'usuarios';

export function AdminPanelPage() {
  const location = useLocation();
  const initialTab = (location.state as { tab?: AdminTab } | null)?.tab ?? 'usuarios';
  const [tab, setTab] = useState<AdminTab>(initialTab);

  return (
    <AdminShell>
      <div className="mb-6">
        <h1 className="text-xl font-bold tracking-tight">Painel Admin</h1>
        <p className="text-sm text-neutral-400 light:text-neutral-600">
          Gestão do acervo e dos usuários do seu município.
        </p>
      </div>

      <div className="mb-6 inline-flex gap-1 rounded-full border border-white/15 bg-white/[0.03] p-1 light:border-black/10 light:bg-black/[0.03]">
        <button
          type="button"
          onClick={() => setTab('acervo')}
          className={
            tab === 'acervo'
              ? 'rounded-full bg-gradient-to-r from-amber-400 to-amber-500 px-4 py-1.5 text-sm font-semibold text-neutral-950'
              : 'rounded-full px-4 py-1.5 text-sm font-semibold text-neutral-400 transition hover:text-neutral-100 light:text-neutral-500 light:hover:text-neutral-900'
          }
        >
          Acervo
        </button>
        <button
          type="button"
          onClick={() => setTab('usuarios')}
          className={
            tab === 'usuarios'
              ? 'rounded-full bg-gradient-to-r from-amber-400 to-amber-500 px-4 py-1.5 text-sm font-semibold text-neutral-950'
              : 'rounded-full px-4 py-1.5 text-sm font-semibold text-neutral-400 transition hover:text-neutral-100 light:text-neutral-500 light:hover:text-neutral-900'
          }
        >
          Usuários
        </button>
      </div>

      {tab === 'acervo' && <AcervoTab />}

      {tab === 'usuarios' && (
        <>
          <UserStatsCards />
          <UsuariosTab />
        </>
      )}
    </AdminShell>
  );
}
