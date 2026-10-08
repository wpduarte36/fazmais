import { create } from 'zustand';
import { MARCA_PADRAO_SLUG, type MarcaPublica } from '@fazmais/shared';
import { apiRequest } from '../lib/apiClient';
import { aplicarMarcaNoDocumento } from '../lib/marcaTema';

const MARCA_PADRAO: MarcaPublica = {
  slug: MARCA_PADRAO_SLUG,
  nomeExibicao: 'FazMais',
  nomeAssistente: 'Fabinho',
  corPrimaria: null,
  logoUrl: null,
  iconeUrl: null,
  assistenteImagemUrl: null,
  assistenteAvatarUrl: null,
};

// ?marca=<slug> simula outra marca sem precisar do domínio (localhost,
// homologação). Fica na aba até ?marca= vazio. É só visual, como a própria marca.
const CHAVE_SIMULADA = 'marca:simulada';

function lerStorage(storage: () => Storage, chave: string): string | null {
  try {
    return storage().getItem(chave);
  } catch {
    return null;
  }
}

function gravarStorage(storage: () => Storage, chave: string, valor: string | null): void {
  try {
    if (valor === null) storage().removeItem(chave);
    else storage().setItem(chave, valor);
  } catch {
    // storage bloqueado (aba anônima etc.) — segue sem cache
  }
}

function slugSimulado(): string | null {
  const daUrl = new URLSearchParams(window.location.search).get('marca');
  if (daUrl !== null) gravarStorage(() => sessionStorage, CHAVE_SIMULADA, daUrl || null);
  return lerStorage(() => sessionStorage, CHAVE_SIMULADA);
}

interface MarcaState {
  marca: MarcaPublica;
  definirMarca: (marca: MarcaPublica) => void;
}

export const useMarcaStore = create<MarcaState>((set) => ({
  marca: MARCA_PADRAO,
  definirMarca: (marca) => {
    aplicarMarcaNoDocumento(marca);
    set({ marca });
  },
}));

export function useMarca(): MarcaPublica {
  return useMarcaStore((s) => s.marca);
}

// Aplica a última marca vista neste host na hora (sem piscar a marca padrão)
// e revalida com a API. Na primeira visita, sem cache, só resolve depois da
// resposta — o App segura a tela de bootstrap até lá.
export async function carregarMarca(): Promise<void> {
  const slug = slugSimulado();
  const chaveCache = `marca:${window.location.host}:${slug ?? ''}`;
  const { definirMarca } = useMarcaStore.getState();

  const emCache = lerStorage(() => localStorage, chaveCache);
  if (emCache) {
    try {
      definirMarca(JSON.parse(emCache) as MarcaPublica);
    } catch {
      gravarStorage(() => localStorage, chaveCache, null);
    }
  }

  const params = new URLSearchParams({ host: window.location.host });
  if (slug) params.set('slug', slug);
  const buscar = apiRequest<MarcaPublica>(`/marcas/atual?${params}`)
    .then((marca) => {
      definirMarca(marca);
      gravarStorage(() => localStorage, chaveCache, JSON.stringify(marca));
    })
    .catch(() => {
      // API fora do ar: fica com o cache ou a marca padrão
    });

  if (!emCache) await buscar;
}
