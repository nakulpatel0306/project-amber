import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Mail,
  Lock,
  Chrome,
  Github,
  ArrowLeft,
  Eye,
  EyeOff,
  User,
  Building2,
  Check,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import type { UserRole } from '../../types/auth.types';
import { cn } from '../../utils/cn';

export function SignupPage() {
  const navigate = useNavigate();
  const { signUpWithEmail, signInWithOAuth, isLoading } = useAuth();
  const { error: showError, info } = useToast();

  const [step, setStep] = useState<'role' | 'details'>('role');
  const [role, setRole] = useState<UserRole>('candidate');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!fullName.trim()) {
      newErrors.fullName = 'Name is required';
    }

    if (!email) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = 'Please enter a valid email';
    }

    if (!password) {
      newErrors.password = 'Password is required';
    } else if (password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    }

    if (password !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleEmailSignUp = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    try {
      await signUpWithEmail(email, password, role, { full_name: fullName });
      info(
        'Check your email',
        'We sent you a confirmation link. Please check your inbox.'
      );
      navigate('/auth/login');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to create account';
      showError('Sign up failed', message);
    }
  };

  const handleOAuthSignUp = async (provider: 'google' | 'github') => {
    try {
      await signInWithOAuth(provider, role);
    } catch (err) {
      const message = err instanceof Error ? err.message : `Failed to sign up with ${provider}`;
      showError('Sign up failed', message);
    }
  };

  const roleOptions = [
    {
      id: 'candidate' as const,
      label: 'I\'m looking for jobs',
      description: 'Find roles that match your personality and values',
      icon: User,
    },
    {
      id: 'employer' as const,
      label: 'I\'m hiring',
      description: 'Find candidates who fit your company culture',
      icon: Building2,
    },
  ];

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ backgroundColor: 'var(--color-background)' }}
    >
      {/* Header */}
      <header className="p-6">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-sm transition-colors hover:opacity-80"
          style={{ color: 'var(--color-textSecondary)' }}
        >
          <ArrowLeft className="w-4 h-4" />
          Back to home
        </Link>
      </header>

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
              {step === 'role' ? 'join amber' : 'create your account'}
            </h1>
            <p
              className="text-sm mt-2"
              style={{ color: 'var(--color-textMuted)' }}
            >
              {step === 'role'
                ? 'how will you be using amber?'
                : `signing up as ${role === 'candidate' ? 'a job seeker' : 'an employer'}`}
            </p>
          </div>

          {step === 'role' ? (
            <>
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

              <Button fullWidth onClick={() => setStep('details')}>
                continue
              </Button>
            </>
          ) : (
            <>
              {/* OAuth buttons */}
              <div className="space-y-3 mb-6">
                <Button
                  variant="secondary"
                  fullWidth
                  onClick={() => handleOAuthSignUp('google')}
                  leftIcon={<Chrome className="w-4 h-4" />}
                  disabled={isLoading}
                >
                  continue with google
                </Button>
                <Button
                  variant="secondary"
                  fullWidth
                  onClick={() => handleOAuthSignUp('github')}
                  leftIcon={<Github className="w-4 h-4" />}
                  disabled={isLoading}
                >
                  continue with github
                </Button>
              </div>

              {/* Divider */}
              <div className="relative my-6">
                <div
                  className="absolute inset-0 flex items-center"
                  aria-hidden="true"
                >
                  <div
                    className="w-full border-t"
                    style={{ borderColor: 'var(--color-border)' }}
                  />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span
                    className="px-2"
                    style={{
                      backgroundColor: 'var(--color-background)',
                      color: 'var(--color-textMuted)',
                    }}
                  >
                    or continue with email
                  </span>
                </div>
              </div>

              {/* Email form */}
              <form onSubmit={handleEmailSignUp} className="space-y-4">
                <Input
                  label="full name"
                  type="text"
                  value={fullName}
                  onChange={e => setFullName(e.target.value)}
                  placeholder="John Doe"
                  leftIcon={<User className="w-4 h-4" />}
                  error={errors.fullName}
                  disabled={isLoading}
                />

                <Input
                  label="email"
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  leftIcon={<Mail className="w-4 h-4" />}
                  error={errors.email}
                  disabled={isLoading}
                />

                <Input
                  label="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="At least 8 characters"
                  leftIcon={<Lock className="w-4 h-4" />}
                  rightIcon={
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="focus:outline-none"
                    >
                      {showPassword ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                  }
                  error={errors.password}
                  disabled={isLoading}
                />

                <Input
                  label="confirm password"
                  type={showPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  placeholder="Confirm your password"
                  leftIcon={<Lock className="w-4 h-4" />}
                  error={errors.confirmPassword}
                  disabled={isLoading}
                />

                <div className="flex gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setStep('role')}
                    disabled={isLoading}
                  >
                    back
                  </Button>
                  <Button type="submit" fullWidth isLoading={isLoading}>
                    create account
                  </Button>
                </div>
              </form>
            </>
          )}

          {/* Sign in link */}
          <p
            className="text-center text-sm mt-6"
            style={{ color: 'var(--color-textMuted)' }}
          >
            already have an account?{' '}
            <Link
              to="/auth/login"
              className="font-medium transition-colors"
              style={{ color: 'var(--color-accent)' }}
            >
              sign in
            </Link>
          </p>
        </div>
      </main>
    </div>
  );
}
