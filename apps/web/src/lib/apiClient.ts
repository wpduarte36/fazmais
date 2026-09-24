import type { AuthenticatedUser } from '@fazmais/shared';
import { getAccessToken } from './tokenStore';
import { useAuthStore } from '../store/authStore';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:3000';

// Endpoints de auth ficam de fora do fluxo de retry-com-refresh abaixo: um
// 401 aqui já É a resposta final (credencial errada, refresh token morto),
// tentar renovar em cima disso só geraria uma segunda chamada inútil.
const AUTH_ENDPOINTS = new Set(['/auth/login', '/auth/refresh']);

export class ApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

interface RequestOptions {
  method?: string;
  body?: unknown;
}

// Compartilhada entre chamadas simultâneas: se duas requisições tomam 401 ao
// mesmo tempo (access token expirado), só uma bate no /auth/refresh — as
// outras esperam essa mesma promise em vez de disparar refresh cada uma.
let refreshPromise: Promise<boolean> | null = null;

export async function refreshAccessToken(): Promise<boolean> {
  if (!refreshPromise) {
    refreshPromise = (async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
          method: 'POST',
          credentials: 'include',
        });
        if (!response.ok) return false;
        const data = (await response.json().catch(() => null)) as
          | { accessToken: string; user: AuthenticatedUser }
          | null;
        if (!data?.accessToken || !data.user) return false;
        useAuthStore.getState().setSession(data.user, data.accessToken);
        return true;
      } catch {
        return false;
      } finally {
        refreshPromise = null;
      }
    })();
  }
  return refreshPromise;
}

export async function apiRequest<T>(path: string, options: RequestOptions = {}, allowRetry = true): Promise<T> {
  const accessToken = getAccessToken();

  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: options.method ?? 'GET',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
    },
    body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
  });

  if (response.status === 401 && allowRetry && !AUTH_ENDPOINTS.has(path)) {
    const refreshed = await refreshAccessToken();
    if (refreshed) {
      return apiRequest<T>(path, options, false);
    }
    useAuthStore.getState().clearSession();
  }

  const data: unknown = await response.json().catch(() => null);

  if (!response.ok) {
    // ValidationPipe do Nest devolve `message` como lista (um item por regra
    // violada) — sem juntar, qualquer 400 de validação virava a mensagem genérica.
    const rawMessage = data && typeof data === 'object' && 'message' in data ? data.message : null;
    const message =
      typeof rawMessage === 'string'
        ? rawMessage
        : Array.isArray(rawMessage) && rawMessage.length > 0
          ? rawMessage.join(' · ')
          : 'Ocorreu um erro inesperado';
    throw new ApiError(message, response.status);
  }

  return data as T;
}
