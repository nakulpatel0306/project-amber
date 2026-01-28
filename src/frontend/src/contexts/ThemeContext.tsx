import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export interface Theme {
  id: string;
  name: string;
  colors: {
    background: string;
    backgroundSecondary: string;
    surface: string;
    surfaceHover: string;
    border: string;
    borderHover: string;
    text: string;
    textSecondary: string;
    textMuted: string;
    accent: string;
    accentHover: string;
    accentText: string;
    success: string;
    error: string;
    warning: string;
  };
}

export const themes: Theme[] = [
  // Amber themes (default for new platform)
  {
    id: 'amber-light',
    name: 'Amber Light',
    colors: {
      background: '#F5F3EF',
      backgroundSecondary: '#FDFCFB',
      surface: '#FFFFFF',
      surfaceHover: '#EBE8E2',
      border: '#DDD8CE',
      borderHover: '#C5BEB2',
      text: '#1C1917',
      textSecondary: '#57534E',
      textMuted: '#78716C',
      accent: '#D97706',
      accentHover: '#B45309',
      accentText: '#FFFFFF',
      success: '#16A34A',
      error: '#DC2626',
      warning: '#F59E0B',
    },
  },
  {
    id: 'amber-dark',
    name: 'Amber Dark',
    colors: {
      background: '#1C1917',
      backgroundSecondary: '#292524',
      surface: '#44403C',
      surfaceHover: '#57534E',
      border: '#57534E',
      borderHover: '#78716C',
      text: '#FAFAF9',
      textSecondary: '#D6D3D1',
      textMuted: '#A8A29E',
      accent: '#F59E0B',
      accentHover: '#D97706',
      accentText: '#1C1917',
      success: '#22C55E',
      error: '#EF4444',
      warning: '#FBBF24',
    },
  },
  // Legacy themes (keep for users who prefer them)
  {
    id: 'midnight',
    name: 'Midnight',
    colors: {
      background: '#0a0a0f',
      backgroundSecondary: '#12121a',
      surface: '#1a1a24',
      surfaceHover: '#22222e',
      border: '#2a2a3a',
      borderHover: '#3a3a4a',
      text: '#f5f5f7',
      textSecondary: '#a1a1aa',
      textMuted: '#71717a',
      accent: '#8b5cf6',
      accentHover: '#7c3aed',
      accentText: '#ffffff',
      success: '#22c55e',
      error: '#ef4444',
      warning: '#f59e0b',
    },
  },
  {
    id: 'snow',
    name: 'Snow',
    colors: {
      background: '#ffffff',
      backgroundSecondary: '#f7f7f8',
      surface: '#f0f0f2',
      surfaceHover: '#e8e8ec',
      border: '#e0e0e5',
      borderHover: '#d0d0d8',
      text: '#1a1a1f',
      textSecondary: '#52525b',
      textMuted: '#a1a1aa',
      accent: '#2563eb',
      accentHover: '#1d4ed8',
      accentText: '#ffffff',
      success: '#16a34a',
      error: '#dc2626',
      warning: '#d97706',
    },
  },
  {
    id: 'ocean',
    name: 'Ocean',
    colors: {
      background: '#0c1222',
      backgroundSecondary: '#111827',
      surface: '#1e293b',
      surfaceHover: '#273548',
      border: '#334155',
      borderHover: '#475569',
      text: '#f1f5f9',
      textSecondary: '#94a3b8',
      textMuted: '#64748b',
      accent: '#38bdf8',
      accentHover: '#0ea5e9',
      accentText: '#0c1222',
      success: '#34d399',
      error: '#f87171',
      warning: '#fbbf24',
    },
  },
  {
    id: 'forest',
    name: 'Forest',
    colors: {
      background: '#0f1612',
      backgroundSecondary: '#161f1a',
      surface: '#1e2a23',
      surfaceHover: '#28362f',
      border: '#2f4038',
      borderHover: '#3d5048',
      text: '#ecfdf5',
      textSecondary: '#a7d4bc',
      textMuted: '#6b9a80',
      accent: '#4ade80',
      accentHover: '#22c55e',
      accentText: '#0f1612',
      success: '#86efac',
      error: '#fca5a5',
      warning: '#fde047',
    },
  },
];

interface ThemeContextType {
  currentTheme: Theme;
  setTheme: (themeId: string) => void;
  themes: Theme[];
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const STORAGE_KEY = 'amber-theme';

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [currentTheme, setCurrentTheme] = useState<Theme>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    const found = themes.find(t => t.id === saved);
    // Default to amber-light for new users
    return found || themes[0];
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, currentTheme.id);

    // Apply CSS variables
    const root = document.documentElement;
    Object.entries(currentTheme.colors).forEach(([key, value]) => {
      root.style.setProperty(`--color-${key}`, value);
    });

    // Set color-scheme for native elements
    const isDark = currentTheme.id.includes('dark') ||
                   currentTheme.id === 'midnight' ||
                   currentTheme.id === 'ocean' ||
                   currentTheme.id === 'forest';
    root.style.colorScheme = isDark ? 'dark' : 'light';
  }, [currentTheme]);

  const setTheme = (themeId: string) => {
    const theme = themes.find(t => t.id === themeId);
    if (theme) {
      setCurrentTheme(theme);
    }
  };

  return (
    <ThemeContext.Provider value={{ currentTheme, setTheme, themes }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
