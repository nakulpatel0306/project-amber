import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Mail, Lock, Chrome, Github, ArrowLeft, Eye, EyeOff } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { AmberLogo } from '../ui/AmberLogo';
import { APP_NAME } from '../../utils/constants';
import { pageEntrance, formStagger, formItem } from '../../utils/motion';

export function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { signInWithEmail, signInWithOAuth, checkEmailExists, isLoading } = useAuth();
  const { error: showError, info } = useToast();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const [isCheckingEmail, setIsCheckingEmail] = useState(false);

  const from = (location.state as { from?: { pathname: string } })?.from?.pathname || '/app';

  const validateForm = () => {
    const newErrors: { email?: string; password?: string } = {};

    if (!email) {
      newErrors.email = 'Email Is Required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = 'Please Enter A Valid Email';
    }

    if (!password) {
      newErrors.password = 'Password Is Required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleEmailSignIn = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    try {
      // Check if email exists before attempting sign in
      setIsCheckingEmail(true);
      const { exists } = await checkEmailExists(email);
      setIsCheckingEmail(false);

      if (!exists) {
        info(
          'No account found',
          'You need an account to sign in. Please sign up first.'
        );
        navigate('/auth/signup');
        return;
      }

      await signInWithEmail(email, password);
      navigate(from, { replace: true });
    } catch (err) {
      setIsCheckingEmail(false);
      const message = err instanceof Error ? err.message : 'Failed to sign in';

      // Handle email not verified error
      if (message.includes('Email not confirmed') || message.includes('not confirmed')) {
        info(
          'Email not verified',
          'Please check your inbox and verify your email before signing in.'
        );
        navigate('/auth/verify-email', { state: { email } });
        return;
      }

      showError('Sign in failed', message);
    }
  };

  const handleOAuthSignIn = async (provider: 'google' | 'github') => {
    try {
      // Clear any stale signup role - login doesn't set a role
      // If user is new, AuthCallback will redirect them to role selection
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
          Back To Home
        </Link>
      </header>

      {/* Main content */}
      <main className="flex-1 flex items-center justify-center px-4 pb-16">
        <motion.div
          className="w-full max-w-sm"
          variants={pageEntrance}
          initial="hidden"
          animate="show"
        >
          {/* Logo */}
          <div className="text-center mb-8">
            <motion.div
              className="flex justify-center mb-4"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, ease: [0.23, 1, 0.32, 1] }}
            >
              <AmberLogo size="xl" />
            </motion.div>
            <h1
              className="text-3xl sm:text-4xl font-serif font-normal tracking-tight"
              style={{ color: 'var(--color-text)' }}
            >
              Welcome Back
            </h1>
            <p
              className="text-sm mt-2"
              style={{ color: 'var(--color-textMuted)' }}
            >
              Sign In To Your {APP_NAME} Account
            </p>
          </div>

          {/* OAuth buttons */}
          <motion.div
            className="space-y-3 mb-6"
            variants={formStagger}
            initial="hidden"
            animate="show"
          >
            <motion.div variants={formItem}>
              <Button
                variant="secondary"
                fullWidth
                onClick={() => handleOAuthSignIn('google')}
                leftIcon={<Chrome className="w-4 h-4" />}
                disabled={isLoading}
                className="hover:!border-blue-400 hover:!bg-blue-50 dark:hover:!bg-blue-950/20"
              >
                Continue With Google
              </Button>
            </motion.div>
            <motion.div variants={formItem}>
              <Button
                variant="secondary"
                fullWidth
                onClick={() => handleOAuthSignIn('github')}
                leftIcon={<Github className="w-4 h-4" />}
                disabled={isLoading}
                className="hover:!border-gray-500 hover:!bg-gray-50 dark:hover:!bg-gray-900/20"
              >
                Continue With GitHub
              </Button>
            </motion.div>
          </motion.div>

          {/* Divider */}
          <div className="relative my-6">
            <div
              className="absolute inset-0 flex items-center"
              aria-hidden="true"
            >
              <motion.div
                className="w-full border-t"
                style={{ borderColor: 'var(--color-border)' }}
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ duration: 0.6, delay: 0.3, ease: [0.23, 1, 0.32, 1] }}
              />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <motion.span
                className="px-2"
                style={{
                  backgroundColor: 'var(--color-background)',
                  color: 'var(--color-textMuted)',
                }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.4, delay: 0.5 }}
              >
                Or Continue With Email
              </motion.span>
            </div>
          </div>

          {/* Email form */}
          <motion.form
            onSubmit={handleEmailSignIn}
            className="space-y-4"
            variants={formStagger}
            initial="hidden"
            animate="show"
          >
            <motion.div variants={formItem}>
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
            </motion.div>

            <motion.div variants={formItem}>
              <Input
                label="Password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Enter Your Password"
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
                  Forgot Password?
                </Link>
              </div>
            </motion.div>

            <motion.div variants={formItem}>
              <Button type="submit" fullWidth isLoading={isLoading || isCheckingEmail}>
                Sign In
              </Button>
            </motion.div>
          </motion.form>

          {/* Sign up link */}
          <motion.p
            className="text-center text-sm mt-6"
            style={{ color: 'var(--color-textMuted)' }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
          >
            Don't Have An Account?{' '}
            <Link
              to="/auth/signup"
              className="font-medium transition-colors"
              style={{ color: 'var(--color-accent)' }}
            >
              Sign Up
            </Link>
          </motion.p>
        </motion.div>
      </main>
    </div>
  );
}
