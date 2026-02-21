-- Fix Infinite Recursion in Profiles RLS Policies
-- The problem: policies on "profiles" table query "profiles" table, causing infinite recursion
-- The solution: use candidates/employers tables to check role instead of profiles

-- ============================================
-- DROP ALL PROBLEMATIC PROFILE POLICIES
-- ============================================
DROP POLICY IF EXISTS "Candidates can view employer profiles" ON public.profiles;
DROP POLICY IF EXISTS "Candidates can view employer profiles for matching" ON public.profiles;
DROP POLICY IF EXISTS "Employers can view candidate profiles" ON public.profiles;
DROP POLICY IF EXISTS "Employers can view candidate profiles for matching" ON public.profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;

-- ============================================
-- RECREATE PROFILE POLICIES (without recursion)
-- ============================================

-- 1. Users can ALWAYS view their own profile (simple, no recursion)
CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

-- 2. Candidates can view employer profiles
-- Check if viewer is a candidate by looking at candidates table (not profiles!)
CREATE POLICY "Candidates can view employer profiles"
  ON public.profiles FOR SELECT
  USING (
    role = 'employer'
    AND EXISTS (
      SELECT 1 FROM public.candidates c
      WHERE c.user_id = auth.uid()
    )
  );

-- 3. Employers can view candidate profiles (only if candidate completed assessment)
-- Check if viewer is an employer by looking at employers table (not profiles!)
CREATE POLICY "Employers can view candidate profiles"
  ON public.profiles FOR SELECT
  USING (
    role = 'candidate'
    AND EXISTS (
      SELECT 1 FROM public.employers e
      WHERE e.user_id = auth.uid()
    )
    AND EXISTS (
      SELECT 1 FROM public.candidates c
      WHERE c.user_id = profiles.id AND c.assessment_status = 'completed'
    )
  );

-- ============================================
-- VERIFY: Check for any remaining recursive policies
-- ============================================
SELECT 'Fixed! New profile policies:' AS status;
SELECT policyname, qual
FROM pg_policies
WHERE schemaname = 'public' AND tablename = 'profiles' AND cmd = 'SELECT';
