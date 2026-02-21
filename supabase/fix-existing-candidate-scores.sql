-- Fix Existing Candidate OCEAN Scores
-- This script updates candidates with missing OCEAN scores
-- by looking up their user_id from auth.users by email

DO $$
DECLARE
  user_record RECORD;
BEGIN
  -- Update David Kim
  SELECT id INTO user_record FROM auth.users WHERE email = 'david.kim@test.com';
  IF user_record.id IS NOT NULL THEN
    UPDATE public.candidates SET
      openness_score = 55,
      conscientiousness_score = 90,
      extraversion_score = 45,
      agreeableness_score = 82,
      neuroticism_score = 15,
      top_traits = ARRAY['The Anchor', 'The Craftsperson'],
      assessment_status = 'completed',
      assessment_completed_at = COALESCE(assessment_completed_at, NOW())
    WHERE user_id = user_record.id;
    RAISE NOTICE 'Updated david.kim@test.com';
  END IF;

  -- Update Sarah Johnson
  SELECT id INTO user_record FROM auth.users WHERE email = 'sarah.johnson@test.com';
  IF user_record.id IS NOT NULL THEN
    UPDATE public.candidates SET
      openness_score = 72,
      conscientiousness_score = 88,
      extraversion_score = 65,
      agreeableness_score = 70,
      neuroticism_score = 25,
      top_traits = ARRAY['The Architect', 'The Strategist'],
      assessment_status = 'completed',
      assessment_completed_at = COALESCE(assessment_completed_at, NOW())
    WHERE user_id = user_record.id;
    RAISE NOTICE 'Updated sarah.johnson@test.com';
  END IF;

  -- Update Marcus Williams
  SELECT id INTO user_record FROM auth.users WHERE email = 'marcus.williams@test.com';
  IF user_record.id IS NOT NULL THEN
    UPDATE public.candidates SET
      openness_score = 85,
      conscientiousness_score = 60,
      extraversion_score = 92,
      agreeableness_score = 78,
      neuroticism_score = 30,
      top_traits = ARRAY['The Catalyst', 'The Connector'],
      assessment_status = 'completed',
      assessment_completed_at = COALESCE(assessment_completed_at, NOW())
    WHERE user_id = user_record.id;
    RAISE NOTICE 'Updated marcus.williams@test.com';
  END IF;

  -- Update Emily Rodriguez
  SELECT id INTO user_record FROM auth.users WHERE email = 'emily.rodriguez@test.com';
  IF user_record.id IS NOT NULL THEN
    UPDATE public.candidates SET
      openness_score = 78,
      conscientiousness_score = 88,
      extraversion_score = 55,
      agreeableness_score = 75,
      neuroticism_score = 35,
      top_traits = ARRAY['The Craftsperson', 'The Architect'],
      assessment_status = 'completed',
      assessment_completed_at = COALESCE(assessment_completed_at, NOW())
    WHERE user_id = user_record.id;
    RAISE NOTICE 'Updated emily.rodriguez@test.com';
  END IF;

END $$;

-- Verify the updates
SELECT
  p.email,
  c.openness_score,
  c.conscientiousness_score,
  c.extraversion_score,
  c.agreeableness_score,
  c.neuroticism_score,
  c.assessment_status,
  CASE
    WHEN c.openness_score IS NOT NULL AND c.assessment_status = 'completed'
    THEN 'VISIBLE'
    ELSE 'HIDDEN'
  END AS visibility
FROM candidates c
JOIN profiles p ON p.id = c.user_id
WHERE p.email IN ('david.kim@test.com', 'sarah.johnson@test.com', 'marcus.williams@test.com', 'emily.rodriguez@test.com')
ORDER BY p.email;
