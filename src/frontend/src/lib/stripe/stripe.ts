/**
 * Stripe integration helpers.
 * Uses Stripe Checkout for payment flow.
 *
 * In production, set VITE_STRIPE_PUBLISHABLE_KEY in .env
 * Backend needs STRIPE_SECRET_KEY for creating checkout sessions.
 */

const STRIPE_KEY = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || '';

let stripePromise: Promise<any> | null = null;

export function getStripe() {
  if (!stripePromise && STRIPE_KEY) {
    stripePromise = import('@stripe/stripe-js').then(({ loadStripe }) =>
      loadStripe(STRIPE_KEY)
    );
  }
  return stripePromise;
}

export async function createCheckoutSession(priceId: string, userId: string): Promise<string | null> {
  try {
    const response = await fetch('/api/stripe/create-checkout-session', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ priceId, userId }),
    });
    const data = await response.json();
    return data.sessionId || null;
  } catch {
    return null;
  }
}

export async function redirectToCheckout(priceId: string, userId: string): Promise<void> {
  const stripe = await getStripe();
  if (!stripe) {
    // Stripe not configured — show demo flow
    console.warn('Stripe not configured. Set VITE_STRIPE_PUBLISHABLE_KEY.');
    return;
  }

  const sessionId = await createCheckoutSession(priceId, userId);
  if (sessionId) {
    await stripe.redirectToCheckout({ sessionId });
  }
}

export async function createPortalSession(userId: string): Promise<string | null> {
  try {
    const response = await fetch('/api/stripe/create-portal-session', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId }),
    });
    const data = await response.json();
    return data.url || null;
  } catch {
    return null;
  }
}
