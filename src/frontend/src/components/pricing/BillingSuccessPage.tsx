import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { CheckCircle2, Loader2 } from 'lucide-react';
import { Button } from '../ui/Button';
import { useAuth } from '../../contexts/AuthContext';
import { getSubscriptionStatus } from '../../lib/stripe/stripe';

/**
 * Shown after a successful Stripe Checkout redirect.
 * Polls the backend until the webhook has processed and the user's
 * subscription status flips to "active", then shows a confirmation.
 */
export function BillingSuccessPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user, refreshProfile } = useAuth();
  const sessionId = searchParams.get('session_id');

  const [status, setStatus] = useState<'processing' | 'active' | 'timeout'>('processing');
  const [planName, setPlanName] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;

    let cancelled = false;
    let attempts = 0;
    const maxAttempts = 20; // ~20 seconds

    async function poll() {
      while (attempts < maxAttempts && !cancelled) {
        attempts++;
        try {
          const info = await getSubscriptionStatus();
          if (info.status === 'active' && info.plan !== 'free') {
            setPlanName(info.plan === 'smooth_talker' ? 'Smooth Talker' : 'Connector');
            setStatus('active');
            // Refresh the auth profile so the rest of the app sees the update
            await refreshProfile();
            return;
          }
        } catch {
          // ignore and retry
        }
        await new Promise(r => setTimeout(r, 1000));
      }
      if (!cancelled) setStatus('timeout');
    }

    poll();
    return () => { cancelled = true; };
  }, [user, refreshProfile]);

  if (status === 'processing') {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--color-background)' }}>
        <div className="text-center max-w-md px-6">
          <Loader2
            className="w-12 h-12 animate-spin mx-auto mb-6"
            style={{ color: 'var(--color-accent)' }}
          />
          <h1 className="text-2xl font-bold mb-2" style={{ color: 'var(--color-text)' }}>
            Processing your subscription...
          </h1>
          <p className="text-sm" style={{ color: 'var(--color-textMuted)' }}>
            This usually takes just a few seconds. Please don't close this page.
          </p>
        </div>
      </div>
    );
  }

  if (status === 'timeout') {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--color-background)' }}>
        <div className="text-center max-w-md px-6">
          <Loader2
            className="w-12 h-12 mx-auto mb-6"
            style={{ color: 'var(--color-textMuted)' }}
          />
          <h1 className="text-2xl font-bold mb-2" style={{ color: 'var(--color-text)' }}>
            Still processing...
          </h1>
          <p className="text-sm mb-6" style={{ color: 'var(--color-textMuted)' }}>
            Your payment was received but it's taking a moment to activate.
            Your subscription will appear in settings shortly.
          </p>
          <Button onClick={() => navigate('/app/settings/subscription')}>
            Go to Settings
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--color-background)' }}>
      <div className="text-center max-w-md px-6">
        <CheckCircle2
          className="w-16 h-16 mx-auto mb-6"
          style={{ color: 'var(--color-success)' }}
        />
        <h1 className="text-2xl font-bold mb-2" style={{ color: 'var(--color-text)' }}>
          You're all set!
        </h1>
        <p className="text-sm mb-8" style={{ color: 'var(--color-textMuted)' }}>
          Your <strong>{planName}</strong> subscription is now active.
          {sessionId && (
            <span className="block mt-1 text-xs opacity-60">Session: {sessionId.slice(0, 12)}...</span>
          )}
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button onClick={() => navigate('/app/dashboard')}>
            Go to Dashboard
          </Button>
          <Button variant="outline" onClick={() => navigate('/app/settings/subscription')}>
            View Subscription
          </Button>
        </div>
      </div>
    </div>
  );
}
