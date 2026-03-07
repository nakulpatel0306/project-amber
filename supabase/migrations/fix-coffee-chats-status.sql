-- Fix: Add 'scheduled' to coffee_chats status CHECK constraint
-- The old constraint only allowed ('pending','accepted','declined','completed','cancelled')
-- which silently rejected 'scheduled' status updates from the frontend.

ALTER TABLE public.coffee_chats
  DROP CONSTRAINT IF EXISTS coffee_chats_status_check;

ALTER TABLE public.coffee_chats
  ADD CONSTRAINT coffee_chats_status_check
  CHECK (status IN ('pending', 'accepted', 'scheduled', 'declined', 'completed', 'cancelled'));

-- Wipe all existing data for a clean slate
TRUNCATE public.coffee_chats CASCADE;
TRUNCATE public.connection_meet_invites CASCADE;
TRUNCATE public.connections CASCADE;
