import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Crown,
  Zap,
  Sparkles,
  ExternalLink,
  CheckCircle2,
  Loader2,
} from 'lucide-react';
import { Button } from '../ui/Button';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import { CANDIDATE_PLANS, EMPLOYER_PLANS } from '../../lib/stripe/plans';
import { createPortalSession, getSubscriptionStatus, type SubscriptionInfo } from '../../lib/stripe/stripe';

const tierIcons: Record<string, React.ElementType> = {
  free: Sparkles,
  pro: Zap,
  premium: Crown,
};

/** Map DB plan name → plan tier for display lookup */
const planToTier: Record<string, string> = {
  free: 'free',
  smooth_talker: 'pro',
  connector: 'premium',
};

const statusLabels: Record<string, { text: string; color: string }> = {
  active: { text: 'Active', color: 'var(--color-success)' },
  past_due: { text: 'Past Due', color: '#ef4444' },
  canceled: { text: 'Canceled', color: 'var(--color-textMuted)' },
  inactive: { text: 'No subscription', color: 'var(--color-textMuted)' },
};

export function SubscriptionSection() {
  const { user, isEmployer } = useAuth();
  const { error: showError } = useToast();
  const navigate = useNavigate();
  const [isLoadingPortal, setIsLoadingPortal] = useState(false);
  const [subscription, setSubscription] = useState<SubscriptionInfo | null>(null);
  const [isLoadingSub, setIsLoadingSub] = useState(true);

  useEffect(() => {
    let cancelled = false;
    async function fetchSub() {
      try {
        const info = await getSubscriptionStatus();
        if (!cancelled) setSubscription(info);
      } catch {
        // Fallback to free
        if (!cancelled) setSubscription({ plan: 'free', status: 'inactive', interval: null, has_stripe_customer: false });
      } finally {
        if (!cancelled) setIsLoadingSub(false);
      }
    }
    fetchSub();
    return () => { cancelled = true; };
  }, []);

  const plans = isEmployer ? EMPLOYER_PLANS : CANDIDATE_PLANS;
  const currentTier = planToTier[subscription?.plan || 'free'] || 'free';
  const currentPlan = plans.find(p => p.tier === currentTier) || plans[0];
  const Icon = tierIcons[currentPlan.tier];
  const statusInfo = statusLabels[subscription?.status || 'inactive'];

  const handleManageSubscription = async () => {
    if (!user) return;
    setIsLoadingPortal(true);
    try {
      const url = await createPortalSession();
      window.location.href = url;
    } catch {
      showError('Error', 'Could not open subscription portal. Make sure you have an active subscription.');
    } finally {
      setIsLoadingPortal(false);
    }
  };

  if (isLoadingSub) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-6 h-6 animate-spin" style={{ color: 'var(--color-textMuted)' }} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-2.5 mb-1">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center"
            style={{ backgroundColor: 'rgba(245, 158, 11, 0.1)' }}
          >
            <Crown className="w-4 h-4" style={{ color: '#f59e0b' }} />
          </div>
          <h2
            className="text-base font-semibold"
            style={{ color: 'var(--color-text)' }}
          >
            Subscription
          </h2>
        </div>
        <p className="text-sm mt-1" style={{ color: 'var(--color-textMuted)' }}>
          Manage Your Plan & Billing
        </p>
      </div>

      {/* Current plan card */}
      <div
        className="p-5 rounded-xl border"
        style={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)' }}
      >
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ backgroundColor: 'rgba(245, 158, 11, 0.1)' }}
            >
              <Icon className="w-5 h-5" style={{ color: '#f59e0b' }} />
            </div>
            <div>
              <h3 className="font-semibold" style={{ color: 'var(--color-text)' }}>
                {currentPlan.name}
              </h3>
              <p className="text-sm" style={{ color: 'var(--color-textMuted)' }}>
                {currentPlan.tagline}
              </p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-lg font-bold" style={{ color: 'var(--color-text)' }}>
              {currentPlan.price === 0 ? 'Free' : `$${currentPlan.price}/mo`}
            </p>
            {subscription?.status && subscription.status !== 'inactive' && (
              <span
                className="text-xs font-medium px-2 py-0.5 rounded-full"
                style={{
                  backgroundColor: `${statusInfo.color}15`,
                  color: statusInfo.color,
                }}
              >
                {statusInfo.text}
                {subscription.interval ? ` (${subscription.interval})` : ''}
              </span>
            )}
          </div>
        </div>

        <div className="mt-4 pt-4 border-t" style={{ borderColor: 'var(--color-border)' }}>
          <p className="text-xs font-medium mb-2" style={{ color: 'var(--color-textMuted)' }}>
            Included In Your Plan:
          </p>
          <ul className="space-y-1.5">
            {currentPlan.features.slice(0, 4).map(feature => (
              <li key={feature} className="flex items-center gap-2 text-sm">
                <CheckCircle2 className="w-3.5 h-3.5 flex-shrink-0" style={{ color: 'var(--color-success)' }} />
                <span style={{ color: 'var(--color-textSecondary)' }}>{feature}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-3">
        <Button
          onClick={() => navigate('/app/pricing')}
          leftIcon={<Crown className="w-4 h-4" />}
        >
          {currentPlan.tier === 'free' ? 'Upgrade Plan' : 'Change Plan'}
        </Button>
        {subscription?.has_stripe_customer && (
          <Button
            variant="outline"
            onClick={handleManageSubscription}
            leftIcon={isLoadingPortal ? <Loader2 className="w-4 h-4 animate-spin" /> : <ExternalLink className="w-4 h-4" />}
            disabled={isLoadingPortal}
          >
            Manage Billing
          </Button>
        )}
      </div>

      {/* Upgrade nudge for free users */}
      {currentPlan.tier === 'free' && (
        <div
          className="p-4 rounded-xl"
          style={{
            backgroundColor: 'rgba(217, 119, 6, 0.08)',
            border: '1px solid var(--color-border)',
          }}
        >
          <p className="text-sm font-medium mb-1" style={{ color: 'var(--color-text)' }}>
            Unlock More With {isEmployer ? 'Barista' : 'Smooth Talker'}
          </p>
          <p className="text-xs mb-3" style={{ color: 'var(--color-textMuted)' }}>
            {isEmployer
              ? 'Get unlimited coffee chat invites, full OCEAN breakdowns, and Ember personality analysis.'
              : 'Get unlimited match browsing, priority visibility to employers, and detailed OCEAN breakdowns.'}
          </p>
          <Button size="sm" onClick={() => navigate('/app/pricing')}>
            See Plans
          </Button>
        </div>
      )}
    </div>
  );
}
