import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Building2, ArrowRight, Loader2 } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import { Button } from '../ui/Button';
import { CoffeeLogo } from '../ui/CoffeeLogo';
import type { UserRole } from '../../types/auth.types';

const roleOptions = [
  {
    id: 'candidate' as const,
    label: "I'm Looking for Jobs",
    description: 'Find roles that match your personality and values',
    icon: User,
  },
  {
    id: 'employer' as const,
    label: "I'm Hiring",
    description: 'Find candidates who fit your company culture',
    icon: Building2,
  },
];

export function Onboarding() {
  const navigate = useNavigate();
  const { updateProfile } = useAuth();
  const { success, error: showError } = useToast();

  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleContinue = async () => {
    if (!selectedRole) return;

    setIsSubmitting(true);
    try {
      await updateProfile({
        role: selectedRole,
        onboarding_completed: false,  // Set to false so setup modal shows
      });

      success('Welcome to Amber!', 'Let\'s set up your profile.');

      // Navigate to appropriate dashboard
      if (selectedRole === 'employer') {
        navigate('/app/employer', { replace: true });
      } else {
        navigate('/app/dashboard', { replace: true });
      }
    } catch (err) {
      console.error('Failed to update profile:', err);
      showError('Setup failed', 'Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-4"
      style={{ backgroundColor: 'var(--color-background)' }}
    >
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <CoffeeLogo size="lg" />
          </div>
          <h1
            className="text-2xl font-semibold mb-2"
            style={{ color: 'var(--color-text)' }}
          >
            Welcome to Amber
          </h1>
          <p
            className="text-sm"
            style={{ color: 'var(--color-textMuted)' }}
          >
            Let's get you set up. What brings you here?
          </p>
        </div>

        {/* Role Selection */}
        <div className="space-y-3 mb-8">
          {roleOptions.map((option) => {
            const isSelected = selectedRole === option.id;
            const Icon = option.icon;

            return (
              <button
                key={option.id}
                onClick={() => setSelectedRole(option.id)}
                className="w-full p-5 rounded-2xl border text-left transition-all"
                style={{
                  backgroundColor: isSelected
                    ? 'rgba(217, 119, 6, 0.1)'
                    : 'var(--color-surface)',
                  borderColor: isSelected
                    ? 'var(--color-accent)'
                    : 'var(--color-border)',
                  borderWidth: isSelected ? '2px' : '1px',
                }}
              >
                <div className="flex items-center gap-4">
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center"
                    style={{
                      backgroundColor: isSelected
                        ? 'var(--color-accent)'
                        : 'var(--color-background)',
                    }}
                  >
                    <Icon
                      className="w-6 h-6"
                      style={{
                        color: isSelected
                          ? 'white'
                          : 'var(--color-textMuted)',
                      }}
                    />
                  </div>
                  <div>
                    <p
                      className="font-medium mb-0.5"
                      style={{ color: 'var(--color-text)' }}
                    >
                      {option.label}
                    </p>
                    <p
                      className="text-sm"
                      style={{ color: 'var(--color-textMuted)' }}
                    >
                      {option.description}
                    </p>
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Continue Button */}
        <Button
          onClick={handleContinue}
          disabled={!selectedRole || isSubmitting}
          fullWidth
          size="lg"
          rightIcon={
            isSubmitting ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <ArrowRight className="w-4 h-4" />
            )
          }
        >
          {isSubmitting ? 'Setting up...' : 'Continue'}
        </Button>

        <p
          className="text-xs text-center mt-4"
          style={{ color: 'var(--color-textMuted)' }}
        >
          You can change this later in settings
        </p>
      </div>
    </div>
  );
}
