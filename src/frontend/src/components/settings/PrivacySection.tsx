import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import { getUserSettings, updateUserSettings } from '../../lib/supabase';
import { Button } from '../ui/Button';
import { Spinner } from '../ui/Spinner';
import { Eye, EyeOff, DollarSign } from 'lucide-react';

interface PrivacySettings {
  profile_visible: boolean;
  show_salary_expectation: boolean;
}

const defaultSettings: PrivacySettings = {
  profile_visible: true,
  show_salary_expectation: false,
};

export function PrivacySection() {
  const { user, isCandidate } = useAuth();
  const { success, error: showError } = useToast();

  const [settings, setSettings] = useState<PrivacySettings>(defaultSettings);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [originalSettings, setOriginalSettings] = useState<PrivacySettings>(defaultSettings);

  useEffect(() => {
    const loadSettings = async () => {
      if (!user) return;

      try {
        const data = await getUserSettings(user.id) as PrivacySettings | null;
        if (data) {
          const loadedSettings = {
            profile_visible: data.profile_visible ?? true,
            show_salary_expectation: data.show_salary_expectation ?? false,
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

  const handleToggle = (key: keyof PrivacySettings) => {
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
      success('Settings saved', 'Your privacy preferences have been updated.');
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

  return (
    <div className="space-y-6">
      <div>
        <h2
          className="text-lg font-medium mb-1"
          style={{ color: 'var(--color-text)' }}
        >
          privacy
        </h2>
        <p className="text-sm" style={{ color: 'var(--color-textMuted)' }}>
          control who can see your information
        </p>
      </div>

      <div className="space-y-4">
        {/* Profile visibility */}
        <div
          className="flex items-start justify-between py-4"
          style={{ borderBottom: '1px solid var(--color-border)' }}
        >
          <div className="flex gap-3">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ backgroundColor: 'var(--color-surface)' }}
            >
              {settings.profile_visible ? (
                <Eye className="w-5 h-5" style={{ color: 'var(--color-accent)' }} />
              ) : (
                <EyeOff className="w-5 h-5" style={{ color: 'var(--color-textMuted)' }} />
              )}
            </div>
            <div>
              <p
                className="text-sm font-medium"
                style={{ color: 'var(--color-text)' }}
              >
                profile visible to employers
              </p>
              <p
                className="text-xs mt-0.5 max-w-sm"
                style={{ color: 'var(--color-textMuted)' }}
              >
                {settings.profile_visible
                  ? 'employers can discover you based on your assessment results'
                  : 'your profile is hidden from employer searches'}
              </p>
            </div>
          </div>
          <button
            onClick={() => handleToggle('profile_visible')}
            className="relative w-11 h-6 rounded-full transition-colors flex-shrink-0"
            style={{
              backgroundColor: settings.profile_visible
                ? 'var(--color-accent)'
                : 'var(--color-border)',
            }}
            aria-pressed={settings.profile_visible}
          >
            <span
              className={`
                absolute top-1 left-1 w-4 h-4 rounded-full bg-white
                transition-transform shadow-sm
                ${settings.profile_visible ? 'translate-x-5' : 'translate-x-0'}
              `}
            />
          </button>
        </div>

        {/* Salary visibility - only for candidates */}
        {isCandidate && (
          <div
            className="flex items-start justify-between py-4"
            style={{ borderBottom: '1px solid var(--color-border)' }}
          >
            <div className="flex gap-3">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ backgroundColor: 'var(--color-surface)' }}
              >
                <DollarSign
                  className="w-5 h-5"
                  style={{
                    color: settings.show_salary_expectation
                      ? 'var(--color-accent)'
                      : 'var(--color-textMuted)',
                  }}
                />
              </div>
              <div>
                <p
                  className="text-sm font-medium"
                  style={{ color: 'var(--color-text)' }}
                >
                  show salary expectations
                </p>
                <p
                  className="text-xs mt-0.5 max-w-sm"
                  style={{ color: 'var(--color-textMuted)' }}
                >
                  {settings.show_salary_expectation
                    ? 'employers can see your salary range'
                    : 'your salary expectations are hidden until you apply'}
                </p>
              </div>
            </div>
            <button
              onClick={() => handleToggle('show_salary_expectation')}
              className="relative w-11 h-6 rounded-full transition-colors flex-shrink-0"
              style={{
                backgroundColor: settings.show_salary_expectation
                  ? 'var(--color-accent)'
                  : 'var(--color-border)',
              }}
              aria-pressed={settings.show_salary_expectation}
            >
              <span
                className={`
                  absolute top-1 left-1 w-4 h-4 rounded-full bg-white
                  transition-transform shadow-sm
                  ${settings.show_salary_expectation ? 'translate-x-5' : 'translate-x-0'}
                `}
              />
            </button>
          </div>
        )}
      </div>

      {/* Info box */}
      <div
        className="p-4 rounded-xl text-sm"
        style={{
          backgroundColor: 'var(--color-surface)',
          color: 'var(--color-textSecondary)',
        }}
      >
        <p>
          even when your profile is hidden, you can still apply to jobs and
          employers you've applied to can see your profile.
        </p>
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
