-- Seed Assessment Responses for Test Users
-- Run this AFTER seed-test-users.sql and seed-questions.sql
-- Creates varied responses to test matching functionality

-- ============================================
-- CREATE ASSESSMENT SESSIONS
-- ============================================

-- Job Seeker Assessment Sessions
INSERT INTO public.assessments (id, user_id, assessment_type, started_at, completed_at, created_at)
VALUES
  ('aa111111-1111-1111-1111-111111111111', '02286b62-311d-4e7a-bdd6-b4135c6c4e95', 'candidate_personality', NOW() - INTERVAL '3 days', NOW() - INTERVAL '3 days', NOW() - INTERVAL '3 days'),
  ('aa222222-2222-2222-2222-222222222222', '0b80df4d-3d8f-4e3f-b69d-1e8126efb454', 'candidate_personality', NOW() - INTERVAL '5 days', NOW() - INTERVAL '5 days', NOW() - INTERVAL '5 days'),
  ('aa333333-3333-3333-3333-333333333333', '2b3b0406-4a2b-49b5-97dd-2e55a93610e3', 'candidate_personality', NOW() - INTERVAL '4 days', NOW() - INTERVAL '4 days', NOW() - INTERVAL '4 days'),
  ('aa444444-4444-4444-4444-444444444444', '8388a5ba-132a-4dbd-995c-08a76183ffb3', 'candidate_personality', NOW() - INTERVAL '2 days', NOW() - INTERVAL '2 days', NOW() - INTERVAL '2 days'),
  ('aa555555-5555-5555-5555-555555555555', 'c88178b4-ae93-46ad-9cfb-bfa3873f9a02', 'candidate_personality', NOW() - INTERVAL '6 days', NOW() - INTERVAL '6 days', NOW() - INTERVAL '6 days')
ON CONFLICT (id) DO NOTHING;

-- Employer Assessment Sessions
INSERT INTO public.assessments (id, user_id, assessment_type, started_at, completed_at, created_at)
VALUES
  ('bb111111-1111-1111-1111-111111111111', 'faec878c-bc59-4eda-ae03-1af945b55cd6', 'employer_culture', NOW() - INTERVAL '7 days', NOW() - INTERVAL '7 days', NOW() - INTERVAL '7 days'),
  ('bb222222-2222-2222-2222-222222222222', 'c5c8b111-e7f0-42c4-b483-571e974ad6fc', 'employer_culture', NOW() - INTERVAL '8 days', NOW() - INTERVAL '8 days', NOW() - INTERVAL '8 days'),
  ('bb333333-3333-3333-3333-333333333333', 'bcaea40c-c371-4fdf-a1d9-4603771b8fa6', 'employer_culture', NOW() - INTERVAL '6 days', NOW() - INTERVAL '6 days', NOW() - INTERVAL '6 days'),
  ('bb444444-4444-4444-4444-444444444444', 'b92fe536-3d7a-41de-89a6-7804e953e6a5', 'employer_culture', NOW() - INTERVAL '9 days', NOW() - INTERVAL '9 days', NOW() - INTERVAL '9 days'),
  ('bb555555-5555-5555-5555-555555555555', '82430c1e-5749-40af-8ee1-0da25cf85cc8', 'employer_culture', NOW() - INTERVAL '5 days', NOW() - INTERVAL '5 days', NOW() - INTERVAL '5 days')
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- CANDIDATE 1: Alex Chen - The Innovator
-- High openness, risk-taker, independent, fast-paced
-- Should match well with: TechStartup Inc, Creative Labs
-- ============================================
INSERT INTO public.assessment_responses (assessment_id, user_id, question_code, answer, answered_at)
VALUES
  ('aa111111-1111-1111-1111-111111111111', '02286b62-311d-4e7a-bdd6-b4135c6c4e95', 'c1', '{"selected": "c1b"}', NOW() - INTERVAL '3 days'),  -- Take it on yourself (independence)
  ('aa111111-1111-1111-1111-111111111111', '02286b62-311d-4e7a-bdd6-b4135c6c4e95', 'c2', '{"selected": "c2b"}', NOW() - INTERVAL '3 days'),  -- Mountain peak (ambition)
  ('aa111111-1111-1111-1111-111111111111', '02286b62-311d-4e7a-bdd6-b4135c6c4e95', 'c3', '{"selected": "c3a"}', NOW() - INTERVAL '3 days'),  -- Moving fast
  ('aa111111-1111-1111-1111-111111111111', '02286b62-311d-4e7a-bdd6-b4135c6c4e95', 'c4', '{"selected": "c4a"}', NOW() - INTERVAL '3 days'),  -- Direct conversation
  ('aa111111-1111-1111-1111-111111111111', '02286b62-311d-4e7a-bdd6-b4135c6c4e95', 'c5', '{"value": 35}', NOW() - INTERVAL '3 days'),     -- More introverted
  ('aa111111-1111-1111-1111-111111111111', '02286b62-311d-4e7a-bdd6-b4135c6c4e95', 'c6', '{"order": ["c6a", "c6b", "c6f", "c6d", "c6e", "c6c"]}', NOW() - INTERVAL '3 days'),  -- Impact, Growth, Autonomy first
  ('aa111111-1111-1111-1111-111111111111', '02286b62-311d-4e7a-bdd6-b4135c6c4e95', 'c7', '{"selected": "c7a"}', NOW() - INTERVAL '3 days'),  -- Speak up immediately
  ('aa111111-1111-1111-1111-111111111111', '02286b62-311d-4e7a-bdd6-b4135c6c4e95', 'c8', '{"selected": "c8a"}', NOW() - INTERVAL '3 days'),  -- Jazz improvisation
  ('aa111111-1111-1111-1111-111111111111', '02286b62-311d-4e7a-bdd6-b4135c6c4e95', 'c9', '{"selected": "c9a"}', NOW() - INTERVAL '3 days'),  -- Find something new
  ('aa111111-1111-1111-1111-111111111111', '02286b62-311d-4e7a-bdd6-b4135c6c4e95', 'c10', '{"value": 25}', NOW() - INTERVAL '3 days'),   -- Dive in (low planning)
  ('aa111111-1111-1111-1111-111111111111', '02286b62-311d-4e7a-bdd6-b4135c6c4e95', 'c11', '{"selected": "c11a"}', NOW() - INTERVAL '3 days'), -- Take the leap
  ('aa111111-1111-1111-1111-111111111111', '02286b62-311d-4e7a-bdd6-b4135c6c4e95', 'c12', '{"text": "Shipping a product feature I designed from scratch, seeing users love it immediately."}', NOW() - INTERVAL '3 days'),
  ('aa111111-1111-1111-1111-111111111111', '02286b62-311d-4e7a-bdd6-b4135c6c4e95', 'c13', '{"selected": "c13b"}', NOW() - INTERVAL '3 days'), -- Lead guitarist (expertise)
  ('aa111111-1111-1111-1111-111111111111', '02286b62-311d-4e7a-bdd6-b4135c6c4e95', 'c14', '{"selected": "c14b"}', NOW() - INTERVAL '3 days'), -- Learn many things
  ('aa111111-1111-1111-1111-111111111111', '02286b62-311d-4e7a-bdd6-b4135c6c4e95', 'c15', '{"selected": "c15b"}', NOW() - INTERVAL '3 days'), -- Fix first, then tell
  ('aa111111-1111-1111-1111-111111111111', '02286b62-311d-4e7a-bdd6-b4135c6c4e95', 'c16', '{"value": 75}', NOW() - INTERVAL '3 days')    -- More integrated
ON CONFLICT (assessment_id, question_code) DO UPDATE SET
  answer = EXCLUDED.answer;

-- ============================================
-- CANDIDATE 2: Sarah Johnson - The Architect
-- High conscientiousness, structured, quality-focused
-- Should match well with: InnovateCorp, FinancePlus
-- ============================================
INSERT INTO public.assessment_responses (assessment_id, user_id, question_code, answer, answered_at)
VALUES
  ('aa222222-2222-2222-2222-222222222222', '0b80df4d-3d8f-4e3f-b69d-1e8126efb454', 'c1', '{"selected": "c1d"}', NOW() - INTERVAL '5 days'),  -- Assess and delegate
  ('aa222222-2222-2222-2222-222222222222', '0b80df4d-3d8f-4e3f-b69d-1e8126efb454', 'c2', '{"selected": "c2a"}', NOW() - INTERVAL '5 days'),  -- Beehive (collaboration, structure)
  ('aa222222-2222-2222-2222-222222222222', '0b80df4d-3d8f-4e3f-b69d-1e8126efb454', 'c3', '{"selected": "c3b"}', NOW() - INTERVAL '5 days'),  -- Getting it right
  ('aa222222-2222-2222-2222-222222222222', '0b80df4d-3d8f-4e3f-b69d-1e8126efb454', 'c4', '{"selected": "c4b"}', NOW() - INTERVAL '5 days'),  -- Thoughtful framing
  ('aa222222-2222-2222-2222-222222222222', '0b80df4d-3d8f-4e3f-b69d-1e8126efb454', 'c5', '{"value": 65}', NOW() - INTERVAL '5 days'),     -- More extroverted
  ('aa222222-2222-2222-2222-222222222222', '0b80df4d-3d8f-4e3f-b69d-1e8126efb454', 'c6', '{"order": ["c6b", "c6c", "c6a", "c6e", "c6d", "c6f"]}', NOW() - INTERVAL '5 days'),  -- Growth, Stability, Impact first
  ('aa222222-2222-2222-2222-222222222222', '0b80df4d-3d8f-4e3f-b69d-1e8126efb454', 'c7', '{"selected": "c7b"}', NOW() - INTERVAL '5 days'),  -- Request a private chat
  ('aa222222-2222-2222-2222-222222222222', '0b80df4d-3d8f-4e3f-b69d-1e8126efb454', 'c8', '{"selected": "c8b"}', NOW() - INTERVAL '5 days'),  -- Classical symphony
  ('aa222222-2222-2222-2222-222222222222', '0b80df4d-3d8f-4e3f-b69d-1e8126efb454', 'c9', '{"selected": "c9b"}', NOW() - INTERVAL '5 days'),  -- Use what works
  ('aa222222-2222-2222-2222-222222222222', '0b80df4d-3d8f-4e3f-b69d-1e8126efb454', 'c10', '{"value": 85}', NOW() - INTERVAL '5 days'),   -- Plan everything first
  ('aa222222-2222-2222-2222-222222222222', '0b80df4d-3d8f-4e3f-b69d-1e8126efb454', 'c11', '{"selected": "c11d"}', NOW() - INTERVAL '5 days'), -- Need more information
  ('aa222222-2222-2222-2222-222222222222', '0b80df4d-3d8f-4e3f-b69d-1e8126efb454', 'c12', '{"text": "Leading a complex product launch where every detail came together perfectly after months of planning."}', NOW() - INTERVAL '5 days'),
  ('aa222222-2222-2222-2222-222222222222', '0b80df4d-3d8f-4e3f-b69d-1e8126efb454', 'c13', '{"selected": "c13a"}', NOW() - INTERVAL '5 days'), -- Lead vocalist (leadership)
  ('aa222222-2222-2222-2222-222222222222', '0b80df4d-3d8f-4e3f-b69d-1e8126efb454', 'c14', '{"selected": "c14a"}', NOW() - INTERVAL '5 days'), -- Master one thing
  ('aa222222-2222-2222-2222-222222222222', '0b80df4d-3d8f-4e3f-b69d-1e8126efb454', 'c15', '{"selected": "c15a"}', NOW() - INTERVAL '5 days'), -- Immediate disclosure
  ('aa222222-2222-2222-2222-222222222222', '0b80df4d-3d8f-4e3f-b69d-1e8126efb454', 'c16', '{"value": 40}', NOW() - INTERVAL '5 days')    -- More separated
ON CONFLICT (assessment_id, question_code) DO UPDATE SET
  answer = EXCLUDED.answer;

-- ============================================
-- CANDIDATE 3: Marcus Williams - The Catalyst
-- High extraversion, collaborative, people-oriented
-- Should match well with: HealthTech Solutions, InnovateCorp
-- ============================================
INSERT INTO public.assessment_responses (assessment_id, user_id, question_code, answer, answered_at)
VALUES
  ('aa333333-3333-3333-3333-333333333333', '2b3b0406-4a2b-49b5-97dd-2e55a93610e3', 'c1', '{"selected": "c1a"}', NOW() - INTERVAL '4 days'),  -- Rally the team
  ('aa333333-3333-3333-3333-333333333333', '2b3b0406-4a2b-49b5-97dd-2e55a93610e3', 'c2', '{"selected": "c2a"}', NOW() - INTERVAL '4 days'),  -- Beehive (collaboration)
  ('aa333333-3333-3333-3333-333333333333', '2b3b0406-4a2b-49b5-97dd-2e55a93610e3', 'c3', '{"selected": "c3a"}', NOW() - INTERVAL '4 days'),  -- Moving fast
  ('aa333333-3333-3333-3333-333333333333', '2b3b0406-4a2b-49b5-97dd-2e55a93610e3', 'c4', '{"selected": "c4b"}', NOW() - INTERVAL '4 days'),  -- Thoughtful framing (empathy)
  ('aa333333-3333-3333-3333-333333333333', '2b3b0406-4a2b-49b5-97dd-2e55a93610e3', 'c5', '{"value": 90}', NOW() - INTERVAL '4 days'),     -- Very extroverted
  ('aa333333-3333-3333-3333-333333333333', '2b3b0406-4a2b-49b5-97dd-2e55a93610e3', 'c6', '{"order": ["c6e", "c6a", "c6b", "c6d", "c6f", "c6c"]}', NOW() - INTERVAL '4 days'),  -- Connection, Impact, Growth first
  ('aa333333-3333-3333-3333-333333333333', '2b3b0406-4a2b-49b5-97dd-2e55a93610e3', 'c7', '{"selected": "c7c"}', NOW() - INTERVAL '4 days'),  -- Gather allies first
  ('aa333333-3333-3333-3333-333333333333', '2b3b0406-4a2b-49b5-97dd-2e55a93610e3', 'c8', '{"selected": "c8d"}', NOW() - INTERVAL '4 days'),  -- Rock anthem (energy)
  ('aa333333-3333-3333-3333-333333333333', '2b3b0406-4a2b-49b5-97dd-2e55a93610e3', 'c9', '{"selected": "c9a"}', NOW() - INTERVAL '4 days'),  -- Find something new
  ('aa333333-3333-3333-3333-333333333333', '2b3b0406-4a2b-49b5-97dd-2e55a93610e3', 'c10', '{"value": 45}', NOW() - INTERVAL '4 days'),   -- Balanced
  ('aa333333-3333-3333-3333-333333333333', '2b3b0406-4a2b-49b5-97dd-2e55a93610e3', 'c11', '{"selected": "c11a"}', NOW() - INTERVAL '4 days'), -- Take the leap
  ('aa333333-3333-3333-3333-333333333333', '2b3b0406-4a2b-49b5-97dd-2e55a93610e3', 'c12', '{"text": "Closing a difficult deal by building genuine relationships with the client team over several months."}', NOW() - INTERVAL '4 days'),
  ('aa333333-3333-3333-3333-333333333333', '2b3b0406-4a2b-49b5-97dd-2e55a93610e3', 'c13', '{"selected": "c13a"}', NOW() - INTERVAL '4 days'), -- Lead vocalist
  ('aa333333-3333-3333-3333-333333333333', '2b3b0406-4a2b-49b5-97dd-2e55a93610e3', 'c14', '{"selected": "c14b"}', NOW() - INTERVAL '4 days'), -- Learn many things
  ('aa333333-3333-3333-3333-333333333333', '2b3b0406-4a2b-49b5-97dd-2e55a93610e3', 'c15', '{"selected": "c15a"}', NOW() - INTERVAL '4 days'), -- Immediate disclosure
  ('aa333333-3333-3333-3333-333333333333', '2b3b0406-4a2b-49b5-97dd-2e55a93610e3', 'c16', '{"value": 80}', NOW() - INTERVAL '4 days')    -- Very integrated
ON CONFLICT (assessment_id, question_code) DO UPDATE SET
  answer = EXCLUDED.answer;

-- ============================================
-- CANDIDATE 4: Emily Rodriguez - The Craftsperson
-- Balanced, detail-focused, quality-oriented, creative
-- Should match well with: Creative Labs, InnovateCorp
-- ============================================
INSERT INTO public.assessment_responses (assessment_id, user_id, question_code, answer, answered_at)
VALUES
  ('aa444444-4444-4444-4444-444444444444', '8388a5ba-132a-4dbd-995c-08a76183ffb3', 'c1', '{"selected": "c1c"}', NOW() - INTERVAL '2 days'),  -- Negotiate timeline (boundaries)
  ('aa444444-4444-4444-4444-444444444444', '8388a5ba-132a-4dbd-995c-08a76183ffb3', 'c2', '{"selected": "c2d"}', NOW() - INTERVAL '2 days'),  -- Deep forest (depth, reflection)
  ('aa444444-4444-4444-4444-444444444444', '8388a5ba-132a-4dbd-995c-08a76183ffb3', 'c3', '{"selected": "c3b"}', NOW() - INTERVAL '2 days'),  -- Getting it right
  ('aa444444-4444-4444-4444-444444444444', '8388a5ba-132a-4dbd-995c-08a76183ffb3', 'c4', '{"selected": "c4b"}', NOW() - INTERVAL '2 days'),  -- Thoughtful framing
  ('aa444444-4444-4444-4444-444444444444', '8388a5ba-132a-4dbd-995c-08a76183ffb3', 'c5', '{"value": 30}', NOW() - INTERVAL '2 days'),     -- Introverted
  ('aa444444-4444-4444-4444-444444444444', '8388a5ba-132a-4dbd-995c-08a76183ffb3', 'c6', '{"order": ["c6b", "c6a", "c6f", "c6e", "c6c", "c6d"]}', NOW() - INTERVAL '2 days'),  -- Growth, Impact, Autonomy first
  ('aa444444-4444-4444-4444-444444444444', '8388a5ba-132a-4dbd-995c-08a76183ffb3', 'c7', '{"selected": "c7b"}', NOW() - INTERVAL '2 days'),  -- Request a private chat
  ('aa444444-4444-4444-4444-444444444444', '8388a5ba-132a-4dbd-995c-08a76183ffb3', 'c8', '{"selected": "c8c"}', NOW() - INTERVAL '2 days'),  -- Electronic beats (consistency)
  ('aa444444-4444-4444-4444-444444444444', '8388a5ba-132a-4dbd-995c-08a76183ffb3', 'c9', '{"selected": "c9a"}', NOW() - INTERVAL '2 days'),  -- Find something new (creative)
  ('aa444444-4444-4444-4444-444444444444', '8388a5ba-132a-4dbd-995c-08a76183ffb3', 'c10', '{"value": 70}', NOW() - INTERVAL '2 days'),   -- More planning
  ('aa444444-4444-4444-4444-444444444444', '8388a5ba-132a-4dbd-995c-08a76183ffb3', 'c11', '{"selected": "c11c"}', NOW() - INTERVAL '2 days'), -- Negotiate a hybrid
  ('aa444444-4444-4444-4444-444444444444', '8388a5ba-132a-4dbd-995c-08a76183ffb3', 'c12', '{"text": "Spending weeks perfecting a design system that made the entire team more productive."}', NOW() - INTERVAL '2 days'),
  ('aa444444-4444-4444-4444-444444444444', '8388a5ba-132a-4dbd-995c-08a76183ffb3', 'c13', '{"selected": "c13c"}', NOW() - INTERVAL '2 days'), -- Bassist (support, reliability)
  ('aa444444-4444-4444-4444-444444444444', '8388a5ba-132a-4dbd-995c-08a76183ffb3', 'c14', '{"selected": "c14a"}', NOW() - INTERVAL '2 days'), -- Master one thing
  ('aa444444-4444-4444-4444-444444444444', '8388a5ba-132a-4dbd-995c-08a76183ffb3', 'c15', '{"selected": "c15b"}', NOW() - INTERVAL '2 days'), -- Fix first, then tell
  ('aa444444-4444-4444-4444-444444444444', '8388a5ba-132a-4dbd-995c-08a76183ffb3', 'c16', '{"value": 25}', NOW() - INTERVAL '2 days')    -- More separated
ON CONFLICT (assessment_id, question_code) DO UPDATE SET
  answer = EXCLUDED.answer;

-- ============================================
-- CANDIDATE 5: David Kim - The Anchor
-- High stability, process-oriented, reliable, methodical
-- Should match well with: FinancePlus, InnovateCorp
-- ============================================
INSERT INTO public.assessment_responses (assessment_id, user_id, question_code, answer, answered_at)
VALUES
  ('aa555555-5555-5555-5555-555555555555', 'c88178b4-ae93-46ad-9cfb-bfa3873f9a02', 'c1', '{"selected": "c1d"}', NOW() - INTERVAL '6 days'),  -- Assess and delegate
  ('aa555555-5555-5555-5555-555555555555', 'c88178b4-ae93-46ad-9cfb-bfa3873f9a02', 'c2', '{"selected": "c2a"}', NOW() - INTERVAL '6 days'),  -- Beehive (structure)
  ('aa555555-5555-5555-5555-555555555555', 'c88178b4-ae93-46ad-9cfb-bfa3873f9a02', 'c3', '{"selected": "c3b"}', NOW() - INTERVAL '6 days'),  -- Getting it right
  ('aa555555-5555-5555-5555-555555555555', 'c88178b4-ae93-46ad-9cfb-bfa3873f9a02', 'c4', '{"selected": "c4d"}', NOW() - INTERVAL '6 days'),  -- Escalate appropriately (process)
  ('aa555555-5555-5555-5555-555555555555', 'c88178b4-ae93-46ad-9cfb-bfa3873f9a02', 'c5', '{"value": 25}', NOW() - INTERVAL '6 days'),     -- Introverted
  ('aa555555-5555-5555-5555-555555555555', 'c88178b4-ae93-46ad-9cfb-bfa3873f9a02', 'c6', '{"order": ["c6c", "c6b", "c6e", "c6a", "c6d", "c6f"]}', NOW() - INTERVAL '6 days'),  -- Stability, Growth, Connection first
  ('aa555555-5555-5555-5555-555555555555', 'c88178b4-ae93-46ad-9cfb-bfa3873f9a02', 'c7', '{"selected": "c7d"}', NOW() - INTERVAL '6 days'),  -- Trust the process
  ('aa555555-5555-5555-5555-555555555555', 'c88178b4-ae93-46ad-9cfb-bfa3873f9a02', 'c8', '{"selected": "c8c"}', NOW() - INTERVAL '6 days'),  -- Electronic beats (consistency)
  ('aa555555-5555-5555-5555-555555555555', 'c88178b4-ae93-46ad-9cfb-bfa3873f9a02', 'c9', '{"selected": "c9b"}', NOW() - INTERVAL '6 days'),  -- Use what works
  ('aa555555-5555-5555-5555-555555555555', 'c88178b4-ae93-46ad-9cfb-bfa3873f9a02', 'c10', '{"value": 90}', NOW() - INTERVAL '6 days'),   -- Plan everything first
  ('aa555555-5555-5555-5555-555555555555', 'c88178b4-ae93-46ad-9cfb-bfa3873f9a02', 'c11', '{"selected": "c11b"}', NOW() - INTERVAL '6 days'), -- Stay the course
  ('aa555555-5555-5555-5555-555555555555', 'c88178b4-ae93-46ad-9cfb-bfa3873f9a02', 'c12', '{"text": "Keeping our systems running at 99.99% uptime during a major traffic spike that would have crashed us before."}', NOW() - INTERVAL '6 days'),
  ('aa555555-5555-5555-5555-555555555555', 'c88178b4-ae93-46ad-9cfb-bfa3873f9a02', 'c13', '{"selected": "c13c"}', NOW() - INTERVAL '6 days'), -- Bassist (reliability)
  ('aa555555-5555-5555-5555-555555555555', 'c88178b4-ae93-46ad-9cfb-bfa3873f9a02', 'c14', '{"selected": "c14a"}', NOW() - INTERVAL '6 days'), -- Master one thing
  ('aa555555-5555-5555-5555-555555555555', 'c88178b4-ae93-46ad-9cfb-bfa3873f9a02', 'c15', '{"selected": "c15c"}', NOW() - INTERVAL '6 days'), -- Assess the situation
  ('aa555555-5555-5555-5555-555555555555', 'c88178b4-ae93-46ad-9cfb-bfa3873f9a02', 'c16', '{"value": 20}', NOW() - INTERVAL '6 days')    -- Clear separation
ON CONFLICT (assessment_id, question_code) DO UPDATE SET
  answer = EXCLUDED.answer;

-- ============================================
-- EMPLOYER 1: TechStartup Inc - Innovation-focused
-- Fast-paced, risk-taking, flat structure
-- ============================================
INSERT INTO public.assessment_responses (assessment_id, user_id, question_code, answer, answered_at)
VALUES
  ('bb111111-1111-1111-1111-111111111111', 'faec878c-bc59-4eda-ae03-1af945b55cd6', 'e1', '{"selected": "e1b"}', NOW() - INTERVAL '7 days'),  -- Hire for culture
  ('bb111111-1111-1111-1111-111111111111', 'faec878c-bc59-4eda-ae03-1af945b55cd6', 'e2', '{"selected": "e2a"}', NOW() - INTERVAL '7 days'),  -- Startup garage
  ('bb111111-1111-1111-1111-111111111111', 'faec878c-bc59-4eda-ae03-1af945b55cd6', 'e3', '{"selected": "e3a"}', NOW() - INTERVAL '7 days'),  -- Move fast
  ('bb111111-1111-1111-1111-111111111111', 'faec878c-bc59-4eda-ae03-1af945b55cd6', 'e4', '{"selected": "e4d"}', NOW() - INTERVAL '7 days'),  -- Make the hard call
  ('bb111111-1111-1111-1111-111111111111', 'faec878c-bc59-4eda-ae03-1af945b55cd6', 'e5', '{"value": 15}', NOW() - INTERVAL '7 days'),     -- Very flat
  ('bb111111-1111-1111-1111-111111111111', 'faec878c-bc59-4eda-ae03-1af945b55cd6', 'e6', '{"order": ["e6b", "e6a", "e6e", "e6c", "e6d", "e6f"]}', NOW() - INTERVAL '7 days'),  -- Innovation, Results, Growth first
  ('bb111111-1111-1111-1111-111111111111', 'faec878c-bc59-4eda-ae03-1af945b55cd6', 'e7', '{"selected": "e7a"}', NOW() - INTERVAL '7 days'),  -- Go all in
  ('bb111111-1111-1111-1111-111111111111', 'faec878c-bc59-4eda-ae03-1af945b55cd6', 'e8', '{"selected": "e8b"}', NOW() - INTERVAL '7 days'),  -- Jazz session
  ('bb111111-1111-1111-1111-111111111111', 'faec878c-bc59-4eda-ae03-1af945b55cd6', 'e9', '{"selected": "e9b"}', NOW() - INTERVAL '7 days'),  -- Raw potential
  ('bb111111-1111-1111-1111-111111111111', 'faec878c-bc59-4eda-ae03-1af945b55cd6', 'e10', '{"value": 85}', NOW() - INTERVAL '7 days'),   -- Continuous feedback
  ('bb111111-1111-1111-1111-111111111111', 'faec878c-bc59-4eda-ae03-1af945b55cd6', 'e11', '{"selected": "e11d"}', NOW() - INTERVAL '7 days'), -- Move forward fast
  ('bb111111-1111-1111-1111-111111111111', 'faec878c-bc59-4eda-ae03-1af945b55cd6', 'e12', '{"text": "When we pivoted our entire product in 2 weeks after customer feedback, everyone rallied together."}', NOW() - INTERVAL '7 days'),
  ('bb111111-1111-1111-1111-111111111111', 'faec878c-bc59-4eda-ae03-1af945b55cd6', 'e13', '{"value": 85}', NOW() - INTERVAL '7 days'),   -- Intense pace
  ('bb111111-1111-1111-1111-111111111111', 'faec878c-bc59-4eda-ae03-1af945b55cd6', 'e14', '{"selected": "e14a"}', NOW() - INTERVAL '7 days'), -- Full flexibility
  ('bb111111-1111-1111-1111-111111111111', 'faec878c-bc59-4eda-ae03-1af945b55cd6', 'e15', '{"selected": "e15a"}', NOW() - INTERVAL '7 days'), -- Radical transparency
  ('bb111111-1111-1111-1111-111111111111', 'faec878c-bc59-4eda-ae03-1af945b55cd6', 'e16', '{"value": 90}', NOW() - INTERVAL '7 days')    -- Disrupt
ON CONFLICT (assessment_id, question_code) DO UPDATE SET
  answer = EXCLUDED.answer;

-- ============================================
-- EMPLOYER 2: InnovateCorp - Balanced growth company
-- Mix of innovation and structure
-- ============================================
INSERT INTO public.assessment_responses (assessment_id, user_id, question_code, answer, answered_at)
VALUES
  ('bb222222-2222-2222-2222-222222222222', 'c5c8b111-e7f0-42c4-b483-571e974ad6fc', 'e1', '{"selected": "e1d"}', NOW() - INTERVAL '8 days'),  -- Hire both differently
  ('bb222222-2222-2222-2222-222222222222', 'c5c8b111-e7f0-42c4-b483-571e974ad6fc', 'e2', '{"selected": "e2b"}', NOW() - INTERVAL '8 days'),  -- Research library (depth)
  ('bb222222-2222-2222-2222-222222222222', 'c5c8b111-e7f0-42c4-b483-571e974ad6fc', 'e3', '{"selected": "e3b"}', NOW() - INTERVAL '8 days'),  -- Build consensus
  ('bb222222-2222-2222-2222-222222222222', 'c5c8b111-e7f0-42c4-b483-571e974ad6fc', 'e4', '{"selected": "e4b"}', NOW() - INTERVAL '8 days'),  -- Find their strength
  ('bb222222-2222-2222-2222-222222222222', 'c5c8b111-e7f0-42c4-b483-571e974ad6fc', 'e5', '{"value": 50}', NOW() - INTERVAL '8 days'),     -- Balanced hierarchy
  ('bb222222-2222-2222-2222-222222222222', 'c5c8b111-e7f0-42c4-b483-571e974ad6fc', 'e6', '{"order": ["e6d", "e6c", "e6e", "e6a", "e6b", "e6f"]}', NOW() - INTERVAL '8 days'),  -- Excellence, Collaboration, Growth first
  ('bb222222-2222-2222-2222-222222222222', 'c5c8b111-e7f0-42c4-b483-571e974ad6fc', 'e7', '{"selected": "e7c"}', NOW() - INTERVAL '8 days'),  -- Test and learn
  ('bb222222-2222-2222-2222-222222222222', 'c5c8b111-e7f0-42c4-b483-571e974ad6fc', 'e8', '{"selected": "e8a"}', NOW() - INTERVAL '8 days'),  -- Debate club
  ('bb222222-2222-2222-2222-222222222222', 'c5c8b111-e7f0-42c4-b483-571e974ad6fc', 'e9', '{"selected": "e9a"}', NOW() - INTERVAL '8 days'),  -- Proven experience
  ('bb222222-2222-2222-2222-222222222222', 'c5c8b111-e7f0-42c4-b483-571e974ad6fc', 'e10', '{"value": 55}', NOW() - INTERVAL '8 days'),   -- Balanced feedback
  ('bb222222-2222-2222-2222-222222222222', 'c5c8b111-e7f0-42c4-b483-571e974ad6fc', 'e11', '{"selected": "e11b"}', NOW() - INTERVAL '8 days'), -- Analyze first
  ('bb222222-2222-2222-2222-222222222222', 'c5c8b111-e7f0-42c4-b483-571e974ad6fc', 'e12', '{"text": "When we hit our first $10M ARR and the whole company celebrated with a surprise party."}', NOW() - INTERVAL '8 days'),
  ('bb222222-2222-2222-2222-222222222222', 'c5c8b111-e7f0-42c4-b483-571e974ad6fc', 'e13', '{"value": 55}', NOW() - INTERVAL '8 days'),   -- Moderate pace
  ('bb222222-2222-2222-2222-222222222222', 'c5c8b111-e7f0-42c4-b483-571e974ad6fc', 'e14', '{"selected": "e14b"}', NOW() - INTERVAL '8 days'), -- Hybrid compromise
  ('bb222222-2222-2222-2222-222222222222', 'c5c8b111-e7f0-42c4-b483-571e974ad6fc', 'e15', '{"selected": "e15a"}', NOW() - INTERVAL '8 days'), -- Radical transparency
  ('bb222222-2222-2222-2222-222222222222', 'c5c8b111-e7f0-42c4-b483-571e974ad6fc', 'e16', '{"value": 60}', NOW() - INTERVAL '8 days')    -- Balanced innovation
ON CONFLICT (assessment_id, question_code) DO UPDATE SET
  answer = EXCLUDED.answer;

-- ============================================
-- EMPLOYER 3: Creative Labs - Design-focused agency
-- Creative, quality-focused, craft-oriented
-- ============================================
INSERT INTO public.assessment_responses (assessment_id, user_id, question_code, answer, answered_at)
VALUES
  ('bb333333-3333-3333-3333-333333333333', 'bcaea40c-c371-4fdf-a1d9-4603771b8fa6', 'e1', '{"selected": "e1c"}', NOW() - INTERVAL '6 days'),  -- Keep looking (high bar)
  ('bb333333-3333-3333-3333-333333333333', 'bcaea40c-c371-4fdf-a1d9-4603771b8fa6', 'e2', '{"selected": "e2d"}', NOW() - INTERVAL '6 days'),  -- Cozy coffee shop (warmth)
  ('bb333333-3333-3333-3333-333333333333', 'bcaea40c-c371-4fdf-a1d9-4603771b8fa6', 'e3', '{"selected": "e3b"}', NOW() - INTERVAL '6 days'),  -- Build consensus
  ('bb333333-3333-3333-3333-333333333333', 'bcaea40c-c371-4fdf-a1d9-4603771b8fa6', 'e4', '{"selected": "e4b"}', NOW() - INTERVAL '6 days'),  -- Find their strength
  ('bb333333-3333-3333-3333-333333333333', 'bcaea40c-c371-4fdf-a1d9-4603771b8fa6', 'e5', '{"value": 30}', NOW() - INTERVAL '6 days'),     -- More flat
  ('bb333333-3333-3333-3333-333333333333', 'bcaea40c-c371-4fdf-a1d9-4603771b8fa6', 'e6', '{"order": ["e6d", "e6b", "e6c", "e6e", "e6a", "e6f"]}', NOW() - INTERVAL '6 days'),  -- Excellence, Innovation, Collaboration first
  ('bb333333-3333-3333-3333-333333333333', 'bcaea40c-c371-4fdf-a1d9-4603771b8fa6', 'e7', '{"selected": "e7b"}', NOW() - INTERVAL '6 days'),  -- Protect what works
  ('bb333333-3333-3333-3333-333333333333', 'bcaea40c-c371-4fdf-a1d9-4603771b8fa6', 'e8', '{"selected": "e8b"}', NOW() - INTERVAL '6 days'),  -- Jazz session (creativity)
  ('bb333333-3333-3333-3333-333333333333', 'bcaea40c-c371-4fdf-a1d9-4603771b8fa6', 'e9', '{"selected": "e9b"}', NOW() - INTERVAL '6 days'),  -- Raw potential
  ('bb333333-3333-3333-3333-333333333333', 'bcaea40c-c371-4fdf-a1d9-4603771b8fa6', 'e10', '{"value": 70}', NOW() - INTERVAL '6 days'),   -- More continuous
  ('bb333333-3333-3333-3333-333333333333', 'bcaea40c-c371-4fdf-a1d9-4603771b8fa6', 'e11', '{"selected": "e11c"}', NOW() - INTERVAL '6 days'), -- Rally the team
  ('bb333333-3333-3333-3333-333333333333', 'bcaea40c-c371-4fdf-a1d9-4603771b8fa6', 'e12', '{"text": "Winning a major design award where the whole team was recognized for their collaborative work."}', NOW() - INTERVAL '6 days'),
  ('bb333333-3333-3333-3333-333333333333', 'bcaea40c-c371-4fdf-a1d9-4603771b8fa6', 'e13', '{"value": 45}', NOW() - INTERVAL '6 days'),   -- Sustainable pace
  ('bb333333-3333-3333-3333-333333333333', 'bcaea40c-c371-4fdf-a1d9-4603771b8fa6', 'e14', '{"selected": "e14b"}', NOW() - INTERVAL '6 days'), -- Hybrid compromise
  ('bb333333-3333-3333-3333-333333333333', 'bcaea40c-c371-4fdf-a1d9-4603771b8fa6', 'e15', '{"selected": "e15a"}', NOW() - INTERVAL '6 days'), -- Radical transparency
  ('bb333333-3333-3333-3333-333333333333', 'bcaea40c-c371-4fdf-a1d9-4603771b8fa6', 'e16', '{"value": 70}', NOW() - INTERVAL '6 days')    -- More disruptive
ON CONFLICT (assessment_id, question_code) DO UPDATE SET
  answer = EXCLUDED.answer;

-- ============================================
-- EMPLOYER 4: FinancePlus - Traditional finance
-- Structured, stable, process-oriented
-- ============================================
INSERT INTO public.assessment_responses (assessment_id, user_id, question_code, answer, answered_at)
VALUES
  ('bb444444-4444-4444-4444-444444444444', 'b92fe536-3d7a-41de-89a6-7804e953e6a5', 'e1', '{"selected": "e1a"}', NOW() - INTERVAL '9 days'),  -- Hire for skills
  ('bb444444-4444-4444-4444-444444444444', 'b92fe536-3d7a-41de-89a6-7804e953e6a5', 'e2', '{"selected": "e2b"}', NOW() - INTERVAL '9 days'),  -- Research library
  ('bb444444-4444-4444-4444-444444444444', 'b92fe536-3d7a-41de-89a6-7804e953e6a5', 'e3', '{"selected": "e3b"}', NOW() - INTERVAL '9 days'),  -- Build consensus
  ('bb444444-4444-4444-4444-444444444444', 'b92fe536-3d7a-41de-89a6-7804e953e6a5', 'e4', '{"selected": "e4a"}', NOW() - INTERVAL '9 days'),  -- Direct conversation
  ('bb444444-4444-4444-4444-444444444444', 'b92fe536-3d7a-41de-89a6-7804e953e6a5', 'e5', '{"value": 80}', NOW() - INTERVAL '9 days'),     -- Hierarchical
  ('bb444444-4444-4444-4444-444444444444', 'b92fe536-3d7a-41de-89a6-7804e953e6a5', 'e6', '{"order": ["e6f", "e6d", "e6a", "e6c", "e6e", "e6b"]}', NOW() - INTERVAL '9 days'),  -- Integrity, Excellence, Results first
  ('bb444444-4444-4444-4444-444444444444', 'b92fe536-3d7a-41de-89a6-7804e953e6a5', 'e7', '{"selected": "e7b"}', NOW() - INTERVAL '9 days'),  -- Protect what works
  ('bb444444-4444-4444-4444-444444444444', 'b92fe536-3d7a-41de-89a6-7804e953e6a5', 'e8', '{"selected": "e8c"}', NOW() - INTERVAL '9 days'),  -- Briefing (efficiency)
  ('bb444444-4444-4444-4444-444444444444', 'b92fe536-3d7a-41de-89a6-7804e953e6a5', 'e9', '{"selected": "e9a"}', NOW() - INTERVAL '9 days'),  -- Proven experience
  ('bb444444-4444-4444-4444-444444444444', 'b92fe536-3d7a-41de-89a6-7804e953e6a5', 'e10', '{"value": 20}', NOW() - INTERVAL '9 days'),   -- Formal reviews
  ('bb444444-4444-4444-4444-444444444444', 'b92fe536-3d7a-41de-89a6-7804e953e6a5', 'e11', '{"selected": "e11b"}', NOW() - INTERVAL '9 days'), -- Analyze first
  ('bb444444-4444-4444-4444-444444444444', 'b92fe536-3d7a-41de-89a6-7804e953e6a5', 'e12', '{"text": "When we successfully navigated a major regulatory audit with zero findings due to our rigorous processes."}', NOW() - INTERVAL '9 days'),
  ('bb444444-4444-4444-4444-444444444444', 'b92fe536-3d7a-41de-89a6-7804e953e6a5', 'e13', '{"value": 30}', NOW() - INTERVAL '9 days'),   -- Sustainable pace
  ('bb444444-4444-4444-4444-444444444444', 'b92fe536-3d7a-41de-89a6-7804e953e6a5', 'e14', '{"selected": "e14c"}', NOW() - INTERVAL '9 days'), -- Hold the line
  ('bb444444-4444-4444-4444-444444444444', 'b92fe536-3d7a-41de-89a6-7804e953e6a5', 'e15', '{"selected": "e15b"}', NOW() - INTERVAL '9 days'), -- Need to know
  ('bb444444-4444-4444-4444-444444444444', 'b92fe536-3d7a-41de-89a6-7804e953e6a5', 'e16', '{"value": 20}', NOW() - INTERVAL '9 days')    -- Optimize
ON CONFLICT (assessment_id, question_code) DO UPDATE SET
  answer = EXCLUDED.answer;

-- ============================================
-- EMPLOYER 5: HealthTech Solutions - Mission-driven
-- Collaborative, empathetic, impact-focused
-- ============================================
INSERT INTO public.assessment_responses (assessment_id, user_id, question_code, answer, answered_at)
VALUES
  ('bb555555-5555-5555-5555-555555555555', '82430c1e-5749-40af-8ee1-0da25cf85cc8', 'e1', '{"selected": "e1b"}', NOW() - INTERVAL '5 days'),  -- Hire for culture
  ('bb555555-5555-5555-5555-555555555555', '82430c1e-5749-40af-8ee1-0da25cf85cc8', 'e2', '{"selected": "e2d"}', NOW() - INTERVAL '5 days'),  -- Cozy coffee shop
  ('bb555555-5555-5555-5555-555555555555', '82430c1e-5749-40af-8ee1-0da25cf85cc8', 'e3', '{"selected": "e3b"}', NOW() - INTERVAL '5 days'),  -- Build consensus
  ('bb555555-5555-5555-5555-555555555555', '82430c1e-5749-40af-8ee1-0da25cf85cc8', 'e4', '{"selected": "e4c"}', NOW() - INTERVAL '5 days'),  -- Increase support
  ('bb555555-5555-5555-5555-555555555555', '82430c1e-5749-40af-8ee1-0da25cf85cc8', 'e5', '{"value": 35}', NOW() - INTERVAL '5 days'),     -- More flat
  ('bb555555-5555-5555-5555-555555555555', '82430c1e-5749-40af-8ee1-0da25cf85cc8', 'e6', '{"order": ["e6f", "e6c", "e6e", "e6a", "e6d", "e6b"]}', NOW() - INTERVAL '5 days'),  -- Integrity, Collaboration, Growth first
  ('bb555555-5555-5555-5555-555555555555', '82430c1e-5749-40af-8ee1-0da25cf85cc8', 'e7', '{"selected": "e7c"}', NOW() - INTERVAL '5 days'),  -- Test and learn
  ('bb555555-5555-5555-5555-555555555555', '82430c1e-5749-40af-8ee1-0da25cf85cc8', 'e8', '{"selected": "e8d"}', NOW() - INTERVAL '5 days'),  -- Campfire (connection)
  ('bb555555-5555-5555-5555-555555555555', '82430c1e-5749-40af-8ee1-0da25cf85cc8', 'e9', '{"selected": "e9b"}', NOW() - INTERVAL '5 days'),  -- Raw potential
  ('bb555555-5555-5555-5555-555555555555', '82430c1e-5749-40af-8ee1-0da25cf85cc8', 'e10', '{"value": 65}', NOW() - INTERVAL '5 days'),   -- More continuous
  ('bb555555-5555-5555-5555-555555555555', '82430c1e-5749-40af-8ee1-0da25cf85cc8', 'e11', '{"selected": "e11c"}', NOW() - INTERVAL '5 days'), -- Rally the team
  ('bb555555-5555-5555-5555-555555555555', '82430c1e-5749-40af-8ee1-0da25cf85cc8', 'e12', '{"text": "When a patient wrote to tell us our app helped them manage their chronic condition and improved their quality of life."}', NOW() - INTERVAL '5 days'),
  ('bb555555-5555-5555-5555-555555555555', '82430c1e-5749-40af-8ee1-0da25cf85cc8', 'e13', '{"value": 50}', NOW() - INTERVAL '5 days'),   -- Balanced pace
  ('bb555555-5555-5555-5555-555555555555', '82430c1e-5749-40af-8ee1-0da25cf85cc8', 'e14', '{"selected": "e14a"}', NOW() - INTERVAL '5 days'), -- Full flexibility
  ('bb555555-5555-5555-5555-555555555555', '82430c1e-5749-40af-8ee1-0da25cf85cc8', 'e15', '{"selected": "e15a"}', NOW() - INTERVAL '5 days'), -- Radical transparency
  ('bb555555-5555-5555-5555-555555555555', '82430c1e-5749-40af-8ee1-0da25cf85cc8', 'e16', '{"value": 65}', NOW() - INTERVAL '5 days')    -- More disruptive
ON CONFLICT (assessment_id, question_code) DO UPDATE SET
  answer = EXCLUDED.answer;

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
