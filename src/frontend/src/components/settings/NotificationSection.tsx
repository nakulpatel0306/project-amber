import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import { getUserSettings, updateUserSettings } from '../../lib/supabase';
import { Button } from '../ui/Button';
import { Spinner } from '../ui/Spinner';

interface NotificationSettings {
  email_updates: boolean;
  email_matches: boolean;
  email_messages: boolean;
  email_newsletter: boolean;
}

const defaultSettings: NotificationSettings = {
  email_updates: true,
  email_matches: true,
  email_messages: true,
  email_newsletter: false,
};

export function NotificationSection() {
  const { user } = useAuth();
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
            email_updates: data.email_updates ?? true,
            email_matches: data.email_matches ?? true,
            email_messages: data.email_messages ?? true,
            email_newsletter: data.email_newsletter ?? false,
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

  const toggleItems = [
    {
      key: 'email_updates' as const,
      label: 'Product updates',
      description: 'News about features and improvements',
    },
    {
      key: 'email_matches' as const,
      label: 'Job matches',
      description: 'When new jobs match your profile',
    },
    {
      key: 'email_messages' as const,
      label: 'Messages',
      description: 'When employers send you messages',
    },
    {
      key: 'email_newsletter' as const,
      label: 'Newsletter',
      description: 'Monthly career tips and insights',
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2
          className="text-lg font-medium mb-1"
          style={{ color: 'var(--color-text)' }}
        >
          notifications
        </h2>
        <p className="text-sm" style={{ color: 'var(--color-textMuted)' }}>
          choose what emails you'd like to receive
        </p>
      </div>

      <div className="space-y-4">
        {toggleItems.map(item => (
          <div
            key={item.key}
            className="flex items-center justify-between py-3"
            style={{ borderBottom: '1px solid var(--color-border)' }}
          >
            <div>
              <p
                className="text-sm font-medium"
                style={{ color: 'var(--color-text)' }}
              >
                {item.label.toLowerCase()}
              </p>
              <p
                className="text-xs mt-0.5"
                style={{ color: 'var(--color-textMuted)' }}
              >
                {item.description.toLowerCase()}
              </p>
            </div>
            <button
              onClick={() => handleToggle(item.key)}
              className={`
                relative w-11 h-6 rounded-full transition-colors
                ${settings[item.key] ? '' : ''}
              `}
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

      {hasChanges && (
        <div className="flex gap-3 pt-2">
          <Button variant="outline" onClick={handleReset} disabled={isSaving}>
            reset
          </Button>
          <Button onClick={handleSave} isLoading={isSaving}>
            save changes
          </Button>
        </div>
      )}
    </div>
  );
}
