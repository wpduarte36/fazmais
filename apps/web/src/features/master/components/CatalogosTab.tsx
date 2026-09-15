import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { CatalogoSummary } from '@fazmais/shared';
import { ApiError } from '../../../lib/apiClient';
import { useCatalogos, useDeleteCatalogo } from '../hooks/useCatalogos';
import { CatalogoModal } from './CatalogoModal';

type ModalState = { mode: 'create' } | { mode: 'edit'; catalogo: CatalogoSummary } | null;

const dateFormatter = new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });

export function CatalogosTab() {
  const { data: catalogos, isLoading, error } = useCatalogos();
  const deleteCatalogo = useDeleteCatalogo();
  const [modal, setModal] = useState<ModalState>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const navigate = useNavigate();

  function handleDelete(catalogo: CatalogoSummary) {
    setActionError(null);
    if (!window.confirm(`Excluir o catálogo "${catalogo.name}"? Essa ação não pode ser desfeita.`)) {
      return;
    }
    deleteCatalogo.mutate(catalogo.id, {
      onError: (err) => {
        setActionError(err instanceof ApiError ? err.message : 'Não foi possível excluir o catálogo.');
      },
    });
  }

  return (
    <div>
      <div className="mb-1 flex items-start justify-between gap-3">
        <div>
          <h2 className="text-sm font-bold">Catálogos</h2>
          <p className="mt-0.5 text-xs text-neutral-400">Globais (tenantId nulo) — qualquer município pode ativar por opt-in.</p>
        </div>
      </div>
      <div className="mb-3.5 mt-3 flex items-center justify-between gap-3">
        <span className="rounded-full border border-white/10 bg-white/[0.05] px-2 py-0.5 text-xs font-semibold text-neutral-400 light:border-black/10 light:bg-black/[0.04] light:text-neutral-500">
          {catalogos?.length ?? 0}
        </span>
        <button
          type="button"
          onClick={() => setModal({ mode: 'create' })}
          className="inline-flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-amber-400 to-amber-500 px-3.5 py-2 text-sm font-semibold text-neutral-950 shadow-lg shadow-amber-500/20 transition hover:from-amber-300 hover:to-amber-400"
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round">
            <path d="M12 5v14M5 12h14" />
          </svg>
          Novo catálogo
        </button>
      </div>

      {actionError && (
        <div className="mb-3 rounded-lg border border-rose-500/30 bg-rose-500/10 px-3.5 py-2.5 text-sm text-rose-300 light:text-rose-700">
          {actionError}
        </div>
      )}

      <div className="overflow-hidden rounded-xl border border-white/10 bg-white/[0.035] light:border-black/10 light:bg-white">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[620px] border-collapse text-sm">
            <thead>
              <tr>
                {['Catálogo', 'Eixos', 'Coleções', 'Conteúdos', 'Municípios ativos', 'Criado em', 'Ações'].map((label) => (
                  <th
                    key={label}
                    className="border-b border-white/10 px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-neutral-500 light:border-black/10"
                  >
                    {label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {isLoading && (
                <tr>
                  <td colSpan={7} className="px-4 py-6 text-center text-neutral-500">
                    Carregando...
                  </td>
                </tr>
              )}
              {error && (
                <tr>
                  <td colSpan={7} className="px-4 py-6 text-center text-rose-300 light:text-rose-700">
                    Não foi possível carregar os catálogos.
                  </td>
                </tr>
              )}
              {!isLoading && catalogos?.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-6 text-center text-neutral-500">
                    Nenhum catálogo cadastrado ainda.
                  </td>
                </tr>
              )}
              {catalogos?.map((catalogo) => (
                <tr
                  key={catalogo.id}
                  onDoubleClick={() => navigate(`/master/catalogos/${catalogo.id}`)}
                  title="Duplo clique pra abrir o construtor de acervo"
                  className="cursor-pointer border-b border-white/10 last:border-b-0 hover:bg-white/[0.02] light:border-black/10 light:hover:bg-black/[0.02]"
                >
                  <td className="flex items-center gap-2.5 px-4 py-3 font-semibold">
                    <span className="flex h-7 w-7 items-center justify-center rounded-md border border-white/10 bg-white/[0.05] text-sm light:border-black/10 light:bg-black/[0.04]">
                      {catalogo.icon}
                    </span>
                    {catalogo.name}
                  </td>
                  <td className="px-4 py-3 tabular-nums text-neutral-400">{catalogo.eixosCount}</td>
                  <td className="px-4 py-3 tabular-nums text-neutral-400">{catalogo.colecoesCount}</td>
                  <td className="px-4 py-3 tabular-nums text-neutral-400">{catalogo.conteudosCount}</td>
                  <td className="px-4 py-3 tabular-nums text-neutral-400">{catalogo.municipiosAtivos}</td>
                  <td className="px-4 py-3 text-neutral-400">{dateFormatter.format(new Date(catalogo.createdAt))}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1.5" onClick={(event) => event.stopPropagation()}>
                      <button
                        type="button"
                        onClick={() => setModal({ mode: 'edit', catalogo })}
                        aria-label="Editar"
                        title="Editar nome/ícone"
                        className="flex h-7 w-7 items-center justify-center rounded-md border border-white/10 text-neutral-400 transition hover:bg-white/[0.05] hover:text-neutral-100 light:border-black/10 light:hover:bg-black/[0.05] light:hover:text-neutral-900"
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                          <path d="M12 20h9" />
                          <path d="M16.5 3.5a2.12 2.12 0 013 3L7 19l-4 1 1-4 12.5-12.5z" />
                        </svg>
                      </button>
                      <button
                        type="button"
                        disabled={catalogo.municipiosAtivos > 0}
                        title={catalogo.municipiosAtivos > 0 ? 'Bloqueado: algum município já ativou' : 'Excluir'}
                        onClick={() => handleDelete(catalogo)}
                        aria-label="Excluir"
                        className="flex h-7 w-7 items-center justify-center rounded-md border border-white/10 text-neutral-400 transition hover:bg-rose-500/10 hover:text-rose-300 disabled:cursor-not-allowed disabled:opacity-35 disabled:hover:bg-transparent disabled:hover:text-neutral-400 light:border-black/10"
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                          <path d="M3 6h18M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2m3 0l-1 14a2 2 0 01-2 2H7a2 2 0 01-2-2L4 6" />
                        </svg>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <p className="mt-2.5 text-xs leading-relaxed text-neutral-500">
        Excluir fica bloqueado se algum município já ativou o catálogo. Dê duplo clique numa linha pra abrir o construtor de acervo (eixos, coleções e conteúdos).
      </p>

      {modal && <CatalogoModal state={modal} onClose={() => setModal(null)} />}
    </div>
  );
}
