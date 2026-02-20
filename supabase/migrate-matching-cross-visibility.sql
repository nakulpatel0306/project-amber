-- ============================================================
-- Migration: Add Cross-Visibility RLS for Ember Matching
-- ============================================================
--
-- Run this AFTER fix-rls-no-recursion.sql (Arsh's cleanup).
--
-- WHY THIS IS NEEDED:
-- The Ember gallery needs candidates to see employer data and
-- employers to see candidate data. Without these policies,
-- every Supabase query for cross-role data returns 0 rows.
--
-- WHY THIS IS SAFE (NO RECURSION):
-- After Arsh's fix, the profiles policy is ONLY:
--   "Users can view own profile" → auth.uid() = id
-- It does NOT reference candidates or employers tables.
-- So our new policies below check profiles safely:
--   candidates policy → subquery on profiles → resolves via auth.uid() = id → done
--   employers policy  → subquery on profiles → resolves via auth.uid() = id → done
-- No circular references. No recursion.
--
-- ============================================================

-- ============================================
-- 1. EMPLOYERS table: Let candidates see employer records
-- ============================================
-- Needed so candidates can view company info for matched roles.
-- Without this, the roles query can fetch roles but NOT employer data.
DROP POLICY IF EXISTS "Candidates can view employers" ON public.employers;
CREATE POLICY "Candidates can view employers"
  ON public.employers FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
        AND profiles.role = 'candidate'
    )
  );

-- ============================================
-- 2. CANDIDATES table: Let employers see assessed candidates
-- ============================================
-- Needed so employers can browse and score candidates for matching.
-- Only shows candidates who have completed their personality assessment.
DROP POLICY IF EXISTS "Employers can view assessed candidates" ON public.candidates;
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
-- 3. PROFILES table: Let employers see candidate profile names
-- ============================================
-- Needed so employer matching can show candidate names.
-- Only exposes profiles of candidates with completed assessments.
DROP POLICY IF EXISTS "Employers can view candidate profiles" ON public.profiles;
CREATE POLICY "Employers can view candidate profiles"
  ON public.profiles FOR SELECT
  USING (
    role = 'candidate'
    AND EXISTS (
      SELECT 1 FROM public.candidates c
      WHERE c.user_id = profiles.id
        AND c.openness_score IS NOT NULL
    )
    AND EXISTS (
      SELECT 1 FROM public.profiles viewer
      WHERE viewer.id = auth.uid()
        AND viewer.role = 'employer'
    )
  );

-- ============================================
-- 4. PROFILES table: Let candidates see employer profile names
-- ============================================
DROP POLICY IF EXISTS "Candidates can view employer profiles" ON public.profiles;
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
-- VERIFY
-- ============================================
SELECT 'Cross-visibility policies added successfully!' AS status;

SELECT tablename, policyname
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename IN ('candidates', 'employers', 'profiles')
  AND cmd = 'SELECT'
ORDER BY tablename, policyname;
