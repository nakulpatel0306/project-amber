-- Migration: Add missing columns to coffee_chats table
-- These columns are required by the frontend for the coffee chat scheduling flow.
-- The frontend already attempts to insert these fields; this migration makes the schema match.

-- Extra identifying fields
ALTER TABLE public.coffee_chats ADD COLUMN IF NOT EXISTS initiated_by TEXT;
ALTER TABLE public.coffee_chats ADD COLUMN IF NOT EXISTS message TEXT;
ALTER TABLE public.coffee_chats ADD COLUMN IF NOT EXISTS preferred_dates JSONB;

-- Role context
ALTER TABLE public.coffee_chats ADD COLUMN IF NOT EXISTS role_id UUID REFERENCES public.roles(id) ON DELETE SET NULL;
ALTER TABLE public.coffee_chats ADD COLUMN IF NOT EXISTS role_title TEXT;

-- Denormalized names to avoid RLS JOIN issues (same pattern as connections table)
ALTER TABLE public.coffee_chats ADD COLUMN IF NOT EXISTS company_name TEXT;
ALTER TABLE public.coffee_chats ADD COLUMN IF NOT EXISTS candidate_name TEXT;

-- Match score cache
ALTER TABLE public.coffee_chats ADD COLUMN IF NOT EXISTS match_score NUMERIC;

-- Simplified feedback aliases (frontend uses 'rating' and 'feedback' instead of candidate_rating etc.)
ALTER TABLE public.coffee_chats ADD COLUMN IF NOT EXISTS rating INTEGER CHECK (rating >= 1 AND rating <= 5);
ALTER TABLE public.coffee_chats ADD COLUMN IF NOT EXISTS feedback TEXT;

-- Duration from the meet invite
ALTER TABLE public.coffee_chats ADD COLUMN IF NOT EXISTS duration_minutes INTEGER DEFAULT 30;

SELECT 'Migration complete! coffee_chats columns added.' AS status;
