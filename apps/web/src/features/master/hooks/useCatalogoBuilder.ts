import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type {
  AiSuggestRequest,
  CreateConteudoRequest,
  MoveConteudoRequest,
  NameOnlyRequest,
  UpdateConteudoRequest,
} from '@fazmais/shared';
import {
  aiSuggest,
  createColecao,
  createConteudo,
  createEixo,
  deleteColecao,
  deleteConteudo,
  deleteEixo,
  getCatalogoTree,
  moveConteudo,
  updateColecao,
  updateConteudo,
  updateEixo,
} from '../api/catalogos.api';

const CATALOGOS_KEY = ['catalogos'];
const treeKey = (catalogoId: string) => ['catalogo-tree', catalogoId];

export function useCatalogoTree(catalogoId: string) {
  return useQuery({ queryKey: treeKey(catalogoId), queryFn: () => getCatalogoTree(catalogoId) });
}

export function useCatalogoBuilder(catalogoId: string) {
  const queryClient = useQueryClient();

  function invalidate() {
    void queryClient.invalidateQueries({ queryKey: treeKey(catalogoId) });
    void queryClient.invalidateQueries({ queryKey: CATALOGOS_KEY });
  }

  const createEixoMutation = useMutation({
    mutationFn: (dto: NameOnlyRequest) => createEixo(catalogoId, dto),
    onSuccess: invalidate,
  });
  const updateEixoMutation = useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: NameOnlyRequest }) => updateEixo(id, dto),
    onSuccess: invalidate,
  });
  const deleteEixoMutation = useMutation({
    mutationFn: (id: string) => deleteEixo(id),
    onSuccess: invalidate,
  });

  const createColecaoMutation = useMutation({
    mutationFn: ({ eixoId, dto }: { eixoId: string; dto: NameOnlyRequest }) => createColecao(eixoId, dto),
    onSuccess: invalidate,
  });
  const updateColecaoMutation = useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: NameOnlyRequest }) => updateColecao(id, dto),
    onSuccess: invalidate,
  });
  const deleteColecaoMutation = useMutation({
    mutationFn: (id: string) => deleteColecao(id),
    onSuccess: invalidate,
  });

  const createConteudoMutation = useMutation({
    mutationFn: ({ colecaoId, dto }: { colecaoId: string; dto: CreateConteudoRequest }) => createConteudo(colecaoId, dto),
    onSuccess: invalidate,
  });
  const updateConteudoMutation = useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: UpdateConteudoRequest }) => updateConteudo(id, dto),
    onSuccess: invalidate,
  });
  const deleteConteudoMutation = useMutation({
    mutationFn: (id: string) => deleteConteudo(id),
    onSuccess: invalidate,
  });
  const moveConteudoMutation = useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: MoveConteudoRequest }) => moveConteudo(id, dto),
    onSuccess: invalidate,
  });

  return {
    createEixo: createEixoMutation,
    updateEixo: updateEixoMutation,
    deleteEixo: deleteEixoMutation,
    createColecao: createColecaoMutation,
    updateColecao: updateColecaoMutation,
    deleteColecao: deleteColecaoMutation,
    createConteudo: createConteudoMutation,
    updateConteudo: updateConteudoMutation,
    deleteConteudo: deleteConteudoMutation,
    moveConteudo: moveConteudoMutation,
  };
}

export function useAiSuggest() {
  return useMutation({ mutationFn: (dto: AiSuggestRequest) => aiSuggest(dto) });
}
