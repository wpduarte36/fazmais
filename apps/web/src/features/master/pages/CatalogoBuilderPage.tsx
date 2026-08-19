import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import type { ColecaoNode, ConteudoSummary, CreateConteudoRequest, EixoNode, UpdateConteudoRequest } from '@fazmais/shared';
import { ApiError } from '../../../lib/apiClient';
import { MasterShell } from '../components/MasterShell';
import { CatalogoModal } from '../components/CatalogoModal';
import { NameOnlyModal } from '../components/NameOnlyModal';
import { ConteudoModal } from '../components/ConteudoModal';
import { useCatalogoBuilder, useCatalogoTree } from '../hooks/useCatalogoBuilder';
import { useCatalogos } from '../hooks/useCatalogos';

const MEDIA_BADGE: Record<string, string> = { VIDEO: '▶ Vídeo', PDF: '📄 PDF', ARTIGO: '📰 Artigo' };
const GRADIENTS = [
  'linear-gradient(135deg,#6366f1,#312e81)',
  'linear-gradient(135deg,#f59e0b,#92400e)',
  'linear-gradient(135deg,#10b981,#064e3b)',
  'linear-gradient(135deg,#ec4899,#831843)',
];

type EixoModalState = { mode: 'create' } | { mode: 'edit'; eixo: EixoNode } | null;
type ColecaoModalState = { mode: 'create'; eixoId: string } | { mode: 'edit'; eixoId: string; colecao: ColecaoNode } | null;
type ConteudoModalState = { mode: 'create'; colecaoId: string } | { mode: 'edit'; colecaoId: string; conteudo: ConteudoSummary } | null;
type DragInfo = { conteudoId: string; sourceColecaoId: string } | null;

export function CatalogoBuilderPage() {
  const { id } = useParams<{ id: string }>();
  const catalogoId = id ?? '';
  const navigate = useNavigate();
  const { data: catalogos } = useCatalogos();
  const { data: tree, isLoading, error } = useCatalogoTree(catalogoId);
  const builder = useCatalogoBuilder(catalogoId);

  const [activeEixoId, setActiveEixoId] = useState<string | null>(null);
  const [catalogoEditOpen, setCatalogoEditOpen] = useState(false);
  const [eixoModal, setEixoModal] = useState<EixoModalState>(null);
  const [colecaoModal, setColecaoModal] = useState<ColecaoModalState>(null);
  const [conteudoModal, setConteudoModal] = useState<ConteudoModalState>(null);
  const [drag, setDrag] = useState<DragInfo>(null);
  const [dragOverColecaoId, setDragOverColecaoId] = useState<string | null>(null);
  const [dragOverEixoId, setDragOverEixoId] = useState<string | null>(null);
  const [destinoChoice, setDestinoChoice] = useState<{ eixo: EixoNode } | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  useEffect(() => {
    if (tree && !activeEixoId && tree.eixos.length > 0) {
      setActiveEixoId(tree.eixos[0].id);
    }
  }, [tree, activeEixoId]);

  function showToast(message: string) {
    setToast(message);
    setTimeout(() => setToast(null), 2600);
  }

  function handleMutationError(err: unknown, fallback: string) {
    setActionError(err instanceof ApiError ? err.message : fallback);
  }

  if (isLoading) {
    return (
      <MasterShell maxWidthClassName="max-w-6xl">
        <p className="text-sm text-neutral-400">Carregando catálogo...</p>
      </MasterShell>
    );
  }

  if (error || !tree) {
    return (
      <MasterShell maxWidthClassName="max-w-6xl">
        <p className="text-sm text-rose-300">Não foi possível carregar este catálogo.</p>
      </MasterShell>
    );
  }

  const activeEixo = tree.eixos.find((eixo) => eixo.id === activeEixoId) ?? null;
  const catalogoSummary = catalogos?.find((c) => c.id === catalogoId);

  function onCardDragStart(conteudoId: string, sourceColecaoId: string) {
    setDrag({ conteudoId, sourceColecaoId });
  }
  function onCardDragEnd() {
    setDrag(null);
    setDragOverColecaoId(null);
    setDragOverEixoId(null);
  }
  function onGridDrop(targetColecaoId: string) {
    setDragOverColecaoId(null);
    if (!drag || drag.sourceColecaoId === targetColecaoId) return;
    builder.moveConteudo.mutate(
      { id: drag.conteudoId, dto: { colecaoId: targetColecaoId } },
      {
        onSuccess: () => showToast('Conteúdo movido de coleção.'),
        onError: (err) => handleMutationError(err, 'Não foi possível mover o conteúdo.'),
      },
    );
  }
  function onPillDrop(eixo: EixoNode) {
    setDragOverEixoId(null);
    if (!drag || eixo.id === activeEixoId) return;
    if (eixo.colecoes.length === 0) {
      showToast(`"${eixo.name}" ainda não tem coleção — crie uma primeiro.`);
      return;
    }
    if (eixo.colecoes.length === 1) {
      const targetColecaoId = eixo.colecoes[0].id;
      builder.moveConteudo.mutate(
        { id: drag.conteudoId, dto: { colecaoId: targetColecaoId } },
        {
          onSuccess: () => showToast(`Movido para "${eixo.colecoes[0].name}" (eixo ${eixo.name}).`),
          onError: (err) => handleMutationError(err, 'Não foi possível mover o conteúdo.'),
        },
      );
      return;
    }
    setDestinoChoice({ eixo });
  }
  function confirmDestino(colecaoId: string, colecaoName: string, eixoName: string) {
    if (!drag) return;
    builder.moveConteudo.mutate(
      { id: drag.conteudoId, dto: { colecaoId } },
      {
        onSuccess: () => showToast(`Movido para "${colecaoName}" (eixo ${eixoName}).`),
        onError: (err) => handleMutationError(err, 'Não foi possível mover o conteúdo.'),
      },
    );
    setDestinoChoice(null);
  }

  function handleDeleteEixo(eixo: EixoNode) {
    if (!window.confirm(`Excluir o eixo "${eixo.name}"? Isso remove as coleções e conteúdos dentro dele.`)) return;
    builder.deleteEixo.mutate(eixo.id, {
      onSuccess: () => {
        if (activeEixoId === eixo.id) setActiveEixoId(null);
      },
      onError: (err) => handleMutationError(err, 'Não foi possível excluir o eixo.'),
    });
  }

  function handleDeleteColecao(colecao: ColecaoNode) {
    if (!window.confirm(`Excluir a coleção "${colecao.name}"? Isso remove os conteúdos dentro dela.`)) return;
    builder.deleteColecao.mutate(colecao.id, {
      onError: (err) => handleMutationError(err, 'Não foi possível excluir a coleção.'),
    });
  }

  function handleDeleteConteudo(conteudo: ConteudoSummary) {
    if (!window.confirm(`Excluir o conteúdo "${conteudo.title}"?`)) return;
    builder.deleteConteudo.mutate(conteudo.id, {
      onError: (err) => handleMutationError(err, 'Não foi possível excluir o conteúdo.'),
    });
  }

  function breadcrumbFor(colecaoId: string): string {
    if (!tree) return '';
    for (const eixo of tree.eixos) {
      const colecao = eixo.colecoes.find((c) => c.id === colecaoId);
      if (colecao) return `${tree.name} / ${eixo.name} / ${colecao.name}`;
    }
    return tree.name;
  }

  return (
    <MasterShell maxWidthClassName="max-w-6xl">
      <div className="mb-4 flex items-center gap-1.5 text-sm text-neutral-500">
        <button type="button" onClick={() => navigate('/master', { state: { tab: 'catalogos' } })} className="hover:text-neutral-200">
          Painel Master
        </button>
        <span>/</span>
        <button type="button" onClick={() => navigate('/master', { state: { tab: 'catalogos' } })} className="hover:text-neutral-200">
          Catálogos
        </button>
        <span>/</span>
        <span className="font-semibold text-neutral-200 light:text-neutral-800">{tree.name}</span>
      </div>

      <div className="mb-6 flex flex-wrap items-center gap-3">
        <span className="flex h-12 w-12 items-center justify-center rounded-xl border border-white/10 bg-white/[0.05] text-2xl light:border-black/10 light:bg-black/[0.04]">
          {tree.icon}
        </span>
        <div>
          <h1 className="text-xl font-bold tracking-tight">{tree.name}</h1>
          <span className="rounded-full border border-amber-400/25 bg-amber-400/10 px-2.5 py-0.5 text-[11px] font-semibold text-amber-300 light:text-amber-700">
            catálogo global · público
          </span>
        </div>
        <button
          type="button"
          onClick={() => setCatalogoEditOpen(true)}
          className="ml-auto rounded-lg border border-white/15 bg-white/[0.03] px-3 py-1.5 text-sm font-semibold text-neutral-100 transition hover:bg-white/[0.06] light:border-black/15 light:bg-black/[0.02] light:text-neutral-900"
        >
          Editar nome/ícone
        </button>
      </div>

      {actionError && (
        <div className="mb-4 rounded-lg border border-rose-500/30 bg-rose-500/10 px-3.5 py-2.5 text-sm text-rose-300 light:text-rose-700">
          {actionError}
        </div>
      )}

      <div className="mb-2 flex items-center justify-between">
        <h2 className="text-xs font-bold uppercase tracking-wider text-neutral-500">Eixos</h2>
      </div>
      <div className="mb-6 flex flex-wrap gap-2">
        {tree.eixos.map((eixo) => (
          <button
            key={eixo.id}
            type="button"
            onClick={() => setActiveEixoId(eixo.id)}
            onDoubleClick={() => setEixoModal({ mode: 'edit', eixo })}
            onDragOver={(event) => {
              if (!drag || eixo.id === activeEixoId) return;
              event.preventDefault();
              setDragOverEixoId(eixo.id);
            }}
            onDragLeave={() => setDragOverEixoId((current) => (current === eixo.id ? null : current))}
            onDrop={(event) => {
              event.preventDefault();
              onPillDrop(eixo);
            }}
            title="Duplo clique pra renomear · arraste um card aqui pra mover"
            className={
              eixo.id === activeEixoId
                ? 'rounded-full bg-gradient-to-r from-amber-400 to-amber-500 px-4 py-1.5 text-sm font-semibold text-neutral-950'
                : dragOverEixoId === eixo.id
                  ? 'rounded-full border border-blue-400/60 bg-blue-400/15 px-4 py-1.5 text-sm font-semibold text-blue-300'
                  : 'rounded-full border border-white/15 bg-white/[0.03] px-4 py-1.5 text-sm font-semibold text-neutral-400 transition hover:text-neutral-100 light:border-black/15 light:bg-black/[0.02] light:text-neutral-500'
            }
          >
            {eixo.name}
          </button>
        ))}
        <button
          type="button"
          onClick={() => setEixoModal({ mode: 'create' })}
          className="rounded-full border border-dashed border-white/25 px-4 py-1.5 text-sm font-semibold text-neutral-400 transition hover:text-neutral-100 light:border-black/25 light:text-neutral-500"
        >
          + Eixo
        </button>
        {activeEixo && (
          <button
            type="button"
            onClick={() => handleDeleteEixo(activeEixo)}
            className="rounded-full border border-white/15 px-3 py-1.5 text-xs font-semibold text-neutral-500 transition hover:border-rose-400/40 hover:text-rose-300 light:border-black/15"
          >
            Excluir eixo atual
          </button>
        )}
      </div>

      {!activeEixo && (
        <p className="text-sm text-neutral-500">Crie um eixo pra começar a organizar coleções e conteúdos.</p>
      )}

      {activeEixo && (
        <>
          <button
            type="button"
            onClick={() => setColecaoModal({ mode: 'create', eixoId: activeEixo.id })}
            className="mb-5 inline-flex items-center gap-1.5 rounded-lg border border-white/15 bg-white/[0.03] px-3 py-1.5 text-sm font-semibold text-neutral-100 transition hover:bg-white/[0.06] light:border-black/15 light:bg-black/[0.02] light:text-neutral-900"
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round">
              <path d="M12 5v14M5 12h14" />
            </svg>
            Nova coleção
          </button>

          {activeEixo.colecoes.length === 0 && (
            <p className="mb-6 text-sm text-neutral-500">Nenhuma coleção neste eixo ainda.</p>
          )}

          {activeEixo.colecoes.map((colecao) => (
            <div key={colecao.id} className="mb-7">
              <div className="mb-2.5 flex flex-wrap items-center justify-between gap-2">
                <h5 className="flex items-center gap-2 text-sm font-bold">
                  <button type="button" onDoubleClick={() => setColecaoModal({ mode: 'edit', eixoId: activeEixo.id, colecao })} title="Duplo clique pra renomear">
                    {colecao.name}
                  </button>
                  <span className="rounded-full border border-white/10 bg-white/[0.05] px-2 py-0.5 text-xs font-semibold text-neutral-400 light:border-black/10 light:bg-black/[0.04]">
                    {colecao.conteudos.length}
                  </span>
                </h5>
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => setConteudoModal({ mode: 'create', colecaoId: colecao.id })}
                    className="rounded-lg border border-white/15 bg-white/[0.03] px-3 py-1.5 text-xs font-semibold text-neutral-100 transition hover:bg-white/[0.06] light:border-black/15 light:bg-black/[0.02] light:text-neutral-900"
                  >
                    + Conteúdo
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDeleteColecao(colecao)}
                    aria-label="Excluir coleção"
                    className="flex h-7 w-7 items-center justify-center rounded-md border border-white/10 text-neutral-400 transition hover:bg-rose-500/10 hover:text-rose-300 light:border-black/10"
                  >
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                      <path d="M3 6h18M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2m3 0l-1 14a2 2 0 01-2 2H7a2 2 0 01-2-2L4 6" />
                    </svg>
                  </button>
                </div>
              </div>

              <div
                onDragOver={(event) => {
                  if (!drag) return;
                  event.preventDefault();
                  setDragOverColecaoId(colecao.id);
                }}
                onDragLeave={() => setDragOverColecaoId((current) => (current === colecao.id ? null : current))}
                onDrop={(event) => {
                  event.preventDefault();
                  onGridDrop(colecao.id);
                }}
                className={`-mx-2 flex gap-3 overflow-x-auto rounded-xl p-2 transition ${
                  dragOverColecaoId === colecao.id ? 'bg-blue-400/10 shadow-[inset_0_0_0_2px_rgba(96,165,250,0.4)]' : ''
                }`}
              >
                {colecao.conteudos.length === 0 && (
                  <p className="py-4 text-xs text-neutral-500">Nenhum conteúdo aqui ainda.</p>
                )}
                {colecao.conteudos.map((conteudo, index) => (
                  <div
                    key={conteudo.id}
                    draggable
                    onDragStart={() => onCardDragStart(conteudo.id, colecao.id)}
                    onDragEnd={onCardDragEnd}
                    className={`group relative w-40 shrink-0 rounded-xl border border-white/10 bg-white/[0.035] transition light:border-black/10 light:bg-white ${
                      drag?.conteudoId === conteudo.id ? 'opacity-35' : ''
                    }`}
                  >
                    <div
                      className="flex h-24 items-start rounded-t-xl p-2"
                      style={{ background: GRADIENTS[index % GRADIENTS.length] }}
                    >
                      <span className="rounded-full bg-black/40 px-2 py-0.5 text-[10px] font-bold text-white">
                        {MEDIA_BADGE[conteudo.mediaType]}
                      </span>
                    </div>
                    <p className="line-clamp-2 px-2.5 py-2.5 text-xs font-semibold">{conteudo.title}</p>
                    <div className="absolute right-1.5 top-1.5 flex gap-1 opacity-0 transition group-hover:opacity-100">
                      <button
                        type="button"
                        onClick={() => setConteudoModal({ mode: 'edit', colecaoId: colecao.id, conteudo })}
                        aria-label="Editar"
                        className="flex h-6 w-6 items-center justify-center rounded-md bg-black/50 text-white hover:bg-black/70"
                      >
                        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                          <path d="M12 20h9" />
                          <path d="M16.5 3.5a2.12 2.12 0 013 3L7 19l-4 1 1-4 12.5-12.5z" />
                        </svg>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteConteudo(conteudo)}
                        aria-label="Excluir"
                        className="flex h-6 w-6 items-center justify-center rounded-md bg-black/50 text-white hover:bg-rose-500/80"
                      >
                        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                          <path d="M3 6h18M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2m3 0l-1 14a2 2 0 01-2 2H7a2 2 0 01-2-2L4 6" />
                        </svg>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </>
      )}

      {catalogoEditOpen && catalogoSummary && (
        <CatalogoModal state={{ mode: 'edit', catalogo: catalogoSummary }} onClose={() => setCatalogoEditOpen(false)} />
      )}

      {eixoModal && (
        <NameOnlyModal
          eyebrow={eixoModal.mode === 'edit' ? 'Editar eixo' : 'Novo eixo'}
          title={eixoModal.mode === 'edit' ? eixoModal.eixo.name : 'Cadastrar eixo'}
          lede={`Agrupa coleções dentro do catálogo "${tree.name}".`}
          placeholder="Ex.: Oralidade"
          initialName={eixoModal.mode === 'edit' ? eixoModal.eixo.name : ''}
          pending={builder.createEixo.isPending || builder.updateEixo.isPending}
          onClose={() => setEixoModal(null)}
          onSave={(name) => {
            const onError = (err: unknown) => handleMutationError(err, 'Não foi possível salvar o eixo.');
            if (eixoModal.mode === 'edit') {
              builder.updateEixo.mutate(
                { id: eixoModal.eixo.id, dto: { name } },
                { onSuccess: () => setEixoModal(null), onError },
              );
            } else {
              builder.createEixo.mutate(
                { name },
                {
                  onSuccess: (created) => {
                    setActiveEixoId(created.id);
                    setEixoModal(null);
                  },
                  onError,
                },
              );
            }
          }}
        />
      )}

      {colecaoModal && (
        <NameOnlyModal
          eyebrow={colecaoModal.mode === 'edit' ? 'Editar coleção' : 'Nova coleção'}
          title={colecaoModal.mode === 'edit' ? colecaoModal.colecao.name : 'Cadastrar coleção'}
          lede="Vinculada ao eixo selecionado no momento."
          placeholder="Ex.: Poesia e Cordel"
          initialName={colecaoModal.mode === 'edit' ? colecaoModal.colecao.name : ''}
          pending={builder.createColecao.isPending || builder.updateColecao.isPending}
          onClose={() => setColecaoModal(null)}
          onSave={(name) => {
            const onError = (err: unknown) => handleMutationError(err, 'Não foi possível salvar a coleção.');
            if (colecaoModal.mode === 'edit') {
              builder.updateColecao.mutate(
                { id: colecaoModal.colecao.id, dto: { name } },
                { onSuccess: () => setColecaoModal(null), onError },
              );
            } else {
              builder.createColecao.mutate(
                { eixoId: colecaoModal.eixoId, dto: { name } },
                { onSuccess: () => setColecaoModal(null), onError },
              );
            }
          }}
        />
      )}

      {conteudoModal && (
        <ConteudoModal
          mode={conteudoModal.mode}
          breadcrumb={breadcrumbFor(conteudoModal.colecaoId)}
          conteudo={conteudoModal.mode === 'edit' ? conteudoModal.conteudo : undefined}
          saving={builder.createConteudo.isPending || builder.updateConteudo.isPending}
          onClose={() => setConteudoModal(null)}
          onCreate={(dto: CreateConteudoRequest) => {
            builder.createConteudo.mutate(
              { colecaoId: conteudoModal.colecaoId, dto },
              {
                onSuccess: () => setConteudoModal(null),
                onError: (err) => handleMutationError(err, 'Não foi possível criar o conteúdo.'),
              },
            );
          }}
          onUpdate={(dto: UpdateConteudoRequest) => {
            if (conteudoModal.mode !== 'edit') return;
            builder.updateConteudo.mutate(
              { id: conteudoModal.conteudo.id, dto },
              {
                onSuccess: () => setConteudoModal(null),
                onError: (err) => handleMutationError(err, 'Não foi possível salvar o conteúdo.'),
              },
            );
          }}
        />
      )}

      {destinoChoice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" onClick={() => setDestinoChoice(null)}>
          <div
            className="w-full max-w-sm rounded-2xl border border-white/15 bg-[#0d0d14] p-5 shadow-2xl light:border-black/10 light:bg-white"
            onClick={(event) => event.stopPropagation()}
          >
            <p className="mb-1 text-[11px] font-bold uppercase tracking-wider text-amber-300 light:text-amber-700">Mover conteúdo</p>
            <h4 className="mb-3 text-base font-bold">Pra qual coleção?</h4>
            <div className="flex flex-col gap-2">
              {destinoChoice.eixo.colecoes.map((colecao) => (
                <button
                  key={colecao.id}
                  type="button"
                  onClick={() => confirmDestino(colecao.id, colecao.name, destinoChoice.eixo.name)}
                  className="rounded-lg border border-white/15 bg-white/[0.03] px-3.5 py-2 text-left text-sm text-neutral-100 transition hover:bg-white/[0.06] light:border-black/15 light:bg-black/[0.02] light:text-neutral-900"
                >
                  {colecao.name}
                </button>
              ))}
            </div>
            <button
              type="button"
              onClick={() => setDestinoChoice(null)}
              className="mt-4 w-full rounded-lg border border-white/15 px-4 py-2 text-sm font-semibold text-neutral-400 hover:text-neutral-100 light:border-black/15"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}

      {toast && (
        <div className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2 rounded-lg border border-white/15 bg-[#0d0d14] px-4 py-2.5 text-sm text-neutral-100 shadow-2xl light:border-black/10 light:bg-white light:text-neutral-900">
          {toast}
        </div>
      )}
    </MasterShell>
  );
}
