import { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { MobileTopBar } from './MobileTopBar';
import { MessagePanelContainer } from '../messaging/MessagePanelContainer';

const SIDEBAR_COLLAPSED_KEY = 'amber-sidebar-collapsed';

export function AppLayout() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
    return localStorage.getItem(SIDEBAR_COLLAPSED_KEY) === 'true';
  });

  // Listen for sidebar collapse changes via storage events
  useEffect(() => {
    const onStorage = () => {
      setSidebarCollapsed(localStorage.getItem(SIDEBAR_COLLAPSED_KEY) === 'true');
    };

    // Also poll briefly since storage events don't fire in the same tab
    const interval = setInterval(onStorage, 200);
    window.addEventListener('storage', onStorage);
    return () => {
      clearInterval(interval);
      window.removeEventListener('storage', onStorage);
    };
  }, []);

  const sidebarWidth = sidebarCollapsed ? 68 : 256;

  return (
    <div
      className="min-h-screen flex flex-row"
      style={{ backgroundColor: 'var(--color-background)' }}
    >
      <Sidebar
        mobileOpen={mobileMenuOpen}
        onMobileClose={() => setMobileMenuOpen(false)}
      />

      <div
        className="flex-1 flex flex-col min-h-screen"
        style={{ marginLeft: undefined }}
      >
        {/* Spacer for desktop sidebar */}
        <div
          className="hidden md:block flex-shrink-0"
          style={{ width: sidebarWidth }}
        />
        <div
          className="flex-1 flex flex-col md:fixed md:inset-y-0 md:right-0 md:overflow-y-auto"
          style={{
            left: sidebarWidth,
            transition: 'left 0.35s cubic-bezier(0.4, 0, 0.2, 1)',
          }}
        >
          <MobileTopBar onMenuClick={() => setMobileMenuOpen(true)} />
          <main className="flex-1">
            <Outlet />
          </main>
        </div>
      </div>

      <MessagePanelContainer />
    </div>
  );
}
