import { useState } from 'react';
import { AuditAcao, type AuditLogEntry } from '@fazmais/shared';
import { useTenants } from '../hooks/useTenants';
import { useAuditoria } from '../hooks/useAuditoria';

const dataHoraFormatter = new Intl.DateTimeFormat('pt-BR', {
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
});

const ACAO_LABEL: Record<AuditAcao, string> = {
  [AuditAcao.ACESSO_PAINEL_ADMIN]: 'Acesso',
  [AuditAcao.USUARIO_CRIADO]: 'Usuário criado',
  [AuditAcao.USUARIO_ALTERADO]: 'Usuário alterado',
  [AuditAcao.USUARIO_SENHA_RESETADA]: 'Senha resetada',
  [AuditAcao.USUARIO_EXCLUIDO]: 'Usuário excluído',
  [AuditAcao.CATALOGO_ATIVADO]: 'Catálogo ativado',
  [AuditAcao.CATALOGO_DESATIVADO]: 'Catálogo desativado',
  [AuditAcao.MUNICIPIO_CRIADO]: 'Município criado',
  [AuditAcao.MUNICIPIO_ALTERADO]: 'Município alterado',
  [AuditAcao.MUNICIPIO_EXCLUIDO]: 'Município excluído',
  [AuditAcao.ADMIN_CRIADO]: 'Admin criado',
  [AuditAcao.ADMIN_ALTERADO]: 'Admin alterado',
  [AuditAcao.ADMIN_EXCLUIDO]: 'Admin excluído',
  [AuditAcao.MARCA_ALTERADA]: 'Empresa alterada',
};

const CAMPO_LABEL: Record<string, string> = {
  name: 'nome',
  email: 'e-mail',
  whatsapp: 'WhatsApp',
  status: 'status',
  marca: 'empresa',
  nomeExibicao: 'nome',
  nomeAssistente: 'assistente',
  corPrimaria: 'cor',
  logoUrl: 'logo',
  dominios: 'domínios',
};

// Só o "o que mudou" de uma alteração — ids e demais detalhes técnicos ficam
// no banco, não poluem a lista.
function resumoAlteracoes(entry: AuditLogEntry): string | null {
  const alteracoes = entry.detalhes?.alteracoes as Record<string, unknown> | undefined;
  if (!alteracoes) return null;
  const partes = Object.entries(alteracoes)
    .filter(([campo]) => campo !== 'planoId')
    .map(([campo, valor]) => `${CAMPO_LABEL[campo] ?? campo}: ${valor === null || valor === '' ? '(vazio)' : String(valor)}`);
  if ('planoId' in alteracoes) partes.push('plano alterado');
  return partes.length > 0 ? partes.join(' · ') : null;
}

function corDaAcao(acao: AuditAcao): string {
  if (acao.endsWith('EXCLUIDO') || acao === AuditAcao.CATALOGO_DESATIVADO) {
    return 'border-rose-500/30 bg-rose-500/10 text-rose-300 light:text-rose-700';
  }
  if (acao === AuditAcao.ACESSO_PAINEL_ADMIN) {
    return 'border-sky-500/30 bg-sky-500/10 text-sky-300 light:text-sky-700';
  }
  return 'border-brand-400/30 bg-brand-400/10 text-brand-300 light:text-brand-700';
}

export function AuditoriaTab() {
  const [tenantId, setTenantId] = useState('');
  const { data: tenants } = useTenants();
  const { data, isLoading, error, fetchNextPage, hasNextPage, isFetchingNextPage } = useAuditoria(
    tenantId || undefined,
  );
  const itens = data?.pages.flatMap((pagina) => pagina.itens) ?? [];

  return (
    <div>
      <div className="mb-3.5 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-sm font-bold">Auditoria</h2>
          <p className="text-xs text-neutral-500">
            Ações feitas por usuários Master sobre os municípios, incluindo a "Área do Admin".
          </p>
        </div>
        <select
          value={tenantId}
          onChange={(event) => setTenantId(event.target.value)}
          className="rounded-lg border border-white/15 bg-white/[0.04] px-3 py-2 text-sm text-neutral-100 outline-none focus:border-brand-400/60 light:border-black/15 light:bg-white light:text-neutral-900"
        >
          <option value="">Todos os municípios</option>
          {tenants?.map((tenant) => (
            <option key={tenant.id} value={tenant.id}>
              {tenant.name}
            </option>
          ))}
        </select>
      </div>

      <div className="overflow-hidden rounded-xl border border-white/10 bg-white/[0.035] light:border-black/10 light:bg-white">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] border-collapse text-sm">
            <thead>
              <tr>
                {['Data e hora', 'Quem', 'Município', 'Ação', 'Descrição'].map((titulo) => (
                  <th
                    key={titulo}
                    className="border-b border-white/10 px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-neutral-500 light:border-black/10"
                  >
                    {titulo}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {isLoading && (
                <tr>
                  <td colSpan={5} className="px-4 py-6 text-center text-neutral-500">
                    Carregando...
                  </td>
                </tr>
              )}
              {error && (
                <tr>
                  <td colSpan={5} className="px-4 py-6 text-center text-rose-300 light:text-rose-700">
                    Não foi possível carregar a auditoria.
                  </td>
                </tr>
              )}
              {!isLoading && !error && itens.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-6 text-center text-neutral-500">
                    Nenhuma ação registrada{tenantId ? ' para este município' : ''} ainda.
                  </td>
                </tr>
              )}
              {itens.map((entry) => {
                const alteracoes = resumoAlteracoes(entry);
                return (
                  <tr key={entry.id} className="border-b border-white/10 align-top last:border-b-0 light:border-black/10">
                    <td className="whitespace-nowrap px-4 py-3 tabular-nums text-neutral-400">
                      {dataHoraFormatter.format(new Date(entry.createdAt))}
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-semibold">{entry.actorName}</div>
                      <div className="text-xs text-neutral-500">{entry.actorLogin}</div>
                    </td>
                    <td className="px-4 py-3">
                      {entry.tenantName ?? '—'}
                      {entry.tenantName && !entry.tenantId && (
                        <div className="text-xs text-neutral-500">(excluído)</div>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-block whitespace-nowrap rounded-full border px-2 py-0.5 text-[11px] font-semibold ${corDaAcao(entry.acao)}`}
                      >
                        {ACAO_LABEL[entry.acao] ?? entry.acao}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div>{entry.descricao}</div>
                      {alteracoes && <div className="mt-0.5 text-xs text-neutral-500">{alteracoes}</div>}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {hasNextPage && (
        <div className="mt-3 flex justify-center">
          <button
            type="button"
            onClick={() => fetchNextPage()}
            disabled={isFetchingNextPage}
            className="rounded-lg border border-white/15 px-4 py-2 text-sm font-semibold text-neutral-300 transition hover:bg-white/[0.05] disabled:opacity-50 light:border-black/15 light:text-neutral-700 light:hover:bg-black/[0.04]"
          >
            {isFetchingNextPage ? 'Carregando...' : 'Carregar mais'}
          </button>
        </div>
      )}
      <p className="mt-2.5 text-xs text-neutral-500">
        A entrada no painel de um município é registrada uma vez a cada 30 minutos por usuário. Não há opção na
        plataforma para editar ou apagar registros.
      </p>
    </div>
  );
}
