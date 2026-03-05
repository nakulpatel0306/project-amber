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
    id: 'amber-light',
    name: 'Amber Light',
    colors: {
      background: '#F7F4EF',
      backgroundSecondary: '#FDFCFB',
      surface: '#FFFFFF',
      surfaceHover: '#EBE8E2',
      border: '#E8E2D8',
      borderHover: '#C5BEB2',
      text: '#1A1612',
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
      background: '#0C0A09',
      backgroundSecondary: '#171412',
      surface: '#1E1A16',
      surfaceHover: '#2A2520',
      border: '#2A2520',
      borderHover: '#3D3530',
      text: '#F5F0EB',
      textSecondary: '#A69888',
      textMuted: '#6B5E52',
      accent: '#E8862D',
      accentHover: '#F2A558',
      accentText: '#0C0A09',
      success: '#22C55E',
      error: '#EF4444',
      warning: '#FBBF24',
    },
  },
];

interface ThemeContextType {
  currentTheme: Theme;
  isDark: boolean;
  setTheme: (themeId: string) => void;
  toggleTheme: () => void;
  themes: Theme[];
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const STORAGE_KEY = 'amber-theme';

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [currentTheme, setCurrentTheme] = useState<Theme>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    const found = themes.find(t => t.id === saved);
    return found || themes[0];
  });

  const isDark = currentTheme.id === 'amber-dark';

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, currentTheme.id);

    const root = document.documentElement;
    Object.entries(currentTheme.colors).forEach(([key, value]) => {
      root.style.setProperty(`--color-${key}`, value);
    });

    root.style.colorScheme = isDark ? 'dark' : 'light';
  }, [currentTheme, isDark]);

  const setTheme = (themeId: string) => {
    const theme = themes.find(t => t.id === themeId);
    if (theme) {
      setCurrentTheme(theme);
    }
  };

  const toggleTheme = () => {
    setCurrentTheme(isDark ? themes[0] : themes[1]);
  };

  return (
    <ThemeContext.Provider value={{ currentTheme, isDark, setTheme, toggleTheme, themes }}>
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
