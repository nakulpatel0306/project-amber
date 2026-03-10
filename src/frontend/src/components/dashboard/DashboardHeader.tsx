import { Sun, Moon, Sunrise, CloudSun, Sunset, MoonStar } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { NotificationDropdown } from '../layout/NotificationDropdown';

const TIME_VARIANTS = [
  { Icon: Sunrise,  label: 'Morning',   bg: '#F59E0B', glow: '#FBBF24' },  // Bright amber
  { Icon: CloudSun, label: 'Afternoon', bg: '#D97706', glow: '#F59E0B' },  // Warm amber
  { Icon: Sunset,   label: 'Evening',   bg: '#B45309', glow: '#D97706' },  // Deep amber
  { Icon: MoonStar, label: 'Night',     bg: '#78350F', glow: '#92400E' },  // Dark ember
];

function getTimeVariant() {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 12) return TIME_VARIANTS[0];
  if (hour >= 12 && hour < 17) return TIME_VARIANTS[1];
  if (hour >= 17 && hour < 21) return TIME_VARIANTS[2];
  return TIME_VARIANTS[3];
}

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
  const { Icon: TimeIcon, bg, glow } = getTimeVariant();

  return (
    <div className="bento-card rounded-2xl p-6 mb-6">
      <div className="flex items-center justify-between gap-4">
        {/* Left: Greeting */}
        <div className="flex items-center gap-4 flex-1 min-w-0">
          <div
            className="hidden sm:flex items-center justify-center w-11 h-11 rounded-2xl flex-shrink-0"
            style={{ background: `linear-gradient(135deg, ${bg}, ${glow})`, boxShadow: `0 2px 10px ${glow}30` }}
          >
            <TimeIcon className="w-5 h-5 text-white" />
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
              {dateStr} &middot; Check &amp; Maintain Your Match Status
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
