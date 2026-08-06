interface PlaceholderPageProps {
  title: string
}

export function PlaceholderPage({ title }: PlaceholderPageProps) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-2 bg-neutral-950 text-neutral-100">
      <span className="text-sm uppercase tracking-widest text-neutral-500">FazMais</span>
      <h1 className="text-2xl font-semibold">{title}</h1>
      <p className="text-neutral-400">Em construção</p>
    </div>
  )
}
