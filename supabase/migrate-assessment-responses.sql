-- Migration: Consolidate assessment_responses columns into single JSONB answer column
-- Run this BEFORE updating the schema to the new format
-- This migration is idempotent and can be run multiple times safely

-- Step 1: Add the new answer column if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'assessment_responses' AND column_name = 'answer'
  ) THEN
    ALTER TABLE public.assessment_responses ADD COLUMN answer JSONB;
  END IF;
END $$;

-- Step 2: Migrate existing data to the new format
-- Only update rows where answer is NULL (not yet migrated)
UPDATE public.assessment_responses
SET answer = CASE
  -- Slider questions: {"value": slider_value}
  WHEN slider_value IS NOT NULL THEN jsonb_build_object('value', slider_value)
  -- Ranking questions: {"order": ranking_order}
  WHEN ranking_order IS NOT NULL THEN jsonb_build_object('order', ranking_order)
  -- Reflection questions: {"text": reflection_text}
  WHEN reflection_text IS NOT NULL THEN jsonb_build_object('text', reflection_text)
  -- Multiple choice questions: {"selected": answer_id}
  WHEN answer_id IS NOT NULL THEN jsonb_build_object('selected', answer_id)
  -- Fallback: empty object (should not happen with valid data)
  ELSE '{}'::jsonb
END
WHERE answer IS NULL;

-- Step 3: Ensure question_code is populated from question_id if needed
UPDATE public.assessment_responses
SET question_code = question_id
WHERE question_code IS NULL AND question_id IS NOT NULL;

-- Step 4: Make answer column NOT NULL after migration
-- Only do this if all rows have been migrated
DO $$
DECLARE
  null_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO null_count FROM public.assessment_responses WHERE answer IS NULL;
  IF null_count = 0 THEN
    -- All rows migrated, make column NOT NULL
    ALTER TABLE public.assessment_responses ALTER COLUMN answer SET NOT NULL;
  ELSE
    RAISE NOTICE 'Warning: % rows still have NULL answer values', null_count;
  END IF;
END $$;

-- Step 5: Drop old columns (optional - run separately after verifying migration)
-- Uncomment these lines when ready to remove old columns:
-- ALTER TABLE public.assessment_responses DROP COLUMN IF EXISTS answer_id;
-- ALTER TABLE public.assessment_responses DROP COLUMN IF EXISTS slider_value;
-- ALTER TABLE public.assessment_responses DROP COLUMN IF EXISTS ranking_order;
-- ALTER TABLE public.assessment_responses DROP COLUMN IF EXISTS reflection_text;
-- ALTER TABLE public.assessment_responses DROP COLUMN IF EXISTS question_id;

-- Step 6: Update unique constraint to use question_code
-- First drop old constraint if it exists, then create new one
DO $$
BEGIN
  -- Drop old constraint if it exists
  IF EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'assessment_responses_assessment_id_question_id_key'
  ) THEN
    ALTER TABLE public.assessment_responses
    DROP CONSTRAINT assessment_responses_assessment_id_question_id_key;
  END IF;

  -- Create new constraint if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'assessment_responses_assessment_id_question_code_key'
  ) THEN
    ALTER TABLE public.assessment_responses
    ADD CONSTRAINT assessment_responses_assessment_id_question_code_key
    UNIQUE (assessment_id, question_code);
  END IF;
EXCEPTION
  WHEN duplicate_object THEN
    -- Constraint already exists, ignore
    NULL;
END $$;

-- Verification query
SELECT
  'Migration complete' as status,
  COUNT(*) as total_responses,
  COUNT(CASE WHEN answer IS NOT NULL THEN 1 END) as migrated_responses
FROM public.assessment_responses;
