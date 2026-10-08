import { useCallback, useEffect, useRef } from 'react';
import { useThemeStore } from '../../../store/themeStore';

// Biblioteca de Apps mantida fora do FazMais (a mesma que o legado mostra em
// /application/library-apps). É pública: não precisa de login. O site aceita
// o tema por postMessage — "true" = escuro, "false" = claro — igual o legado faz.
const BIBLIOTECA_APPS_URL = 'https://bibliotecapp.fazeducacao.com.br/aplicativos';
const BIBLIOTECA_APPS_ORIGEM = new URL(BIBLIOTECA_APPS_URL).origin;

export function BibliotecaAppsExterna() {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const theme = useThemeStore((state) => state.theme);

  const enviarTema = useCallback(() => {
    iframeRef.current?.contentWindow?.postMessage(theme === 'dark' ? 'true' : 'false', BIBLIOTECA_APPS_ORIGEM);
  }, [theme]);

  useEffect(enviarTema, [enviarTema]);

  return (
    <iframe
      ref={iframeRef}
      src={BIBLIOTECA_APPS_URL}
      title="Biblioteca de Apps"
      onLoad={enviarTema}
      className="h-[calc(100vh-11rem)] min-h-[560px] w-full rounded-xl border border-white/10 bg-white light:border-black/10"
    />
  );
}
