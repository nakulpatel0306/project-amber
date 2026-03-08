import { useTheme } from '../../contexts/ThemeContext';
import { Sun, Moon } from 'lucide-react';

export function AppearanceSection() {
  const { isDark, toggleTheme } = useTheme();

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

      {/* Toggle row */}
      <div
        className="flex items-center justify-between p-4 rounded-xl border"
        style={{
          backgroundColor: 'var(--color-surface)',
          borderColor: 'var(--color-border)',
        }}
      >
        <div className="flex items-center gap-3">
          {isDark ? (
            <Moon className="w-5 h-5" style={{ color: 'var(--color-accent)' }} />
          ) : (
            <Sun className="w-5 h-5" style={{ color: 'var(--color-accent)' }} />
          )}
          <div>
            <p className="text-sm font-medium" style={{ color: 'var(--color-text)' }}>
              {isDark ? 'Dark Mode' : 'Light Mode'}
            </p>
            <p className="text-xs" style={{ color: 'var(--color-textMuted)' }}>
              {isDark ? 'Amber Dark theme active' : 'Amber Light theme active'}
            </p>
          </div>
        </div>

        <button
          onClick={toggleTheme}
          className="relative w-12 h-7 rounded-full transition-colors duration-200"
          style={{
            backgroundColor: isDark ? 'var(--color-accent)' : 'var(--color-border)',
          }}
          aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
        >
          <span
            className="absolute top-0.5 left-0.5 w-6 h-6 rounded-full bg-white shadow transition-transform duration-200 flex items-center justify-center"
            style={{
              transform: isDark ? 'translateX(20px)' : 'translateX(0)',
            }}
          >
            {isDark ? (
              <Moon className="w-3.5 h-3.5" style={{ color: 'var(--color-accent)' }} />
            ) : (
              <Sun className="w-3.5 h-3.5" style={{ color: '#D97706' }} />
            )}
          </span>
        </button>
      </div>

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
