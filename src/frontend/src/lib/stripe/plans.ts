export type PlanTier = 'free' | 'pro' | 'premium';
export type SubscriptionPlan = 'free' | 'smooth_talker' | 'connector';
export type UserRole = 'candidate' | 'employer';

export interface PricingPlan {
  id: string;
  tier: PlanTier;
  /** Internal plan key stored in the database */
  planKey: SubscriptionPlan;
  name: string;
  tagline: string;
  price: number; // monthly in USD, 0 for free
  yearlyPrice: number; // yearly price (monthly equivalent)
  features: string[];
  limitations?: string[];
  cta: string;
  popular?: boolean;
  stripePriceId?: string; // Stripe Price ID for monthly billing
  stripeYearlyPriceId?: string; // Stripe Price ID for yearly billing
}

/**
 * Price ID mapping — reads from env vars set in .env, with hardcoded
 * test-mode fallbacks so local development works out of the box.
 */
export const PRICE_IDS = {
  // Candidate plans
  smooth_talker_monthly: import.meta.env.VITE_STRIPE_PRICE_SMOOTH_MONTHLY || 'price_1T2oVzHXKhBQCJWjU2CJciW7',
  smooth_talker_yearly:  import.meta.env.VITE_STRIPE_PRICE_SMOOTH_YEARLY  || 'price_1T2oWYHXKhBQCJWjxFrbIaLX',
  connector_monthly:     import.meta.env.VITE_STRIPE_PRICE_CONNECTOR_MONTHLY || 'price_1T2oXMHXKhBQCJWjDm9jLe3r',
  connector_yearly:      import.meta.env.VITE_STRIPE_PRICE_CONNECTOR_YEARLY  || 'price_1T2oY1HXKhBQCJWjXUAzGSYX',
  // Employer plans (reuse same price IDs — both roles map to the same Stripe products)
  barista_monthly:       import.meta.env.VITE_STRIPE_PRICE_BARISTA_MONTHLY    || 'price_1T2oVzHXKhBQCJWjU2CJciW7',
  barista_yearly:        import.meta.env.VITE_STRIPE_PRICE_BARISTA_YEARLY     || 'price_1T2oWYHXKhBQCJWjxFrbIaLX',
  roastmaster_monthly:   import.meta.env.VITE_STRIPE_PRICE_ROASTMASTER_MONTHLY || 'price_1T2oXMHXKhBQCJWjDm9jLe3r',
  roastmaster_yearly:    import.meta.env.VITE_STRIPE_PRICE_ROASTMASTER_YEARLY  || 'price_1T2oY1HXKhBQCJWjXUAzGSYX',
} as const;

/**
 * Reverse-lookup: given a Stripe price ID, return the plan + interval.
 * Used on the success page to show what the user just subscribed to.
 */
export function planFromPriceId(priceId: string): { plan: SubscriptionPlan; interval: 'monthly' | 'yearly' } | null {
  if (priceId === PRICE_IDS.smooth_talker_monthly) return { plan: 'smooth_talker', interval: 'monthly' };
  if (priceId === PRICE_IDS.smooth_talker_yearly)  return { plan: 'smooth_talker', interval: 'yearly' };
  if (priceId === PRICE_IDS.connector_monthly)     return { plan: 'connector', interval: 'monthly' };
  if (priceId === PRICE_IDS.connector_yearly)      return { plan: 'connector', interval: 'yearly' };
  return null;
}

export const CANDIDATE_PLANS: PricingPlan[] = [
  {
    id: 'candidate_free',
    tier: 'free',
    planKey: 'free',
    name: 'Lurker',
    tagline: 'Dip your toes in',
    price: 0,
    yearlyPrice: 0,
    features: [
      '3 connects per week',
      'Personality assessment',
      'Basic archetype insights',
      'Browse matches',
    ],
    limitations: [
      'Limited match visibility',
      'Basic profile only',
    ],
    cta: 'get started free',
  },
  {
    id: 'candidate_pro',
    tier: 'pro',
    planKey: 'smooth_talker',
    name: 'Smooth Talker',
    tagline: 'Stand out from the crowd',
    price: 12,
    yearlyPrice: 9,
    features: [
      '10 connects per week',
      'Everything in Lurker',
      'Detailed OCEAN breakdown',
      'Priority in employer searches',
      'Read receipts on requests',
      'Enhanced profile',
    ],
    cta: 'start talking',
    popular: true,
    stripePriceId: PRICE_IDS.smooth_talker_monthly,
    stripeYearlyPriceId: PRICE_IDS.smooth_talker_yearly,
  },
  {
    id: 'candidate_premium',
    tier: 'premium',
    planKey: 'connector',
    name: 'Connector',
    tagline: 'Your network is your net worth',
    price: 24,
    yearlyPrice: 19,
    features: [
      'Unlimited connects',
      'Everything in Smooth Talker',
      'Personalized Ember coaching',
      'Profile boost',
      'Direct employer introductions',
      'Interview prep with Ember',
    ],
    cta: 'go premium',
    stripePriceId: PRICE_IDS.connector_monthly,
    stripeYearlyPriceId: PRICE_IDS.connector_yearly,
  },
];

export const EMPLOYER_PLANS: PricingPlan[] = [
  {
    id: 'employer_free',
    tier: 'free',
    planKey: 'free',
    name: 'Cold Brew',
    tagline: 'Beta access, on the house',
    price: 0,
    yearlyPrice: 0,
    features: [
      '50 connects per month',
      'Culture assessment',
      'Full candidate profiles',
      '3 active role postings',
      'Basic culture matching',
    ],
    limitations: [
      'No Ember analysis',
      'No team reports',
    ],
    cta: 'start free',
  },
  {
    id: 'employer_pro',
    tier: 'pro',
    planKey: 'smooth_talker',
    name: 'Barista',
    tagline: 'Craft the perfect team',
    price: 49,
    yearlyPrice: 39,
    features: [
      '150 connects per month',
      'Everything in Cold Brew',
      '10 active role postings',
      'Ember personality analysis',
      'Advanced culture matching',
      'Team compatibility reports',
      'Priority support',
    ],
    cta: 'brew better hires',
    popular: true,
    stripePriceId: PRICE_IDS.barista_monthly,
    stripeYearlyPriceId: PRICE_IDS.barista_yearly,
  },
  {
    id: 'employer_premium',
    tier: 'premium',
    planKey: 'connector',
    name: 'Roastmaster',
    tagline: 'Hire with confidence',
    price: 99,
    yearlyPrice: 79,
    features: [
      'Unlimited connects',
      'Everything in Barista',
      'Unlimited role postings',
      'Custom culture assessments',
      'Candidate pipeline tracking',
      'Dedicated account manager',
      'ATS integrations',
    ],
    cta: 'scale your hiring',
    stripePriceId: PRICE_IDS.roastmaster_monthly,
    stripeYearlyPriceId: PRICE_IDS.roastmaster_yearly,
  },
];

export function getPlansByRole(role: UserRole): PricingPlan[] {
  return role === 'employer' ? EMPLOYER_PLANS : CANDIDATE_PLANS;
}

export function getPlanById(planId: string): PricingPlan | undefined {
  return [...CANDIDATE_PLANS, ...EMPLOYER_PLANS].find(p => p.id === planId);
}
