interface BackButtonProps {
  onClick: () => void;
  label?: string;
  className?: string;
}

// Botão "← Voltar" padrão do sistema — mesmo visual em todo lugar que tem
// um nível acima pra onde voltar (construtor de catálogo, eixo/busca da Home,
// definir senha). Quem usa decide o destino via onClick, porque "voltar"
// aqui é sempre pro nível pai, não necessariamente pra página anterior do
// histórico (que pode ser o login ou outro site).
export function BackButton({ onClick, label = 'Voltar', className = '' }: BackButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/[0.03] px-3 py-1 text-xs font-semibold text-neutral-300 transition hover:border-amber-400/50 hover:text-amber-400 light:border-black/10 light:bg-black/[0.03] light:text-neutral-600 light:hover:text-amber-600 ${className}`}
    >
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
        <path d="M19 12H5M12 19l-7-7 7-7" />
      </svg>
      {label}
    </button>
  );
}
