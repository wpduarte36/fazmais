import type { ReactNode } from 'react';
import { useAuthStore } from '../../../store/authStore';
import { useLogout } from '../../auth/hooks/useLogout';
import { ThemeToggle } from '../../../components/ThemeToggle';
import { FazMaisLegacyLogo } from '../../../components/FazMaisLegacyLogo';

interface AdminShellProps {
  children: ReactNode;
  maxWidthClassName?: string;
}

export function AdminShell({ children, maxWidthClassName = 'max-w-5xl' }: AdminShellProps) {
  const user = useAuthStore((state) => state.user);
  const handleLogout = useLogout();

  return (
    <div className="min-h-screen bg-[#07070c] text-neutral-100 light:bg-[#f6f4ef] light:text-neutral-900">
      <header className="flex items-center justify-between border-b border-white/10 px-7 py-3.5 light:border-black/10">
        <div className="flex items-center gap-2.5">
          <FazMaisLegacyLogo className="h-9 w-auto" />
          <span className="text-base font-bold tracking-tight">
            Faz<span className="text-amber-400">Mais</span>
          </span>
          <span className="ml-1 rounded-full border border-amber-400/25 bg-amber-400/10 px-2.5 py-0.5 text-[11px] font-semibold text-amber-300 light:text-amber-700">
            painel admin
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
              <div className="text-[11px] text-neutral-500">Admin</div>
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
    </div>
  );
}
