import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import {
  Check,
  X,
  Sparkles,
  Crown,
  Zap,
  ArrowRight,
  ArrowLeft,
  CreditCard,
} from 'lucide-react';
import { Button } from '../ui/Button';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import { CANDIDATE_PLANS, EMPLOYER_PLANS, PricingPlan } from '../../lib/stripe/plans';
import { redirectToCheckout } from '../../lib/stripe/stripe';

const tierIcons: Record<string, React.ElementType> = {
  free: Sparkles,
  pro: Zap,
  premium: Crown,
};

const tierAccent: Record<string, string> = {
  free: '#E8E0D6',
  pro: '#E8A849',
  premium: '#D97706',
};

export function PricingPage() {
  const { user, isEmployer } = useAuth();
  const { success: showSuccess } = useToast();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const isWelcome = searchParams.get('welcome') === 'true';
  const [billing, setBilling] = useState<'monthly' | 'yearly'>('monthly');
  const [activeTab, setActiveTab] = useState<'candidate' | 'employer'>(
    user ? (isEmployer ? 'employer' : 'candidate') : 'candidate'
  );

  const isPublic = !user;
  const plans = activeTab === 'employer' ? EMPLOYER_PLANS : CANDIDATE_PLANS;
  const dashboardPath = isEmployer ? '/app/employer' : '/app/dashboard';

  const handleSubscribe = async (plan: PricingPlan) => {
    if (!user) {
      navigate('/auth/signup');
      return;
    }

    if (plan.tier === 'free') {
      showSuccess('You\'re all set!', 'Enjoy your free plan');
      navigate(dashboardPath);
      return;
    }

    const priceId = billing === 'yearly' ? plan.stripeYearlyPriceId : plan.stripePriceId;
    if (!priceId || priceId.startsWith('price_')) {
      showSuccess('Coming Soon!', `${plan.name} plan will be available at launch`);
      navigate(dashboardPath);
      return;
    }

    await redirectToCheckout(priceId, user.id);
  };

  const handleSkip = () => {
    navigate(dashboardPath);
  };

  return (
    <div style={{ background: 'var(--color-background)' }}>
      {/* Header */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-12">
        {isPublic && (
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-sm font-medium mb-8 transition-opacity hover:opacity-70"
            style={{ color: 'var(--color-textMuted)' }}
          >
            <ArrowLeft className="w-4 h-4" />
            Back To Home
          </Link>
        )}

        {/* Welcome banner for first-time users */}
        {!isPublic && isWelcome && (
          <div
            className="p-6 rounded-2xl mb-8 border text-center"
            style={{
              backgroundColor: 'rgba(217, 119, 6, 0.08)',
              borderColor: 'var(--color-accent)',
            }}
          >
            <h2 className="text-xl font-bold mb-2" style={{ color: 'var(--color-text)' }}>
              Welcome to Amber!
            </h2>
            <p className="text-sm mb-4" style={{ color: 'var(--color-textSecondary)' }}>
              Your account is ready. Choose a plan to unlock the full experience, or start free.
            </p>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleSkip}
              rightIcon={<ArrowRight className="w-4 h-4" />}
            >
              Skip for Now
            </Button>
          </div>
        )}

        <div className="flex items-center gap-3 mb-4">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{ backgroundColor: 'rgba(245, 158, 11, 0.1)' }}
          >
            <CreditCard className="w-5 h-5" style={{ color: 'var(--color-accent)' }} />
          </div>
          <span
            className="text-xs font-semibold uppercase tracking-widest"
            style={{ color: 'var(--color-accent)' }}
          >
            Pricing
          </span>
        </div>

        <h1
          className="text-3xl sm:text-4xl font-bold tracking-tight mb-3"
          style={{ color: 'var(--color-text)' }}
        >
          Find Your Perfect Plan
        </h1>
        <p
          className="text-sm sm:text-base max-w-2xl leading-relaxed"
          style={{ color: 'var(--color-textSecondary)' }}
        >
          From casual networking to serious hiring, pick the plan that matches your vibe.
          Every plan starts free so you can explore before you commit. Use connects to
          reach out to matches, and upgrade when you are ready for more.
        </p>

        {/* Toggles */}
        <div className="flex flex-col items-start gap-3 mt-8">
          {/* Role toggle */}
          <div
            className="inline-flex rounded-xl p-1"
            style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)' }}
          >
            <button
              onClick={() => setActiveTab('candidate')}
              className="px-5 py-2 rounded-lg text-sm font-medium transition-all"
              style={{
                backgroundColor: activeTab === 'candidate' ? 'var(--color-accent)' : 'transparent',
                color: activeTab === 'candidate' ? 'white' : 'var(--color-textSecondary)',
              }}
            >
              Job Seekers
            </button>
            <button
              onClick={() => setActiveTab('employer')}
              className="px-5 py-2 rounded-lg text-sm font-medium transition-all"
              style={{
                backgroundColor: activeTab === 'employer' ? 'var(--color-accent)' : 'transparent',
                color: activeTab === 'employer' ? 'white' : 'var(--color-textSecondary)',
              }}
            >
              Employers
            </button>
          </div>

          {/* Billing toggle */}
          <div className="flex items-center gap-3 ml-1.5">
            <span
              className="text-sm font-medium"
              style={{ color: billing === 'monthly' ? 'var(--color-text)' : 'var(--color-textMuted)' }}
            >
              Monthly
            </span>
            <button
              onClick={() => setBilling(billing === 'monthly' ? 'yearly' : 'monthly')}
              className="relative w-12 h-6 rounded-full transition-colors"
              style={{ backgroundColor: billing === 'yearly' ? 'var(--color-accent)' : 'var(--color-border)' }}
            >
              <span
                className="absolute top-0.5 w-5 h-5 rounded-full bg-white transition-transform shadow-sm"
                style={{ left: billing === 'yearly' ? '26px' : '2px' }}
              />
            </button>
            <span
              className="text-sm font-medium"
              style={{ color: billing === 'yearly' ? 'var(--color-text)' : 'var(--color-textMuted)' }}
            >
              Yearly
            </span>
            {billing === 'yearly' && (
              <span
                className="text-xs font-semibold px-2 py-0.5 rounded-full"
                style={{ backgroundColor: 'rgba(16, 185, 129, 0.1)', color: 'var(--color-success)' }}
              >
                Save 20%
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Divider */}
      <div className="border-t" style={{ borderColor: 'var(--color-border)' }} />

      {/* Pricing cards */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {plans.map(plan => {
            const Icon = tierIcons[plan.tier];
            const accent = tierAccent[plan.tier];
            const price = billing === 'yearly' ? plan.yearlyPrice : plan.price;

            return (
              <div
                key={plan.id}
                className="relative rounded-2xl p-5 flex flex-col transition-all hover:shadow-lg"
                style={{
                  backgroundColor: 'var(--color-surface)',
                  border: plan.popular
                    ? `2px solid ${accent}`
                    : '1px solid var(--color-border)',
                }}
              >
                {plan.popular && (
                  <div
                    className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full text-xs font-bold"
                    style={{ backgroundColor: accent, color: 'white' }}
                  >
                    Most Popular
                  </div>
                )}

                {/* Plan header */}
                <div className="mb-4">
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center mb-2.5"
                    style={{ backgroundColor: `${accent}15` }}
                  >
                    <Icon className="w-4 h-4" style={{ color: accent }} />
                  </div>
                  <h3 className="text-lg font-bold" style={{ color: 'var(--color-text)' }}>
                    {plan.name}
                  </h3>
                  <p className="text-xs mt-0.5" style={{ color: 'var(--color-textMuted)' }}>
                    {plan.tagline}
                  </p>
                </div>

                {/* Price */}
                <div className="mb-4">
                  {price === 0 ? (
                    <div className="text-2xl font-bold" style={{ color: 'var(--color-text)' }}>
                      Free
                    </div>
                  ) : (
                    <div className="flex items-baseline gap-1">
                      <span className="text-2xl font-bold" style={{ color: 'var(--color-text)' }}>
                        ${price}
                      </span>
                      <span className="text-xs" style={{ color: 'var(--color-textMuted)' }}>
                        /mo
                      </span>
                    </div>
                  )}
                  {billing === 'yearly' && price > 0 && (
                    <p className="text-xs mt-1" style={{ color: 'var(--color-textMuted)' }}>
                      Billed ${price * 12}/year
                    </p>
                  )}
                </div>

                {/* CTA */}
                <Button
                  className="w-full mb-4"
                  size="sm"
                  variant={plan.popular ? 'primary' : 'outline'}
                  onClick={() => handleSubscribe(plan)}
                >
                  {plan.cta}
                </Button>

                {/* Features */}
                <div className="flex-1">
                  <ul className="space-y-2">
                    {plan.features.map(feature => (
                      <li key={feature} className="flex items-start gap-2 text-xs">
                        <Check
                          className="w-3.5 h-3.5 mt-0.5 flex-shrink-0"
                          style={{ color: 'var(--color-success)' }}
                        />
                        <span style={{ color: 'var(--color-text)' }}>{feature}</span>
                      </li>
                    ))}
                    {plan.limitations?.map(limit => (
                      <li key={limit} className="flex items-start gap-2 text-xs">
                        <X
                          className="w-3.5 h-3.5 mt-0.5 flex-shrink-0"
                          style={{ color: 'var(--color-textMuted)' }}
                        />
                        <span style={{ color: 'var(--color-textMuted)' }}>{limit}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Divider */}
      <div className="border-t" style={{ borderColor: 'var(--color-border)' }} />

      {/* Bottom note */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div
          className="rounded-2xl p-8 text-center"
          style={{
            background: 'var(--color-surface)',
            border: '1px solid var(--color-border)',
          }}
        >
          <p className="text-sm" style={{ color: 'var(--color-textSecondary)' }}>
            All plans include a 14-day free trial. Cancel anytime. No credit card required for free plans.
          </p>
          {!isPublic && isWelcome && (
            <Button
              variant="ghost"
              size="sm"
              className="mt-4"
              onClick={handleSkip}
            >
              Continue with Free Plan
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
