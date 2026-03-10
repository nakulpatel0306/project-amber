-- Fix match_score column type: was created as INTEGER by older migration,
-- needs to accept decimal values from the matching engine.
ALTER TABLE public.coffee_chats ALTER COLUMN match_score TYPE NUMERIC USING match_score::NUMERIC;

SELECT 'Migration complete! match_score is now NUMERIC.' AS status;
