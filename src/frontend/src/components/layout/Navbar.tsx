import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  Menu,
  X,
  Settings,
  LogOut,
  User,
  ChevronDown,
  Bell,
  Briefcase,
  LayoutDashboard,
  ClipboardList,
  Coffee,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { Avatar } from '../ui/Avatar';
import {
  Dropdown,
  DropdownItem,
  DropdownDivider,
} from '../ui/Dropdown';
import { cn } from '../../utils/cn';
import { APP_NAME } from '../../utils/constants';

export function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, profile, signOut, isEmployer } = useAuth();
  useTheme(); // for theme reactivity
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const candidateNavItems = [
    { path: '/app/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/app/assessment', label: 'Assessment', icon: ClipboardList },
    { path: '/app/jobs', label: 'Jobs', icon: Briefcase },
    { path: '/app/chats', label: 'Coffee Chats', icon: Coffee },
  ];

  const employerNavItems = [
    { path: '/app/employer', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/app/employer/roles', label: 'Roles', icon: Briefcase },
    { path: '/app/employer/candidates', label: 'Candidates', icon: User },
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
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{
                background:
                  'linear-gradient(135deg, var(--color-accent), var(--color-accentHover))',
              }}
            >
              <span className="text-sm font-bold text-white">A</span>
            </div>
            <span
              className="text-lg font-semibold hidden sm:block"
              style={{ color: 'var(--color-text)' }}
            >
              {APP_NAME.toLowerCase()}
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
                    'flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-[var(--color-surface)]'
                      : 'hover:bg-[var(--color-surface)]'
                  )}
                  style={{
                    color: isActive
                      ? 'var(--color-text)'
                      : 'var(--color-textSecondary)',
                  }}
                >
                  <item.icon className="w-4 h-4" />
                  {item.label.toLowerCase()}
                </Link>
              );
            })}
          </div>

          {/* Right section */}
          <div className="flex items-center gap-3">
            {/* Notifications */}
            <button
              className="p-2 rounded-lg transition-colors hover:bg-[var(--color-surface)]"
              style={{ color: 'var(--color-textSecondary)' }}
            >
              <Bell className="w-5 h-5" />
            </button>

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
                profile
              </DropdownItem>
              <DropdownItem
                icon={<Settings className="w-4 h-4" />}
                onClick={() => navigate('/app/settings')}
              >
                settings
              </DropdownItem>
              <DropdownDivider />
              <DropdownItem
                icon={<LogOut className="w-4 h-4" />}
                onClick={handleSignOut}
                danger
              >
                sign out
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
                    'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-[var(--color-surface)]'
                      : 'hover:bg-[var(--color-surface)]'
                  )}
                  style={{
                    color: isActive
                      ? 'var(--color-text)'
                      : 'var(--color-textSecondary)',
                  }}
                >
                  <item.icon className="w-5 h-5" />
                  {item.label.toLowerCase()}
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </nav>
  );
}
