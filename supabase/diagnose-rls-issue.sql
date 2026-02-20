-- Diagnostic Script: Why can't users see their assessment data?
-- Run this in Supabase SQL Editor

-- ============================================
-- 1. CHECK CURRENT RLS POLICIES
-- ============================================
SELECT '=== CURRENT SELECT POLICIES ===' AS section;
SELECT tablename, policyname, qual
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename IN ('candidates', 'employers', 'profiles', 'assessments')
  AND cmd = 'SELECT'
ORDER BY tablename, policyname;

-- ============================================
-- 2. CHECK CANDIDATE DATA FOR TEST USERS
-- ============================================
SELECT '=== CANDIDATE DATA ===' AS section;
SELECT
  u.email,
  c.user_id,
  c.openness_score,
  c.conscientiousness_score,
  c.assessment_status,
  c.assessment_completed_at,
  CASE
    WHEN c.user_id IS NULL THEN 'NO CANDIDATE RECORD'
    WHEN c.openness_score IS NULL THEN 'MISSING OCEAN SCORES'
    WHEN c.assessment_status != 'completed' THEN 'STATUS NOT COMPLETED'
    ELSE 'OK'
  END AS issue
FROM auth.users u
LEFT JOIN profiles p ON p.id = u.id
LEFT JOIN candidates c ON c.user_id = u.id
WHERE u.email LIKE '%test.com' OR u.email LIKE '%test'
ORDER BY u.email;

-- ============================================
-- 3. CHECK EMPLOYER DATA FOR TEST USERS
-- ============================================
SELECT '=== EMPLOYER DATA ===' AS section;
SELECT
  u.email,
  e.user_id,
  e.company_name,
  e.openness_preference,
  e.culture_quiz_completed,
  CASE
    WHEN e.user_id IS NULL THEN 'NO EMPLOYER RECORD'
    WHEN e.openness_preference IS NULL THEN 'MISSING CULTURE SCORES'
    WHEN e.culture_quiz_completed = false THEN 'QUIZ NOT COMPLETED'
    ELSE 'OK'
  END AS issue
FROM auth.users u
LEFT JOIN profiles p ON p.id = u.id
LEFT JOIN employers e ON e.user_id = u.id
WHERE u.email LIKE '%test.com' OR u.email LIKE '%test'
ORDER BY u.email;

-- ============================================
-- 4. CHECK ASSESSMENTS TABLE
-- ============================================
SELECT '=== ASSESSMENTS RECORDS ===' AS section;
SELECT
  u.email,
  a.assessment_type,
  a.completed_at,
  CASE WHEN a.completed_at IS NOT NULL THEN 'COMPLETED' ELSE 'IN PROGRESS' END AS status
FROM auth.users u
JOIN assessments a ON a.user_id = u.id
WHERE u.email LIKE '%test.com' OR u.email LIKE '%test'
ORDER BY u.email, a.assessment_type;

-- ============================================
-- 5. CHECK PROFILES TABLE
-- ============================================
SELECT '=== PROFILES ===' AS section;
SELECT
  u.email,
  p.id AS profile_id,
  p.role,
  p.onboarding_completed
FROM auth.users u
LEFT JOIN profiles p ON p.id = u.id
WHERE u.email LIKE '%test.com' OR u.email LIKE '%test'
ORDER BY u.email;

-- ============================================
-- 6. TEST RLS AS SPECIFIC USER (requires service role)
-- This simulates what a user would see
-- ============================================
SELECT '=== RLS IS ENABLED ON ===' AS section;
SELECT tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename IN ('candidates', 'employers', 'profiles', 'assessments');
