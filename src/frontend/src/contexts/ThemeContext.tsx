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
    id: 'claude',
    name: 'Claude',
    colors: {
      background: '#1a1915',
      backgroundSecondary: '#252420',
      surface: '#2d2c28',
      surfaceHover: '#3a3935',
      border: '#3d3c38',
      borderHover: '#4d4c48',
      text: '#f5f4ef',
      textSecondary: '#b8b5a8',
      textMuted: '#8a8778',
      accent: '#da7756',
      accentHover: '#c96645',
      accentText: '#ffffff',
      success: '#5fb280',
      error: '#e67373',
      warning: '#d9a441',
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
    id: 'rose',
    name: 'Rose',
    colors: {
      background: '#1f1318',
      backgroundSecondary: '#2a1a22',
      surface: '#362430',
      surfaceHover: '#442e3c',
      border: '#4a3542',
      borderHover: '#5c4250',
      text: '#fdf2f5',
      textSecondary: '#d4a5b5',
      textMuted: '#9a7585',
      accent: '#f472b6',
      accentHover: '#ec4899',
      accentText: '#1f1318',
      success: '#86efac',
      error: '#fca5a5',
      warning: '#fcd34d',
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

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [currentTheme, setCurrentTheme] = useState<Theme>(() => {
    const saved = localStorage.getItem('luma-theme');
    const found = themes.find(t => t.id === saved);
    return found || themes[0];
  });

  useEffect(() => {
    localStorage.setItem('luma-theme', currentTheme.id);

    // Apply CSS variables
    const root = document.documentElement;
    Object.entries(currentTheme.colors).forEach(([key, value]) => {
      root.style.setProperty(`--color-${key}`, value);
    });
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
