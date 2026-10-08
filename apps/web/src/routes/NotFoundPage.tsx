import { Link } from 'react-router-dom';
import { BrandLogo } from '../components/BrandLogo';

export function NotFoundPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-[#07070c] px-6 text-center text-neutral-100 light:bg-[#f6f4ef] light:text-neutral-900">
      <BrandLogo className="h-14" />
      <div>
        <p className="text-sm font-semibold uppercase tracking-widest text-brand-400">404</p>
        <h1 className="mt-1 text-2xl font-bold">Página não encontrada</h1>
        <p className="mt-2 text-sm text-neutral-400 light:text-neutral-600">
          O endereço que você tentou acessar não existe ou foi movido.
        </p>
      </div>
      <Link
        to="/"
        className="mt-2 inline-flex items-center justify-center rounded-lg bg-gradient-to-r from-brand-400 to-brand-500 px-4 py-2.5 text-sm font-semibold text-neutral-950 shadow-lg shadow-brand-500/20 transition hover:from-brand-300 hover:to-brand-400"
      >
        Voltar ao início
      </Link>
    </div>
  );
}
