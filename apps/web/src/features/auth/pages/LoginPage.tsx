import { useState, type FormEvent } from 'react';
import { useLogin } from '../hooks/useLogin';
import { ApiError } from '../../../lib/apiClient';
import { ThemeToggle } from '../../../components/ThemeToggle';
import { AbstractGradientBg } from '../components/AbstractGradientBg';
import { FazMaisLegacyLogo } from '../../../components/FazMaisLegacyLogo';

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
    <div className="relative min-h-screen overflow-hidden bg-[#07070c] light:bg-[#f6f4ef]">
      <ThemeToggle className="fixed right-4 top-4 z-20" />

      <AbstractGradientBg />

      <div className="relative z-10 flex min-h-screen flex-col items-center justify-center gap-12 px-6 py-12 md:flex-row md:items-center md:justify-between md:gap-8 md:px-16 lg:px-24">
        {/* Boas-vindas */}
        <div className="max-w-lg text-center animate-[fadeIn_0.6s_ease-out] md:text-left">
          <h1 className="text-3xl font-bold tracking-tight text-white light:text-neutral-900">
            Bem-vindo ao portal Faz<span className="text-amber-400">Mais</span>
          </h1>
          <p className="mt-4 text-[15px] leading-relaxed text-neutral-300 light:text-neutral-600">
            Nós acreditamos que educação se faz juntos e, por isso, desenvolvemos uma série de materiais que visam
            apoiar o trabalho docente respeitando a autonomia do professor e a individualidade de cada aluno. Nossos
            materiais são referenciais e se inspiram em experiências educacionais de sucesso no Brasil e no exterior.
            Aqui o educador encontra ideias, recursos e dicas de como ampliar o potencial das suas aulas aliando
            tecnologia, pedagogia e desenvolvimento das habilidades socioemocionais. Conheça nossos eixos de trabalho
            e navegue pelos materiais! Bom planejamento!
          </p>
        </div>

        {/* Painel de login */}
        <div className="w-full max-w-sm shrink-0 animate-[fadeIn_0.6s_ease-out] md:mr-6 lg:mr-14">
          <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-8 shadow-2xl shadow-black/40 backdrop-blur-xl light:border-black/10 light:bg-white light:shadow-black/10">
            <div className="mb-6 flex justify-center">
              <FazMaisLegacyLogo className="h-16" />
            </div>

            <h2 className="mb-6 text-center text-lg font-semibold text-white light:text-neutral-900">
              Entrar na plataforma
            </h2>

            <form onSubmit={handleSubmit}>
              <div className="flex flex-col gap-4">
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="login" className="text-xs font-medium text-neutral-300 light:text-neutral-600">
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
                    className="w-full rounded-lg border border-white/10 bg-white/5 px-3.5 py-2.5 text-sm text-white placeholder:text-neutral-500 outline-none transition focus:border-amber-400/60 focus:bg-white/[0.07] focus:ring-2 focus:ring-amber-400/20 light:border-black/10 light:bg-black/[0.03] light:text-neutral-900 light:placeholder:text-neutral-400 light:focus:bg-white"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label htmlFor="password" className="text-xs font-medium text-neutral-300 light:text-neutral-600">
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
                      className="w-full rounded-lg border border-white/10 bg-white/5 px-3.5 py-2.5 pr-10 text-sm text-white placeholder:text-neutral-500 outline-none transition focus:border-amber-400/60 focus:bg-white/[0.07] focus:ring-2 focus:ring-amber-400/20 light:border-black/10 light:bg-black/[0.03] light:text-neutral-900 light:placeholder:text-neutral-400 light:focus:bg-white"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((v) => !v)}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-neutral-500 transition hover:text-neutral-300 light:text-neutral-400 light:hover:text-neutral-700"
                      aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
                    >
                      {showPassword ? <EyeOffIcon /> : <EyeIcon />}
                    </button>
                  </div>
                </div>

                {errorMessage && (
                  <div className="rounded-lg border border-rose-500/30 bg-rose-500/10 px-3.5 py-2.5 text-sm text-rose-300 light:text-rose-700">
                    {errorMessage}
                  </div>
                )}

                {notice && (
                  <div className="rounded-lg border border-indigo-400/30 bg-indigo-400/10 px-3.5 py-2.5 text-sm text-indigo-300 light:text-indigo-700">
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
                  className="text-neutral-400 transition hover:text-amber-300 light:text-neutral-500 light:hover:text-amber-600"
                >
                  Esqueceu sua senha?
                </button>
                <button
                  type="button"
                  onClick={() => setNotice('O formulário de solicitação de acesso ainda está em construção.')}
                  className="text-neutral-400 transition hover:text-amber-300 light:text-neutral-500 light:hover:text-amber-600"
                >
                  Ainda não tenho acesso
                </button>
              </div>
            </form>
          </div>
        </div>
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
