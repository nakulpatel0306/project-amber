import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  User,
  Bell,
  Shield,
  Palette,
  MessageSquare,
  Settings,
  ChevronRight,
  Briefcase,
  Building2,
  Crown,
  CheckCircle2,
  Sliders,
  Sparkles,
} from 'lucide-react';
import { cn } from '../../utils/cn';
import { useAuth } from '../../contexts/AuthContext';
import { getUserSettings } from '../../lib/supabase';

// Section components
import { ProfileSection } from './ProfileSection';
import { CandidateProfileSection } from './CandidateProfileSection';
import { EmployerProfileSection } from './EmployerProfileSection';
import { NotificationSection } from './NotificationSection';
import { PrivacySection } from './PrivacySection';
import { AppearanceSection } from './AppearanceSection';
import { FeedbackSection } from './FeedbackSection';
import { AccountSection } from './AccountSection';
import { SubscriptionSection } from './SubscriptionSection';

type SettingsSection = 'profile' | 'work-profile' | 'company-profile' | 'subscription' | 'notifications' | 'privacy' | 'appearance' | 'feedback' | 'account';

interface SectionConfig {
  id: SettingsSection;
  label: string;
  icon: React.ElementType;
  description: string;
  candidateOnly?: boolean;
  employerOnly?: boolean;
}

const allSections: SectionConfig[] = [
  { id: 'profile', label: 'Profile', icon: User, description: 'Your Personal Information' },
  { id: 'work-profile', label: 'Work Profile', icon: Briefcase, description: 'Job Preferences & Experience', candidateOnly: true },
  { id: 'company-profile', label: 'Company Profile', icon: Building2, description: 'Company Information', employerOnly: true },
  { id: 'subscription', label: 'Subscription', icon: Crown, description: 'Plan & Billing' },
  { id: 'notifications', label: 'Notifications', icon: Bell, description: 'Email & Push Preferences' },
  { id: 'privacy', label: 'Privacy', icon: Shield, description: 'Control Your Visibility' },
  { id: 'appearance', label: 'Appearance', icon: Palette, description: 'Theme & Display' },
  { id: 'feedback', label: 'Feedback', icon: MessageSquare, description: 'Report Bugs Or Suggest' },
  { id: 'account', label: 'Account', icon: Settings, description: 'Password & Security' },
];

export function SettingsPage() {
  const { section } = useParams<{ section?: string }>();
  const navigate = useNavigate();
  const { user, profile, isCandidate, isEmployer } = useAuth();

  const activeSection = (section as SettingsSection) || 'profile';

  // Compute profile completeness
  const [notificationsConfigured, setNotificationsConfigured] = useState(false);
  useEffect(() => {
    if (!user) return;
    getUserSettings(user.id).then((data: Record<string, unknown> | null) => {
      if (data) {
        const hasAnyToggle = data.email_daily_digest || data.email_matches || data.email_messages || data.sms_enabled;
        setNotificationsConfigured(!!hasAnyToggle);
      }
    }).catch(() => {});
  }, [user]);

  const profileComplete = !!(profile?.full_name && profile?.avatar_url);
  const completedCount = [profileComplete, notificationsConfigured, !!profile?.avatar_url].filter(Boolean).length;

  const headerPills = [
    { label: 'Sections', value: `${isCandidate || isEmployer ? 8 : 7}`, color: '#f59e0b', Icon: Sliders },
    { label: 'Profile', value: profileComplete ? 'Complete' : 'Incomplete', color: profileComplete ? '#10B981' : '#ef4444', Icon: CheckCircle2 },
    { label: 'Status', value: completedCount >= 2 ? 'Configured' : 'Setup Needed', color: completedCount >= 2 ? '#8B5CF6' : '#06B6D4', Icon: Sparkles },
  ];

  // Filter sections based on user role
  const sections = allSections.filter(s => {
    if (s.candidateOnly && !isCandidate) return false;
    if (s.employerOnly && !isEmployer) return false;
    return true;
  });

  const handleSectionChange = (newSection: SettingsSection) => {
    navigate(`/app/settings/${newSection}`);
  };

  const renderSection = () => {
    switch (activeSection) {
      case 'profile':
        return <ProfileSection />;
      case 'work-profile':
        return isCandidate ? <CandidateProfileSection /> : <ProfileSection />;
      case 'company-profile':
        return isEmployer ? <EmployerProfileSection /> : <ProfileSection />;
      case 'subscription':
        return <SubscriptionSection />;
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
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="bento-card rounded-2xl p-6 mb-6">
        <div className="flex items-center gap-4">
          <div
            className="hidden sm:flex items-center justify-center w-14 h-14 rounded-xl flex-shrink-0"
            style={{ background: 'linear-gradient(135deg, #b45309, #d97706, #f59e0b)' }}
          >
            <Settings className="w-7 h-7 text-white" />
          </div>
          <div className="flex-1">
            <h1
              className="text-3xl font-bold tracking-tight"
              style={{ color: 'var(--color-text)', fontFamily: 'var(--font-display)' }}
            >
              Settings
            </h1>
            <p
              className="font-mono text-[10px] uppercase tracking-[0.25em] mt-1"
              style={{ color: 'var(--color-textMuted)' }}
            >
              Manage Your Account & Preferences
            </p>
            {/* Stat pills */}
            <div className="flex flex-wrap gap-2 mt-3">
              {headerPills.map((stat) => (
                <div
                  key={stat.label}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium"
                  style={{
                    background: `linear-gradient(135deg, ${stat.color}18, ${stat.color}08)`,
                    border: `1px solid ${stat.color}30`,
                    color: 'var(--color-text)',
                  }}
                >
                  <div
                    className="w-5 h-5 rounded-full flex items-center justify-center"
                    style={{ backgroundColor: `${stat.color}20` }}
                  >
                    <stat.Icon className="w-3 h-3" style={{ color: stat.color }} />
                  </div>
                  <span className="opacity-60">{stat.label}</span>
                  <span className="font-semibold" style={{ color: stat.color }}>{stat.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

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
                        ? 'rgba(245, 158, 11, 0.08)'
                        : 'transparent',
                    color:
                      activeSection === id
                        ? 'var(--color-text)'
                        : 'var(--color-textSecondary)',
                    border: activeSection === id
                      ? '1px solid rgba(245, 158, 11, 0.2)'
                      : '1px solid transparent',
                  }}
                >
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                    style={{
                      backgroundColor: activeSection === id
                        ? 'rgba(245, 158, 11, 0.15)'
                        : 'var(--color-surface)',
                    }}
                  >
                    <Icon
                      className="w-4 h-4"
                      style={{
                        color: activeSection === id
                          ? '#f59e0b'
                          : 'var(--color-textMuted)',
                      }}
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium">{label}</p>
                    <p
                      className="text-xs mt-0.5 truncate"
                      style={{ color: 'var(--color-textMuted)' }}
                    >
                      {description}
                    </p>
                  </div>
                  <ChevronRight
                    className={cn(
                      'w-4 h-4 flex-shrink-0 transition-transform',
                      activeSection === id && 'rotate-90'
                    )}
                    style={{
                      color: activeSection === id
                        ? '#f59e0b'
                        : 'var(--color-textMuted)',
                    }}
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
