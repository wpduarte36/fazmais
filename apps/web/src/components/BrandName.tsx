import { useMarca } from '../store/marcaStore';

// Nome da marca com a última palavra (em CamelCase) na cor da marca:
// "FazMais" -> Faz + Mais, "PlannetaMais" -> Planneta + Mais. Nome sem
// segunda palavra em maiúscula sai inteiro, sem destaque.
export function BrandName() {
  const { nomeExibicao } = useMarca();
  const corte = nomeExibicao.search(/[A-ZÀ-Ý][^A-ZÀ-Ý]*$/);

  if (corte <= 0) return <>{nomeExibicao}</>;
  return (
    <>
      {nomeExibicao.slice(0, corte)}
      <span className="text-brand-400">{nomeExibicao.slice(corte)}</span>
    </>
  );
}
