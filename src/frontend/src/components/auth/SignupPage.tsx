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
import { motion } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { AmberLogo } from '../ui/AmberLogo';
import type { UserRole } from '../../types/auth.types';
import { cn } from '../../utils/cn';
import { pageEntrance } from '../../utils/motion';

export function SignupPage() {
  const navigate = useNavigate();
  const { signUpWithEmail, signInWithOAuth, checkEmailExists, isLoading } = useAuth();
  const { error: showError, info } = useToast();
  const [isCheckingEmail, setIsCheckingEmail] = useState(false);

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
      newErrors.fullName = 'Name Is Required';
    }

    if (!email) {
      newErrors.email = 'Email Is Required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = 'Please Enter A Valid Email';
    }

    if (!password) {
      newErrors.password = 'Password Is Required';
    } else if (password.length < 8) {
      newErrors.password = 'Password Must Be At Least 8 Characters';
    }

    if (password !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords Do Not Match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleEmailSignUp = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    try {
      // Check if email already exists
      setIsCheckingEmail(true);
      const { exists } = await checkEmailExists(email);
      setIsCheckingEmail(false);

      if (exists) {
        info(
          'Account exists',
          'You already have an account. Try signing in instead.'
        );
        navigate('/auth/login');
        return;
      }

      const result = await signUpWithEmail(email, password, role, { full_name: fullName });
      console.log('Signup result:', result);

      if (result.session) {
        // User is logged in immediately, navigate to appropriate dashboard
        const dashboardPath = role === 'employer' ? '/app/employer' : '/app/dashboard';
        console.log('Navigating to:', dashboardPath);
        navigate(dashboardPath, { replace: true });
      } else {
        // Email verification required - redirect to verify email page
        console.log('Email verification required, redirecting to verify-email');
        navigate('/auth/verify-email', { state: { email } });
      }
    } catch (err) {
      setIsCheckingEmail(false);
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
      label: 'I\'m Looking For Jobs',
      description: 'Find Roles That Match Your Personality And Values',
      icon: User,
    },
    {
      id: 'employer' as const,
      label: 'I\'m Hiring',
      description: 'Find Candidates Who Fit Your Company Culture',
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
              {step === 'role' ? 'Join Amber' : 'Create Your Account'}
            </h1>
            <p
              className="text-sm mt-2"
              style={{ color: 'var(--color-textMuted)' }}
            >
              {step === 'role'
                ? 'How Will You Be Using Amber?'
                : `Signing Up As ${role === 'candidate' ? 'A Job Seeker' : 'An Employer'}`}
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

              <Button fullWidth onClick={() => setStep('details')}>
                Continue
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
                  Continue With Google
                </Button>
                <Button
                  variant="secondary"
                  fullWidth
                  onClick={() => handleOAuthSignUp('github')}
                  leftIcon={<Github className="w-4 h-4" />}
                  disabled={isLoading}
                >
                  Continue With GitHub
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
                    Or Continue With Email
                  </span>
                </div>
              </div>

              {/* Email form */}
              <form onSubmit={handleEmailSignUp} className="space-y-4">
                <Input
                  label="Full Name"
                  type="text"
                  value={fullName}
                  onChange={e => setFullName(e.target.value)}
                  placeholder="John Doe"
                  leftIcon={<User className="w-4 h-4" />}
                  error={errors.fullName}
                  disabled={isLoading}
                />

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

                <Input
                  label="Password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="At Least 8 Characters"
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
                  label="Confirm Password"
                  type={showPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  placeholder="Confirm Your Password"
                  leftIcon={<Lock className="w-4 h-4" />}
                  error={errors.confirmPassword}
                  disabled={isLoading}
                />

                <div className="flex gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setStep('role')}
                    disabled={isLoading || isCheckingEmail}
                  >
                    Back
                  </Button>
                  <Button type="submit" fullWidth isLoading={isLoading || isCheckingEmail}>
                    Create Account
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
            Already Have An Account?{' '}
            <Link
              to="/auth/login"
              className="font-medium transition-colors"
              style={{ color: 'var(--color-accent)' }}
            >
              Sign In
            </Link>
          </p>
        </motion.div>
      </main>
    </div>
  );
}
