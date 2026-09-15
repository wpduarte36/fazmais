import { useState, type FormEvent } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { ApiError } from '../../../lib/apiClient';
import { ThemeToggle } from '../../../components/ThemeToggle';
import { AbstractGradientBg } from '../components/AbstractGradientBg';
import { FazMaisLegacyLogo } from '../../../components/FazMaisLegacyLogo';
import { useSetPassword } from '../hooks/useSetPassword';

export function DefinirSenhaPage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const [password, setPasswordValue] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [formError, setFormError] = useState<string | null>(null);
  const setPasswordMutation = useSetPassword();

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setFormError(null);

    if (password.length < 8) {
      setFormError('A senha deve ter pelo menos 8 caracteres');
      return;
    }
    if (password !== confirmPassword) {
      setFormError('As senhas não coincidem');
      return;
    }
    if (!token) return;

    setPasswordMutation.mutate({ token, password });
  }

  const apiErrorMessage =
    setPasswordMutation.error instanceof ApiError
      ? setPasswordMutation.error.message
      : setPasswordMutation.error
        ? 'Não foi possível definir sua senha. Tente novamente.'
        : null;

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#07070c] light:bg-[#f6f4ef]">
      <ThemeToggle className="fixed right-4 top-4 z-20" />
      <AbstractGradientBg />

      <div className="relative z-10 flex min-h-screen flex-col items-center justify-center px-6 py-12">
        <div className="w-full max-w-sm animate-[fadeIn_0.6s_ease-out]">
          <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-8 shadow-2xl shadow-black/40 backdrop-blur-xl light:border-black/10 light:bg-white light:shadow-black/10">
            <div className="mb-6 flex justify-center">
              <FazMaisLegacyLogo className="h-16" />
            </div>

            {!token ? (
              <div className="text-center">
                <h2 className="mb-2 text-lg font-semibold text-white light:text-neutral-900">Link inválido</h2>
                <p className="mb-6 text-sm text-neutral-400 light:text-neutral-600">
                  Esse link de definição de senha está incompleto. Peça um novo link pro administrador da sua escola.
                </p>
                <Link
                  to="/login"
                  className="inline-flex items-center justify-center rounded-lg bg-gradient-to-r from-amber-400 to-amber-500 px-4 py-2.5 text-sm font-semibold text-neutral-950 shadow-lg shadow-amber-500/20 transition hover:from-amber-300 hover:to-amber-400"
                >
                  Ir para o login
                </Link>
              </div>
            ) : setPasswordMutation.isSuccess ? (
              <div className="text-center">
                <h2 className="mb-2 text-lg font-semibold text-white light:text-neutral-900">Senha definida!</h2>
                <p className="mb-6 text-sm text-neutral-400 light:text-neutral-600">
                  Sua senha foi definida com sucesso. Agora é só entrar na plataforma.
                </p>
                <Link
                  to="/login"
                  className="inline-flex items-center justify-center rounded-lg bg-gradient-to-r from-amber-400 to-amber-500 px-4 py-2.5 text-sm font-semibold text-neutral-950 shadow-lg shadow-amber-500/20 transition hover:from-amber-300 hover:to-amber-400"
                >
                  Ir para o login
                </Link>
              </div>
            ) : (
              <>
                <h2 className="mb-6 text-center text-lg font-semibold text-white light:text-neutral-900">
                  Defina sua senha
                </h2>

                <form onSubmit={handleSubmit}>
                  <div className="flex flex-col gap-4">
                    <div className="flex flex-col gap-1.5">
                      <label htmlFor="password" className="text-xs font-medium text-neutral-300 light:text-neutral-600">
                        Nova senha
                      </label>
                      <input
                        id="password"
                        name="password"
                        type="password"
                        autoComplete="new-password"
                        required
                        value={password}
                        onChange={(e) => setPasswordValue(e.target.value)}
                        placeholder="••••••••"
                        className="w-full rounded-lg border border-white/10 bg-white/5 px-3.5 py-2.5 text-sm text-white placeholder:text-neutral-500 outline-none transition focus:border-amber-400/60 focus:bg-white/[0.07] focus:ring-2 focus:ring-amber-400/20 light:border-black/10 light:bg-black/[0.03] light:text-neutral-900 light:placeholder:text-neutral-400 light:focus:bg-white"
                      />
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label htmlFor="confirmPassword" className="text-xs font-medium text-neutral-300 light:text-neutral-600">
                        Confirmar senha
                      </label>
                      <input
                        id="confirmPassword"
                        name="confirmPassword"
                        type="password"
                        autoComplete="new-password"
                        required
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full rounded-lg border border-white/10 bg-white/5 px-3.5 py-2.5 text-sm text-white placeholder:text-neutral-500 outline-none transition focus:border-amber-400/60 focus:bg-white/[0.07] focus:ring-2 focus:ring-amber-400/20 light:border-black/10 light:bg-black/[0.03] light:text-neutral-900 light:placeholder:text-neutral-400 light:focus:bg-white"
                      />
                    </div>

                    {(formError ?? apiErrorMessage) && (
                      <div className="rounded-lg border border-rose-500/30 bg-rose-500/10 px-3.5 py-2.5 text-sm text-rose-300 light:text-rose-700">
                        {formError ?? apiErrorMessage}
                      </div>
                    )}

                    <button
                      type="submit"
                      disabled={setPasswordMutation.isPending}
                      className="mt-1 flex items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-amber-400 to-amber-500 px-4 py-2.5 text-sm font-semibold text-neutral-950 shadow-lg shadow-amber-500/20 transition hover:from-amber-300 hover:to-amber-400 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {setPasswordMutation.isPending ? 'Salvando...' : 'Definir senha'}
                    </button>
                  </div>
                </form>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
