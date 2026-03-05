import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Crown,
  Zap,
  Sparkles,
  ExternalLink,
  CheckCircle2,
} from 'lucide-react';
import { Button } from '../ui/Button';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import { CANDIDATE_PLANS, EMPLOYER_PLANS } from '../../lib/stripe/plans';
import { createPortalSession } from '../../lib/stripe/stripe';

const tierIcons: Record<string, React.ElementType> = {
  free: Sparkles,
  pro: Zap,
  premium: Crown,
};

export function SubscriptionSection() {
  const { user, isEmployer } = useAuth();
  const { error: showError } = useToast();
  const navigate = useNavigate();
  const [isLoadingPortal, setIsLoadingPortal] = useState(false);

  // In production, this would come from Supabase user metadata or a subscriptions table
  const currentPlanId = isEmployer ? 'employer_free' : 'candidate_free';
  const plans = isEmployer ? EMPLOYER_PLANS : CANDIDATE_PLANS;
  const currentPlan = plans.find(p => p.id === currentPlanId) || plans[0];

  const handleManageSubscription = async () => {
    if (!user) return;
    setIsLoadingPortal(true);
    try {
      const url = await createPortalSession(user.id);
      if (url) {
        window.location.href = url;
      } else {
        // Stripe not configured - go to pricing
        navigate('/app/pricing');
      }
    } catch {
      showError('Error', 'Could not open subscription portal');
    } finally {
      setIsLoadingPortal(false);
    }
  };

  const Icon = tierIcons[currentPlan.tier];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold mb-1" style={{ color: 'var(--color-text)' }}>
          Subscription
        </h2>
        <p className="text-sm" style={{ color: 'var(--color-textMuted)' }}>
          Manage your plan and billing
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
              style={{ backgroundColor: currentPlan.tier === 'free' ? 'var(--color-background)' : 'rgba(245, 158, 11, 0.1)' }}
            >
              <Icon className="w-5 h-5" style={{ color: currentPlan.tier === 'free' ? 'var(--color-textMuted)' : 'var(--color-accent)' }} />
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
          </div>
        </div>

        <div className="mt-4 pt-4 border-t" style={{ borderColor: 'var(--color-border)' }}>
          <p className="text-xs font-medium mb-2" style={{ color: 'var(--color-textMuted)' }}>
            Included in your plan:
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
          {currentPlan.tier === 'free' ? 'upgrade plan' : 'change plan'}
        </Button>
        {currentPlan.tier !== 'free' && (
          <Button
            variant="outline"
            onClick={handleManageSubscription}
            leftIcon={<ExternalLink className="w-4 h-4" />}
            disabled={isLoadingPortal}
          >
            manage billing
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
            Unlock more with {isEmployer ? 'Barista' : 'Smooth Talker'}
          </p>
          <p className="text-xs mb-3" style={{ color: 'var(--color-textMuted)' }}>
            {isEmployer
              ? 'Get unlimited coffee chat invites, full OCEAN breakdowns, and Ember personality analysis.'
              : 'Get unlimited match browsing, priority visibility to employers, and detailed OCEAN breakdowns.'}
          </p>
          <Button size="sm" onClick={() => navigate('/app/pricing')}>
            see plans
          </Button>
        </div>
      )}
    </div>
  );
}
