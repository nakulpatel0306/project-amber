-- Fix RLS Policies After Cross-Visibility Migration
-- This ensures users can view their OWN data while also allowing cross-visibility for matching

-- ============================================
-- CANDIDATES TABLE - Restore self-access + add cross-visibility
-- ============================================

-- Drop all SELECT policies on candidates to start fresh
DROP POLICY IF EXISTS "Candidates can view own data" ON public.candidates;
DROP POLICY IF EXISTS "Employers can view assessed candidates" ON public.candidates;
DROP POLICY IF EXISTS "Employers can view candidates" ON public.candidates;

-- Policy 1: Candidates can ALWAYS view their own data
CREATE POLICY "Candidates can view own data"
  ON public.candidates FOR SELECT
  USING (auth.uid() = user_id);

-- Policy 2: Employers can view candidates who completed assessments
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
-- EMPLOYERS TABLE - Restore self-access + add cross-visibility
-- ============================================

-- Drop all SELECT policies on employers to start fresh
DROP POLICY IF EXISTS "Employers can view own data" ON public.employers;
DROP POLICY IF EXISTS "Candidates can view employers" ON public.employers;

-- Policy 1: Employers can ALWAYS view their own data
CREATE POLICY "Employers can view own data"
  ON public.employers FOR SELECT
  USING (auth.uid() = user_id);

-- Policy 2: Candidates can view all employers (for matching)
CREATE POLICY "Candidates can view employers"
  ON public.employers FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'candidate'
    )
  );

-- ============================================
-- PROFILES TABLE - Restore self-access + cross-visibility
-- ============================================

DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Employers can view candidate profiles" ON public.profiles;
DROP POLICY IF EXISTS "Candidates can view employer profiles" ON public.profiles;

-- Policy 1: Users can ALWAYS view their own profile
CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

-- Policy 2: Employers can view candidate profiles (completed assessments only)
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

-- Policy 3: Candidates can view employer profiles
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
-- ASSESSMENTS TABLE - Ensure users can view own
-- ============================================
DROP POLICY IF EXISTS "Users can view own assessments" ON public.assessments;
CREATE POLICY "Users can view own assessments"
  ON public.assessments FOR SELECT
  USING (auth.uid() = user_id);

-- ============================================
-- ASSESSMENT_RESPONSES TABLE - Ensure users can view own
-- ============================================
DROP POLICY IF EXISTS "Users can view own assessment responses" ON public.assessment_responses;
CREATE POLICY "Users can view own assessment responses"
  ON public.assessment_responses FOR SELECT
  USING (auth.uid() = user_id);

-- ============================================
-- VERIFY POLICIES
-- ============================================
SELECT 'RLS Policies Fixed!' AS status;

SELECT tablename, policyname, cmd, qual
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename IN ('candidates', 'employers', 'profiles', 'assessments', 'assessment_responses')
  AND cmd = 'SELECT'
ORDER BY tablename, policyname;
