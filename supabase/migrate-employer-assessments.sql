-- Migration: Add Support for Employer Supplementary Assessments
-- Run this on EXISTING databases to add support for:
-- - Team Dynamics Assessment
-- - Leadership Style Assessment
-- - Growth Philosophy Assessment
-- - Work Environment Assessment

-- ============================================
-- 1. ADD NEW COLUMNS TO EMPLOYERS TABLE
-- ============================================

-- Add team_dynamics_data column
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
    AND table_name = 'employers'
    AND column_name = 'team_dynamics_data'
  ) THEN
    ALTER TABLE public.employers ADD COLUMN team_dynamics_data JSONB;
    RAISE NOTICE 'Added team_dynamics_data column to employers table';
  ELSE
    RAISE NOTICE 'team_dynamics_data column already exists';
  END IF;
END $$;

-- Add leadership_style_data column
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
    AND table_name = 'employers'
    AND column_name = 'leadership_style_data'
  ) THEN
    ALTER TABLE public.employers ADD COLUMN leadership_style_data JSONB;
    RAISE NOTICE 'Added leadership_style_data column to employers table';
  ELSE
    RAISE NOTICE 'leadership_style_data column already exists';
  END IF;
END $$;

-- Add growth_philosophy_data column
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
    AND table_name = 'employers'
    AND column_name = 'growth_philosophy_data'
  ) THEN
    ALTER TABLE public.employers ADD COLUMN growth_philosophy_data JSONB;
    RAISE NOTICE 'Added growth_philosophy_data column to employers table';
  ELSE
    RAISE NOTICE 'growth_philosophy_data column already exists';
  END IF;
END $$;

-- Add work_environment_data column
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
    AND table_name = 'employers'
    AND column_name = 'work_environment_data'
  ) THEN
    ALTER TABLE public.employers ADD COLUMN work_environment_data JSONB;
    RAISE NOTICE 'Added work_environment_data column to employers table';
  ELSE
    RAISE NOTICE 'work_environment_data column already exists';
  END IF;
END $$;

-- ============================================
-- 2. UPDATE QUESTIONS TABLE CHECK CONSTRAINT
-- ============================================

ALTER TABLE public.questions DROP CONSTRAINT IF EXISTS questions_question_type_check;
ALTER TABLE public.questions ADD CONSTRAINT questions_question_type_check
  CHECK (question_type IN ('candidate', 'employer', 'visual_perception', 'cognitive_patterns', 'situational_judgment', 'work_values', 'team_dynamics', 'leadership_style', 'growth_philosophy', 'work_environment'));

-- ============================================
-- 3. UPDATE ASSESSMENTS TABLE CHECK CONSTRAINT
-- ============================================

ALTER TABLE public.assessments DROP CONSTRAINT IF EXISTS assessments_assessment_type_check;
ALTER TABLE public.assessments ADD CONSTRAINT assessments_assessment_type_check
  CHECK (assessment_type IN ('candidate_personality', 'employer_culture', 'visual_perception', 'cognitive_patterns', 'situational_judgment', 'work_values', 'team_dynamics', 'leadership_style', 'growth_philosophy', 'work_environment'));

-- ============================================
-- VERIFICATION
-- ============================================
SELECT 'Employer supplementary assessments migration completed successfully!' as status;

-- Show new columns
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'employers'
  AND column_name IN ('team_dynamics_data', 'leadership_style_data', 'growth_philosophy_data', 'work_environment_data');
