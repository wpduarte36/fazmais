import { create } from 'zustand';

type Theme = 'dark' | 'light';

function applyThemeClass(theme: Theme): void {
  document.documentElement.classList.toggle('light', theme === 'light');
}

interface ThemeState {
  theme: Theme;
  toggleTheme: () => void;
}

export const useThemeStore = create<ThemeState>((set, get) => ({
  theme: 'dark',
  toggleTheme: () => {
    const next: Theme = get().theme === 'dark' ? 'light' : 'dark';
    applyThemeClass(next);
    set({ theme: next });
  },
}));
