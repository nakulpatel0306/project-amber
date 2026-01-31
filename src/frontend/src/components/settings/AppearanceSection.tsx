import { useTheme, themes, type Theme } from '../../contexts/ThemeContext';
import { Check, Sun, Moon } from 'lucide-react';
import { cn } from '../../utils/cn';

export function AppearanceSection() {
  const { currentTheme, setTheme } = useTheme();

  const themeGroups = [
    {
      label: 'Amber',
      description: 'our signature warm palette',
      themes: themes.filter(t => t.id.startsWith('amber')),
    },
    {
      label: 'Other',
      description: 'additional theme options',
      themes: themes.filter(t => !t.id.startsWith('amber')),
    },
  ];

  const isDark = (theme: Theme) =>
    theme.id.includes('dark') ||
    theme.id === 'midnight' ||
    theme.id === 'ocean' ||
    theme.id === 'forest' ||
    theme.id === 'rose';

  return (
    <div className="space-y-6">
      <div>
        <h2
          className="text-lg font-medium mb-1"
          style={{ color: 'var(--color-text)' }}
        >
          Appearance
        </h2>
        <p className="text-sm" style={{ color: 'var(--color-textMuted)' }}>
          Customize how Amber looks on your device
        </p>
      </div>

      {themeGroups.map(group => (
        <div key={group.label}>
          <div className="flex items-center gap-2 mb-3">
            <h3
              className="text-sm font-medium"
              style={{ color: 'var(--color-text)' }}
            >
              {group.label}
            </h3>
            <span
              className="text-xs"
              style={{ color: 'var(--color-textMuted)' }}
            >
              — {group.description}
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {group.themes.map(theme => (
              <button
                key={theme.id}
                onClick={() => setTheme(theme.id)}
                className={cn(
                  'relative p-3 rounded-xl border transition-all text-left',
                  currentTheme.id === theme.id
                    ? 'ring-2 ring-[var(--color-accent)]'
                    : 'hover:border-[var(--color-borderHover)]'
                )}
                style={{
                  borderColor:
                    currentTheme.id === theme.id
                      ? 'var(--color-accent)'
                      : 'var(--color-border)',
                  backgroundColor: 'var(--color-surface)',
                }}
              >
                {/* Theme preview */}
                <div
                  className="w-full h-16 rounded-lg mb-2 overflow-hidden"
                  style={{ backgroundColor: theme.colors.background }}
                >
                  <div className="h-full p-2 flex flex-col">
                    <div
                      className="w-full h-2 rounded mb-1"
                      style={{ backgroundColor: theme.colors.surface }}
                    />
                    <div className="flex gap-1 flex-1">
                      <div
                        className="w-1/3 rounded"
                        style={{ backgroundColor: theme.colors.surface }}
                      />
                      <div className="flex-1 flex flex-col gap-1">
                        <div
                          className="h-1.5 rounded w-3/4"
                          style={{ backgroundColor: theme.colors.textMuted }}
                        />
                        <div
                          className="h-1.5 rounded w-1/2"
                          style={{ backgroundColor: theme.colors.accent }}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Theme info */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {isDark(theme) ? (
                      <Moon className="w-3 h-3" style={{ color: 'var(--color-textMuted)' }} />
                    ) : (
                      <Sun className="w-3 h-3" style={{ color: 'var(--color-textMuted)' }} />
                    )}
                    <span
                      className="text-xs font-medium"
                      style={{ color: 'var(--color-text)' }}
                    >
                      {theme.name}
                    </span>
                  </div>
                  {currentTheme.id === theme.id && (
                    <Check
                      className="w-4 h-4"
                      style={{ color: 'var(--color-accent)' }}
                    />
                  )}
                </div>

                {/* Color swatches */}
                <div className="flex gap-1 mt-2">
                  <div
                    className="w-4 h-4 rounded-full"
                    style={{ backgroundColor: theme.colors.accent }}
                    title="Accent"
                  />
                  <div
                    className="w-4 h-4 rounded-full"
                    style={{ backgroundColor: theme.colors.background }}
                    title="Background"
                  />
                  <div
                    className="w-4 h-4 rounded-full"
                    style={{ backgroundColor: theme.colors.text }}
                    title="Text"
                  />
                </div>
              </button>
            ))}
          </div>
        </div>
      ))}

      {/* Info */}
      <div
        className="p-4 rounded-xl text-sm"
        style={{
          backgroundColor: 'var(--color-surface)',
          color: 'var(--color-textSecondary)',
        }}
      >
        <p>
          Theme preference is saved locally and will persist across sessions.
        </p>
      </div>
    </div>
  );
}
