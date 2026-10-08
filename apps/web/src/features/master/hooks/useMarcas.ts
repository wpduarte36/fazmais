import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { UpdateMarcaRequest } from '@fazmais/shared';
import { listMarcas, updateMarca } from '../api/marcas.api';
import { carregarMarca } from '../../../store/marcaStore';

const MARCAS_KEY = ['marcas'];

export function useMarcas() {
  return useQuery({ queryKey: MARCAS_KEY, queryFn: listMarcas });
}

export function useUpdateMarca() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: UpdateMarcaRequest }) => updateMarca(id, dto),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: MARCAS_KEY });
      // A lista de municípios mostra o nome da marca.
      void queryClient.invalidateQueries({ queryKey: ['tenants'] });
      // Se a marca editada é a da tela atual, já aplica.
      void carregarMarca();
    },
  });
}
