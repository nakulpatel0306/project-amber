import { useState } from 'react';
import {
  Settings,
  Coffee,
  Users,
  X,
  User,
} from 'lucide-react';
import { WelcomeScreen } from './WelcomeScreen';
import { AssessmentFlow } from './AssessmentFlow';
import { CandidateDashboard } from './CandidateDashboard';
import { SettingsPanel } from './SettingsPanel';
import { AccountPage } from './AccountPage';
import { FeedbackWidget } from './FeedbackWidget';
import { useAuth } from '../contexts/AuthContext';

type View = 'welcome' | 'assessment' | 'dashboard' | 'account';
type SidebarView = 'none' | 'settings';

export function ChatInterface() {
  const { user, isAuthEnabled } = useAuth();
  const [currentView, setCurrentView] = useState<View>('welcome');
  const [sidebarView, setSidebarView] = useState<SidebarView>('none');

  const handleClearHistory = () => {
    // Reset to welcome screen
    setCurrentView('welcome');
    setSidebarView('none');
  };

  const getCurrentPageName = () => {
    switch (currentView) {
      case 'welcome':
        return 'home';
      case 'assessment':
        return 'assessment';
      case 'dashboard':
        return 'dashboard';
      case 'account':
        return 'account';
      default:
        return 'unknown';
    }
  };

  return (
    <div className="flex h-screen" style={{ backgroundColor: 'var(--color-background)' }}>
      {/* sidebar */}
      <aside
        className="w-14 flex flex-col items-center py-4 border-r"
        style={{
          backgroundColor: 'var(--color-backgroundSecondary)',
          borderColor: 'var(--color-border)',
        }}
      >
        {/* logo */}
        <div className="mb-6">
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center cursor-pointer btn-smooth"
            style={{
              background: 'linear-gradient(135deg, var(--color-accent), var(--color-accentHover))',
            }}
            onClick={() => setCurrentView('welcome')}
            title="home"
          >
            <Coffee className="w-5 h-5 text-white" />
          </div>
        </div>

        {/* nav items */}
        <nav className="flex-1 flex flex-col items-center gap-2">
          <NavButton
            icon={<Coffee className="w-4 h-4" />}
            active={currentView === 'assessment'}
            onClick={() => setCurrentView('assessment')}
            title="assessment"
          />
          <NavButton
            icon={<Users className="w-4 h-4" />}
            active={currentView === 'dashboard'}
            onClick={() => setCurrentView('dashboard')}
            title="dashboard"
          />
        </nav>

        {/* bottom items */}
        <div className="flex flex-col items-center gap-2">
          {isAuthEnabled && user && (
            <NavButton
              icon={<User className="w-4 h-4" />}
              active={currentView === 'account'}
              onClick={() => setCurrentView('account')}
              title="account"
            />
          )}
          <NavButton
            icon={<Settings className="w-4 h-4" />}
            active={sidebarView === 'settings'}
            onClick={() => setSidebarView(sidebarView === 'settings' ? 'none' : 'settings')}
            title="settings"
          />
        </div>
      </aside>

      {/* settings panel */}
      {sidebarView !== 'none' && (
        <div
          className="w-80 border-r flex flex-col slide-in-right"
          style={{
            backgroundColor: 'var(--color-backgroundSecondary)',
            borderColor: 'var(--color-border)',
          }}
        >
          <div
            className="flex items-center justify-between px-4 py-3 border-b"
            style={{ borderColor: 'var(--color-border)' }}
          >
            <h2
              className="text-sm font-medium"
              style={{ color: 'var(--color-text)' }}
            >
              settings
            </h2>
            <button
              onClick={() => setSidebarView('none')}
              className="p-1.5 rounded-lg transition-colors"
              style={{ color: 'var(--color-textMuted)' }}
              onMouseEnter={e => (e.currentTarget.style.backgroundColor = 'var(--color-surface)')}
              onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4">
            <SettingsPanel onClearHistory={handleClearHistory} />
          </div>
        </div>
      )}

      {/* main content */}
      <div className="flex-1 flex flex-col">
        {/* header */}
        <header
          className="flex items-center justify-between px-5 py-3 border-b"
          style={{
            backgroundColor: 'var(--color-background)',
            borderColor: 'var(--color-border)',
          }}
        >
          <div className="flex items-center gap-2">
            <span className="brand-font" style={{ color: 'var(--color-text)' }}>
              luna culturesync
            </span>
            <span
              className="text-[10px] px-1.5 py-0.5 rounded"
              style={{
                backgroundColor: 'var(--color-surface)',
                color: 'var(--color-textMuted)',
              }}
            >
              beta
            </span>
          </div>
        </header>

        {/* content area */}
        <main className="flex-1 overflow-y-auto">
          {currentView === 'welcome' && (
            <WelcomeScreen
              onStartAssessment={() => setCurrentView('assessment')}
              onViewDashboard={() => setCurrentView('dashboard')}
            />
          )}
          {currentView === 'assessment' && <AssessmentFlow />}
          {currentView === 'dashboard' && <CandidateDashboard />}
          {currentView === 'account' && <AccountPage />}
        </main>
      </div>

      {/* feedback widget */}
      <FeedbackWidget page={getCurrentPageName()} />
    </div>
  );
}

function NavButton({
  icon,
  active,
  onClick,
  title,
}: {
  icon: React.ReactNode;
  active: boolean;
  onClick: () => void;
  title: string;
}) {
  return (
    <button
      onClick={onClick}
      className="w-9 h-9 flex items-center justify-center rounded-lg transition-all duration-150"
      style={{
        backgroundColor: active ? 'var(--color-surface)' : 'transparent',
        color: active ? 'var(--color-accent)' : 'var(--color-textMuted)',
      }}
      onMouseEnter={e => {
        if (!active) {
          e.currentTarget.style.backgroundColor = 'var(--color-surface)';
        }
      }}
      onMouseLeave={e => {
        if (!active) {
          e.currentTarget.style.backgroundColor = 'transparent';
        }
      }}
      title={title}
    >
      {icon}
    </button>
  );
}
