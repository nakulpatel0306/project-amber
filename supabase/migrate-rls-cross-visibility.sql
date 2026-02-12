-- Migration: Add Cross-Visibility RLS Policies
-- This fixes the matching feature by allowing employers and candidates to see each other's profiles
--
-- THE PROBLEM:
-- The profiles table RLS only allows users to view their OWN profile.
-- When TopCandidates queries: candidates JOIN profiles, the profiles JOIN fails
-- because employers can't read candidate profiles.
--
-- THE FIX:
-- Add policies that allow:
-- 1. Employers to view candidate profiles (if candidate has completed assessment)
-- 2. Candidates to view employer profiles (for viewing company info)

-- ============================================
-- ADD CROSS-VISIBILITY POLICIES TO PROFILES
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
-- VERIFY POLICIES WERE CREATED
-- ============================================
SELECT 'Cross-visibility policies created successfully!' as status;

SELECT policyname, tablename, cmd
FROM pg_policies
WHERE tablename = 'profiles' AND schemaname = 'public'
ORDER BY policyname;
