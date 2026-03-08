import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  Settings,
  LogOut,
  LayoutDashboard,
  Coffee,
  Sparkles,
  Flame,
  Globe,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { Avatar } from '../ui/Avatar';
import { AmberLogo } from '../ui/AmberLogo';
import { cn } from '../../utils/cn';
import { APP_NAME } from '../../utils/constants';

const SIDEBAR_COLLAPSED_KEY = 'amber-sidebar-collapsed';

interface SidebarProps {
  mobileOpen: boolean;
  onMobileClose: () => void;
}

export function Sidebar({ mobileOpen, onMobileClose }: SidebarProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, profile, signOut, isEmployer } = useAuth();

  const [collapsed, setCollapsed] = useState(() => {
    return localStorage.getItem(SIDEBAR_COLLAPSED_KEY) === 'true';
  });

  useEffect(() => {
    localStorage.setItem(SIDEBAR_COLLAPSED_KEY, String(collapsed));
    // Set CSS custom property for loader/fullscreen centering
    const width = window.innerWidth >= 768 ? (collapsed ? '68px' : '256px') : '0px';
    document.documentElement.style.setProperty('--sidebar-width', width);
  }, [collapsed]);

  // Update on resize (mobile ↔ desktop)
  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth >= 768 ? (collapsed ? '68px' : '256px') : '0px';
      document.documentElement.style.setProperty('--sidebar-width', width);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [collapsed]);

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const candidateNavItems = [
    { path: '/app/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/app/insights', label: 'Insights', icon: Sparkles },
    { path: '/app/ember', label: 'Ember', icon: Flame },
    { path: '/app/network', label: 'Network', icon: Globe },
    { path: '/app/chats', label: 'Coffee Chats', icon: Coffee },
  ];

  const employerNavItems = [
    { path: '/app/employer', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/app/employer/insights', label: 'Insights', icon: Sparkles },
    { path: '/app/employer/ember', label: 'Ember', icon: Flame },
    { path: '/app/network', label: 'Network', icon: Globe },
    { path: '/app/employer/chats', label: 'Coffee Chats', icon: Coffee },
  ];

  const navItems = isEmployer ? employerNavItems : candidateNavItems;

  const sidebarContent = (
    <div className="flex flex-col h-full">
      {/* Header — logo toggles sidebar on desktop, navigates on mobile */}
      <div
        className={cn(
          'flex items-center h-14 px-4 border-b',
          collapsed ? 'justify-center' : 'justify-start'
        )}
        style={{ borderColor: 'var(--color-border)' }}
      >
        {/* Desktop: logo toggles collapse */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          className="hidden md:flex items-center gap-2 transition-transform hover:scale-105 overflow-hidden whitespace-nowrap"
        >
          <AmberLogo size="sm" />
          <span
            className="text-base font-semibold transition-[opacity,width] duration-200 overflow-hidden"
            style={{
              color: 'var(--color-text)',
              width: collapsed ? 0 : 'auto',
              opacity: collapsed ? 0 : 1,
            }}
          >
            {APP_NAME}
          </span>
        </button>
        {/* Mobile: logo navigates home */}
        <Link
          to="/app"
          onClick={onMobileClose}
          className="md:hidden flex items-center gap-2"
        >
          <AmberLogo size="sm" />
          <span
            className="text-base font-semibold"
            style={{ color: 'var(--color-text)' }}
          >
            {APP_NAME}
          </span>
        </Link>
      </div>

      {/* Nav Items */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto overflow-x-hidden">
        {navItems.map(item => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              onClick={onMobileClose}
              title={collapsed ? item.label : undefined}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 whitespace-nowrap overflow-hidden',
                collapsed && 'justify-center px-0',
                isActive
                  ? 'bg-[var(--color-accent)]'
                  : 'hover:bg-[var(--color-surfaceHover)]'
              )}
              style={{
                color: isActive
                  ? 'var(--color-accentText)'
                  : 'var(--color-textSecondary)',
              }}
            >
              <item.icon className="w-[18px] h-[18px] flex-shrink-0" />
              {!collapsed && item.label}
            </Link>
          );
        })}

        {/* Divider */}
        <div className="my-3 border-t" style={{ borderColor: 'var(--color-border)' }} />

        {/* Settings */}
        <Link
          to="/app/settings"
          onClick={onMobileClose}
          title={collapsed ? 'Settings' : undefined}
          className={cn(
            'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 whitespace-nowrap overflow-hidden',
            collapsed && 'justify-center px-0',
            location.pathname.startsWith('/app/settings')
              ? 'bg-[var(--color-accent)]'
              : 'hover:bg-[var(--color-surfaceHover)]'
          )}
          style={{
            color: location.pathname.startsWith('/app/settings')
              ? 'var(--color-accentText)'
              : 'var(--color-textSecondary)',
          }}
        >
          <Settings className="w-[18px] h-[18px] flex-shrink-0" />
          {!collapsed && 'Settings'}
        </Link>
      </nav>

      {/* Footer */}
      <div
        className="px-3 py-3 border-t overflow-hidden"
        style={{ borderColor: 'var(--color-border)' }}
      >
        {/* User info */}
        <div
          className={cn(
            'flex items-center gap-3 mt-1 px-3 py-2 rounded-lg overflow-hidden',
            collapsed && 'justify-center px-0'
          )}
        >
          <Avatar
            src={profile?.avatar_url}
            fallback={profile?.full_name || user?.email}
            size="sm"
          />
          {!collapsed && (
            <div className="flex-1 min-w-0">
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
          )}
        </div>

        {/* Sign Out */}
        <button
          onClick={handleSignOut}
          title={collapsed ? 'Sign Out' : undefined}
          className={cn(
            'flex items-center gap-3 w-full px-3 py-2 rounded-lg text-sm transition-colors hover:bg-[var(--color-surfaceHover)] whitespace-nowrap overflow-hidden',
            collapsed && 'justify-center px-0'
          )}
          style={{ color: 'var(--color-error)' }}
        >
          {/* Match avatar width (32px) so icon aligns with avatar above */}
          <div className="w-8 h-8 flex items-center justify-center flex-shrink-0">
            <LogOut className="w-[18px] h-[18px]" />
          </div>
          {!collapsed && 'Sign Out'}
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <aside
        className={cn(
          'hidden md:flex flex-col fixed inset-y-0 left-0 z-40 border-r transition-[width] duration-200 overflow-hidden',
          collapsed ? 'w-[68px]' : 'w-64'
        )}
        style={{
          backgroundColor: 'var(--color-backgroundSecondary)',
          borderColor: 'var(--color-border)',
        }}
      >
        {sidebarContent}
      </aside>

      {/* Mobile overlay */}
      {mobileOpen && (
        <>
          <div
            className="md:hidden fixed inset-0 z-40 bg-black/50"
            onClick={onMobileClose}
          />
          <aside
            className="md:hidden fixed inset-y-0 left-0 z-50 w-64 border-r"
            style={{
              backgroundColor: 'var(--color-backgroundSecondary)',
              borderColor: 'var(--color-border)',
            }}
          >
            {sidebarContent}
          </aside>
        </>
      )}

    </>
  );
}

export function useSidebarCollapsed() {
  const [collapsed] = useState(() => {
    return localStorage.getItem(SIDEBAR_COLLAPSED_KEY) === 'true';
  });
  return collapsed;
}
