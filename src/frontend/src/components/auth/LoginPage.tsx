import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Mail, Lock, Chrome, Github, ArrowLeft, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { APP_NAME } from '../../utils/constants';

export function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { signInWithEmail, signInWithOAuth, isLoading } = useAuth();
  const { error: showError, success } = useToast();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});

  const from = (location.state as { from?: { pathname: string } })?.from?.pathname || '/app';

  const validateForm = () => {
    const newErrors: { email?: string; password?: string } = {};

    if (!email) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = 'Please enter a valid email';
    }

    if (!password) {
      newErrors.password = 'Password is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleEmailSignIn = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    try {
      await signInWithEmail(email, password);
      success('Welcome back!', 'You have been signed in successfully.');
      navigate(from, { replace: true });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to sign in';
      showError('Sign in failed', message);
    }
  };

  const handleOAuthSignIn = async (provider: 'google' | 'github') => {
    try {
      // Don't pass role for login - only signup should set role
      // Remove any stale signup role from localStorage
      localStorage.removeItem('amber-signup-role');
      await signInWithOAuth(provider);
    } catch (err) {
      const message = err instanceof Error ? err.message : `Failed to sign in with ${provider}`;
      showError('Sign in failed', message);
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
              welcome back
            </h1>
            <p
              className="text-sm mt-2"
              style={{ color: 'var(--color-textMuted)' }}
            >
              sign in to your {APP_NAME.toLowerCase()} account
            </p>
          </div>

          {/* OAuth buttons */}
          <div className="space-y-3 mb-6">
            <Button
              variant="secondary"
              fullWidth
              onClick={() => handleOAuthSignIn('google')}
              leftIcon={<Chrome className="w-4 h-4" />}
              disabled={isLoading}
            >
              continue with google
            </Button>
            <Button
              variant="secondary"
              fullWidth
              onClick={() => handleOAuthSignIn('github')}
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
          <form onSubmit={handleEmailSignIn} className="space-y-4">
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

            <div>
              <Input
                label="password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Enter your password"
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
              <div className="flex justify-end mt-2">
                <Link
                  to="/auth/forgot-password"
                  className="text-xs transition-colors"
                  style={{ color: 'var(--color-accent)' }}
                >
                  forgot password?
                </Link>
              </div>
            </div>

            <Button type="submit" fullWidth isLoading={isLoading}>
              sign in
            </Button>
          </form>

          {/* Sign up link */}
          <p
            className="text-center text-sm mt-6"
            style={{ color: 'var(--color-textMuted)' }}
          >
            don't have an account?{' '}
            <Link
              to="/auth/signup"
              className="font-medium transition-colors"
              style={{ color: 'var(--color-accent)' }}
            >
              sign up
            </Link>
          </p>
        </div>
      </main>
    </div>
  );
}
