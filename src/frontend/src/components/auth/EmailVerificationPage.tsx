import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Mail, ArrowLeft, CheckCircle2, RefreshCw } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import { Button } from '../ui/Button';

export function EmailVerificationPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { resendVerificationEmail, isLoading } = useAuth();
  const { success, error: showError } = useToast();

  const [isResending, setIsResending] = useState(false);

  // Get email from location state if available
  const email = (location.state as { email?: string })?.email || '';

  const handleResendEmail = async () => {
    if (!email) {
      showError('Error', 'No email address available. Please try signing up again.');
      navigate('/auth/signup');
      return;
    }

    setIsResending(true);
    try {
      await resendVerificationEmail(email);
      success('Email sent', 'A new verification email has been sent to your inbox.');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to resend verification email';
      showError('Error', message);
    } finally {
      setIsResending(false);
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
          {/* Icon */}
          <div className="text-center mb-8">
            <div
              className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-4"
              style={{
                backgroundColor: 'var(--color-accent)',
              }}
            >
              <Mail className="w-8 h-8 text-white" />
            </div>
            <h1
              className="text-2xl font-semibold"
              style={{ color: 'var(--color-text)' }}
            >
              Check Your Email
            </h1>
            <p
              className="text-sm mt-2"
              style={{ color: 'var(--color-textMuted)' }}
            >
              {email ? (
                <>We've sent a verification link to <strong style={{ color: 'var(--color-text)' }}>{email}</strong></>
              ) : (
                "We've sent a verification link to your email"
              )}
            </p>
          </div>

          {/* Instructions */}
          <div
            className="p-4 rounded-xl mb-6"
            style={{ backgroundColor: 'var(--color-surface)' }}
          >
            <div className="flex items-start gap-3">
              <CheckCircle2
                className="w-5 h-5 mt-0.5 flex-shrink-0"
                style={{ color: 'var(--color-success)' }}
              />
              <div>
                <p
                  className="text-sm font-medium"
                  style={{ color: 'var(--color-text)' }}
                >
                  Click the link in your email to verify your account
                </p>
                <p
                  className="text-xs mt-1"
                  style={{ color: 'var(--color-textMuted)' }}
                >
                  The link will expire in 24 hours
                </p>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="space-y-3">
            <Button
              variant="secondary"
              fullWidth
              onClick={handleResendEmail}
              disabled={isResending || isLoading || !email}
              leftIcon={<RefreshCw className={`w-4 h-4 ${isResending ? 'animate-spin' : ''}`} />}
            >
              {isResending ? 'Sending...' : 'Resend Verification Email'}
            </Button>

            <Button
              variant="outline"
              fullWidth
              onClick={() => navigate('/auth/login')}
            >
              Back to Sign In
            </Button>
          </div>

          {/* Help text */}
          <p
            className="text-center text-xs mt-6"
            style={{ color: 'var(--color-textMuted)' }}
          >
            Didn't receive the email? Check your spam folder or{' '}
            <Link
              to="/auth/signup"
              className="font-medium"
              style={{ color: 'var(--color-accent)' }}
            >
              try a different email
            </Link>
          </p>
        </div>
      </main>
    </div>
  );
}
