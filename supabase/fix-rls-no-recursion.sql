-- Fix RLS: Remove ALL cross-visibility policies that cause recursion
-- Cross-visibility for matching will be handled by backend API with service role

-- ============================================
-- DROP ALL SELECT POLICIES
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
-- CREATE ONLY "OWN DATA" POLICIES
-- These are the ONLY safe policies - no subqueries to other tables
-- ============================================

-- Profiles: users see their own profile only
CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

-- Candidates: candidates see their own data only
CREATE POLICY "Candidates can view own data"
  ON public.candidates FOR SELECT
  USING (auth.uid() = user_id);

-- Employers: employers see their own data only
CREATE POLICY "Employers can view own data"
  ON public.employers FOR SELECT
  USING (auth.uid() = user_id);

-- ============================================
-- VERIFY
-- ============================================
SELECT 'SUCCESS: Only own-data policies remain' AS status;
SELECT tablename, policyname, qual
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename IN ('profiles', 'candidates', 'employers')
  AND cmd = 'SELECT'
ORDER BY tablename, policyname;
