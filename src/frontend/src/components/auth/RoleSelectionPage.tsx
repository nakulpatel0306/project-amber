import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Building2, Check } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import { supabase } from '../../lib/supabase';
import { Button } from '../ui/Button';
import { CoffeeLogo } from '../ui/CoffeeLogo';
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

      // Wait for profile to exist (database trigger may not have completed yet)
      let profile = null;
      let attempts = 0;
      const maxAttempts = 10;

      while (!profile && attempts < maxAttempts) {
        const { data } = await supabase
          .from('profiles')
          .select('id')
          .eq('id', user.id)
          .single();

        if (data) {
          profile = data;
        } else {
          // Wait 500ms before trying again
          await new Promise(resolve => setTimeout(resolve, 500));
          attempts++;
        }
      }

      // If profile still doesn't exist after waiting, create it manually
      if (!profile) {
        const { error: insertError } = await supabase
          .from('profiles')
          .insert({
            id: user.id,
            email: user.email || '',
            full_name: user.user_metadata?.full_name || user.user_metadata?.name || null,
            avatar_url: user.user_metadata?.avatar_url || null,
            role: role,
            onboarding_completed: false  // Set to false so setup modal shows
          });

        if (insertError) {
          console.error('Profile insert error:', insertError);
          throw new Error('Unable to create profile. Please try again.');
        }
      } else {
        // Profile exists, update it - keep onboarding_completed as false for new users
        const { error: updateError } = await supabase
          .from('profiles')
          .update({ role, onboarding_completed: false })
          .eq('id', user.id);

        if (updateError) {
          console.error('Profile update error:', updateError);
          throw updateError;
        }
      }

      // Ensure the role-specific record exists
      if (role === 'candidate') {
        const { data: existing } = await supabase
          .from('candidates')
          .select('id')
          .eq('user_id', user.id)
          .single();

        if (!existing) {
          const { error: candidateError } = await supabase
            .from('candidates')
            .insert({ user_id: user.id });

          if (candidateError) {
            console.error('Candidate insert error:', candidateError);
          }
        }
      } else if (role === 'employer') {
        const { data: existing } = await supabase
          .from('employers')
          .select('id')
          .eq('user_id', user.id)
          .single();

        if (!existing) {
          const { error: employerError } = await supabase
            .from('employers')
            .insert({ user_id: user.id, company_name: 'My Company' });

          if (employerError) {
            console.error('Employer insert error:', employerError);
          }
        }
      }

      // Also create user_settings if they don't exist
      const { data: existingSettings } = await supabase
        .from('user_settings')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (!existingSettings) {
        await supabase.from('user_settings').insert({ user_id: user.id });
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
              <CoffeeLogo size="md" />
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
