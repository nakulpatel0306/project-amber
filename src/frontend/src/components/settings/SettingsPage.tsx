import { useParams, useNavigate } from 'react-router-dom';
import {
  User,
  Bell,
  Shield,
  Palette,
  MessageSquare,
  Settings,
  ChevronRight,
} from 'lucide-react';
import { cn } from '../../utils/cn';

// Section components
import { ProfileSection } from './ProfileSection';
import { NotificationSection } from './NotificationSection';
import { PrivacySection } from './PrivacySection';
import { AppearanceSection } from './AppearanceSection';
import { FeedbackSection } from './FeedbackSection';
import { AccountSection } from './AccountSection';

type SettingsSection = 'profile' | 'notifications' | 'privacy' | 'appearance' | 'feedback' | 'account';

const sections: {
  id: SettingsSection;
  label: string;
  icon: React.ElementType;
  description: string;
}[] = [
  { id: 'profile', label: 'Profile', icon: User, description: 'Manage your personal info' },
  { id: 'notifications', label: 'Notifications', icon: Bell, description: 'Email and push preferences' },
  { id: 'privacy', label: 'Privacy', icon: Shield, description: 'Control your visibility' },
  { id: 'appearance', label: 'Appearance', icon: Palette, description: 'Theme and display' },
  { id: 'feedback', label: 'Feedback', icon: MessageSquare, description: 'Report bugs or suggest' },
  { id: 'account', label: 'Account', icon: Settings, description: 'Password and security' },
];

export function SettingsPage() {
  const { section } = useParams<{ section?: string }>();
  const navigate = useNavigate();

  const activeSection = (section as SettingsSection) || 'profile';

  const handleSectionChange = (newSection: SettingsSection) => {
    navigate(`/app/settings/${newSection}`);
  };

  const renderSection = () => {
    switch (activeSection) {
      case 'profile':
        return <ProfileSection />;
      case 'notifications':
        return <NotificationSection />;
      case 'privacy':
        return <PrivacySection />;
      case 'appearance':
        return <AppearanceSection />;
      case 'feedback':
        return <FeedbackSection />;
      case 'account':
        return <AccountSection />;
      default:
        return <ProfileSection />;
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1
        className="text-2xl font-semibold mb-8"
        style={{ color: 'var(--color-text)' }}
      >
        settings
      </h1>

      <div className="flex flex-col md:flex-row gap-8">
        {/* Sidebar navigation */}
        <nav className="md:w-64 flex-shrink-0">
          <ul className="space-y-1">
            {sections.map(({ id, label, icon: Icon, description }) => (
              <li key={id}>
                <button
                  onClick={() => handleSectionChange(id)}
                  className={cn(
                    'w-full flex items-center gap-3 px-4 py-3 rounded-xl',
                    'text-left transition-all'
                  )}
                  style={{
                    backgroundColor:
                      activeSection === id
                        ? 'var(--color-surface)'
                        : 'transparent',
                    color:
                      activeSection === id
                        ? 'var(--color-text)'
                        : 'var(--color-textSecondary)',
                  }}
                >
                  <Icon className="w-5 h-5 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium">{label.toLowerCase()}</p>
                    <p
                      className="text-xs mt-0.5 truncate"
                      style={{ color: 'var(--color-textMuted)' }}
                    >
                      {description.toLowerCase()}
                    </p>
                  </div>
                  <ChevronRight
                    className={cn(
                      'w-4 h-4 flex-shrink-0 transition-transform',
                      activeSection === id && 'rotate-90'
                    )}
                    style={{ color: 'var(--color-textMuted)' }}
                  />
                </button>
              </li>
            ))}
          </ul>
        </nav>

        {/* Content area */}
        <div className="flex-1 min-w-0">
          <div
            className="p-6 rounded-2xl border"
            style={{
              backgroundColor: 'var(--color-backgroundSecondary)',
              borderColor: 'var(--color-border)',
            }}
          >
            {renderSection()}
          </div>
        </div>
      </div>
    </div>
  );
}
