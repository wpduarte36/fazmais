import { useState, type ReactNode } from 'react';
import { useAuthStore } from '../../../store/authStore';
import { useLogout } from '../../auth/hooks/useLogout';
import { ThemeToggle } from '../../../components/ThemeToggle';
import { FazMaisLegacyLogo } from '../../../components/FazMaisLegacyLogo';
import { VerComoEducadorModal } from './VerComoEducadorModal';
import { AcessarComoAdminModal } from './AcessarComoAdminModal';

interface MasterShellProps {
  children: ReactNode;
  maxWidthClassName?: string;
}

export function MasterShell({ children, maxWidthClassName = 'max-w-5xl' }: MasterShellProps) {
  const user = useAuthStore((state) => state.user);
  const handleLogout = useLogout();
  const [verComoEducadorAberto, setVerComoEducadorAberto] = useState(false);
  const [acessarComoAdminAberto, setAcessarComoAdminAberto] = useState(false);

  return (
    <div className="min-h-screen bg-[#07070c] text-neutral-100 light:bg-[#f6f4ef] light:text-neutral-900">
      <header className="flex items-center justify-between border-b border-white/10 px-7 py-3.5 light:border-black/10">
        <div className="flex items-center gap-2.5">
          <FazMaisLegacyLogo className="h-9 w-auto" />
          <span className="text-base font-bold tracking-tight">
            Faz<span className="text-brand-400">Mais</span>
          </span>
          <span className="ml-1 rounded-full border border-brand-400/25 bg-brand-400/10 px-2.5 py-0.5 text-[11px] font-semibold text-brand-300 light:text-brand-700">
            visão global
          </span>
        </div>
        <div className="flex items-center gap-3">
          <ThemeToggle />
          <div className="flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-indigo-700 text-xs font-bold text-white">
              {user?.name.charAt(0).toUpperCase()}
            </span>
            <div className="leading-tight">
              <div className="text-sm font-semibold">{user?.name}</div>
              <div className="text-[11px] text-neutral-500">Master</div>
              <button
                type="button"
                onClick={() => setVerComoEducadorAberto(true)}
                className="mt-1 block text-[11px] font-semibold text-brand-400 transition hover:text-brand-300 hover:underline light:text-brand-600"
              >
                📚 Área do Educador
              </button>
              <button
                type="button"
                onClick={() => setAcessarComoAdminAberto(true)}
                className="mt-1 block text-[11px] font-semibold text-brand-400 transition hover:text-brand-300 hover:underline light:text-brand-600"
              >
                🛠 Área do Admin
              </button>
            </div>
          </div>
          <button
            type="button"
            onClick={handleLogout}
            className="text-sm text-neutral-400 transition hover:text-neutral-100 light:text-neutral-500 light:hover:text-neutral-900"
          >
            Sair
          </button>
        </div>
      </header>

      <main className={`mx-auto ${maxWidthClassName} px-7 py-8`}>{children}</main>

      {verComoEducadorAberto && <VerComoEducadorModal onClose={() => setVerComoEducadorAberto(false)} />}
      {acessarComoAdminAberto && <AcessarComoAdminModal onClose={() => setAcessarComoAdminAberto(false)} />}
    </div>
  );
}
