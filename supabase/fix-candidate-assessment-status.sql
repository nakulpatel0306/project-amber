-- Fix Candidate Assessment Status
-- This script fixes candidates who have assessment data but missing OCEAN scores
-- or incorrect assessment_status values.

-- ============================================
-- DIAGNOSTIC: Show current state
-- ============================================
SELECT 'Candidates with NULL openness_score:' AS diagnostic;
SELECT c.id, p.full_name, p.email, c.openness_score, c.assessment_status, c.assessment_completed_at
FROM candidates c
JOIN profiles p ON p.id = c.user_id
WHERE c.openness_score IS NULL;

SELECT 'Candidates with assessment_status not completed:' AS diagnostic;
SELECT c.id, p.full_name, p.email, c.openness_score, c.assessment_status
FROM candidates c
JOIN profiles p ON p.id = c.user_id
WHERE c.assessment_status != 'completed' OR c.assessment_status IS NULL;

SELECT 'Completed assessments without corresponding candidate scores:' AS diagnostic;
SELECT a.id AS assessment_id, a.user_id, a.assessment_type, a.completed_at, c.openness_score
FROM assessments a
JOIN candidates c ON c.user_id = a.user_id
WHERE a.assessment_type = 'candidate_personality'
  AND a.completed_at IS NOT NULL
  AND c.openness_score IS NULL;

-- ============================================
-- FIX 1: Update candidates who have OCEAN scores but wrong status
-- ============================================
UPDATE candidates
SET
  assessment_status = 'completed',
  assessment_completed_at = COALESCE(assessment_completed_at, NOW())
WHERE openness_score IS NOT NULL
  AND conscientiousness_score IS NOT NULL
  AND extraversion_score IS NOT NULL
  AND agreeableness_score IS NOT NULL
  AND neuroticism_score IS NOT NULL
  AND (assessment_status != 'completed' OR assessment_status IS NULL);

SELECT 'Fixed candidates with scores but wrong status:' AS result, COUNT(*) AS count
FROM candidates
WHERE openness_score IS NOT NULL
  AND assessment_status = 'completed';

-- ============================================
-- FIX 2: For candidates with NULL scores, check if they're in seed data
-- If so, we can re-apply seed values. Run seed-test-users.sql to fix those.
-- ============================================

-- Show candidates still needing fixes (these need to re-take assessment or have seed data applied)
SELECT 'Candidates still needing OCEAN scores (re-run seed-test-users.sql or have them re-take assessment):' AS action_needed;
SELECT c.id, p.full_name, p.email, c.assessment_status
FROM candidates c
JOIN profiles p ON p.id = c.user_id
WHERE c.openness_score IS NULL;

-- ============================================
-- VERIFY: Final state
-- ============================================
SELECT 'Final state - All candidates:' AS verification;
SELECT
  c.id,
  p.full_name,
  c.openness_score,
  c.conscientiousness_score,
  c.extraversion_score,
  c.agreeableness_score,
  c.neuroticism_score,
  c.assessment_status,
  CASE
    WHEN c.openness_score IS NOT NULL AND c.assessment_status = 'completed' THEN 'OK - Visible to employers'
    WHEN c.openness_score IS NULL THEN 'HIDDEN - Missing OCEAN scores'
    WHEN c.assessment_status != 'completed' THEN 'HIDDEN - Status not completed'
    ELSE 'CHECK'
  END AS visibility_status
FROM candidates c
JOIN profiles p ON p.id = c.user_id
ORDER BY visibility_status, p.full_name;
