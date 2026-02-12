-- Fix Test Data for Matching Feature
-- Run this in Supabase SQL Editor to diagnose and fix matching data issues
--
-- This script will:
-- 1. Show the current state of test data
-- 2. Ensure all test candidates have assessment_status = 'completed'
-- 3. Ensure all test candidates have OCEAN scores populated
-- 4. Verify profiles have correct roles

-- ============================================
-- DIAGNOSTIC: Check current state
-- ============================================

SELECT '=== DIAGNOSTIC: Checking current data state ===' as section;

-- Check profiles
SELECT 'Profiles:' as check_type;
SELECT id, email, role, onboarding_completed
FROM public.profiles
WHERE email LIKE '%@test.com' OR email LIKE '%@%.test';

-- Check candidates
SELECT 'Candidates:' as check_type;
SELECT c.id, p.email, c.assessment_status, c.openness_score, c.conscientiousness_score
FROM public.candidates c
JOIN public.profiles p ON p.id = c.user_id
WHERE p.email LIKE '%@test.com';

-- Check employers
SELECT 'Employers:' as check_type;
SELECT e.id, p.email, e.company_name, e.openness_preference, e.culture_quiz_completed
FROM public.employers e
JOIN public.profiles p ON p.id = e.user_id
WHERE p.email LIKE '%@%.test';

-- Check roles
SELECT 'Active Roles:' as check_type;
SELECT r.id, r.title, e.company_name, r.status
FROM public.roles r
JOIN public.employers e ON e.id = r.employer_id
WHERE r.status = 'active';

-- ============================================
-- FIX 1: Ensure profile roles are set correctly
-- ============================================
SELECT '=== FIX 1: Setting profile roles ===' as section;

-- Set candidate roles
UPDATE public.profiles
SET role = 'candidate', onboarding_completed = true
WHERE email LIKE '%@test.com' AND (role IS NULL OR role != 'candidate');

-- Set employer roles
UPDATE public.profiles
SET role = 'employer', onboarding_completed = true
WHERE email LIKE '%@%.test' AND (role IS NULL OR role != 'employer');

-- ============================================
-- FIX 2: Ensure candidates have completed assessments and OCEAN scores
-- ============================================
SELECT '=== FIX 2: Updating candidate assessment data ===' as section;

-- Update Alex Chen (if exists)
UPDATE public.candidates SET
  assessment_status = 'completed',
  assessment_completed_at = COALESCE(assessment_completed_at, NOW()),
  openness_score = COALESCE(openness_score, 92),
  conscientiousness_score = COALESCE(conscientiousness_score, 75),
  extraversion_score = COALESCE(extraversion_score, 68),
  agreeableness_score = COALESCE(agreeableness_score, 70),
  neuroticism_score = COALESCE(neuroticism_score, 25),
  top_traits = COALESCE(top_traits, ARRAY['The Innovator', 'The Explorer'])
WHERE user_id = '02286b62-311d-4e7a-bdd6-b4135c6c4e95';

-- Update Sarah Johnson (if exists)
UPDATE public.candidates SET
  assessment_status = 'completed',
  assessment_completed_at = COALESCE(assessment_completed_at, NOW()),
  openness_score = COALESCE(openness_score, 65),
  conscientiousness_score = COALESCE(conscientiousness_score, 95),
  extraversion_score = COALESCE(extraversion_score, 72),
  agreeableness_score = COALESCE(agreeableness_score, 80),
  neuroticism_score = COALESCE(neuroticism_score, 30),
  top_traits = COALESCE(top_traits, ARRAY['The Architect', 'The Strategist'])
WHERE user_id = '0b80df4d-3d8f-4e3f-b69d-1e8126efb454';

-- Update Marcus Williams (if exists)
UPDATE public.candidates SET
  assessment_status = 'completed',
  assessment_completed_at = COALESCE(assessment_completed_at, NOW()),
  openness_score = COALESCE(openness_score, 70),
  conscientiousness_score = COALESCE(conscientiousness_score, 68),
  extraversion_score = COALESCE(extraversion_score, 95),
  agreeableness_score = COALESCE(agreeableness_score, 88),
  neuroticism_score = COALESCE(neuroticism_score, 20),
  top_traits = COALESCE(top_traits, ARRAY['The Catalyst', 'The Harmonizer'])
WHERE user_id = '2b3b0406-4a2b-49b5-97dd-2e55a93610e3';

-- Update Emily Rodriguez (if exists)
UPDATE public.candidates SET
  assessment_status = 'completed',
  assessment_completed_at = COALESCE(assessment_completed_at, NOW()),
  openness_score = COALESCE(openness_score, 78),
  conscientiousness_score = COALESCE(conscientiousness_score, 88),
  extraversion_score = COALESCE(extraversion_score, 55),
  agreeableness_score = COALESCE(agreeableness_score, 75),
  neuroticism_score = COALESCE(neuroticism_score, 35),
  top_traits = COALESCE(top_traits, ARRAY['The Craftsperson', 'The Architect'])
WHERE user_id = '8388a5ba-132a-4dbd-995c-08a76183ffb3';

-- Update David Kim (if exists)
UPDATE public.candidates SET
  assessment_status = 'completed',
  assessment_completed_at = COALESCE(assessment_completed_at, NOW()),
  openness_score = COALESCE(openness_score, 55),
  conscientiousness_score = COALESCE(conscientiousness_score, 90),
  extraversion_score = COALESCE(extraversion_score, 45),
  agreeableness_score = COALESCE(agreeableness_score, 82),
  neuroticism_score = COALESCE(neuroticism_score, 15),
  top_traits = COALESCE(top_traits, ARRAY['The Anchor', 'The Craftsperson'])
WHERE user_id = 'c88178b4-ae93-46ad-9cfb-bfa3873f9a02';

-- ============================================
-- FIX 3: Ensure employers have culture preferences
-- ============================================
SELECT '=== FIX 3: Updating employer culture data ===' as section;

-- Update TechStartup Inc
UPDATE public.employers SET
  openness_preference = COALESCE(openness_preference, 90),
  conscientiousness_preference = COALESCE(conscientiousness_preference, 65),
  extraversion_preference = COALESCE(extraversion_preference, 75),
  agreeableness_preference = COALESCE(agreeableness_preference, 70),
  neuroticism_preference = COALESCE(neuroticism_preference, 40),
  culture_quiz_completed = true,
  culture_values = COALESCE(culture_values, ARRAY['Innovation', 'Speed', 'Autonomy', 'Risk-taking', 'Creativity'])
WHERE user_id = 'faec878c-bc59-4eda-ae03-1af945b55cd6';

-- Update InnovateCorp
UPDATE public.employers SET
  openness_preference = COALESCE(openness_preference, 75),
  conscientiousness_preference = COALESCE(conscientiousness_preference, 85),
  extraversion_preference = COALESCE(extraversion_preference, 70),
  agreeableness_preference = COALESCE(agreeableness_preference, 80),
  neuroticism_preference = COALESCE(neuroticism_preference, 30),
  culture_quiz_completed = true,
  culture_values = COALESCE(culture_values, ARRAY['Balance', 'Growth', 'Collaboration', 'Excellence', 'Innovation'])
WHERE user_id = 'c5c8b111-e7f0-42c4-b483-571e974ad6fc';

-- Update Creative Labs
UPDATE public.employers SET
  openness_preference = COALESCE(openness_preference, 88),
  conscientiousness_preference = COALESCE(conscientiousness_preference, 82),
  extraversion_preference = COALESCE(extraversion_preference, 65),
  agreeableness_preference = COALESCE(agreeableness_preference, 78),
  neuroticism_preference = COALESCE(neuroticism_preference, 35),
  culture_quiz_completed = true,
  culture_values = COALESCE(culture_values, ARRAY['Creativity', 'Craft', 'Aesthetics', 'Collaboration', 'Quality'])
WHERE user_id = 'bcaea40c-c371-4fdf-a1d9-4603771b8fa6';

-- Update FinancePlus
UPDATE public.employers SET
  openness_preference = COALESCE(openness_preference, 50),
  conscientiousness_preference = COALESCE(conscientiousness_preference, 95),
  extraversion_preference = COALESCE(extraversion_preference, 55),
  agreeableness_preference = COALESCE(agreeableness_preference, 75),
  neuroticism_preference = COALESCE(neuroticism_preference, 20),
  culture_quiz_completed = true,
  culture_values = COALESCE(culture_values, ARRAY['Stability', 'Precision', 'Trust', 'Process', 'Excellence'])
WHERE user_id = 'b92fe536-3d7a-41de-89a6-7804e953e6a5';

-- Update HealthTech Solutions
UPDATE public.employers SET
  openness_preference = COALESCE(openness_preference, 80),
  conscientiousness_preference = COALESCE(conscientiousness_preference, 78),
  extraversion_preference = COALESCE(extraversion_preference, 72),
  agreeableness_preference = COALESCE(agreeableness_preference, 92),
  neuroticism_preference = COALESCE(neuroticism_preference, 25),
  culture_quiz_completed = true,
  culture_values = COALESCE(culture_values, ARRAY['Mission', 'Empathy', 'Innovation', 'Collaboration', 'Impact'])
WHERE user_id = '82430c1e-5749-40af-8ee1-0da25cf85cc8';

-- ============================================
-- VERIFY: Check state after fixes
-- ============================================
SELECT '=== VERIFICATION: After fixes ===' as section;

-- Verify candidates now have correct data
SELECT 'Updated Candidates:' as check_type;
SELECT c.id, p.email, c.assessment_status, c.openness_score, c.conscientiousness_score, c.extraversion_score
FROM public.candidates c
JOIN public.profiles p ON p.id = c.user_id
WHERE p.email LIKE '%@test.com';

-- Verify employers have correct data
SELECT 'Updated Employers:' as check_type;
SELECT e.id, e.company_name, e.openness_preference, e.conscientiousness_preference, e.culture_quiz_completed
FROM public.employers e
JOIN public.profiles p ON p.id = e.user_id
WHERE p.email LIKE '%@%.test';

-- Count candidates visible to employers (with completed assessments)
SELECT 'Candidates visible to employers:' as check_type;
SELECT COUNT(*) as count
FROM public.candidates
WHERE assessment_status = 'completed' AND openness_score IS NOT NULL;

-- Count active roles visible to candidates
SELECT 'Active roles for matching:' as check_type;
SELECT COUNT(*) as count
FROM public.roles
WHERE status = 'active';

SELECT '=== DONE: If counts above are > 0, matching should work ===' as section;
