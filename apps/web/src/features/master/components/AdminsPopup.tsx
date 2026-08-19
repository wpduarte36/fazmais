import { useState, type FormEvent } from 'react';
import type { AdminSummary, UserStatus } from '@fazmais/shared';
import { ApiError } from '../../../lib/apiClient';
import { useAdmins, useCreateAdmin, useDeleteAdmin, useUpdateAdmin } from '../hooks/useAdmins';

interface AdminsPopupProps {
  tenantId: string;
  tenantName: string;
  onClose: () => void;
}

const STATUS_LABEL: Record<UserStatus, string> = {
  ATIVO: 'Ativo',
  PENDENTE: 'Pendente',
  INATIVO: 'Inativo',
};

const STATUS_CLASSES: Record<UserStatus, string> = {
  ATIVO: 'text-emerald-400 bg-emerald-400/10 border-emerald-400/30 light:text-emerald-700',
  PENDENTE: 'text-amber-300 bg-amber-300/10 border-amber-300/30 light:text-amber-700',
  INATIVO: 'text-neutral-400 bg-white/[0.04] border-white/15 light:text-neutral-500 light:bg-black/[0.03] light:border-black/15',
};

export function AdminsPopup({ tenantId, tenantName, onClose }: AdminsPopupProps) {
  const { data: admins, isLoading } = useAdmins(tenantId);
  const createAdmin = useCreateAdmin(tenantId);
  const updateAdmin = useUpdateAdmin(tenantId);
  const deleteAdmin = useDeleteAdmin(tenantId);

  const [creating, setCreating] = useState(false);
  const [createForm, setCreateForm] = useState({ name: '', login: '', email: '', whatsapp: '' });
  const [createError, setCreateError] = useState<string | null>(null);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({ name: '', email: '', whatsapp: '', status: 'ATIVO' as UserStatus });
  const [editError, setEditError] = useState<string | null>(null);

  function startEdit(admin: AdminSummary) {
    setEditingId(admin.id);
    setEditForm({ name: admin.name, email: admin.email, whatsapp: admin.whatsapp ?? '', status: admin.status });
    setEditError(null);
  }

  function handleCreate(event: FormEvent) {
    event.preventDefault();
    setCreateError(null);
    createAdmin.mutate(
      {
        name: createForm.name,
        login: createForm.login,
        email: createForm.email,
        whatsapp: createForm.whatsapp || undefined,
      },
      {
        onSuccess: () => {
          setCreating(false);
          setCreateForm({ name: '', login: '', email: '', whatsapp: '' });
        },
        onError: (err) => setCreateError(err instanceof ApiError ? err.message : 'Não foi possível criar o administrador.'),
      },
    );
  }

  function handleUpdate(event: FormEvent) {
    event.preventDefault();
    if (!editingId) return;
    setEditError(null);
    updateAdmin.mutate(
      { userId: editingId, dto: editForm },
      {
        onSuccess: () => setEditingId(null),
        onError: (err) => setEditError(err instanceof ApiError ? err.message : 'Não foi possível salvar as alterações.'),
      },
    );
  }

  function handleDelete(admin: AdminSummary) {
    if (!window.confirm(`Excluir o administrador "${admin.name}"?`)) return;
    deleteAdmin.mutate(admin.id);
  }

  return (
    <div
      className="fixed inset-0 z-40 flex items-center justify-center bg-black/65 p-4 backdrop-blur-[3px] light:bg-black/30"
      onClick={onClose}
    >
      <div
        className="flex max-h-[82vh] w-full max-w-2xl flex-col rounded-2xl border border-white/15 bg-[#0d0d14] shadow-2xl light:border-black/10 light:bg-white"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4 border-b border-white/10 px-6 py-5 light:border-black/10">
          <div>
            <p className="mb-1 text-[11px] font-bold uppercase tracking-wider text-amber-300 light:text-amber-700">Administradores</p>
            <h3 className="text-base font-bold text-neutral-100 light:text-neutral-900">{tenantName}</h3>
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

        <div className="flex-1 overflow-y-auto px-6 py-5">
          <div className="mb-4 flex justify-end">
            <button
              type="button"
              onClick={() => setCreating((v) => !v)}
              className="inline-flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-amber-400 to-amber-500 px-3 py-1.5 text-xs font-semibold text-neutral-950"
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round">
                <path d="M12 5v14M5 12h14" />
              </svg>
              Novo administrador
            </button>
          </div>

          {creating && (
            <form
              onSubmit={handleCreate}
              className="mb-4 rounded-xl border border-white/15 bg-white/[0.03] p-4 light:border-black/15 light:bg-black/[0.02]"
            >
              <div className="mb-3 grid grid-cols-2 gap-2.5">
                <FormField label="Nome" value={createForm.name} onChange={(v) => setCreateForm((f) => ({ ...f, name: v }))} placeholder="Nome completo" required />
                <FormField label="Login" value={createForm.login} onChange={(v) => setCreateForm((f) => ({ ...f, login: v }))} placeholder="usuario.login" required />
                <FormField label="E-mail" type="email" value={createForm.email} onChange={(v) => setCreateForm((f) => ({ ...f, email: v }))} placeholder="nome@municipio.gov.br" required />
                <FormField label="WhatsApp" value={createForm.whatsapp} onChange={(v) => setCreateForm((f) => ({ ...f, whatsapp: v }))} placeholder="(11) 90000-0000" />
              </div>
              {createError && <p className="mb-3 text-sm text-rose-300 light:text-rose-700">{createError}</p>}
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setCreating(false)}
                  className="rounded-lg px-3 py-1.5 text-xs font-semibold text-neutral-400 hover:text-neutral-100 light:text-neutral-500 light:hover:text-neutral-900"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={createAdmin.isPending}
                  className="rounded-lg bg-gradient-to-r from-amber-400 to-amber-500 px-3 py-1.5 text-xs font-semibold text-neutral-950 disabled:opacity-60"
                >
                  {createAdmin.isPending ? 'Salvando...' : 'Salvar administrador'}
                </button>
              </div>
            </form>
          )}

          <div className="overflow-hidden rounded-xl border border-white/10 light:border-black/10">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[560px] border-collapse text-sm">
                <thead>
                  <tr>
                    {['Nome', 'Login', 'E-mail', 'WhatsApp', 'Status', 'Ações'].map((label) => (
                      <th
                        key={label}
                        className="border-b border-white/10 bg-white/[0.02] px-4 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wider text-neutral-500 light:border-black/10 light:bg-black/[0.02]"
                      >
                        {label}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {isLoading && (
                    <tr>
                      <td colSpan={6} className="px-4 py-5 text-center text-neutral-500">
                        Carregando...
                      </td>
                    </tr>
                  )}
                  {!isLoading && admins?.length === 0 && (
                    <tr>
                      <td colSpan={6} className="px-4 py-5 text-center text-neutral-500">
                        Nenhum administrador vinculado ainda.
                      </td>
                    </tr>
                  )}
                  {admins?.map((admin) =>
                    editingId === admin.id ? (
                      <tr key={admin.id} className="border-b border-white/10 last:border-b-0 light:border-black/10">
                        <td colSpan={6} className="px-4 py-3">
                          <form onSubmit={handleUpdate} className="flex flex-col gap-2.5">
                            <div className="grid grid-cols-2 gap-2.5">
                              <FormField label="Nome" value={editForm.name} onChange={(v) => setEditForm((f) => ({ ...f, name: v }))} required />
                              <FormField label="E-mail" type="email" value={editForm.email} onChange={(v) => setEditForm((f) => ({ ...f, email: v }))} required />
                              <FormField label="WhatsApp" value={editForm.whatsapp} onChange={(v) => setEditForm((f) => ({ ...f, whatsapp: v }))} />
                              <div className="flex flex-col gap-1">
                                <label className="text-[11px] font-semibold text-neutral-400 light:text-neutral-500">Status</label>
                                <select
                                  value={editForm.status}
                                  onChange={(event) => setEditForm((f) => ({ ...f, status: event.target.value as UserStatus }))}
                                  className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none light:border-black/10 light:bg-black/[0.03] light:text-neutral-900"
                                >
                                  <option value="ATIVO">Ativo</option>
                                  <option value="INATIVO">Inativo</option>
                                </select>
                              </div>
                            </div>
                            {editError && <p className="text-sm text-rose-300 light:text-rose-700">{editError}</p>}
                            <div className="flex justify-end gap-2">
                              <button
                                type="button"
                                onClick={() => setEditingId(null)}
                                className="rounded-lg px-3 py-1.5 text-xs font-semibold text-neutral-400 hover:text-neutral-100 light:text-neutral-500 light:hover:text-neutral-900"
                              >
                                Cancelar
                              </button>
                              <button
                                type="submit"
                                disabled={updateAdmin.isPending}
                                className="rounded-lg bg-gradient-to-r from-amber-400 to-amber-500 px-3 py-1.5 text-xs font-semibold text-neutral-950 disabled:opacity-60"
                              >
                                {updateAdmin.isPending ? 'Salvando...' : 'Salvar'}
                              </button>
                            </div>
                          </form>
                        </td>
                      </tr>
                    ) : (
                      <tr key={admin.id} className="border-b border-white/10 last:border-b-0 hover:bg-white/[0.02] light:border-black/10 light:hover:bg-black/[0.02]">
                        <td className="px-4 py-2.5">{admin.name}</td>
                        <td className="px-4 py-2.5 text-neutral-400">{admin.login}</td>
                        <td className="px-4 py-2.5 text-neutral-400">{admin.email}</td>
                        <td className="px-4 py-2.5 text-neutral-400">{admin.whatsapp ?? '—'}</td>
                        <td className="px-4 py-2.5">
                          <span className={`inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-xs font-semibold ${STATUS_CLASSES[admin.status]}`}>
                            {STATUS_LABEL[admin.status]}
                          </span>
                        </td>
                        <td className="px-4 py-2.5">
                          <div className="flex items-center gap-1.5">
                            <button
                              type="button"
                              onClick={() => startEdit(admin)}
                              aria-label="Editar"
                              className="flex h-7 w-7 items-center justify-center rounded-md border border-white/10 text-neutral-400 transition hover:bg-white/[0.05] hover:text-neutral-100 light:border-black/10 light:hover:bg-black/[0.05] light:hover:text-neutral-900"
                            >
                              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                                <path d="M12 20h9" />
                                <path d="M16.5 3.5a2.12 2.12 0 013 3L7 19l-4 1 1-4 12.5-12.5z" />
                              </svg>
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDelete(admin)}
                              aria-label="Excluir"
                              className="flex h-7 w-7 items-center justify-center rounded-md border border-white/10 text-neutral-400 transition hover:bg-rose-500/10 hover:text-rose-300 light:border-black/10"
                            >
                              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                                <path d="M3 6h18M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2m3 0l-1 14a2 2 0 01-2 2H7a2 2 0 01-2-2L4 6" />
                              </svg>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ),
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

interface FormFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  placeholder?: string;
  required?: boolean;
}

function FormField({ label, value, onChange, type = 'text', placeholder, required }: FormFieldProps) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-[11px] font-semibold text-neutral-400 light:text-neutral-500">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        required={required}
        className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-neutral-500 outline-none transition focus:border-amber-400/60 focus:ring-2 focus:ring-amber-400/20 light:border-black/10 light:bg-black/[0.03] light:text-neutral-900 light:placeholder:text-neutral-400 light:focus:bg-white"
      />
    </div>
  );
}
