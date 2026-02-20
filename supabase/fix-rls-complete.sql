-- ============================================================
-- COMPLETE RLS FIX — Run this to restore all access
-- ============================================================
-- This script ensures ALL necessary policies exist.
-- It does NOT delete or modify any data — only access rules.
-- ============================================================

-- ============================================
-- STEP 1: Drop ALL existing SELECT policies (clean slate)
-- ============================================
DO $$
DECLARE
  pol RECORD;
BEGIN
  FOR pol IN
    SELECT policyname, tablename
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename IN ('profiles', 'candidates', 'employers')
      AND cmd = 'SELECT'
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I', pol.policyname, pol.tablename);
  END LOOP;
END $$;

-- ============================================
-- STEP 2: "Own data" policies (users see their own records)
-- ============================================

-- Profiles: everyone can see their own profile
CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

-- Candidates: candidates can see their own data
CREATE POLICY "Candidates can view own data"
  ON public.candidates FOR SELECT
  USING (auth.uid() = user_id);

-- Employers: employers can see their own data
CREATE POLICY "Employers can view own data"
  ON public.employers FOR SELECT
  USING (auth.uid() = user_id);

-- ============================================
-- STEP 3: Cross-visibility for matching
-- ============================================

-- Candidates can see employer records (for Ember matching)
CREATE POLICY "Candidates can view employers"
  ON public.employers FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
        AND profiles.role = 'candidate'
    )
  );

-- Employers can see assessed candidates (for Ember matching)
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

-- Employers can see candidate profile names
CREATE POLICY "Employers can view candidate profiles"
  ON public.profiles FOR SELECT
  USING (
    role = 'candidate'
    AND EXISTS (
      SELECT 1 FROM public.profiles viewer
      WHERE viewer.id = auth.uid()
        AND viewer.role = 'employer'
    )
  );

-- Candidates can see employer profile names
CREATE POLICY "Candidates can view employer profiles"
  ON public.profiles FOR SELECT
  USING (
    role = 'employer'
    AND EXISTS (
      SELECT 1 FROM public.profiles viewer
      WHERE viewer.id = auth.uid()
        AND viewer.role = 'candidate'
    )
  );

-- ============================================
-- STEP 4: Verify everything is in place
-- ============================================
SELECT '✓ All policies created successfully' AS status;

SELECT tablename, policyname
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename IN ('candidates', 'employers', 'profiles')
  AND cmd = 'SELECT'
ORDER BY tablename, policyname;

-- ============================================
-- STEP 5: Verify data still exists (quick count)
-- ============================================
SELECT 'Data check' AS section,
  (SELECT count(*) FROM public.candidates) AS total_candidates,
  (SELECT count(*) FROM public.candidates WHERE openness_score IS NOT NULL) AS assessed_candidates,
  (SELECT count(*) FROM public.employers) AS total_employers,
  (SELECT count(*) FROM public.profiles) AS total_profiles;
