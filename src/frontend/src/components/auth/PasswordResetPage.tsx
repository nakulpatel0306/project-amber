import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, ArrowLeft, Eye, EyeOff, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { AmberLogo } from '../ui/AmberLogo';

type Step = 'request' | 'reset' | 'success';

export function PasswordResetPage() {
  const navigate = useNavigate();
  const { resetPassword, updatePassword, isLoading, session } = useAuth();
  const { error: showError, success } = useToast();

  // Determine initial step based on URL params
  const [step, setStep] = useState<Step>(() => {
    // If there's a session (user clicked reset link), go to reset step
    if (session) return 'reset';
    return 'request';
  });

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    // If session exists and we're on this page, user clicked reset link
    if (session) {
      setStep('reset');
    }
  }, [session]);

  const handleRequestReset = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email) {
      setErrors({ email: 'Email is required' });
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setErrors({ email: 'Please enter a valid email' });
      return;
    }

    try {
      await resetPassword(email);
      setStep('success');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to send reset email';
      showError('Error', message);
    }
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();

    const newErrors: Record<string, string> = {};

    if (!password) {
      newErrors.password = 'Password is required';
    } else if (password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    }

    if (password !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      await updatePassword(password);
      success('Password updated', 'Your password has been successfully changed.');
      navigate('/auth/login');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to update password';
      showError('Error', message);
    }
  };

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ backgroundColor: 'var(--color-background)' }}
    >
      {/* Header */}
      <header className="p-6">
        <Link
          to="/auth/login"
          className="inline-flex items-center gap-2 text-sm transition-colors hover:opacity-80"
          style={{ color: 'var(--color-textSecondary)' }}
        >
          <ArrowLeft className="w-4 h-4" />
          Back to sign in
        </Link>
      </header>

      {/* Main content */}
      <main className="flex-1 flex items-center justify-center px-4 pb-16">
        <div className="w-full max-w-sm">
          {/* Logo */}
          <div className="text-center mb-8">
            {step === 'success' ? (
              <div
                className="inline-flex items-center justify-center w-12 h-12 rounded-2xl mb-4"
                style={{
                  backgroundColor: 'var(--color-success)',
                }}
              >
                <CheckCircle2 className="w-6 h-6 text-white" />
              </div>
            ) : (
              <div className="flex justify-center mb-4">
                <AmberLogo size="md" />
              </div>
            )}
            <h1
              className="text-2xl font-semibold"
              style={{ color: 'var(--color-text)' }}
            >
              {step === 'request' && 'Forgot Password?'}
              {step === 'reset' && 'Set New Password'}
              {step === 'success' && 'Check Your Email'}
            </h1>
            <p
              className="text-sm mt-2"
              style={{ color: 'var(--color-textMuted)' }}
            >
              {step === 'request' &&
                "No worries, we'll send you reset instructions"}
              {step === 'reset' && 'Enter your new password below'}
              {step === 'success' &&
                `We've sent a password reset link to ${email}`}
            </p>
          </div>

          {/* Request form */}
          {step === 'request' && (
            <form onSubmit={handleRequestReset} className="space-y-4">
              <Input
                label="Email"
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="you@example.com"
                leftIcon={<Mail className="w-4 h-4" />}
                error={errors.email}
                disabled={isLoading}
              />

              <Button type="submit" fullWidth isLoading={isLoading}>
                Send Reset Link
              </Button>
            </form>
          )}

          {/* Reset form */}
          {step === 'reset' && (
            <form onSubmit={handleUpdatePassword} className="space-y-4">
              <Input
                label="New Password"
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
                label="Confirm New Password"
                type={showPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                placeholder="Confirm your password"
                leftIcon={<Lock className="w-4 h-4" />}
                error={errors.confirmPassword}
                disabled={isLoading}
              />

              <Button type="submit" fullWidth isLoading={isLoading}>
                Update Password
              </Button>
            </form>
          )}

          {/* Success state */}
          {step === 'success' && (
            <div className="space-y-4">
              <p
                className="text-sm text-center"
                style={{ color: 'var(--color-textSecondary)' }}
              >
                Didn't receive the email? Check your spam folder or{' '}
                <button
                  onClick={() => setStep('request')}
                  className="font-medium"
                  style={{ color: 'var(--color-accent)' }}
                >
                  try another email address
                </button>
              </p>

              <Button
                variant="secondary"
                fullWidth
                onClick={() => navigate('/auth/login')}
              >
                Back to Sign In
              </Button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
