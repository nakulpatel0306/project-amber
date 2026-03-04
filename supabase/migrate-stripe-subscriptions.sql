-- Stripe Subscription Fields Migration
-- Adds billing columns to the profiles table so webhook events can record
-- the customer's Stripe IDs, plan, and subscription status.
--
-- Run this in the Supabase SQL Editor.

-- Add Stripe-related columns to profiles (idempotent)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'stripe_customer_id') THEN
    ALTER TABLE public.profiles ADD COLUMN stripe_customer_id TEXT;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'stripe_subscription_id') THEN
    ALTER TABLE public.profiles ADD COLUMN stripe_subscription_id TEXT;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'subscription_plan') THEN
    ALTER TABLE public.profiles ADD COLUMN subscription_plan TEXT DEFAULT 'free'
      CHECK (subscription_plan IN ('free', 'smooth_talker', 'connector'));
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'subscription_interval') THEN
    ALTER TABLE public.profiles ADD COLUMN subscription_interval TEXT
      CHECK (subscription_interval IN ('monthly', 'yearly'));
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'subscription_status') THEN
    ALTER TABLE public.profiles ADD COLUMN subscription_status TEXT DEFAULT 'inactive'
      CHECK (subscription_status IN ('active', 'past_due', 'canceled', 'inactive'));
  END IF;
END $$;

-- Index for fast customer lookups from webhooks
CREATE INDEX IF NOT EXISTS idx_profiles_stripe_customer_id
  ON public.profiles (stripe_customer_id)
  WHERE stripe_customer_id IS NOT NULL;
