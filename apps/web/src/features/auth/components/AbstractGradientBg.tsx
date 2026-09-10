export function AbstractGradientBg() {
  return (
    <>
      <div
        className="pointer-events-none absolute inset-0 opacity-100 transition-opacity light:opacity-0"
        style={{
          background:
            'radial-gradient(38% 50% at 12% 18%, rgba(99,102,241,0.35), transparent 70%),' +
            'radial-gradient(45% 55% at 88% 12%, rgba(251,191,36,0.28), transparent 70%),' +
            'radial-gradient(50% 60% at 78% 90%, rgba(217,119,6,0.22), transparent 70%),' +
            'radial-gradient(40% 50% at 8% 88%, rgba(139,92,246,0.22), transparent 70%),' +
            'radial-gradient(30% 40% at 50% 50%, rgba(129,140,248,0.1), transparent 70%)',
        }}
      />
      <div
        className="pointer-events-none absolute inset-0 opacity-0 transition-opacity light:opacity-100"
        style={{
          background:
            'radial-gradient(38% 50% at 12% 18%, rgba(99,102,241,0.16), transparent 70%),' +
            'radial-gradient(45% 55% at 88% 12%, rgba(251,191,36,0.22), transparent 70%),' +
            'radial-gradient(50% 60% at 78% 90%, rgba(217,119,6,0.14), transparent 70%),' +
            'radial-gradient(40% 50% at 8% 88%, rgba(139,92,246,0.12), transparent 70%)',
        }}
      />
    </>
  );
}
