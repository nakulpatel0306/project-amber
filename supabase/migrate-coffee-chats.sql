-- Migration: Add missing columns to coffee_chats table
-- This adds columns for storing match context and partner info directly,
-- avoiding the need for cross-table JOINs that conflict with RLS policies.

-- Add columns that the frontend code expects
ALTER TABLE public.coffee_chats ADD COLUMN IF NOT EXISTS role_id UUID REFERENCES public.roles(id) ON DELETE SET NULL;
ALTER TABLE public.coffee_chats ADD COLUMN IF NOT EXISTS role_title TEXT;
ALTER TABLE public.coffee_chats ADD COLUMN IF NOT EXISTS match_score INTEGER;
ALTER TABLE public.coffee_chats ADD COLUMN IF NOT EXISTS message TEXT;
ALTER TABLE public.coffee_chats ADD COLUMN IF NOT EXISTS initiated_by TEXT CHECK (initiated_by IN ('employer', 'candidate'));

-- Add partner name columns to avoid cross-table JOINs
-- These store the names at creation time, avoiding RLS issues with reading other tables
ALTER TABLE public.coffee_chats ADD COLUMN IF NOT EXISTS candidate_name TEXT;
ALTER TABLE public.coffee_chats ADD COLUMN IF NOT EXISTS company_name TEXT;

-- Add preferred dates column (array of ISO date strings for scheduling options)
ALTER TABLE public.coffee_chats ADD COLUMN IF NOT EXISTS preferred_dates JSONB;

-- Add rating and feedback columns (unified, replacing the dual employer_/candidate_ versions)
ALTER TABLE public.coffee_chats ADD COLUMN IF NOT EXISTS rating INTEGER CHECK (rating >= 1 AND rating <= 5);
ALTER TABLE public.coffee_chats ADD COLUMN IF NOT EXISTS feedback TEXT;

-- Create index on role_id for faster lookups
CREATE INDEX IF NOT EXISTS idx_coffee_chats_role_id ON public.coffee_chats(role_id);

-- Verify the migration
SELECT 'Migration complete! Coffee chats table now has:' AS status;
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'coffee_chats' AND table_schema = 'public'
ORDER BY ordinal_position;
