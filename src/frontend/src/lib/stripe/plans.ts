export type PlanTier = 'free' | 'pro' | 'premium';
export type UserRole = 'candidate' | 'employer';

export interface PricingPlan {
  id: string;
  tier: PlanTier;
  name: string;
  tagline: string;
  price: number; // monthly in USD, 0 for free
  yearlyPrice: number; // yearly price (monthly equivalent)
  features: string[];
  limitations?: string[];
  cta: string;
  popular?: boolean;
  stripePriceId?: string; // Stripe Price ID - set in production
  stripeYearlyPriceId?: string;
}

export const CANDIDATE_PLANS: PricingPlan[] = [
  {
    id: 'candidate_free',
    tier: 'free',
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
    name: 'Mingler',
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
    cta: 'start mingling',
    popular: true,
    stripePriceId: 'price_candidate_pro_monthly',
    stripeYearlyPriceId: 'price_candidate_pro_yearly',
  },
  {
    id: 'candidate_premium',
    tier: 'premium',
    name: 'Networker',
    tagline: 'Your network is your net worth',
    price: 24,
    yearlyPrice: 19,
    features: [
      'Unlimited connects',
      'Everything in Mingler',
      'Personalized Ember coaching',
      'Profile boost',
      'Direct employer introductions',
      'Interview prep with Ember',
    ],
    cta: 'go premium',
    stripePriceId: 'price_candidate_premium_monthly',
    stripeYearlyPriceId: 'price_candidate_premium_yearly',
  },
];

export const EMPLOYER_PLANS: PricingPlan[] = [
  {
    id: 'employer_free',
    tier: 'free',
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
    stripePriceId: 'price_employer_pro_monthly',
    stripeYearlyPriceId: 'price_employer_pro_yearly',
  },
  {
    id: 'employer_premium',
    tier: 'premium',
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
    stripePriceId: 'price_employer_premium_monthly',
    stripeYearlyPriceId: 'price_employer_premium_yearly',
  },
];

export function getPlansByRole(role: UserRole): PricingPlan[] {
  return role === 'employer' ? EMPLOYER_PLANS : CANDIDATE_PLANS;
}

export function getPlanById(planId: string): PricingPlan | undefined {
  return [...CANDIDATE_PLANS, ...EMPLOYER_PLANS].find(p => p.id === planId);
}
