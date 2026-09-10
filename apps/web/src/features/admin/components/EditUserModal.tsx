import { useState, type FormEvent } from 'react';
import type { PlanoSummary, UpdateUserRequest, UserStatus, UserSummary } from '@fazmais/shared';

interface EditUserModalProps {
  user: UserSummary;
  planos?: PlanoSummary[];
  isSelf: boolean;
  pending: boolean;
  error: string | null;
  onSave: (dto: UpdateUserRequest) => void;
  onClose: () => void;
}

export function EditUserModal({ user, planos, isSelf, pending, error, onSave, onClose }: EditUserModalProps) {
  const [name, setName] = useState(user.name);
  const [email, setEmail] = useState(user.email);
  const [whatsapp, setWhatsapp] = useState(user.whatsapp ?? '');
  const [status, setStatus] = useState<UserStatus>(user.status);
  const [planoId, setPlanoId] = useState(user.planoId ?? '');

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    onSave({ name, email, whatsapp, status, planoId: planoId || null });
  }

  return (
    <div
      className="fixed inset-0 z-30 flex items-center justify-center bg-black/55 p-4 backdrop-blur-[2px] light:bg-black/25"
      onClick={onClose}
    >
      <div
        className="w-full max-w-[460px] rounded-2xl border border-white/15 bg-[#0d0d14] p-6 shadow-2xl light:border-black/10 light:bg-white"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="mb-5 flex items-start justify-between gap-4">
          <div>
            <p className="mb-1 text-[11px] font-bold uppercase tracking-wider text-amber-300 light:text-amber-700">
              Editar usuário
            </p>
            <h3 className="text-lg font-bold text-neutral-100 light:text-neutral-900">{user.name}</h3>
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

        <form onSubmit={handleSubmit} className="flex flex-col gap-3.5">
          <Field label="Nome">
            <input
              value={name}
              onChange={(event) => setName(event.target.value)}
              required
              className="w-full rounded-lg border border-white/10 bg-white/5 px-3.5 py-2.5 text-sm text-white outline-none transition focus:border-amber-400/60 focus:ring-2 focus:ring-amber-400/20 light:border-black/10 light:bg-black/[0.03] light:text-neutral-900"
            />
          </Field>

          <Field label="E-mail">
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
              className="w-full rounded-lg border border-white/10 bg-white/5 px-3.5 py-2.5 text-sm text-white outline-none transition focus:border-amber-400/60 focus:ring-2 focus:ring-amber-400/20 light:border-black/10 light:bg-black/[0.03] light:text-neutral-900"
            />
          </Field>

          <Field label="WhatsApp">
            <input
              value={whatsapp}
              onChange={(event) => setWhatsapp(event.target.value)}
              placeholder="(11) 90000-0000"
              className="w-full rounded-lg border border-white/10 bg-white/5 px-3.5 py-2.5 text-sm text-white outline-none transition focus:border-amber-400/60 focus:ring-2 focus:ring-amber-400/20 light:border-black/10 light:bg-black/[0.03] light:text-neutral-900"
            />
          </Field>

          <div className="grid grid-cols-2 gap-2.5">
            <Field label="Status">
              <select
                value={status}
                onChange={(event) => setStatus(event.target.value as UserStatus)}
                disabled={isSelf}
                className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white outline-none disabled:opacity-50 light:border-black/10 light:bg-black/[0.03] light:text-neutral-900"
              >
                <option value="ATIVO">Ativo</option>
                <option value="INATIVO">Inativo</option>
              </select>
            </Field>

            {user.role === 'PROFESSOR' && (
              <Field label="Plano">
                <select
                  value={planoId}
                  onChange={(event) => setPlanoId(event.target.value)}
                  className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white outline-none light:border-black/10 light:bg-black/[0.03] light:text-neutral-900"
                >
                  <option value="">Sem plano</option>
                  {planos?.map((plano) => (
                    <option key={plano.id} value={plano.id}>
                      {plano.name}
                    </option>
                  ))}
                </select>
              </Field>
            )}
          </div>

          {isSelf && <p className="text-xs text-neutral-500">Você não pode alterar o status da sua própria conta.</p>}
          {error && <p className="text-sm text-rose-300 light:text-rose-700">{error}</p>}

          <div className="mt-2 flex gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-lg border border-white/15 px-4 py-2.5 text-sm font-semibold text-neutral-400 transition hover:text-neutral-100 light:border-black/15 light:text-neutral-500 light:hover:text-neutral-900"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={pending}
              className="flex-1 rounded-lg bg-gradient-to-r from-amber-400 to-amber-500 px-4 py-2.5 text-sm font-semibold text-neutral-950 shadow-lg shadow-amber-500/20 transition hover:from-amber-300 hover:to-amber-400 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {pending ? 'Salvando...' : 'Salvar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-[11px] font-semibold text-neutral-400 light:text-neutral-500">{label}</label>
      {children}
    </div>
  );
}
