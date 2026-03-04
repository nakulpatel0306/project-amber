-- REVERT: Remove the problematic policy that caused RLS recursion
DROP POLICY IF EXISTS "Candidates can view employers via coffee chats" ON public.employers;
