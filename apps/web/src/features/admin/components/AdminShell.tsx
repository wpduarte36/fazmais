import { useState, type ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../../store/authStore';
import { useLogout } from '../../auth/hooks/useLogout';
import { ThemeToggle } from '../../../components/ThemeToggle';
import { FazMaisLegacyLogo } from '../../../components/FazMaisLegacyLogo';
import { VerComoEducadorModal } from '../../master/components/VerComoEducadorModal';
import { useTenantAlvo } from '../tenantAlvo';

interface AdminShellProps {
  children: ReactNode;
  maxWidthClassName?: string;
  // Nome do município quando o Master está no "Acessar como admin".
  tenantAlvoNome?: string;
}

export function AdminShell({ children, maxWidthClassName = 'max-w-5xl', tenantAlvoNome }: AdminShellProps) {
  const user = useAuthStore((state) => state.user);
  const handleLogout = useLogout();
  const navigate = useNavigate();
  const tenantAlvo = useTenantAlvo();
  const isMasterComoAdmin = Boolean(tenantAlvo);
  const [verComoEducadorAberto, setVerComoEducadorAberto] = useState(false);
  const linkClassName =
    'mt-1 block text-[11px] font-semibold text-amber-400 transition hover:text-amber-300 hover:underline light:text-amber-600';

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
              {isMasterComoAdmin ? (
                <>
                  <div className="text-[11px] text-neutral-500">{tenantAlvoNome ?? 'Município'} · Admin</div>
                  <button type="button" onClick={() => navigate('/master')} className={linkClassName}>
                    ← Painel Master
                  </button>
                  <button type="button" onClick={() => setVerComoEducadorAberto(true)} className={linkClassName}>
                    👁 Ver como educador
                  </button>
                </>
              ) : (
                <>
                  <div className="text-[11px] text-neutral-500">Admin</div>
                  <button type="button" onClick={() => navigate('/')} className={linkClassName}>
                    👁 Ver como educador
                  </button>
                </>
              )}
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

      {verComoEducadorAberto && (
        <VerComoEducadorModal tenantIdInicial={tenantAlvo} onClose={() => setVerComoEducadorAberto(false)} />
      )}
    </div>
  );
}
