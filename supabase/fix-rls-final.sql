-- ============================================================
-- FINAL RLS FIX — Safe, no recursion, no self-references
-- ============================================================
-- This script:
--   1. Drops all SELECT policies on profiles/candidates/employers
--   2. Recreates "own data" policies (so you can see your own data)
--   3. Adds cross-visibility on candidates + employers tables ONLY
--   4. Creates a SECURITY DEFINER function for profile name lookups
--      (avoids self-referencing profiles policies entirely)
--
-- DOES NOT touch any data rows. Only policies and functions.
-- ============================================================

-- ============================================
-- STEP 1: Drop all SELECT policies (clean slate)
-- ============================================
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Candidates can view employer profiles" ON public.profiles;
DROP POLICY IF EXISTS "Employers can view candidate profiles" ON public.profiles;
DROP POLICY IF EXISTS "Candidates can view employer profiles for matching" ON public.profiles;
DROP POLICY IF EXISTS "Employers can view candidate profiles for matching" ON public.profiles;

DROP POLICY IF EXISTS "Candidates can view own data" ON public.candidates;
DROP POLICY IF EXISTS "Employers can view assessed candidates" ON public.candidates;
DROP POLICY IF EXISTS "Employers can view candidates" ON public.candidates;

DROP POLICY IF EXISTS "Employers can view own data" ON public.employers;
DROP POLICY IF EXISTS "Candidates can view employers" ON public.employers;

-- ============================================
-- STEP 2: Own data policies (MUST exist for app to work)
-- ============================================
CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Candidates can view own data"
  ON public.candidates FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Employers can view own data"
  ON public.employers FOR SELECT
  USING (auth.uid() = user_id);

-- ============================================
-- STEP 3: Cross-visibility for Ember matching
-- These ONLY reference the profiles table via auth.uid() = id
-- which resolves instantly — zero recursion risk.
-- ============================================

-- Candidates can see all employer records
CREATE POLICY "Candidates can view employers"
  ON public.employers FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
        AND profiles.role = 'candidate'
    )
  );

-- Employers can see candidates who completed assessments
CREATE POLICY "Employers can view assessed candidates"
  ON public.candidates FOR SELECT
  USING (
    openness_score IS NOT NULL
    AND EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
        AND profiles.role = 'employer'
    )
  );

-- ============================================
-- STEP 4: Profile name lookup function (bypasses RLS)
-- Used by employer view to get candidate names without
-- needing a self-referencing profiles policy.
-- ============================================
CREATE OR REPLACE FUNCTION public.get_profiles_by_ids(user_ids UUID[])
RETURNS TABLE(id UUID, full_name TEXT, email TEXT)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT p.id, p.full_name, p.email
  FROM public.profiles p
  WHERE p.id = ANY(user_ids);
$$;

-- ============================================
-- VERIFY
-- ============================================
SELECT 'SUCCESS — Policies created' AS status;

SELECT tablename, policyname
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename IN ('candidates', 'employers', 'profiles')
  AND cmd = 'SELECT'
ORDER BY tablename, policyname;

-- Verify data is intact
SELECT 'Data verification' AS section,
  (SELECT count(*) FROM public.candidates) AS total_candidates,
  (SELECT count(*) FROM public.candidates WHERE openness_score IS NOT NULL) AS assessed_candidates,
  (SELECT count(*) FROM public.employers) AS total_employers,
  (SELECT count(*) FROM public.profiles) AS total_profiles;
