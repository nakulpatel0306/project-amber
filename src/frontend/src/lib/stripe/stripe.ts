/**
 * Stripe integration helpers.
 *
 * All paid flows go through the backend which creates a Stripe Checkout
 * session and returns the hosted checkout URL for redirect.
 *
 * Auth: sends JWT when available. Falls back to userId in the request
 * body / query param so billing works even when SUPABASE_JWT_SECRET is
 * not configured on the backend (local dev).
 */

import { supabase } from '../supabase';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

/** Get the current Supabase session (JWT + user id). */
async function getAuthInfo(): Promise<{ token: string | null; userId: string | null }> {
  const { data: { session } } = await supabase.auth.getSession();
  return {
    token: session?.access_token ?? null,
    userId: session?.user?.id ?? null,
  };
}

/** Authenticated fetch wrapper for Stripe API calls. */
async function stripeFetch(
  path: string,
  body?: Record<string, unknown>,
): Promise<Response> {
  const { token, userId } = await getAuthInfo();
  // Always include userId in body as fallback for when backend auth is not configured
  const payload = body ? { ...body, userId } : { userId };
  return fetch(`${API_BASE}${path}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(payload),
  });
}

/**
 * Create a Checkout Session on the backend and redirect to Stripe's
 * hosted checkout page.
 *
 * Returns the checkout URL on success, or throws on error.
 */
export async function createCheckoutSession(priceId: string): Promise<string> {
  const response = await stripeFetch('/api/stripe/create-checkout-session', { priceId });

  if (!response.ok) {
    const err = await response.json().catch(() => ({ detail: 'Unknown error' }));
    throw new Error(err.detail || `HTTP ${response.status}`);
  }

  const data = await response.json();

  if (!data.url) {
    throw new Error(data.message || 'No checkout URL returned');
  }

  return data.url;
}

/**
 * Redirect the browser to Stripe Checkout for the given price.
 * Shows errors via the returned error string (null = success redirect).
 */
export async function redirectToCheckout(priceId: string): Promise<string | null> {
  try {
    const url = await createCheckoutSession(priceId);
    window.location.href = url;
    return null;
  } catch (err) {
    return err instanceof Error ? err.message : 'Failed to start checkout';
  }
}

/**
 * Create a Billing Portal session and return the portal URL.
 */
export async function createPortalSession(): Promise<string> {
  const response = await stripeFetch('/api/stripe/create-portal-session');

  if (!response.ok) {
    const err = await response.json().catch(() => ({ detail: 'Unknown error' }));
    throw new Error(err.detail || `HTTP ${response.status}`);
  }

  const data = await response.json();

  if (!data.url) {
    throw new Error(data.message || 'No portal URL returned');
  }

  return data.url;
}

/**
 * Fetch the current user's subscription status from the backend.
 */
export interface SubscriptionInfo {
  plan: 'free' | 'smooth_talker' | 'connector';
  status: 'active' | 'past_due' | 'canceled' | 'inactive';
  interval: 'monthly' | 'yearly' | null;
  has_stripe_customer: boolean;
}

export async function getSubscriptionStatus(): Promise<SubscriptionInfo> {
  const { token, userId } = await getAuthInfo();
  const params = userId ? `?userId=${userId}` : '';
  const response = await fetch(`${API_BASE}/api/stripe/subscription${params}`, {
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });

  if (!response.ok) {
    return { plan: 'free', status: 'inactive', interval: null, has_stripe_customer: false };
  }

  return response.json();
}
