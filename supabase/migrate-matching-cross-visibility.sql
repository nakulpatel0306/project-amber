-- Migration: Add Cross-Visibility RLS Policies for Matching
--
-- THE PROBLEM:
-- The Ember matching gallery queries Supabase directly from the frontend:
--   Candidate view: roles.select('*, employers!inner(*)')
--     → candidates can't read 'employers' table → !inner join filters out ALL rows
--   Employer view: candidates.select('*, profiles!inner(full_name, email)')
--     → employers can't read 'candidates' table → query returns 0 rows
--
-- THE FIX:
-- Add RLS policies that allow:
-- 1. Candidates to view employer records (needed for roles JOIN employers)
-- 2. Employers to view candidate records (needed for matching)
-- 3. Ensure profiles cross-visibility is also in place
--
-- SAFETY: No recursion risk — subqueries only check auth.uid() against
-- the profiles table, which always resolves via "Users can view own profile".

-- ============================================
-- CANDIDATES TABLE: Employers can view candidates
-- ============================================
-- Employers need to read candidate rows for the matching gallery.
-- Only show candidates who have completed their personality assessment.
DROP POLICY IF EXISTS "Employers can view assessed candidates" ON public.candidates;
CREATE POLICY "Employers can view assessed candidates"
  ON public.candidates FOR SELECT
  USING (
    openness_score IS NOT NULL
    AND EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'employer'
    )
  );

-- ============================================
-- EMPLOYERS TABLE: Candidates can view employers
-- ============================================
-- Candidates need to read employer rows for the roles JOIN employers query.
DROP POLICY IF EXISTS "Candidates can view employers" ON public.employers;
CREATE POLICY "Candidates can view employers"
  ON public.employers FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'candidate'
    )
  );

-- ============================================
-- PROFILES TABLE: Ensure cross-visibility exists
-- ============================================
-- Employers can view candidate profiles (for matching)
DROP POLICY IF EXISTS "Employers can view candidate profiles" ON public.profiles;
CREATE POLICY "Employers can view candidate profiles"
  ON public.profiles FOR SELECT
  USING (
    role = 'candidate'
    AND EXISTS (
      SELECT 1 FROM public.profiles viewer
      WHERE viewer.id = auth.uid() AND viewer.role = 'employer'
    )
    AND EXISTS (
      SELECT 1 FROM public.candidates c
      WHERE c.user_id = profiles.id AND c.assessment_status = 'completed'
    )
  );

-- Candidates can view employer profiles (for matching)
DROP POLICY IF EXISTS "Candidates can view employer profiles" ON public.profiles;
CREATE POLICY "Candidates can view employer profiles"
  ON public.profiles FOR SELECT
  USING (
    role = 'employer'
    AND EXISTS (
      SELECT 1 FROM public.profiles viewer
      WHERE viewer.id = auth.uid() AND viewer.role = 'candidate'
    )
  );

-- ============================================
-- VERIFY
-- ============================================
SELECT 'Matching cross-visibility policies created!' AS status;

SELECT policyname, tablename, cmd
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename IN ('candidates', 'employers', 'profiles')
ORDER BY tablename, policyname;
