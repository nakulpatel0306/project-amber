-- Test RLS as specific users
-- This simulates what the frontend would see

-- Get the user IDs
SELECT 'User IDs for testing:' AS info;
SELECT id, email FROM auth.users
WHERE email IN ('david.kim@test.com', 'hr@techstartup.test');

-- Test 1: What does david.kim@test.com see in candidates table?
-- Replace the UUID below with david.kim's actual user_id from above
SELECT 'Testing as david.kim@test.com:' AS test;
SELECT set_config('request.jwt.claim.sub', 'c26eb65a-d218-45ea-bf4a-f749d9bcb79b', true);
SELECT set_config('request.jwt.claims', '{"sub": "c26eb65a-d218-45ea-bf4a-f749d9bcb79b", "role": "authenticated"}', true);

-- This simulates auth.uid() = the user's ID
SELECT
  'Candidate query result' AS query,
  c.*
FROM candidates c
WHERE c.user_id = 'c26eb65a-d218-45ea-bf4a-f749d9bcb79b';

-- Test 2: Check if auth.uid() works in this context
SELECT 'auth.uid() returns:' AS test, auth.uid();

-- Test 3: Direct check - does the policy condition evaluate to true?
SELECT
  'Policy check for david.kim' AS test,
  user_id,
  openness_score,
  (user_id = 'c26eb65a-d218-45ea-bf4a-f749d9bcb79b') AS "would_policy_pass"
FROM candidates
WHERE user_id = 'c26eb65a-d218-45ea-bf4a-f749d9bcb79b';

-- Test 4: Check employer for hr@techstartup.test
SELECT 'Testing employer hr@techstartup.test:' AS test;
SELECT
  user_id,
  company_name,
  culture_quiz_completed,
  openness_preference
FROM employers
WHERE user_id = '9330fa2c-48f3-4517-af04-28d7a1a03c63';
