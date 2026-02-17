-- Migration: Add Support for New Assessments
-- Run this on EXISTING databases to add support for:
-- - Cognitive Patterns Assessment
-- - Situational Judgment Assessment
-- - Work Values Assessment

-- ============================================
-- 1. ADD NEW COLUMNS TO CANDIDATES TABLE
-- ============================================

-- Add cognitive_patterns_data column
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
    AND table_name = 'candidates'
    AND column_name = 'cognitive_patterns_data'
  ) THEN
    ALTER TABLE public.candidates ADD COLUMN cognitive_patterns_data JSONB;
    RAISE NOTICE 'Added cognitive_patterns_data column to candidates table';
  ELSE
    RAISE NOTICE 'cognitive_patterns_data column already exists';
  END IF;
END $$;

-- Add situational_judgment_data column
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
    AND table_name = 'candidates'
    AND column_name = 'situational_judgment_data'
  ) THEN
    ALTER TABLE public.candidates ADD COLUMN situational_judgment_data JSONB;
    RAISE NOTICE 'Added situational_judgment_data column to candidates table';
  ELSE
    RAISE NOTICE 'situational_judgment_data column already exists';
  END IF;
END $$;

-- Add work_values_data column
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
    AND table_name = 'candidates'
    AND column_name = 'work_values_data'
  ) THEN
    ALTER TABLE public.candidates ADD COLUMN work_values_data JSONB;
    RAISE NOTICE 'Added work_values_data column to candidates table';
  ELSE
    RAISE NOTICE 'work_values_data column already exists';
  END IF;
END $$;

-- ============================================
-- 2. UPDATE QUESTIONS TABLE CHECK CONSTRAINT
-- ============================================

-- Drop and recreate the question_type constraint
ALTER TABLE public.questions DROP CONSTRAINT IF EXISTS questions_question_type_check;
ALTER TABLE public.questions ADD CONSTRAINT questions_question_type_check
  CHECK (question_type IN ('candidate', 'employer', 'visual_perception', 'cognitive_patterns', 'situational_judgment', 'work_values'));

-- ============================================
-- 3. UPDATE ASSESSMENTS TABLE CHECK CONSTRAINT
-- ============================================

-- Drop and recreate the assessment_type constraint
ALTER TABLE public.assessments DROP CONSTRAINT IF EXISTS assessments_assessment_type_check;
ALTER TABLE public.assessments ADD CONSTRAINT assessments_assessment_type_check
  CHECK (assessment_type IN ('candidate_personality', 'employer_culture', 'visual_perception', 'cognitive_patterns', 'situational_judgment', 'work_values'));

-- ============================================
-- VERIFICATION
-- ============================================
SELECT 'Migration completed successfully!' as status;

-- Show updated constraints
SELECT
  tc.table_name,
  tc.constraint_name,
  cc.check_clause
FROM information_schema.table_constraints tc
JOIN information_schema.check_constraints cc
  ON tc.constraint_name = cc.constraint_name
WHERE tc.table_name IN ('questions', 'assessments')
  AND tc.constraint_type = 'CHECK'
  AND (tc.constraint_name LIKE '%question_type%' OR tc.constraint_name LIKE '%assessment_type%');

-- Show new columns
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'candidates'
  AND column_name IN ('cognitive_patterns_data', 'situational_judgment_data', 'work_values_data');
