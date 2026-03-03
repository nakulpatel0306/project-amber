-- Fix: Allow candidates to insert coffee chats
-- This policy was missing, causing "Let's Brew" from the candidate side to fail silently

DROP POLICY IF EXISTS "Candidates can insert coffee chats" ON public.coffee_chats;
CREATE POLICY "Candidates can insert coffee chats"
  ON public.coffee_chats FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.candidates
      WHERE candidates.id = candidate_id AND candidates.user_id = auth.uid()
    )
  );
