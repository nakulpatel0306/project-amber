import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Building2, Check } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import { supabase } from '../../lib/supabase';
import { Button } from '../ui/Button';
import { AmberLogo } from '../ui/AmberLogo';
import type { UserRole } from '../../types/auth.types';
import { cn } from '../../utils/cn';

export function RoleSelectionPage() {
  const navigate = useNavigate();
  const { refreshProfile } = useAuth();
  const { error: showError } = useToast();

  const [role, setRole] = useState<UserRole>('candidate');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('Not authenticated');
      }

      // Use upsert to handle both new and existing profiles
      // This avoids race conditions with the database trigger and duplicate key errors
      console.log('RoleSelectionPage: Upserting profile for user:', user.id);

      const { error: upsertError } = await supabase
        .from('profiles')
        .upsert(
          {
            id: user.id,
            email: user.email || '',
            full_name: user.user_metadata?.full_name || user.user_metadata?.name || null,
            avatar_url: user.user_metadata?.avatar_url || null,
            role: role,
            onboarding_completed: false
          },
          { onConflict: 'id' }
        );

      if (upsertError) {
        console.error('Profile upsert error:', upsertError);
        throw new Error('Unable to save profile. Please try again.');
      }

      console.log('RoleSelectionPage: Profile upserted successfully with role:', role);

      // Ensure the role-specific record exists (use upsert to avoid conflicts)
      if (role === 'candidate') {
        const { error: candidateError } = await supabase
          .from('candidates')
          .upsert({ user_id: user.id }, { onConflict: 'user_id' });

        if (candidateError) {
          console.error('Candidate upsert error:', candidateError);
        }
      } else if (role === 'employer') {
        const { error: employerError } = await supabase
          .from('employers')
          .upsert({ user_id: user.id, company_name: 'My Company' }, { onConflict: 'user_id' });

        if (employerError) {
          console.error('Employer upsert error:', employerError);
        }
      }

      // Ensure user_settings exists (use upsert to avoid conflicts)
      const { error: settingsError } = await supabase
        .from('user_settings')
        .upsert({ user_id: user.id }, { onConflict: 'user_id' });

      if (settingsError) {
        console.error('User settings upsert error:', settingsError);
      }

      await refreshProfile();
      // Navigate to appropriate dashboard - setup modal will show there
      navigate('/app', { replace: true });
    } catch (err) {
      console.error('Role selection error:', err);
      const message = err instanceof Error ? err.message : 'Failed to save role. Please try again.';
      showError('Error', message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const roleOptions = [
    {
      id: 'candidate' as const,
      label: "I'm looking for jobs",
      description: 'Find roles that match your personality and values',
      icon: User,
    },
    {
      id: 'employer' as const,
      label: "I'm hiring",
      description: 'Find candidates who fit your company culture',
      icon: Building2,
    },
  ];

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ backgroundColor: 'var(--color-background)' }}
    >
      {/* Main content */}
      <main className="flex-1 flex items-center justify-center px-4 pb-16">
        <div className="w-full max-w-sm">
          {/* Logo */}
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <AmberLogo size="md" />
            </div>
            <h1
              className="text-2xl font-semibold"
              style={{ color: 'var(--color-text)' }}
            >
              One More Step
            </h1>
            <p
              className="text-sm mt-2"
              style={{ color: 'var(--color-textMuted)' }}
            >
              How will you be using Amber?
            </p>
          </div>

          {/* Role selection */}
          <div className="space-y-3 mb-6">
            {roleOptions.map(option => (
              <button
                key={option.id}
                onClick={() => setRole(option.id)}
                className={cn(
                  'w-full flex items-start gap-4 p-4 rounded-xl border text-left transition-all',
                  role === option.id
                    ? 'border-[var(--color-accent)] bg-[var(--color-accent)]/5'
                    : 'border-[var(--color-border)] hover:border-[var(--color-borderHover)]'
                )}
                style={{
                  backgroundColor:
                    role === option.id
                      ? undefined
                      : 'var(--color-surface)',
                }}
                disabled={isSubmitting}
              >
                <div
                  className={cn(
                    'w-10 h-10 rounded-xl flex items-center justify-center',
                    role === option.id
                      ? 'bg-[var(--color-accent)] text-white'
                      : 'bg-[var(--color-background)]'
                  )}
                  style={{
                    color:
                      role === option.id
                        ? undefined
                        : 'var(--color-textSecondary)',
                  }}
                >
                  <option.icon className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <p
                    className="font-medium text-sm"
                    style={{ color: 'var(--color-text)' }}
                  >
                    {option.label}
                  </p>
                  <p
                    className="text-xs mt-0.5"
                    style={{ color: 'var(--color-textMuted)' }}
                  >
                    {option.description}
                  </p>
                </div>
                {role === option.id && (
                  <Check
                    className="w-5 h-5"
                    style={{ color: 'var(--color-accent)' }}
                  />
                )}
              </button>
            ))}
          </div>

          <Button fullWidth onClick={handleSubmit} isLoading={isSubmitting}>
            Continue
          </Button>
        </div>
      </main>
    </div>
  );
}
