import { useState } from 'react';

interface ResetPasswordModalProps {
  userName: string;
  token: string;
  expiresAt: string;
  onClose: () => void;
}

const dateTimeFormatter = new Intl.DateTimeFormat('pt-BR', { dateStyle: 'short', timeStyle: 'short' });

export function ResetPasswordModal({ userName, token, expiresAt, onClose }: ResetPasswordModalProps) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    await navigator.clipboard.writeText(token);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div
      className="fixed inset-0 z-30 flex items-center justify-center bg-black/55 p-4 backdrop-blur-[2px] light:bg-black/25"
      onClick={onClose}
    >
      <div
        className="w-full max-w-[440px] rounded-2xl border border-white/15 bg-[#0d0d14] p-6 shadow-2xl light:border-black/10 light:bg-white"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="mb-5 flex items-start justify-between gap-4">
          <div>
            <p className="mb-1 text-[11px] font-bold uppercase tracking-wider text-amber-300 light:text-amber-700">
              Redefinição de senha
            </p>
            <h3 className="text-lg font-bold text-neutral-100 light:text-neutral-900">{userName}</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Fechar"
            className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md border border-white/10 bg-white/[0.03] text-neutral-400 transition hover:bg-white/[0.08] hover:text-neutral-100 light:border-black/10 light:bg-black/[0.03] light:text-neutral-500 light:hover:bg-black/[0.06] light:hover:text-neutral-900"
          >
            ✕
          </button>
        </div>

        <p className="mb-4 text-sm leading-relaxed text-neutral-400 light:text-neutral-500">
          Como ainda não enviamos e-mail automaticamente, copie o token abaixo e repasse pro usuário (WhatsApp, por
          exemplo) — ele vai usar isso pra definir uma senha nova.
        </p>

        <div className="rounded-lg border border-white/10 bg-white/5 px-3.5 py-2.5 light:border-black/10 light:bg-black/[0.03]">
          <code className="block break-all text-xs text-amber-300 light:text-amber-700">{token}</code>
        </div>

        <p className="mt-2 text-xs text-neutral-500">Expira em {dateTimeFormatter.format(new Date(expiresAt))}.</p>

        <div className="mt-6 flex gap-2.5">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 rounded-lg border border-white/15 px-4 py-2.5 text-sm font-semibold text-neutral-400 transition hover:text-neutral-100 light:border-black/15 light:text-neutral-500 light:hover:text-neutral-900"
          >
            Fechar
          </button>
          <button
            type="button"
            onClick={handleCopy}
            className="flex-1 rounded-lg bg-gradient-to-r from-amber-400 to-amber-500 px-4 py-2.5 text-sm font-semibold text-neutral-950 shadow-lg shadow-amber-500/20 transition hover:from-amber-300 hover:to-amber-400"
          >
            {copied ? 'Copiado!' : 'Copiar token'}
          </button>
        </div>
      </div>
    </div>
  );
}
