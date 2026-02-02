import { useState, useEffect } from 'react';
import { Bell, Mail, MessageSquare, Sparkles, Users, Briefcase, Phone } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import { getUserSettings, updateUserSettings } from '../../lib/supabase';
import { Button } from '../ui/Button';
import { Spinner } from '../ui/Spinner';

interface NotificationSettings {
  // Communication channels
  sms_enabled: boolean;
  // Email preferences
  email_daily_digest: boolean;
  email_product_updates: boolean;
  email_matches: boolean;
  email_messages: boolean;
  email_tips: boolean;
}

const defaultSettings: NotificationSettings = {
  sms_enabled: false,
  email_daily_digest: true,
  email_product_updates: true,
  email_matches: true,
  email_messages: true,
  email_tips: false,
};

interface NotificationItem {
  key: keyof NotificationSettings;
  label: string;
  description: string;
  icon: React.ElementType;
  candidateOnly?: boolean;
  employerOnly?: boolean;
}

export function NotificationSection() {
  const { user, isCandidate, isEmployer } = useAuth();
  const { success, error: showError } = useToast();

  const [settings, setSettings] = useState<NotificationSettings>(defaultSettings);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [originalSettings, setOriginalSettings] = useState<NotificationSettings>(defaultSettings);

  useEffect(() => {
    const loadSettings = async () => {
      if (!user) return;

      try {
        const data = await getUserSettings(user.id) as NotificationSettings | null;
        if (data) {
          const loadedSettings = {
            sms_enabled: data.sms_enabled ?? false,
            email_daily_digest: data.email_daily_digest ?? true,
            email_product_updates: data.email_product_updates ?? true,
            email_matches: data.email_matches ?? true,
            email_messages: data.email_messages ?? true,
            email_tips: data.email_tips ?? false,
          };
          setSettings(loadedSettings);
          setOriginalSettings(loadedSettings);
        }
      } catch (err) {
        console.error('Error loading settings:', err);
      } finally {
        setIsLoading(false);
      }
    };

    loadSettings();
  }, [user]);

  const handleToggle = (key: keyof NotificationSettings) => {
    setSettings(prev => {
      const newSettings = { ...prev, [key]: !prev[key] };
      setHasChanges(JSON.stringify(newSettings) !== JSON.stringify(originalSettings));
      return newSettings;
    });
  };

  const handleSave = async () => {
    if (!user) return;

    setIsSaving(true);
    try {
      await updateUserSettings(user.id, settings);
      setOriginalSettings(settings);
      setHasChanges(false);
      success('Settings saved', 'Your notification preferences have been updated.');
    } catch (err) {
      showError('Failed to save', 'Please try again later.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleReset = () => {
    setSettings(originalSettings);
    setHasChanges(false);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Spinner size="lg" />
      </div>
    );
  }

  // Define notification items based on role
  const candidateNotifications: NotificationItem[] = [
    {
      key: 'sms_enabled',
      label: 'SMS Notifications',
      description: 'Receive text messages for urgent updates and interview requests',
      icon: Phone,
    },
    {
      key: 'email_daily_digest',
      label: 'Daily Job Digest',
      description: 'A daily email with new job matches and opportunities',
      icon: Mail,
    },
    {
      key: 'email_matches',
      label: 'New Job Matches',
      description: 'Instant notifications when companies match your profile',
      icon: Briefcase,
    },
    {
      key: 'email_messages',
      label: 'Messages from Employers',
      description: 'When employers send you messages or interview requests',
      icon: MessageSquare,
    },
    {
      key: 'email_product_updates',
      label: 'Product Updates',
      description: 'New features, improvements, and platform news',
      icon: Sparkles,
    },
    {
      key: 'email_tips',
      label: 'Career Tips',
      description: 'Weekly tips on improving your profile and interview skills',
      icon: Bell,
    },
  ];

  const employerNotifications: NotificationItem[] = [
    {
      key: 'sms_enabled',
      label: 'SMS Notifications',
      description: 'Receive text messages for urgent candidate responses',
      icon: Phone,
    },
    {
      key: 'email_daily_digest',
      label: 'Daily Candidate Digest',
      description: 'A daily summary of new candidates matching your roles',
      icon: Mail,
    },
    {
      key: 'email_matches',
      label: 'New Candidate Matches',
      description: 'Instant notifications when candidates match your culture',
      icon: Users,
    },
    {
      key: 'email_messages',
      label: 'Candidate Messages',
      description: 'When candidates respond to your outreach',
      icon: MessageSquare,
    },
    {
      key: 'email_product_updates',
      label: 'Product Updates',
      description: 'New features, improvements, and platform news',
      icon: Sparkles,
    },
    {
      key: 'email_tips',
      label: 'Hiring Tips',
      description: 'Weekly tips on improving your hiring process',
      icon: Bell,
    },
  ];

  const notificationItems = isEmployer ? employerNotifications : candidateNotifications;

  return (
    <div className="space-y-6">
      <div>
        <h2
          className="text-lg font-medium mb-1"
          style={{ color: 'var(--color-text)' }}
        >
          Notifications
        </h2>
        <p className="text-sm" style={{ color: 'var(--color-textMuted)' }}>
          {isEmployer
            ? 'Choose how you want to be notified about candidates and hiring activity'
            : 'Choose how you want to be notified about jobs and opportunities'}
        </p>
      </div>

      {/* SMS Section */}
      <div
        className="p-4 rounded-xl border"
        style={{
          backgroundColor: 'var(--color-surface)',
          borderColor: settings.sms_enabled ? 'var(--color-accent)' : 'var(--color-border)',
        }}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ backgroundColor: 'rgba(139, 92, 246, 0.1)' }}
            >
              <Phone className="w-5 h-5" style={{ color: '#8B5CF6' }} />
            </div>
            <div>
              <p
                className="text-sm font-medium"
                style={{ color: 'var(--color-text)' }}
              >
                SMS Notifications
              </p>
              <p
                className="text-xs mt-0.5"
                style={{ color: 'var(--color-textMuted)' }}
              >
                {isEmployer
                  ? 'Get texts for urgent candidate responses'
                  : 'Get texts for interview requests and urgent updates'}
              </p>
            </div>
          </div>
          <button
            onClick={() => handleToggle('sms_enabled')}
            className="relative w-11 h-6 rounded-full transition-colors"
            style={{
              backgroundColor: settings.sms_enabled
                ? 'var(--color-accent)'
                : 'var(--color-border)',
            }}
            aria-pressed={settings.sms_enabled}
          >
            <span
              className={`
                absolute top-1 left-1 w-4 h-4 rounded-full bg-white
                transition-transform shadow-sm
                ${settings.sms_enabled ? 'translate-x-5' : 'translate-x-0'}
              `}
            />
          </button>
        </div>
        {settings.sms_enabled && (
          <p
            className="mt-3 text-xs px-3 py-2 rounded-lg"
            style={{
              backgroundColor: 'var(--color-background)',
              color: 'var(--color-textMuted)',
            }}
          >
            You'll receive SMS at the phone number in your profile. Standard messaging rates may apply.
          </p>
        )}
      </div>

      {/* Email Preferences */}
      <div>
        <h3
          className="text-sm font-medium mb-3 flex items-center gap-2"
          style={{ color: 'var(--color-text)' }}
        >
          <Mail className="w-4 h-4" style={{ color: 'var(--color-accent)' }} />
          Email Preferences
        </h3>

        <div className="space-y-1">
          {notificationItems.filter(item => item.key !== 'sms_enabled').map(item => (
            <div
              key={item.key}
              className="flex items-center justify-between py-3 px-3 rounded-lg hover:bg-[var(--color-surface)] transition-colors"
            >
              <div className="flex items-center gap-3">
                <item.icon
                  className="w-4 h-4"
                  style={{ color: 'var(--color-textMuted)' }}
                />
                <div>
                  <p
                    className="text-sm font-medium"
                    style={{ color: 'var(--color-text)' }}
                  >
                    {item.label}
                  </p>
                  <p
                    className="text-xs mt-0.5"
                    style={{ color: 'var(--color-textMuted)' }}
                  >
                    {item.description}
                  </p>
                </div>
              </div>
              <button
                onClick={() => handleToggle(item.key)}
                className="relative w-11 h-6 rounded-full transition-colors"
                style={{
                  backgroundColor: settings[item.key]
                    ? 'var(--color-accent)'
                    : 'var(--color-border)',
                }}
                aria-pressed={settings[item.key]}
              >
                <span
                  className={`
                    absolute top-1 left-1 w-4 h-4 rounded-full bg-white
                    transition-transform shadow-sm
                    ${settings[item.key] ? 'translate-x-5' : 'translate-x-0'}
                  `}
                />
              </button>
            </div>
          ))}
        </div>
      </div>

      {hasChanges && (
        <div className="flex gap-3 pt-2">
          <Button variant="outline" onClick={handleReset} disabled={isSaving}>
            Reset
          </Button>
          <Button onClick={handleSave} isLoading={isSaving}>
            Save Changes
          </Button>
        </div>
      )}
    </div>
  );
}
