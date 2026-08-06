import { create } from 'zustand';
import type { AuthenticatedUser } from '@fazmais/shared';
import { setAccessToken } from '../lib/tokenStore';

interface AuthState {
  user: AuthenticatedUser | null;
  isAuthenticated: boolean;
  setSession: (user: AuthenticatedUser, accessToken: string) => void;
  clearSession: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  setSession: (user, accessToken) => {
    setAccessToken(accessToken);
    set({ user, isAuthenticated: true });
  },
  clearSession: () => {
    setAccessToken(null);
    set({ user: null, isAuthenticated: false });
  },
}));
