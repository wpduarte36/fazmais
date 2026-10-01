import { createContext, useContext } from 'react';

// Município sobre o qual o Painel Admin age. Pro Admin fica vazio (a API usa
// o município dele); pro Master na "Área do Admin" é o município que ele
// escolheu na aba Municípios — vai como ?tenantId= em toda chamada do painel.
export const TenantAlvoContext = createContext<string | undefined>(undefined);

export function useTenantAlvo(): string | undefined {
  return useContext(TenantAlvoContext);
}

export function comTenant(path: string, tenantId: string | undefined): string {
  if (!tenantId) return path;
  const separador = path.includes('?') ? '&' : '?';
  return `${path}${separador}tenantId=${encodeURIComponent(tenantId)}`;
}
