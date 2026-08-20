import { useMemo, useState, type FormEvent } from 'react';
import type { ManagedUserRole, UserSummary, UserStatus } from '@fazmais/shared';
import { ApiError } from '../../../lib/apiClient';
import { useAuthStore } from '../../../store/authStore';
import { useCreateUser, useDeleteUser, useResetPassword, useUpdateUser, useUsers } from '../hooks/useUsers';
import { ResetPasswordModal } from './ResetPasswordModal';

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

const ROLE_LABEL: Record<ManagedUserRole, string> = {
  ADMIN: 'Admin',
  PROFESSOR: 'Professor',
};

const ROLE_FILTERS: Array<{ value: ManagedUserRole | 'TODOS'; label: string }> = [
  { value: 'TODOS', label: 'Todos' },
  { value: 'ADMIN', label: 'Admin' },
  { value: 'PROFESSOR', label: 'Professor' },
];

function normalize(text: string): string {
  return text.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
}

export function UsuariosTab() {
  const currentUserId = useAuthStore((state) => state.user?.id);
  const { data: users, isLoading } = useUsers();
  const createUser = useCreateUser();
  const updateUser = useUpdateUser();
  const deleteUser = useDeleteUser();
  const resetPassword = useResetPassword();

  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<ManagedUserRole | 'TODOS'>('TODOS');

  const [creating, setCreating] = useState(false);
  const [createForm, setCreateForm] = useState({ name: '', login: '', email: '', whatsapp: '', role: 'PROFESSOR' as ManagedUserRole });
  const [createError, setCreateError] = useState<string | null>(null);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({ name: '', email: '', whatsapp: '', status: 'ATIVO' as UserStatus });
  const [editError, setEditError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const [resetResult, setResetResult] = useState<{ userName: string; token: string; expiresAt: string } | null>(null);

  const filteredUsers = useMemo(() => {
    const termo = normalize(searchQuery.trim());
    return (users ?? []).filter((user) => {
      const matchesRole = roleFilter === 'TODOS' || user.role === roleFilter;
      const matchesSearch =
        termo.length === 0 || normalize(user.name).includes(termo) || normalize(user.login).includes(termo);
      return matchesRole && matchesSearch;
    });
  }, [users, searchQuery, roleFilter]);

  function startEdit(user: UserSummary) {
    setEditingId(user.id);
    setEditForm({ name: user.name, email: user.email, whatsapp: user.whatsapp ?? '', status: user.status });
    setEditError(null);
  }

  function handleCreate(event: FormEvent) {
    event.preventDefault();
    setCreateError(null);
    createUser.mutate(
      {
        name: createForm.name,
        login: createForm.login,
        email: createForm.email,
        whatsapp: createForm.whatsapp || undefined,
        role: createForm.role,
      },
      {
        onSuccess: () => {
          setCreating(false);
          setCreateForm({ name: '', login: '', email: '', whatsapp: '', role: 'PROFESSOR' });
        },
        onError: (err) => setCreateError(err instanceof ApiError ? err.message : 'Não foi possível criar o usuário.'),
      },
    );
  }

  function handleUpdate(event: FormEvent) {
    event.preventDefault();
    if (!editingId) return;
    setEditError(null);
    updateUser.mutate(
      { id: editingId, dto: editForm },
      {
        onSuccess: () => setEditingId(null),
        onError: (err) => setEditError(err instanceof ApiError ? err.message : 'Não foi possível salvar as alterações.'),
      },
    );
  }

  function handleDelete(user: UserSummary) {
    setActionError(null);
    if (!window.confirm(`Excluir o usuário "${user.name}"? Essa ação não pode ser desfeita.`)) return;
    deleteUser.mutate(user.id, {
      onError: (err) => setActionError(err instanceof ApiError ? err.message : 'Não foi possível excluir o usuário.'),
    });
  }

  function handleResetPassword(user: UserSummary) {
    setActionError(null);
    resetPassword.mutate(user.id, {
      onSuccess: (data) => setResetResult({ userName: user.name, token: data.token, expiresAt: data.expiresAt }),
      onError: (err) => setActionError(err instanceof ApiError ? err.message : 'Não foi possível gerar o token de redefinição.'),
    });
  }

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative">
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500"
            >
              <circle cx="11" cy="11" r="7" />
              <path d="m21 21-4.35-4.35" />
            </svg>
            <input
              type="text"
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder="Buscar por nome ou login..."
              className="w-56 rounded-full border border-white/10 bg-white/[0.04] py-1.5 pl-8 pr-3 text-sm text-neutral-100 outline-none transition placeholder:text-neutral-500 focus:border-amber-400/50 focus:bg-white/[0.07] light:border-black/10 light:bg-black/[0.03] light:text-neutral-900 light:placeholder:text-neutral-400"
            />
          </div>
          <div className="inline-flex gap-1 rounded-full border border-white/15 bg-white/[0.03] p-1 light:border-black/10 light:bg-black/[0.03]">
            {ROLE_FILTERS.map((filter) => (
              <button
                key={filter.value}
                type="button"
                onClick={() => setRoleFilter(filter.value)}
                className={
                  roleFilter === filter.value
                    ? 'rounded-full bg-gradient-to-r from-amber-400 to-amber-500 px-3 py-1 text-xs font-semibold text-neutral-950'
                    : 'rounded-full px-3 py-1 text-xs font-semibold text-neutral-400 transition hover:text-neutral-100 light:text-neutral-500 light:hover:text-neutral-900'
                }
              >
                {filter.label}
              </button>
            ))}
          </div>
        </div>
        <button
          type="button"
          onClick={() => setCreating((v) => !v)}
          className="inline-flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-amber-400 to-amber-500 px-3.5 py-2 text-sm font-semibold text-neutral-950 shadow-lg shadow-amber-500/20 transition hover:from-amber-300 hover:to-amber-400"
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round">
            <path d="M12 5v14M5 12h14" />
          </svg>
          Novo usuário
        </button>
      </div>

      {actionError && (
        <div className="mb-3 rounded-lg border border-rose-500/30 bg-rose-500/10 px-3.5 py-2.5 text-sm text-rose-300 light:text-rose-700">
          {actionError}
        </div>
      )}

      {creating && (
        <form
          onSubmit={handleCreate}
          className="mb-4 rounded-xl border border-white/15 bg-white/[0.03] p-4 light:border-black/15 light:bg-black/[0.02]"
        >
          <div className="mb-3 grid grid-cols-2 gap-2.5 sm:grid-cols-3">
            <FormField label="Nome" value={createForm.name} onChange={(v) => setCreateForm((f) => ({ ...f, name: v }))} placeholder="Nome completo" required />
            <FormField label="Login" value={createForm.login} onChange={(v) => setCreateForm((f) => ({ ...f, login: v }))} placeholder="usuario.login" required />
            <FormField label="E-mail" type="email" value={createForm.email} onChange={(v) => setCreateForm((f) => ({ ...f, email: v }))} placeholder="nome@municipio.gov.br" required />
            <FormField label="WhatsApp" value={createForm.whatsapp} onChange={(v) => setCreateForm((f) => ({ ...f, whatsapp: v }))} placeholder="(11) 90000-0000" />
            <div className="flex flex-col gap-1">
              <label className="text-[11px] font-semibold text-neutral-400 light:text-neutral-500">Papel</label>
              <select
                value={createForm.role}
                onChange={(event) => setCreateForm((f) => ({ ...f, role: event.target.value as ManagedUserRole }))}
                className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none light:border-black/10 light:bg-black/[0.03] light:text-neutral-900"
              >
                <option value="PROFESSOR">Professor</option>
                <option value="ADMIN">Admin</option>
              </select>
            </div>
          </div>
          <p className="mb-3 text-xs text-neutral-500">O usuário define a própria senha no primeiro acesso.</p>
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
              disabled={createUser.isPending}
              className="rounded-lg bg-gradient-to-r from-amber-400 to-amber-500 px-3 py-1.5 text-xs font-semibold text-neutral-950 disabled:opacity-60"
            >
              {createUser.isPending ? 'Salvando...' : 'Salvar usuário'}
            </button>
          </div>
        </form>
      )}

      <div className="overflow-hidden rounded-xl border border-white/10 bg-white/[0.035] light:border-black/10 light:bg-white">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] border-collapse text-sm">
            <thead>
              <tr>
                {['Nome', 'Login', 'E-mail', 'WhatsApp', 'Papel', 'Status', 'Ações'].map((label) => (
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
                  <td colSpan={7} className="px-4 py-5 text-center text-neutral-500">
                    Carregando...
                  </td>
                </tr>
              )}
              {!isLoading && filteredUsers.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-5 text-center text-neutral-500">
                    {users?.length === 0 ? 'Nenhum usuário cadastrado ainda.' : 'Nenhum usuário encontrado.'}
                  </td>
                </tr>
              )}
              {filteredUsers.map((user) => {
                const isSelf = user.id === currentUserId;
                return editingId === user.id ? (
                  <tr key={user.id} className="border-b border-white/10 last:border-b-0 light:border-black/10">
                    <td colSpan={7} className="px-4 py-3">
                      <form onSubmit={handleUpdate} className="flex flex-col gap-2.5">
                        <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
                          <FormField label="Nome" value={editForm.name} onChange={(v) => setEditForm((f) => ({ ...f, name: v }))} required />
                          <FormField label="E-mail" type="email" value={editForm.email} onChange={(v) => setEditForm((f) => ({ ...f, email: v }))} required />
                          <FormField label="WhatsApp" value={editForm.whatsapp} onChange={(v) => setEditForm((f) => ({ ...f, whatsapp: v }))} />
                          <div className="flex flex-col gap-1">
                            <label className="text-[11px] font-semibold text-neutral-400 light:text-neutral-500">Status</label>
                            <select
                              value={editForm.status}
                              onChange={(event) => setEditForm((f) => ({ ...f, status: event.target.value as UserStatus }))}
                              disabled={isSelf}
                              className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none disabled:opacity-50 light:border-black/10 light:bg-black/[0.03] light:text-neutral-900"
                            >
                              <option value="ATIVO">Ativo</option>
                              <option value="INATIVO">Inativo</option>
                            </select>
                          </div>
                        </div>
                        {isSelf && (
                          <p className="text-xs text-neutral-500">Você não pode alterar o status da sua própria conta.</p>
                        )}
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
                            disabled={updateUser.isPending}
                            className="rounded-lg bg-gradient-to-r from-amber-400 to-amber-500 px-3 py-1.5 text-xs font-semibold text-neutral-950 disabled:opacity-60"
                          >
                            {updateUser.isPending ? 'Salvando...' : 'Salvar'}
                          </button>
                        </div>
                      </form>
                    </td>
                  </tr>
                ) : (
                  <tr key={user.id} className="border-b border-white/10 last:border-b-0 hover:bg-white/[0.02] light:border-black/10 light:hover:bg-black/[0.02]">
                    <td className="px-4 py-2.5">
                      {user.name}
                      {isSelf && <span className="ml-1.5 text-xs text-neutral-500">(você)</span>}
                    </td>
                    <td className="px-4 py-2.5 text-neutral-400">{user.login}</td>
                    <td className="px-4 py-2.5 text-neutral-400">{user.email}</td>
                    <td className="px-4 py-2.5 text-neutral-400">{user.whatsapp ?? '—'}</td>
                    <td className="px-4 py-2.5 text-neutral-400">{ROLE_LABEL[user.role]}</td>
                    <td className="px-4 py-2.5">
                      <span className={`inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-xs font-semibold ${STATUS_CLASSES[user.status]}`}>
                        {STATUS_LABEL[user.status]}
                      </span>
                    </td>
                    <td className="px-4 py-2.5">
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => startEdit(user)}
                          aria-label="Editar"
                          title="Editar"
                          className="flex h-7 w-7 items-center justify-center rounded-md border border-white/10 text-neutral-400 transition hover:bg-white/[0.05] hover:text-neutral-100 light:border-black/10 light:hover:bg-black/[0.05] light:hover:text-neutral-900"
                        >
                          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                            <path d="M12 20h9" />
                            <path d="M16.5 3.5a2.12 2.12 0 013 3L7 19l-4 1 1-4 12.5-12.5z" />
                          </svg>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleResetPassword(user)}
                          disabled={resetPassword.isPending}
                          aria-label="Resetar senha"
                          title="Resetar senha"
                          className="flex h-7 w-7 items-center justify-center rounded-md border border-white/10 text-neutral-400 transition hover:bg-white/[0.05] hover:text-neutral-100 disabled:opacity-50 light:border-black/10 light:hover:bg-black/[0.05] light:hover:text-neutral-900"
                        >
                          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                            <path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 11-7.778 7.778 5.5 5.5 0 017.777-7.777zm0 0L15.5 7.5m0 0L19 4m-3.5 3.5L19 11" />
                          </svg>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(user)}
                          disabled={isSelf}
                          aria-label="Excluir"
                          title={isSelf ? 'Você não pode excluir a própria conta' : 'Excluir'}
                          className="flex h-7 w-7 items-center justify-center rounded-md border border-white/10 text-neutral-500 transition hover:bg-rose-500/10 hover:text-rose-300 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-transparent disabled:hover:text-neutral-500 light:border-black/10"
                        >
                          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                            <path d="M3 6h18M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2m3 0l-1 14a2 2 0 01-2 2H7a2 2 0 01-2-2L4 6" />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {resetResult && (
        <ResetPasswordModal
          userName={resetResult.userName}
          token={resetResult.token}
          expiresAt={resetResult.expiresAt}
          onClose={() => setResetResult(null)}
        />
      )}
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
