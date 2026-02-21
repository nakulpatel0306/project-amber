-- Fix ALL Infinite Recursion in RLS Policies
-- The chain: profiles -> candidates -> profiles (recursion!)
-- We need to break ALL circular references

-- ============================================
-- STEP 1: DROP ALL SELECT POLICIES THAT MIGHT CAUSE RECURSION
-- ============================================

-- Profiles policies
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Candidates can view employer profiles" ON public.profiles;
DROP POLICY IF EXISTS "Employers can view candidate profiles" ON public.profiles;
DROP POLICY IF EXISTS "Candidates can view employer profiles for matching" ON public.profiles;
DROP POLICY IF EXISTS "Employers can view candidate profiles for matching" ON public.profiles;

-- Candidates policies
DROP POLICY IF EXISTS "Candidates can view own data" ON public.candidates;
DROP POLICY IF EXISTS "Employers can view assessed candidates" ON public.candidates;
DROP POLICY IF EXISTS "Employers can view candidates" ON public.candidates;

-- Employers policies
DROP POLICY IF EXISTS "Employers can view own data" ON public.employers;
DROP POLICY IF EXISTS "Candidates can view employers" ON public.employers;

-- ============================================
-- STEP 2: RECREATE SIMPLE "OWN DATA" POLICIES FIRST
-- These don't reference other tables, so no recursion possible
-- ============================================

-- Profiles: users see their own profile
CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

-- Candidates: candidates see their own data
CREATE POLICY "Candidates can view own data"
  ON public.candidates FOR SELECT
  USING (auth.uid() = user_id);

-- Employers: employers see their own data
CREATE POLICY "Employers can view own data"
  ON public.employers FOR SELECT
  USING (auth.uid() = user_id);

-- ============================================
-- STEP 3: CROSS-VISIBILITY POLICIES
-- IMPORTANT: Only use candidates/employers tables, NEVER profiles
-- ============================================

-- Employers can view candidates who completed assessments
-- Check if viewer is employer by checking employers table (NOT profiles)
CREATE POLICY "Employers can view assessed candidates"
  ON public.candidates FOR SELECT
  USING (
    openness_score IS NOT NULL
    AND EXISTS (
      SELECT 1 FROM public.employers e
      WHERE e.user_id = auth.uid()
    )
  );

-- Candidates can view all employers
-- Check if viewer is candidate by checking candidates table (NOT profiles)
CREATE POLICY "Candidates can view employers"
  ON public.employers FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.candidates c
      WHERE c.user_id = auth.uid()
    )
  );

-- Candidates can view employer profiles (for matching)
-- Check via candidates table, not profiles
CREATE POLICY "Candidates can view employer profiles"
  ON public.profiles FOR SELECT
  USING (
    role = 'employer'
    AND EXISTS (
      SELECT 1 FROM public.candidates c
      WHERE c.user_id = auth.uid()
    )
  );

-- Employers can view candidate profiles (for matching)
-- Check via employers table, not profiles
CREATE POLICY "Employers can view candidate profiles"
  ON public.profiles FOR SELECT
  USING (
    role = 'candidate'
    AND EXISTS (
      SELECT 1 FROM public.employers e
      WHERE e.user_id = auth.uid()
    )
  );

-- ============================================
-- VERIFY: Show all SELECT policies
-- ============================================
SELECT 'All SELECT policies after fix:' AS status;
SELECT tablename, policyname, qual
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename IN ('profiles', 'candidates', 'employers')
  AND cmd = 'SELECT'
ORDER BY tablename, policyname;
