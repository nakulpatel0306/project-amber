import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { NotificationDropdown } from '../layout/NotificationDropdown';
import { EmberFirefly } from '../ember/EmberFirefly';

interface DashboardHeaderProps {
  greeting: string;
  firstName: string;
}

export function DashboardHeader({ greeting, firstName }: DashboardHeaderProps) {
  const { isDark, toggleTheme } = useTheme();
  const today = new Date();
  const dateStr = today.toLocaleDateString('en-US', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

  return (
    <div className="bento-card rounded-2xl p-6 mb-6">
      <div className="flex items-center justify-between gap-4">
        {/* Left: Greeting */}
        <div className="flex items-center gap-4 flex-1 min-w-0">
          <div className="hidden sm:block ember-hover-flutter flex-shrink-0 mt-1">
            <EmberFirefly size="sm" mood="happy" animated />
          </div>
          <div className="min-w-0">
            <h1
              className="text-3xl font-bold tracking-tight"
              style={{ color: 'var(--color-text)', fontFamily: 'var(--font-display)' }}
            >
              {greeting}, {firstName}
            </h1>
            <p
              className="text-sm mt-1"
              style={{ color: 'var(--color-textMuted)' }}
            >
              {dateStr} &middot; Check &amp; maintain your match status
            </p>
          </div>
        </div>

        {/* Right: Theme toggle + Notifications together */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <button
            onClick={toggleTheme}
            className="p-2 rounded-lg transition-colors hover:bg-[var(--color-surfaceHover)]"
            aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
            style={{ color: 'var(--color-textSecondary)' }}
          >
            {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>
          <NotificationDropdown />
        </div>
      </div>
    </div>
  );
}
