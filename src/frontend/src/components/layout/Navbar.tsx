import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  Menu,
  X,
  Settings,
  LogOut,
  User,
  Crown,
  ChevronDown,
  LayoutDashboard,
  Coffee,
  Sparkles,
  Flame,
  Globe,
  Sun,
  Moon,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { Avatar } from '../ui/Avatar';
import { AmberLogo } from '../ui/AmberLogo';
import {
  Dropdown,
  DropdownItem,
  DropdownDivider,
} from '../ui/Dropdown';
import { cn } from '../../utils/cn';
import { APP_NAME } from '../../utils/constants';
import { NotificationDropdown } from './NotificationDropdown';
import { BookmarkDropdown } from './BookmarkDropdown';

export function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, profile, signOut, isEmployer } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const candidateNavItems: { path: string; label: string; icon: React.ElementType }[] = [
    { path: '/app/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/app/insights', label: 'Insights', icon: Sparkles },
    { path: '/app/ember', label: 'Ember', icon: Flame },
    { path: '/app/network', label: 'Network', icon: Globe },
    { path: '/app/chats', label: 'Coffee Chats', icon: Coffee },
  ];

  const employerNavItems: { path: string; label: string; icon: React.ElementType }[] = [
    { path: '/app/employer', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/app/employer/insights', label: 'Insights', icon: Sparkles },
    { path: '/app/employer/ember', label: 'Ember', icon: Flame },
    { path: '/app/network', label: 'Network', icon: Globe },
    { path: '/app/employer/chats', label: 'Coffee Chats', icon: Coffee },
  ];

  const navItems = isEmployer ? employerNavItems : candidateNavItems;

  return (
    <nav
      className="sticky top-0 z-40 border-b"
      style={{
        backgroundColor: 'var(--color-backgroundSecondary)',
        borderColor: 'var(--color-border)',
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/app" className="flex items-center gap-2">
            <AmberLogo size="sm" />
            <span
              className="text-lg font-semibold hidden sm:block"
              style={{ color: 'var(--color-text)' }}
            >
              {APP_NAME}
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-1">
            {navItems.map(item => {
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={cn(
                    'flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-150',
                    isActive
                      ? 'bg-[var(--color-accent)]'
                      : 'hover:bg-[var(--color-surface)]'
                  )}
                  style={{
                    color: isActive
                      ? 'var(--color-accentText)'
                      : 'var(--color-textSecondary)',
                  }}
                >
                  {item.icon && <item.icon className="w-4 h-4" />}
                  {item.label}
                </Link>
              );
            })}
          </div>

          {/* Right section */}
          <div className="flex items-center gap-3">
            {/* Theme toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg transition-colors hover:bg-[var(--color-surface)]"
              aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {isDark ? (
                <Sun className="w-4.5 h-4.5" style={{ color: 'var(--color-textSecondary)' }} />
              ) : (
                <Moon className="w-4.5 h-4.5" style={{ color: 'var(--color-textSecondary)' }} />
              )}
            </button>

            {/* Bookmarks (employers only) */}
            <BookmarkDropdown />

            {/* Notifications */}
            <NotificationDropdown />

            {/* User menu */}
            <Dropdown
              align="right"
              trigger={
                <button className="flex items-center gap-2 p-1.5 rounded-lg transition-colors hover:bg-[var(--color-surface)]">
                  <Avatar
                    src={profile?.avatar_url}
                    fallback={profile?.full_name || user?.email}
                    size="sm"
                  />
                  <ChevronDown
                    className="w-4 h-4 hidden sm:block"
                    style={{ color: 'var(--color-textMuted)' }}
                  />
                </button>
              }
            >
              <div className="px-3 py-2">
                <p
                  className="text-sm font-medium truncate"
                  style={{ color: 'var(--color-text)' }}
                >
                  {profile?.full_name || 'User'}
                </p>
                <p
                  className="text-xs truncate"
                  style={{ color: 'var(--color-textMuted)' }}
                >
                  {user?.email}
                </p>
              </div>
              <DropdownDivider />
              <DropdownItem
                icon={<User className="w-4 h-4" />}
                onClick={() => navigate('/app/settings/profile')}
              >
                Profile
              </DropdownItem>
              <DropdownItem
                icon={<Crown className="w-4 h-4" />}
                onClick={() => navigate('/app/pricing')}
              >
                Upgrade Plan
              </DropdownItem>
              <DropdownItem
                icon={<Settings className="w-4 h-4" />}
                onClick={() => navigate('/app/settings')}
              >
                Settings
              </DropdownItem>
              <DropdownDivider />
              <DropdownItem
                icon={<LogOut className="w-4 h-4" />}
                onClick={handleSignOut}
                danger
              >
                Sign Out
              </DropdownItem>
            </Dropdown>

            {/* Mobile menu button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg transition-colors hover:bg-[var(--color-surface)]"
              style={{ color: 'var(--color-textSecondary)' }}
            >
              {mobileMenuOpen ? (
                <X className="w-5 h-5" />
              ) : (
                <Menu className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      {mobileMenuOpen && (
        <div
          className="md:hidden border-t"
          style={{ borderColor: 'var(--color-border)' }}
        >
          <div className="px-4 py-3 space-y-1">
            {navItems.map(item => {
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className={cn(
                    'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150',
                    isActive
                      ? 'bg-[var(--color-accent)]'
                      : 'hover:bg-[var(--color-surface)]'
                  )}
                  style={{
                    color: isActive
                      ? 'var(--color-accentText)'
                      : 'var(--color-textSecondary)',
                  }}
                >
                  {item.icon && <item.icon className="w-5 h-5" />}
                  {item.label}
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </nav>
  );
}
