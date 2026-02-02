-- Seed Assessment Responses for Test Users
-- Run this AFTER seed-test-users.sql and seed-questions.sql
-- Creates varied responses to test matching functionality

-- ============================================
-- CREATE ASSESSMENT SESSIONS
-- ============================================

-- Job Seeker Assessment Sessions
INSERT INTO public.assessments (id, user_id, assessment_type, started_at, completed_at, created_at)
VALUES
  ('aa111111-1111-1111-1111-111111111111', 'a1111111-1111-1111-1111-111111111111', 'candidate_personality', NOW() - INTERVAL '3 days', NOW() - INTERVAL '3 days', NOW() - INTERVAL '3 days'),
  ('aa222222-2222-2222-2222-222222222222', 'a2222222-2222-2222-2222-222222222222', 'candidate_personality', NOW() - INTERVAL '5 days', NOW() - INTERVAL '5 days', NOW() - INTERVAL '5 days'),
  ('aa333333-3333-3333-3333-333333333333', 'a3333333-3333-3333-3333-333333333333', 'candidate_personality', NOW() - INTERVAL '4 days', NOW() - INTERVAL '4 days', NOW() - INTERVAL '4 days'),
  ('aa444444-4444-4444-4444-444444444444', 'a4444444-4444-4444-4444-444444444444', 'candidate_personality', NOW() - INTERVAL '2 days', NOW() - INTERVAL '2 days', NOW() - INTERVAL '2 days'),
  ('aa555555-5555-5555-5555-555555555555', 'a5555555-5555-5555-5555-555555555555', 'candidate_personality', NOW() - INTERVAL '6 days', NOW() - INTERVAL '6 days', NOW() - INTERVAL '6 days')
ON CONFLICT (id) DO NOTHING;

-- Employer Assessment Sessions
INSERT INTO public.assessments (id, user_id, assessment_type, started_at, completed_at, created_at)
VALUES
  ('bb111111-1111-1111-1111-111111111111', 'b1111111-1111-1111-1111-111111111111', 'employer_culture', NOW() - INTERVAL '7 days', NOW() - INTERVAL '7 days', NOW() - INTERVAL '7 days'),
  ('bb222222-2222-2222-2222-222222222222', 'b2222222-2222-2222-2222-222222222222', 'employer_culture', NOW() - INTERVAL '8 days', NOW() - INTERVAL '8 days', NOW() - INTERVAL '8 days'),
  ('bb333333-3333-3333-3333-333333333333', 'b3333333-3333-3333-3333-333333333333', 'employer_culture', NOW() - INTERVAL '6 days', NOW() - INTERVAL '6 days', NOW() - INTERVAL '6 days'),
  ('bb444444-4444-4444-4444-444444444444', 'b4444444-4444-4444-4444-444444444444', 'employer_culture', NOW() - INTERVAL '9 days', NOW() - INTERVAL '9 days', NOW() - INTERVAL '9 days'),
  ('bb555555-5555-5555-5555-555555555555', 'b5555555-5555-5555-5555-555555555555', 'employer_culture', NOW() - INTERVAL '5 days', NOW() - INTERVAL '5 days', NOW() - INTERVAL '5 days')
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- CANDIDATE 1: Alex Chen - The Innovator
-- High openness, risk-taker, independent, fast-paced
-- Should match well with: TechStartup Inc, Creative Labs
-- ============================================
INSERT INTO public.assessment_responses (assessment_id, user_id, question_id, question_code, answer_id, slider_value, ranking_order, reflection_text, answered_at)
VALUES
  ('aa111111-1111-1111-1111-111111111111', 'a1111111-1111-1111-1111-111111111111', 'c1', 'c1', 'c1b', NULL, NULL, NULL, NOW() - INTERVAL '3 days'),  -- Take it on yourself (independence)
  ('aa111111-1111-1111-1111-111111111111', 'a1111111-1111-1111-1111-111111111111', 'c2', 'c2', 'c2b', NULL, NULL, NULL, NOW() - INTERVAL '3 days'),  -- Mountain peak (ambition)
  ('aa111111-1111-1111-1111-111111111111', 'a1111111-1111-1111-1111-111111111111', 'c3', 'c3', 'c3a', NULL, NULL, NULL, NOW() - INTERVAL '3 days'),  -- Moving fast
  ('aa111111-1111-1111-1111-111111111111', 'a1111111-1111-1111-1111-111111111111', 'c4', 'c4', 'c4a', NULL, NULL, NULL, NOW() - INTERVAL '3 days'),  -- Direct conversation
  ('aa111111-1111-1111-1111-111111111111', 'a1111111-1111-1111-1111-111111111111', 'c5', 'c5', NULL, 35, NULL, NULL, NOW() - INTERVAL '3 days'),     -- More introverted
  ('aa111111-1111-1111-1111-111111111111', 'a1111111-1111-1111-1111-111111111111', 'c6', 'c6', NULL, NULL, ARRAY['c6a', 'c6b', 'c6f', 'c6d', 'c6e', 'c6c'], NULL, NOW() - INTERVAL '3 days'),  -- Impact, Growth, Autonomy first
  ('aa111111-1111-1111-1111-111111111111', 'a1111111-1111-1111-1111-111111111111', 'c7', 'c7', 'c7a', NULL, NULL, NULL, NOW() - INTERVAL '3 days'),  -- Speak up immediately
  ('aa111111-1111-1111-1111-111111111111', 'a1111111-1111-1111-1111-111111111111', 'c8', 'c8', 'c8a', NULL, NULL, NULL, NOW() - INTERVAL '3 days'),  -- Jazz improvisation
  ('aa111111-1111-1111-1111-111111111111', 'a1111111-1111-1111-1111-111111111111', 'c9', 'c9', 'c9a', NULL, NULL, NULL, NOW() - INTERVAL '3 days'),  -- Find something new
  ('aa111111-1111-1111-1111-111111111111', 'a1111111-1111-1111-1111-111111111111', 'c10', 'c10', NULL, 25, NULL, NULL, NOW() - INTERVAL '3 days'),   -- Dive in (low planning)
  ('aa111111-1111-1111-1111-111111111111', 'a1111111-1111-1111-1111-111111111111', 'c11', 'c11', 'c11a', NULL, NULL, NULL, NOW() - INTERVAL '3 days'), -- Take the leap
  ('aa111111-1111-1111-1111-111111111111', 'a1111111-1111-1111-1111-111111111111', 'c12', 'c12', NULL, NULL, NULL, 'Shipping a product feature I designed from scratch, seeing users love it immediately.', NOW() - INTERVAL '3 days'),
  ('aa111111-1111-1111-1111-111111111111', 'a1111111-1111-1111-1111-111111111111', 'c13', 'c13', 'c13b', NULL, NULL, NULL, NOW() - INTERVAL '3 days'), -- Lead guitarist (expertise)
  ('aa111111-1111-1111-1111-111111111111', 'a1111111-1111-1111-1111-111111111111', 'c14', 'c14', 'c14b', NULL, NULL, NULL, NOW() - INTERVAL '3 days'), -- Learn many things
  ('aa111111-1111-1111-1111-111111111111', 'a1111111-1111-1111-1111-111111111111', 'c15', 'c15', 'c15b', NULL, NULL, NULL, NOW() - INTERVAL '3 days'), -- Fix first, then tell
  ('aa111111-1111-1111-1111-111111111111', 'a1111111-1111-1111-1111-111111111111', 'c16', 'c16', NULL, 75, NULL, NULL, NOW() - INTERVAL '3 days')    -- More integrated
ON CONFLICT (assessment_id, question_id) DO UPDATE SET
  answer_id = EXCLUDED.answer_id,
  slider_value = EXCLUDED.slider_value,
  ranking_order = EXCLUDED.ranking_order,
  reflection_text = EXCLUDED.reflection_text;

-- ============================================
-- CANDIDATE 2: Sarah Johnson - The Architect
-- High conscientiousness, structured, quality-focused
-- Should match well with: InnovateCorp, FinancePlus
-- ============================================
INSERT INTO public.assessment_responses (assessment_id, user_id, question_id, question_code, answer_id, slider_value, ranking_order, reflection_text, answered_at)
VALUES
  ('aa222222-2222-2222-2222-222222222222', 'a2222222-2222-2222-2222-222222222222', 'c1', 'c1', 'c1d', NULL, NULL, NULL, NOW() - INTERVAL '5 days'),  -- Assess and delegate
  ('aa222222-2222-2222-2222-222222222222', 'a2222222-2222-2222-2222-222222222222', 'c2', 'c2', 'c2a', NULL, NULL, NULL, NOW() - INTERVAL '5 days'),  -- Beehive (collaboration, structure)
  ('aa222222-2222-2222-2222-222222222222', 'a2222222-2222-2222-2222-222222222222', 'c3', 'c3', 'c3b', NULL, NULL, NULL, NOW() - INTERVAL '5 days'),  -- Getting it right
  ('aa222222-2222-2222-2222-222222222222', 'a2222222-2222-2222-2222-222222222222', 'c4', 'c4', 'c4b', NULL, NULL, NULL, NOW() - INTERVAL '5 days'),  -- Thoughtful framing
  ('aa222222-2222-2222-2222-222222222222', 'a2222222-2222-2222-2222-222222222222', 'c5', 'c5', NULL, 65, NULL, NULL, NOW() - INTERVAL '5 days'),     -- More extroverted
  ('aa222222-2222-2222-2222-222222222222', 'a2222222-2222-2222-2222-222222222222', 'c6', 'c6', NULL, NULL, ARRAY['c6b', 'c6c', 'c6a', 'c6e', 'c6d', 'c6f'], NULL, NOW() - INTERVAL '5 days'),  -- Growth, Stability, Impact first
  ('aa222222-2222-2222-2222-222222222222', 'a2222222-2222-2222-2222-222222222222', 'c7', 'c7', 'c7b', NULL, NULL, NULL, NOW() - INTERVAL '5 days'),  -- Request a private chat
  ('aa222222-2222-2222-2222-222222222222', 'a2222222-2222-2222-2222-222222222222', 'c8', 'c8', 'c8b', NULL, NULL, NULL, NOW() - INTERVAL '5 days'),  -- Classical symphony
  ('aa222222-2222-2222-2222-222222222222', 'a2222222-2222-2222-2222-222222222222', 'c9', 'c9', 'c9b', NULL, NULL, NULL, NOW() - INTERVAL '5 days'),  -- Use what works
  ('aa222222-2222-2222-2222-222222222222', 'a2222222-2222-2222-2222-222222222222', 'c10', 'c10', NULL, 85, NULL, NULL, NOW() - INTERVAL '5 days'),   -- Plan everything first
  ('aa222222-2222-2222-2222-222222222222', 'a2222222-2222-2222-2222-222222222222', 'c11', 'c11', 'c11d', NULL, NULL, NULL, NOW() - INTERVAL '5 days'), -- Need more information
  ('aa222222-2222-2222-2222-222222222222', 'a2222222-2222-2222-2222-222222222222', 'c12', 'c12', NULL, NULL, NULL, 'Leading a complex product launch where every detail came together perfectly after months of planning.', NOW() - INTERVAL '5 days'),
  ('aa222222-2222-2222-2222-222222222222', 'a2222222-2222-2222-2222-222222222222', 'c13', 'c13', 'c13a', NULL, NULL, NULL, NOW() - INTERVAL '5 days'), -- Lead vocalist (leadership)
  ('aa222222-2222-2222-2222-222222222222', 'a2222222-2222-2222-2222-222222222222', 'c14', 'c14', 'c14a', NULL, NULL, NULL, NOW() - INTERVAL '5 days'), -- Master one thing
  ('aa222222-2222-2222-2222-222222222222', 'a2222222-2222-2222-2222-222222222222', 'c15', 'c15', 'c15a', NULL, NULL, NULL, NOW() - INTERVAL '5 days'), -- Immediate disclosure
  ('aa222222-2222-2222-2222-222222222222', 'a2222222-2222-2222-2222-222222222222', 'c16', 'c16', NULL, 40, NULL, NULL, NOW() - INTERVAL '5 days')    -- More separated
ON CONFLICT (assessment_id, question_id) DO UPDATE SET
  answer_id = EXCLUDED.answer_id,
  slider_value = EXCLUDED.slider_value,
  ranking_order = EXCLUDED.ranking_order,
  reflection_text = EXCLUDED.reflection_text;

-- ============================================
-- CANDIDATE 3: Marcus Williams - The Catalyst
-- High extraversion, collaborative, people-oriented
-- Should match well with: HealthTech Solutions, InnovateCorp
-- ============================================
INSERT INTO public.assessment_responses (assessment_id, user_id, question_id, question_code, answer_id, slider_value, ranking_order, reflection_text, answered_at)
VALUES
  ('aa333333-3333-3333-3333-333333333333', 'a3333333-3333-3333-3333-333333333333', 'c1', 'c1', 'c1a', NULL, NULL, NULL, NOW() - INTERVAL '4 days'),  -- Rally the team
  ('aa333333-3333-3333-3333-333333333333', 'a3333333-3333-3333-3333-333333333333', 'c2', 'c2', 'c2a', NULL, NULL, NULL, NOW() - INTERVAL '4 days'),  -- Beehive (collaboration)
  ('aa333333-3333-3333-3333-333333333333', 'a3333333-3333-3333-3333-333333333333', 'c3', 'c3', 'c3a', NULL, NULL, NULL, NOW() - INTERVAL '4 days'),  -- Moving fast
  ('aa333333-3333-3333-3333-333333333333', 'a3333333-3333-3333-3333-333333333333', 'c4', 'c4', 'c4b', NULL, NULL, NULL, NOW() - INTERVAL '4 days'),  -- Thoughtful framing (empathy)
  ('aa333333-3333-3333-3333-333333333333', 'a3333333-3333-3333-3333-333333333333', 'c5', 'c5', NULL, 90, NULL, NULL, NOW() - INTERVAL '4 days'),     -- Very extroverted
  ('aa333333-3333-3333-3333-333333333333', 'a3333333-3333-3333-3333-333333333333', 'c6', 'c6', NULL, NULL, ARRAY['c6e', 'c6a', 'c6b', 'c6d', 'c6f', 'c6c'], NULL, NOW() - INTERVAL '4 days'),  -- Connection, Impact, Growth first
  ('aa333333-3333-3333-3333-333333333333', 'a3333333-3333-3333-3333-333333333333', 'c7', 'c7', 'c7c', NULL, NULL, NULL, NOW() - INTERVAL '4 days'),  -- Gather allies first
  ('aa333333-3333-3333-3333-333333333333', 'a3333333-3333-3333-3333-333333333333', 'c8', 'c8', 'c8d', NULL, NULL, NULL, NOW() - INTERVAL '4 days'),  -- Rock anthem (energy)
  ('aa333333-3333-3333-3333-333333333333', 'a3333333-3333-3333-3333-333333333333', 'c9', 'c9', 'c9a', NULL, NULL, NULL, NOW() - INTERVAL '4 days'),  -- Find something new
  ('aa333333-3333-3333-3333-333333333333', 'a3333333-3333-3333-3333-333333333333', 'c10', 'c10', NULL, 45, NULL, NULL, NOW() - INTERVAL '4 days'),   -- Balanced
  ('aa333333-3333-3333-3333-333333333333', 'a3333333-3333-3333-3333-333333333333', 'c11', 'c11', 'c11a', NULL, NULL, NULL, NOW() - INTERVAL '4 days'), -- Take the leap
  ('aa333333-3333-3333-3333-333333333333', 'a3333333-3333-3333-3333-333333333333', 'c12', 'c12', NULL, NULL, NULL, 'Closing a difficult deal by building genuine relationships with the client team over several months.', NOW() - INTERVAL '4 days'),
  ('aa333333-3333-3333-3333-333333333333', 'a3333333-3333-3333-3333-333333333333', 'c13', 'c13', 'c13a', NULL, NULL, NULL, NOW() - INTERVAL '4 days'), -- Lead vocalist
  ('aa333333-3333-3333-3333-333333333333', 'a3333333-3333-3333-3333-333333333333', 'c14', 'c14', 'c14b', NULL, NULL, NULL, NOW() - INTERVAL '4 days'), -- Learn many things
  ('aa333333-3333-3333-3333-333333333333', 'a3333333-3333-3333-3333-333333333333', 'c15', 'c15', 'c15a', NULL, NULL, NULL, NOW() - INTERVAL '4 days'), -- Immediate disclosure
  ('aa333333-3333-3333-3333-333333333333', 'a3333333-3333-3333-3333-333333333333', 'c16', 'c16', NULL, 80, NULL, NULL, NOW() - INTERVAL '4 days')    -- Very integrated
ON CONFLICT (assessment_id, question_id) DO UPDATE SET
  answer_id = EXCLUDED.answer_id,
  slider_value = EXCLUDED.slider_value,
  ranking_order = EXCLUDED.ranking_order,
  reflection_text = EXCLUDED.reflection_text;

-- ============================================
-- CANDIDATE 4: Emily Rodriguez - The Craftsperson
-- Balanced, detail-focused, quality-oriented, creative
-- Should match well with: Creative Labs, InnovateCorp
-- ============================================
INSERT INTO public.assessment_responses (assessment_id, user_id, question_id, question_code, answer_id, slider_value, ranking_order, reflection_text, answered_at)
VALUES
  ('aa444444-4444-4444-4444-444444444444', 'a4444444-4444-4444-4444-444444444444', 'c1', 'c1', 'c1c', NULL, NULL, NULL, NOW() - INTERVAL '2 days'),  -- Negotiate timeline (boundaries)
  ('aa444444-4444-4444-4444-444444444444', 'a4444444-4444-4444-4444-444444444444', 'c2', 'c2', 'c2d', NULL, NULL, NULL, NOW() - INTERVAL '2 days'),  -- Deep forest (depth, reflection)
  ('aa444444-4444-4444-4444-444444444444', 'a4444444-4444-4444-4444-444444444444', 'c3', 'c3', 'c3b', NULL, NULL, NULL, NOW() - INTERVAL '2 days'),  -- Getting it right
  ('aa444444-4444-4444-4444-444444444444', 'a4444444-4444-4444-4444-444444444444', 'c4', 'c4', 'c4b', NULL, NULL, NULL, NOW() - INTERVAL '2 days'),  -- Thoughtful framing
  ('aa444444-4444-4444-4444-444444444444', 'a4444444-4444-4444-4444-444444444444', 'c5', 'c5', NULL, 30, NULL, NULL, NOW() - INTERVAL '2 days'),     -- Introverted
  ('aa444444-4444-4444-4444-444444444444', 'a4444444-4444-4444-4444-444444444444', 'c6', 'c6', NULL, NULL, ARRAY['c6b', 'c6a', 'c6f', 'c6e', 'c6c', 'c6d'], NULL, NOW() - INTERVAL '2 days'),  -- Growth, Impact, Autonomy first
  ('aa444444-4444-4444-4444-444444444444', 'a4444444-4444-4444-4444-444444444444', 'c7', 'c7', 'c7b', NULL, NULL, NULL, NOW() - INTERVAL '2 days'),  -- Request a private chat
  ('aa444444-4444-4444-4444-444444444444', 'a4444444-4444-4444-4444-444444444444', 'c8', 'c8', 'c8c', NULL, NULL, NULL, NOW() - INTERVAL '2 days'),  -- Electronic beats (consistency)
  ('aa444444-4444-4444-4444-444444444444', 'a4444444-4444-4444-4444-444444444444', 'c9', 'c9', 'c9a', NULL, NULL, NULL, NOW() - INTERVAL '2 days'),  -- Find something new (creative)
  ('aa444444-4444-4444-4444-444444444444', 'a4444444-4444-4444-4444-444444444444', 'c10', 'c10', NULL, 70, NULL, NULL, NOW() - INTERVAL '2 days'),   -- More planning
  ('aa444444-4444-4444-4444-444444444444', 'a4444444-4444-4444-4444-444444444444', 'c11', 'c11', 'c11c', NULL, NULL, NULL, NOW() - INTERVAL '2 days'), -- Negotiate a hybrid
  ('aa444444-4444-4444-4444-444444444444', 'a4444444-4444-4444-4444-444444444444', 'c12', 'c12', NULL, NULL, NULL, 'Spending weeks perfecting a design system that made the entire team more productive.', NOW() - INTERVAL '2 days'),
  ('aa444444-4444-4444-4444-444444444444', 'a4444444-4444-4444-4444-444444444444', 'c13', 'c13', 'c13c', NULL, NULL, NULL, NOW() - INTERVAL '2 days'), -- Bassist (support, reliability)
  ('aa444444-4444-4444-4444-444444444444', 'a4444444-4444-4444-4444-444444444444', 'c14', 'c14', 'c14a', NULL, NULL, NULL, NOW() - INTERVAL '2 days'), -- Master one thing
  ('aa444444-4444-4444-4444-444444444444', 'a4444444-4444-4444-4444-444444444444', 'c15', 'c15', 'c15b', NULL, NULL, NULL, NOW() - INTERVAL '2 days'), -- Fix first, then tell
  ('aa444444-4444-4444-4444-444444444444', 'a4444444-4444-4444-4444-444444444444', 'c16', 'c16', NULL, 25, NULL, NULL, NOW() - INTERVAL '2 days')    -- More separated
ON CONFLICT (assessment_id, question_id) DO UPDATE SET
  answer_id = EXCLUDED.answer_id,
  slider_value = EXCLUDED.slider_value,
  ranking_order = EXCLUDED.ranking_order,
  reflection_text = EXCLUDED.reflection_text;

-- ============================================
-- CANDIDATE 5: David Kim - The Anchor
-- High stability, process-oriented, reliable, methodical
-- Should match well with: FinancePlus, InnovateCorp
-- ============================================
INSERT INTO public.assessment_responses (assessment_id, user_id, question_id, question_code, answer_id, slider_value, ranking_order, reflection_text, answered_at)
VALUES
  ('aa555555-5555-5555-5555-555555555555', 'a5555555-5555-5555-5555-555555555555', 'c1', 'c1', 'c1d', NULL, NULL, NULL, NOW() - INTERVAL '6 days'),  -- Assess and delegate
  ('aa555555-5555-5555-5555-555555555555', 'a5555555-5555-5555-5555-555555555555', 'c2', 'c2', 'c2a', NULL, NULL, NULL, NOW() - INTERVAL '6 days'),  -- Beehive (structure)
  ('aa555555-5555-5555-5555-555555555555', 'a5555555-5555-5555-5555-555555555555', 'c3', 'c3', 'c3b', NULL, NULL, NULL, NOW() - INTERVAL '6 days'),  -- Getting it right
  ('aa555555-5555-5555-5555-555555555555', 'a5555555-5555-5555-5555-555555555555', 'c4', 'c4', 'c4d', NULL, NULL, NULL, NOW() - INTERVAL '6 days'),  -- Escalate appropriately (process)
  ('aa555555-5555-5555-5555-555555555555', 'a5555555-5555-5555-5555-555555555555', 'c5', 'c5', NULL, 25, NULL, NULL, NOW() - INTERVAL '6 days'),     -- Introverted
  ('aa555555-5555-5555-5555-555555555555', 'a5555555-5555-5555-5555-555555555555', 'c6', 'c6', NULL, NULL, ARRAY['c6c', 'c6b', 'c6e', 'c6a', 'c6d', 'c6f'], NULL, NOW() - INTERVAL '6 days'),  -- Stability, Growth, Connection first
  ('aa555555-5555-5555-5555-555555555555', 'a5555555-5555-5555-5555-555555555555', 'c7', 'c7', 'c7d', NULL, NULL, NULL, NOW() - INTERVAL '6 days'),  -- Trust the process
  ('aa555555-5555-5555-5555-555555555555', 'a5555555-5555-5555-5555-555555555555', 'c8', 'c8', 'c8c', NULL, NULL, NULL, NOW() - INTERVAL '6 days'),  -- Electronic beats (consistency)
  ('aa555555-5555-5555-5555-555555555555', 'a5555555-5555-5555-5555-555555555555', 'c9', 'c9', 'c9b', NULL, NULL, NULL, NOW() - INTERVAL '6 days'),  -- Use what works
  ('aa555555-5555-5555-5555-555555555555', 'a5555555-5555-5555-5555-555555555555', 'c10', 'c10', NULL, 90, NULL, NULL, NOW() - INTERVAL '6 days'),   -- Plan everything first
  ('aa555555-5555-5555-5555-555555555555', 'a5555555-5555-5555-5555-555555555555', 'c11', 'c11', 'c11b', NULL, NULL, NULL, NOW() - INTERVAL '6 days'), -- Stay the course
  ('aa555555-5555-5555-5555-555555555555', 'a5555555-5555-5555-5555-555555555555', 'c12', 'c12', NULL, NULL, NULL, 'Keeping our systems running at 99.99% uptime during a major traffic spike that would have crashed us before.', NOW() - INTERVAL '6 days'),
  ('aa555555-5555-5555-5555-555555555555', 'a5555555-5555-5555-5555-555555555555', 'c13', 'c13', 'c13c', NULL, NULL, NULL, NOW() - INTERVAL '6 days'), -- Bassist (reliability)
  ('aa555555-5555-5555-5555-555555555555', 'a5555555-5555-5555-5555-555555555555', 'c14', 'c14', 'c14a', NULL, NULL, NULL, NOW() - INTERVAL '6 days'), -- Master one thing
  ('aa555555-5555-5555-5555-555555555555', 'a5555555-5555-5555-5555-555555555555', 'c15', 'c15', 'c15c', NULL, NULL, NULL, NOW() - INTERVAL '6 days'), -- Assess the situation
  ('aa555555-5555-5555-5555-555555555555', 'a5555555-5555-5555-5555-555555555555', 'c16', 'c16', NULL, 20, NULL, NULL, NOW() - INTERVAL '6 days')    -- Clear separation
ON CONFLICT (assessment_id, question_id) DO UPDATE SET
  answer_id = EXCLUDED.answer_id,
  slider_value = EXCLUDED.slider_value,
  ranking_order = EXCLUDED.ranking_order,
  reflection_text = EXCLUDED.reflection_text;

-- ============================================
-- EMPLOYER 1: TechStartup Inc - Innovation-focused
-- Fast-paced, risk-taking, flat structure
-- ============================================
INSERT INTO public.assessment_responses (assessment_id, user_id, question_id, question_code, answer_id, slider_value, ranking_order, reflection_text, answered_at)
VALUES
  ('bb111111-1111-1111-1111-111111111111', 'b1111111-1111-1111-1111-111111111111', 'e1', 'e1', 'e1b', NULL, NULL, NULL, NOW() - INTERVAL '7 days'),  -- Hire for culture
  ('bb111111-1111-1111-1111-111111111111', 'b1111111-1111-1111-1111-111111111111', 'e2', 'e2', 'e2a', NULL, NULL, NULL, NOW() - INTERVAL '7 days'),  -- Startup garage
  ('bb111111-1111-1111-1111-111111111111', 'b1111111-1111-1111-1111-111111111111', 'e3', 'e3', 'e3a', NULL, NULL, NULL, NOW() - INTERVAL '7 days'),  -- Move fast
  ('bb111111-1111-1111-1111-111111111111', 'b1111111-1111-1111-1111-111111111111', 'e4', 'e4', 'e4d', NULL, NULL, NULL, NOW() - INTERVAL '7 days'),  -- Make the hard call
  ('bb111111-1111-1111-1111-111111111111', 'b1111111-1111-1111-1111-111111111111', 'e5', 'e5', NULL, 15, NULL, NULL, NOW() - INTERVAL '7 days'),     -- Very flat
  ('bb111111-1111-1111-1111-111111111111', 'b1111111-1111-1111-1111-111111111111', 'e6', 'e6', NULL, NULL, ARRAY['e6b', 'e6a', 'e6e', 'e6c', 'e6d', 'e6f'], NULL, NOW() - INTERVAL '7 days'),  -- Innovation, Results, Growth first
  ('bb111111-1111-1111-1111-111111111111', 'b1111111-1111-1111-1111-111111111111', 'e7', 'e7', 'e7a', NULL, NULL, NULL, NOW() - INTERVAL '7 days'),  -- Go all in
  ('bb111111-1111-1111-1111-111111111111', 'b1111111-1111-1111-1111-111111111111', 'e8', 'e8', 'e8b', NULL, NULL, NULL, NOW() - INTERVAL '7 days'),  -- Jazz session
  ('bb111111-1111-1111-1111-111111111111', 'b1111111-1111-1111-1111-111111111111', 'e9', 'e9', 'e9b', NULL, NULL, NULL, NOW() - INTERVAL '7 days'),  -- Raw potential
  ('bb111111-1111-1111-1111-111111111111', 'b1111111-1111-1111-1111-111111111111', 'e10', 'e10', NULL, 85, NULL, NULL, NOW() - INTERVAL '7 days'),   -- Continuous feedback
  ('bb111111-1111-1111-1111-111111111111', 'b1111111-1111-1111-1111-111111111111', 'e11', 'e11', 'e11d', NULL, NULL, NULL, NOW() - INTERVAL '7 days'), -- Move forward fast
  ('bb111111-1111-1111-1111-111111111111', 'b1111111-1111-1111-1111-111111111111', 'e12', 'e12', NULL, NULL, NULL, 'When we pivoted our entire product in 2 weeks after customer feedback, everyone rallied together.', NOW() - INTERVAL '7 days'),
  ('bb111111-1111-1111-1111-111111111111', 'b1111111-1111-1111-1111-111111111111', 'e13', 'e13', NULL, 85, NULL, NULL, NOW() - INTERVAL '7 days'),   -- Intense pace
  ('bb111111-1111-1111-1111-111111111111', 'b1111111-1111-1111-1111-111111111111', 'e14', 'e14', 'e14a', NULL, NULL, NULL, NOW() - INTERVAL '7 days'), -- Full flexibility
  ('bb111111-1111-1111-1111-111111111111', 'b1111111-1111-1111-1111-111111111111', 'e15', 'e15', 'e15a', NULL, NULL, NULL, NOW() - INTERVAL '7 days'), -- Radical transparency
  ('bb111111-1111-1111-1111-111111111111', 'b1111111-1111-1111-1111-111111111111', 'e16', 'e16', NULL, 90, NULL, NULL, NOW() - INTERVAL '7 days')    -- Disrupt
ON CONFLICT (assessment_id, question_id) DO UPDATE SET
  answer_id = EXCLUDED.answer_id,
  slider_value = EXCLUDED.slider_value,
  ranking_order = EXCLUDED.ranking_order,
  reflection_text = EXCLUDED.reflection_text;

-- ============================================
-- EMPLOYER 2: InnovateCorp - Balanced growth company
-- Mix of innovation and structure
-- ============================================
INSERT INTO public.assessment_responses (assessment_id, user_id, question_id, question_code, answer_id, slider_value, ranking_order, reflection_text, answered_at)
VALUES
  ('bb222222-2222-2222-2222-222222222222', 'b2222222-2222-2222-2222-222222222222', 'e1', 'e1', 'e1d', NULL, NULL, NULL, NOW() - INTERVAL '8 days'),  -- Hire both differently
  ('bb222222-2222-2222-2222-222222222222', 'b2222222-2222-2222-2222-222222222222', 'e2', 'e2', 'e2b', NULL, NULL, NULL, NOW() - INTERVAL '8 days'),  -- Research library (depth)
  ('bb222222-2222-2222-2222-222222222222', 'b2222222-2222-2222-2222-222222222222', 'e3', 'e3', 'e3b', NULL, NULL, NULL, NOW() - INTERVAL '8 days'),  -- Build consensus
  ('bb222222-2222-2222-2222-222222222222', 'b2222222-2222-2222-2222-222222222222', 'e4', 'e4', 'e4b', NULL, NULL, NULL, NOW() - INTERVAL '8 days'),  -- Find their strength
  ('bb222222-2222-2222-2222-222222222222', 'b2222222-2222-2222-2222-222222222222', 'e5', 'e5', NULL, 50, NULL, NULL, NOW() - INTERVAL '8 days'),     -- Balanced hierarchy
  ('bb222222-2222-2222-2222-222222222222', 'b2222222-2222-2222-2222-222222222222', 'e6', 'e6', NULL, NULL, ARRAY['e6d', 'e6c', 'e6e', 'e6a', 'e6b', 'e6f'], NULL, NOW() - INTERVAL '8 days'),  -- Excellence, Collaboration, Growth first
  ('bb222222-2222-2222-2222-222222222222', 'b2222222-2222-2222-2222-222222222222', 'e7', 'e7', 'e7c', NULL, NULL, NULL, NOW() - INTERVAL '8 days'),  -- Test and learn
  ('bb222222-2222-2222-2222-222222222222', 'b2222222-2222-2222-2222-222222222222', 'e8', 'e8', 'e8a', NULL, NULL, NULL, NOW() - INTERVAL '8 days'),  -- Debate club
  ('bb222222-2222-2222-2222-222222222222', 'b2222222-2222-2222-2222-222222222222', 'e9', 'e9', 'e9a', NULL, NULL, NULL, NOW() - INTERVAL '8 days'),  -- Proven experience
  ('bb222222-2222-2222-2222-222222222222', 'b2222222-2222-2222-2222-222222222222', 'e10', 'e10', NULL, 55, NULL, NULL, NOW() - INTERVAL '8 days'),   -- Balanced feedback
  ('bb222222-2222-2222-2222-222222222222', 'b2222222-2222-2222-2222-222222222222', 'e11', 'e11', 'e11b', NULL, NULL, NULL, NOW() - INTERVAL '8 days'), -- Analyze first
  ('bb222222-2222-2222-2222-222222222222', 'b2222222-2222-2222-2222-222222222222', 'e12', 'e12', NULL, NULL, NULL, 'When we hit our first $10M ARR and the whole company celebrated with a surprise party.', NOW() - INTERVAL '8 days'),
  ('bb222222-2222-2222-2222-222222222222', 'b2222222-2222-2222-2222-222222222222', 'e13', 'e13', NULL, 55, NULL, NULL, NOW() - INTERVAL '8 days'),   -- Moderate pace
  ('bb222222-2222-2222-2222-222222222222', 'b2222222-2222-2222-2222-222222222222', 'e14', 'e14', 'e14b', NULL, NULL, NULL, NOW() - INTERVAL '8 days'), -- Hybrid compromise
  ('bb222222-2222-2222-2222-222222222222', 'b2222222-2222-2222-2222-222222222222', 'e15', 'e15', 'e15a', NULL, NULL, NULL, NOW() - INTERVAL '8 days'), -- Radical transparency
  ('bb222222-2222-2222-2222-222222222222', 'b2222222-2222-2222-2222-222222222222', 'e16', 'e16', NULL, 60, NULL, NULL, NOW() - INTERVAL '8 days')    -- Balanced innovation
ON CONFLICT (assessment_id, question_id) DO UPDATE SET
  answer_id = EXCLUDED.answer_id,
  slider_value = EXCLUDED.slider_value,
  ranking_order = EXCLUDED.ranking_order,
  reflection_text = EXCLUDED.reflection_text;

-- ============================================
-- EMPLOYER 3: Creative Labs - Design-focused agency
-- Creative, quality-focused, craft-oriented
-- ============================================
INSERT INTO public.assessment_responses (assessment_id, user_id, question_id, question_code, answer_id, slider_value, ranking_order, reflection_text, answered_at)
VALUES
  ('bb333333-3333-3333-3333-333333333333', 'b3333333-3333-3333-3333-333333333333', 'e1', 'e1', 'e1c', NULL, NULL, NULL, NOW() - INTERVAL '6 days'),  -- Keep looking (high bar)
  ('bb333333-3333-3333-3333-333333333333', 'b3333333-3333-3333-3333-333333333333', 'e2', 'e2', 'e2d', NULL, NULL, NULL, NOW() - INTERVAL '6 days'),  -- Cozy coffee shop (warmth)
  ('bb333333-3333-3333-3333-333333333333', 'b3333333-3333-3333-3333-333333333333', 'e3', 'e3', 'e3b', NULL, NULL, NULL, NOW() - INTERVAL '6 days'),  -- Build consensus
  ('bb333333-3333-3333-3333-333333333333', 'b3333333-3333-3333-3333-333333333333', 'e4', 'e4', 'e4b', NULL, NULL, NULL, NOW() - INTERVAL '6 days'),  -- Find their strength
  ('bb333333-3333-3333-3333-333333333333', 'b3333333-3333-3333-3333-333333333333', 'e5', 'e5', NULL, 30, NULL, NULL, NOW() - INTERVAL '6 days'),     -- More flat
  ('bb333333-3333-3333-3333-333333333333', 'b3333333-3333-3333-3333-333333333333', 'e6', 'e6', NULL, NULL, ARRAY['e6d', 'e6b', 'e6c', 'e6e', 'e6a', 'e6f'], NULL, NOW() - INTERVAL '6 days'),  -- Excellence, Innovation, Collaboration first
  ('bb333333-3333-3333-3333-333333333333', 'b3333333-3333-3333-3333-333333333333', 'e7', 'e7', 'e7b', NULL, NULL, NULL, NOW() - INTERVAL '6 days'),  -- Protect what works
  ('bb333333-3333-3333-3333-333333333333', 'b3333333-3333-3333-3333-333333333333', 'e8', 'e8', 'e8b', NULL, NULL, NULL, NOW() - INTERVAL '6 days'),  -- Jazz session (creativity)
  ('bb333333-3333-3333-3333-333333333333', 'b3333333-3333-3333-3333-333333333333', 'e9', 'e9', 'e9b', NULL, NULL, NULL, NOW() - INTERVAL '6 days'),  -- Raw potential
  ('bb333333-3333-3333-3333-333333333333', 'b3333333-3333-3333-3333-333333333333', 'e10', 'e10', NULL, 70, NULL, NULL, NOW() - INTERVAL '6 days'),   -- More continuous
  ('bb333333-3333-3333-3333-333333333333', 'b3333333-3333-3333-3333-333333333333', 'e11', 'e11', 'e11c', NULL, NULL, NULL, NOW() - INTERVAL '6 days'), -- Rally the team
  ('bb333333-3333-3333-3333-333333333333', 'b3333333-3333-3333-3333-333333333333', 'e12', 'e12', NULL, NULL, NULL, 'Winning a major design award where the whole team was recognized for their collaborative work.', NOW() - INTERVAL '6 days'),
  ('bb333333-3333-3333-3333-333333333333', 'b3333333-3333-3333-3333-333333333333', 'e13', 'e13', NULL, 45, NULL, NULL, NOW() - INTERVAL '6 days'),   -- Sustainable pace
  ('bb333333-3333-3333-3333-333333333333', 'b3333333-3333-3333-3333-333333333333', 'e14', 'e14', 'e14b', NULL, NULL, NULL, NOW() - INTERVAL '6 days'), -- Hybrid compromise
  ('bb333333-3333-3333-3333-333333333333', 'b3333333-3333-3333-3333-333333333333', 'e15', 'e15', 'e15a', NULL, NULL, NULL, NOW() - INTERVAL '6 days'), -- Radical transparency
  ('bb333333-3333-3333-3333-333333333333', 'b3333333-3333-3333-3333-333333333333', 'e16', 'e16', NULL, 70, NULL, NULL, NOW() - INTERVAL '6 days')    -- More disruptive
ON CONFLICT (assessment_id, question_id) DO UPDATE SET
  answer_id = EXCLUDED.answer_id,
  slider_value = EXCLUDED.slider_value,
  ranking_order = EXCLUDED.ranking_order,
  reflection_text = EXCLUDED.reflection_text;

-- ============================================
-- EMPLOYER 4: FinancePlus - Traditional finance
-- Structured, stable, process-oriented
-- ============================================
INSERT INTO public.assessment_responses (assessment_id, user_id, question_id, question_code, answer_id, slider_value, ranking_order, reflection_text, answered_at)
VALUES
  ('bb444444-4444-4444-4444-444444444444', 'b4444444-4444-4444-4444-444444444444', 'e1', 'e1', 'e1a', NULL, NULL, NULL, NOW() - INTERVAL '9 days'),  -- Hire for skills
  ('bb444444-4444-4444-4444-444444444444', 'b4444444-4444-4444-4444-444444444444', 'e2', 'e2', 'e2b', NULL, NULL, NULL, NOW() - INTERVAL '9 days'),  -- Research library
  ('bb444444-4444-4444-4444-444444444444', 'b4444444-4444-4444-4444-444444444444', 'e3', 'e3', 'e3b', NULL, NULL, NULL, NOW() - INTERVAL '9 days'),  -- Build consensus
  ('bb444444-4444-4444-4444-444444444444', 'b4444444-4444-4444-4444-444444444444', 'e4', 'e4', 'e4a', NULL, NULL, NULL, NOW() - INTERVAL '9 days'),  -- Direct conversation
  ('bb444444-4444-4444-4444-444444444444', 'b4444444-4444-4444-4444-444444444444', 'e5', 'e5', NULL, 80, NULL, NULL, NOW() - INTERVAL '9 days'),     -- Hierarchical
  ('bb444444-4444-4444-4444-444444444444', 'b4444444-4444-4444-4444-444444444444', 'e6', 'e6', NULL, NULL, ARRAY['e6f', 'e6d', 'e6a', 'e6c', 'e6e', 'e6b'], NULL, NOW() - INTERVAL '9 days'),  -- Integrity, Excellence, Results first
  ('bb444444-4444-4444-4444-444444444444', 'b4444444-4444-4444-4444-444444444444', 'e7', 'e7', 'e7b', NULL, NULL, NULL, NOW() - INTERVAL '9 days'),  -- Protect what works
  ('bb444444-4444-4444-4444-444444444444', 'b4444444-4444-4444-4444-444444444444', 'e8', 'e8', 'e8c', NULL, NULL, NULL, NOW() - INTERVAL '9 days'),  -- Briefing (efficiency)
  ('bb444444-4444-4444-4444-444444444444', 'b4444444-4444-4444-4444-444444444444', 'e9', 'e9', 'e9a', NULL, NULL, NULL, NOW() - INTERVAL '9 days'),  -- Proven experience
  ('bb444444-4444-4444-4444-444444444444', 'b4444444-4444-4444-4444-444444444444', 'e10', 'e10', NULL, 20, NULL, NULL, NOW() - INTERVAL '9 days'),   -- Formal reviews
  ('bb444444-4444-4444-4444-444444444444', 'b4444444-4444-4444-4444-444444444444', 'e11', 'e11', 'e11b', NULL, NULL, NULL, NOW() - INTERVAL '9 days'), -- Analyze first
  ('bb444444-4444-4444-4444-444444444444', 'b4444444-4444-4444-4444-444444444444', 'e12', 'e12', NULL, NULL, NULL, 'When we successfully navigated a major regulatory audit with zero findings due to our rigorous processes.', NOW() - INTERVAL '9 days'),
  ('bb444444-4444-4444-4444-444444444444', 'b4444444-4444-4444-4444-444444444444', 'e13', 'e13', NULL, 30, NULL, NULL, NOW() - INTERVAL '9 days'),   -- Sustainable pace
  ('bb444444-4444-4444-4444-444444444444', 'b4444444-4444-4444-4444-444444444444', 'e14', 'e14', 'e14c', NULL, NULL, NULL, NOW() - INTERVAL '9 days'), -- Hold the line
  ('bb444444-4444-4444-4444-444444444444', 'b4444444-4444-4444-4444-444444444444', 'e15', 'e15', 'e15b', NULL, NULL, NULL, NOW() - INTERVAL '9 days'), -- Need to know
  ('bb444444-4444-4444-4444-444444444444', 'b4444444-4444-4444-4444-444444444444', 'e16', 'e16', NULL, 20, NULL, NULL, NOW() - INTERVAL '9 days')    -- Optimize
ON CONFLICT (assessment_id, question_id) DO UPDATE SET
  answer_id = EXCLUDED.answer_id,
  slider_value = EXCLUDED.slider_value,
  ranking_order = EXCLUDED.ranking_order,
  reflection_text = EXCLUDED.reflection_text;

-- ============================================
-- EMPLOYER 5: HealthTech Solutions - Mission-driven
-- Collaborative, empathetic, impact-focused
-- ============================================
INSERT INTO public.assessment_responses (assessment_id, user_id, question_id, question_code, answer_id, slider_value, ranking_order, reflection_text, answered_at)
VALUES
  ('bb555555-5555-5555-5555-555555555555', 'b5555555-5555-5555-5555-555555555555', 'e1', 'e1', 'e1b', NULL, NULL, NULL, NOW() - INTERVAL '5 days'),  -- Hire for culture
  ('bb555555-5555-5555-5555-555555555555', 'b5555555-5555-5555-5555-555555555555', 'e2', 'e2', 'e2d', NULL, NULL, NULL, NOW() - INTERVAL '5 days'),  -- Cozy coffee shop
  ('bb555555-5555-5555-5555-555555555555', 'b5555555-5555-5555-5555-555555555555', 'e3', 'e3', 'e3b', NULL, NULL, NULL, NOW() - INTERVAL '5 days'),  -- Build consensus
  ('bb555555-5555-5555-5555-555555555555', 'b5555555-5555-5555-5555-555555555555', 'e4', 'e4', 'e4c', NULL, NULL, NULL, NOW() - INTERVAL '5 days'),  -- Increase support
  ('bb555555-5555-5555-5555-555555555555', 'b5555555-5555-5555-5555-555555555555', 'e5', 'e5', NULL, 35, NULL, NULL, NOW() - INTERVAL '5 days'),     -- More flat
  ('bb555555-5555-5555-5555-555555555555', 'b5555555-5555-5555-5555-555555555555', 'e6', 'e6', NULL, NULL, ARRAY['e6f', 'e6c', 'e6e', 'e6a', 'e6d', 'e6b'], NULL, NOW() - INTERVAL '5 days'),  -- Integrity, Collaboration, Growth first
  ('bb555555-5555-5555-5555-555555555555', 'b5555555-5555-5555-5555-555555555555', 'e7', 'e7', 'e7c', NULL, NULL, NULL, NOW() - INTERVAL '5 days'),  -- Test and learn
  ('bb555555-5555-5555-5555-555555555555', 'b5555555-5555-5555-5555-555555555555', 'e8', 'e8', 'e8d', NULL, NULL, NULL, NOW() - INTERVAL '5 days'),  -- Campfire (connection)
  ('bb555555-5555-5555-5555-555555555555', 'b5555555-5555-5555-5555-555555555555', 'e9', 'e9', 'e9b', NULL, NULL, NULL, NOW() - INTERVAL '5 days'),  -- Raw potential
  ('bb555555-5555-5555-5555-555555555555', 'b5555555-5555-5555-5555-555555555555', 'e10', 'e10', NULL, 65, NULL, NULL, NOW() - INTERVAL '5 days'),   -- More continuous
  ('bb555555-5555-5555-5555-555555555555', 'b5555555-5555-5555-5555-555555555555', 'e11', 'e11', 'e11c', NULL, NULL, NULL, NOW() - INTERVAL '5 days'), -- Rally the team
  ('bb555555-5555-5555-5555-555555555555', 'b5555555-5555-5555-5555-555555555555', 'e12', 'e12', NULL, NULL, NULL, 'When a patient wrote to tell us our app helped them manage their chronic condition and improved their quality of life.', NOW() - INTERVAL '5 days'),
  ('bb555555-5555-5555-5555-555555555555', 'b5555555-5555-5555-5555-555555555555', 'e13', 'e13', NULL, 50, NULL, NULL, NOW() - INTERVAL '5 days'),   -- Balanced pace
  ('bb555555-5555-5555-5555-555555555555', 'b5555555-5555-5555-5555-555555555555', 'e14', 'e14', 'e14a', NULL, NULL, NULL, NOW() - INTERVAL '5 days'), -- Full flexibility
  ('bb555555-5555-5555-5555-555555555555', 'b5555555-5555-5555-5555-555555555555', 'e15', 'e15', 'e15a', NULL, NULL, NULL, NOW() - INTERVAL '5 days'), -- Radical transparency
  ('bb555555-5555-5555-5555-555555555555', 'b5555555-5555-5555-5555-555555555555', 'e16', 'e16', NULL, 65, NULL, NULL, NOW() - INTERVAL '5 days')    -- More disruptive
ON CONFLICT (assessment_id, question_id) DO UPDATE SET
  answer_id = EXCLUDED.answer_id,
  slider_value = EXCLUDED.slider_value,
  ranking_order = EXCLUDED.ranking_order,
  reflection_text = EXCLUDED.reflection_text;

-- ============================================
-- VERIFY RESPONSES
-- ============================================
SELECT 'Assessment responses created:' as status;

SELECT
  p.full_name,
  p.role,
  a.assessment_type,
  COUNT(ar.id) as response_count
FROM public.profiles p
JOIN public.assessments a ON a.user_id = p.id
JOIN public.assessment_responses ar ON ar.assessment_id = a.id
WHERE p.email LIKE '%test%' OR p.email LIKE '%.test'
GROUP BY p.full_name, p.role, a.assessment_type
ORDER BY p.role, p.full_name;
