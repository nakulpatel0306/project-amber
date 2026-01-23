import { useTheme } from '../contexts/ThemeContext';
import { Check, Palette } from 'lucide-react';

export function ThemeSelector() {
  const { currentTheme, setTheme, themes } = useTheme();

  return (
    <div>
      <div className="flex items-center gap-2 mb-4">
        <Palette className="w-4 h-4" style={{ color: 'var(--color-textSecondary)' }} />
        <h3 className="text-sm font-medium" style={{ color: 'var(--color-text)' }}>
          Theme
        </h3>
      </div>

      <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
        {themes.map(theme => {
          const isSelected = currentTheme.id === theme.id;

          return (
            <button
              key={theme.id}
              onClick={() => setTheme(theme.id)}
              className="group relative flex flex-col items-center gap-2 p-3 rounded-xl border transition-all"
              style={{
                backgroundColor: isSelected ? 'var(--color-surfaceHover)' : 'var(--color-surface)',
                borderColor: isSelected ? 'var(--color-accent)' : 'var(--color-border)',
              }}
              onMouseEnter={e => {
                if (!isSelected) {
                  e.currentTarget.style.borderColor = 'var(--color-borderHover)';
                }
              }}
              onMouseLeave={e => {
                if (!isSelected) {
                  e.currentTarget.style.borderColor = 'var(--color-border)';
                }
              }}
            >
              {/* Color preview */}
              <div className="relative w-10 h-10 rounded-lg overflow-hidden border border-black/10">
                {/* Background preview */}
                <div
                  className="absolute inset-0"
                  style={{ backgroundColor: theme.colors.background }}
                />
                {/* Surface preview */}
                <div
                  className="absolute bottom-0 left-0 right-0 h-1/2 rounded-t"
                  style={{ backgroundColor: theme.colors.surface }}
                />
                {/* Accent dot */}
                <div
                  className="absolute top-1.5 right-1.5 w-2.5 h-2.5 rounded-full"
                  style={{ backgroundColor: theme.colors.accent }}
                />
              </div>

              {/* Theme name */}
              <span
                className="text-xs font-medium"
                style={{ color: 'var(--color-text)' }}
              >
                {theme.name}
              </span>

              {/* Selected indicator */}
              {isSelected && (
                <div
                  className="absolute -top-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center"
                  style={{ backgroundColor: 'var(--color-accent)' }}
                >
                  <Check className="w-3 h-3 text-white" strokeWidth={3} />
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
