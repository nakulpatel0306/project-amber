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
      background: '#FAFAFA',
      backgroundSecondary: '#FFFFFF',
      surface: '#FFFFFF',
      surfaceHover: '#F5F5F5',
      border: '#E5E5E5',
      borderHover: '#CCCCCC',
      text: '#0A0A0A',
      textSecondary: '#666666',
      textMuted: '#999999',
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
      background: '#000000',
      backgroundSecondary: '#0A0A0A',
      surface: '#111111',
      surfaceHover: '#1A1A1A',
      border: '#222222',
      borderHover: '#333333',
      text: '#FAFAFA',
      textSecondary: '#888888',
      textMuted: '#555555',
      accent: '#F09030',
      accentHover: '#F5A855',
      accentText: '#000000',
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
