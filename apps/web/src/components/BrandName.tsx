import { useMarca } from '../store/marcaStore';

// Nome da marca com a última palavra (em CamelCase) na cor da marca:
// "FazMais" -> Faz + Mais, "PlanetaMais" -> Planeta + Mais. Nome sem
// segunda palavra em maiúscula sai inteiro, sem destaque. `nome` sobrescreve
// a marca da URL (prévia no Painel Master).
export function BrandName({ nome }: { nome?: string }) {
  const marca = useMarca();
  const nomeExibicao = nome ?? marca.nomeExibicao;
  const corte = nomeExibicao.search(/[A-ZÀ-Ý][^A-ZÀ-Ý]*$/);

  if (corte <= 0) return <>{nomeExibicao}</>;
  return (
    <>
      {nomeExibicao.slice(0, corte)}
      <span className="text-brand-400">{nomeExibicao.slice(corte)}</span>
    </>
  );
}
