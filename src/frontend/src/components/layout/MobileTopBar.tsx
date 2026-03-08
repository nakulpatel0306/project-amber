import { Menu, Sun, Moon } from 'lucide-react';
import { Link } from 'react-router-dom';
import { AmberLogo } from '../ui/AmberLogo';
import { APP_NAME } from '../../utils/constants';
import { NotificationDropdown } from './NotificationDropdown';
import { BookmarkDropdown } from './BookmarkDropdown';
import { useTheme } from '../../contexts/ThemeContext';

interface MobileTopBarProps {
  onMenuClick: () => void;
}

export function MobileTopBar({ onMenuClick }: MobileTopBarProps) {
  const { isDark, toggleTheme } = useTheme();

  return (
    <div
      className="md:hidden sticky top-0 z-30 flex items-center justify-between h-14 px-4 border-b"
      style={{
        backgroundColor: 'var(--color-backgroundSecondary)',
        borderColor: 'var(--color-border)',
      }}
    >
      <button
        onClick={onMenuClick}
        className="p-2 -ml-2 rounded-lg transition-colors hover:bg-[var(--color-surfaceHover)]"
        style={{ color: 'var(--color-textSecondary)' }}
      >
        <Menu className="w-5 h-5" />
      </button>

      <Link to="/app" className="flex items-center gap-2">
        <AmberLogo size="sm" />
        <span
          className="text-base font-semibold"
          style={{ color: 'var(--color-text)' }}
        >
          {APP_NAME}
        </span>
      </Link>

      <div className="flex items-center gap-1">
        <button
          onClick={toggleTheme}
          className="p-2 rounded-lg transition-colors hover:bg-[var(--color-surfaceHover)]"
          aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
          style={{ color: 'var(--color-textSecondary)' }}
        >
          {isDark ? <Sun className="w-[18px] h-[18px]" /> : <Moon className="w-[18px] h-[18px]" />}
        </button>
        <BookmarkDropdown />
        <NotificationDropdown />
      </div>
    </div>
  );
}
