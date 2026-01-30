import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Building2, Check } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import { supabase } from '../../lib/supabase';
import { Button } from '../ui/Button';
import type { UserRole } from '../../types/auth.types';
import { cn } from '../../utils/cn';

export function RoleSelectionPage() {
  const navigate = useNavigate();
  const { refreshProfile } = useAuth();
  const { error: showError, success } = useToast();

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

      // Update the profile role and mark onboarding as started
      // Setting onboarding_completed ensures returning users won't be asked for role again
      const { error: profileError } = await supabase
        .from('profiles')
        .update({ role, onboarding_completed: true })
        .eq('id', user.id);

      if (profileError) {
        throw profileError;
      }

      // Ensure the role-specific record exists
      if (role === 'candidate') {
        // Check if candidate record exists, create if not
        const { data: existing } = await supabase
          .from('candidates')
          .select('id')
          .eq('user_id', user.id)
          .single();

        if (!existing) {
          await supabase.from('candidates').insert({ user_id: user.id });
        }
      } else if (role === 'employer') {
        // Check if employer record exists, create if not
        const { data: existing } = await supabase
          .from('employers')
          .select('id')
          .eq('user_id', user.id)
          .single();

        if (!existing) {
          await supabase.from('employers').insert({
            user_id: user.id,
            company_name: 'My Company'
          });
        }
      }

      await refreshProfile();
      success('Welcome!', 'Your account is ready.');
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
            <div
              className="inline-flex items-center justify-center w-12 h-12 rounded-2xl mb-4"
              style={{
                background: 'linear-gradient(135deg, var(--color-accent), var(--color-accentHover))',
              }}
            >
              <span className="text-xl font-bold text-white">A</span>
            </div>
            <h1
              className="text-2xl font-semibold"
              style={{ color: 'var(--color-text)' }}
            >
              one more step
            </h1>
            <p
              className="text-sm mt-2"
              style={{ color: 'var(--color-textMuted)' }}
            >
              how will you be using amber?
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
                    {option.label.toLowerCase()}
                  </p>
                  <p
                    className="text-xs mt-0.5"
                    style={{ color: 'var(--color-textMuted)' }}
                  >
                    {option.description.toLowerCase()}
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
            continue
          </Button>
        </div>
      </main>
    </div>
  );
}
