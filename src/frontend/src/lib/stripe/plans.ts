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
    name: 'Wallflower',
    tagline: 'Dip your toes in',
    price: 0,
    yearlyPrice: 0,
    features: [
      'Personality assessment',
      'Basic archetype insights',
      'Browse 3 matches per week',
      '1 coffee chat request per month',
      'Community access',
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
    name: 'Smooth Talker',
    tagline: 'Stand out from the crowd',
    price: 12,
    yearlyPrice: 9,
    features: [
      'Everything in Wallflower',
      'Unlimited match browsing',
      '10 coffee chat requests per month',
      'Detailed OCEAN breakdown',
      'Priority in employer searches',
      'Read receipts on chat requests',
    ],
    cta: 'start talking',
    popular: true,
    stripePriceId: 'price_candidate_pro_monthly',
    stripeYearlyPriceId: 'price_candidate_pro_yearly',
  },
  {
    id: 'candidate_premium',
    tier: 'premium',
    name: 'Connector',
    tagline: 'Your network is your net worth',
    price: 24,
    yearlyPrice: 19,
    features: [
      'Everything in Smooth Talker',
      'Unlimited coffee chat requests',
      'Personalized Ember coaching',
      'Profile boost — appear first',
      'Direct employer introductions',
      'Interview prep with Ember',
      'Career insights dashboard',
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
    tagline: 'Get a taste',
    price: 0,
    yearlyPrice: 0,
    features: [
      'Culture assessment',
      'Browse candidate profiles',
      'Candidate compatibility rankings',
      '2 coffee chat invites per month',
      '1 active role posting',
    ],
    limitations: [
      'Limited candidate details',
      'No Ember analysis',
      'Basic matching only',
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
      'Everything in Cold Brew',
      'Unlimited coffee chat invites',
      'Full OCEAN candidate breakdowns',
      'Ember personality analysis',
      '5 active role postings',
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
      'Everything in Barista',
      'Unlimited role postings',
      'Custom culture assessments',
      'Candidate pipeline tracking',
      'API access',
      'White-label coffee chats',
      'Dedicated account manager',
      'Custom integrations (ATS)',
      'Bulk candidate analysis',
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
