import { useState, type FormEvent } from 'react';
import { useLogin } from '../hooks/useLogin';
import { ApiError } from '../../../lib/apiClient';

export function LoginPage() {
  const [login, setLoginValue] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const loginMutation = useLogin();

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setNotice(null);
    loginMutation.mutate({ login, password });
  }

  const errorMessage =
    loginMutation.error instanceof ApiError ? loginMutation.error.message : loginMutation.error ? 'Não foi possível entrar. Tente novamente.' : null;

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#07070c] px-4 py-12">
      {/* Glows de fundo */}
      <div className="pointer-events-none absolute -left-32 -top-32 h-[32rem] w-[32rem] rounded-full bg-indigo-600/30 blur-[120px]" />
      <div className="pointer-events-none absolute -bottom-40 -right-24 h-[36rem] w-[36rem] rounded-full bg-amber-500/20 blur-[140px]" />
      <div className="pointer-events-none absolute left-1/2 top-1/3 h-[24rem] w-[24rem] -translate-x-1/2 rounded-full bg-violet-700/20 blur-[100px]" />

      {/* Textura sutil de "prateleira" evocando o catálogo, ao fundo */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage:
            'repeating-linear-gradient(90deg, rgba(255,255,255,0.6) 0, rgba(255,255,255,0.6) 1px, transparent 1px, transparent 64px)',
        }}
      />

      <div className="relative z-10 flex w-full max-w-md flex-col items-center animate-[fadeIn_0.6s_ease-out]">
        <div className="mb-8 flex flex-col items-center gap-2 text-center">
          <div className="flex items-center gap-2">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-amber-400 to-amber-600 text-lg font-black text-neutral-950 shadow-lg shadow-amber-500/20">
              F
            </span>
            <span className="text-2xl font-bold tracking-tight text-white">
              Faz<span className="text-amber-400">Mais</span>
            </span>
          </div>
          <p className="text-sm text-neutral-400">O catálogo educacional da sua rede de ensino</p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="w-full rounded-2xl border border-white/10 bg-white/[0.04] p-8 shadow-2xl shadow-black/40 backdrop-blur-xl"
        >
          <h1 className="mb-6 text-lg font-semibold text-white">Entrar na plataforma</h1>

          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label htmlFor="login" className="text-xs font-medium text-neutral-300">
                Login
              </label>
              <input
                id="login"
                name="login"
                type="text"
                autoComplete="username"
                required
                value={login}
                onChange={(e) => setLoginValue(e.target.value)}
                placeholder="seu.login"
                className="w-full rounded-lg border border-white/10 bg-white/5 px-3.5 py-2.5 text-sm text-white placeholder:text-neutral-500 outline-none transition focus:border-amber-400/60 focus:bg-white/[0.07] focus:ring-2 focus:ring-amber-400/20"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label htmlFor="password" className="text-xs font-medium text-neutral-300">
                Senha
              </label>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full rounded-lg border border-white/10 bg-white/5 px-3.5 py-2.5 pr-10 text-sm text-white placeholder:text-neutral-500 outline-none transition focus:border-amber-400/60 focus:bg-white/[0.07] focus:ring-2 focus:ring-amber-400/20"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-neutral-500 transition hover:text-neutral-300"
                  aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
                >
                  {showPassword ? <EyeOffIcon /> : <EyeIcon />}
                </button>
              </div>
            </div>

            {errorMessage && (
              <div className="rounded-lg border border-rose-500/30 bg-rose-500/10 px-3.5 py-2.5 text-sm text-rose-300">
                {errorMessage}
              </div>
            )}

            {notice && (
              <div className="rounded-lg border border-indigo-400/30 bg-indigo-400/10 px-3.5 py-2.5 text-sm text-indigo-300">
                {notice}
              </div>
            )}

            <button
              type="submit"
              disabled={loginMutation.isPending}
              className="mt-1 flex items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-amber-400 to-amber-500 px-4 py-2.5 text-sm font-semibold text-neutral-950 shadow-lg shadow-amber-500/20 transition hover:from-amber-300 hover:to-amber-400 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loginMutation.isPending && <Spinner />}
              {loginMutation.isPending ? 'Entrando...' : 'Entrar'}
            </button>
          </div>

          <div className="mt-6 flex flex-col items-center gap-2 text-sm">
            <button
              type="button"
              onClick={() => setNotice('A recuperação de senha por e-mail ainda não está disponível nesta versão.')}
              className="text-neutral-400 transition hover:text-amber-300"
            >
              Esqueceu sua senha?
            </button>
            <button
              type="button"
              onClick={() => setNotice('O formulário de solicitação de acesso ainda está em construção.')}
              className="text-neutral-400 transition hover:text-amber-300"
            >
              Ainda não tenho acesso
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function Spinner() {
  return (
    <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-90" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
    </svg>
  );
}

function EyeIcon() {
  return (
    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12s3.75-7.5 9.75-7.5 9.75 7.5 9.75 7.5-3.75 7.5-9.75 7.5S2.25 12 2.25 12z" />
      <circle cx="12" cy="12" r="3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function EyeOffIcon() {
  return (
    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M3.98 8.223A10.477 10.477 0 002.25 12s3.75 7.5 9.75 7.5c1.556 0 3.037-.353 4.35-.984M6.228 6.228A10.45 10.45 0 0112 4.5c6 0 9.75 7.5 9.75 7.5a10.53 10.53 0 01-4.293 4.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88"
      />
    </svg>
  );
}
