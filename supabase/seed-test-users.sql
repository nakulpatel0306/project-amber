-- Seed Test Users for Amber Platform
-- Run this in Supabase SQL Editor to create 10 test profiles
-- 5 Job Seekers (candidates) + 5 Employers

-- ============================================
-- CREATE TEST USERS IN AUTH
-- ============================================
-- Note: These users will have password 'TestPassword123!'
-- The password hash below is for 'TestPassword123!'

DO $$
DECLARE
  test_password_hash TEXT := '$2a$10$PznXkCAOKkgzCRSlqKPKCeY0Mj.5vaGH9.T0YkVZQqUZQqUZqJZqK';

  -- Job Seeker UUIDs
  js1_id UUID := 'a1111111-1111-1111-1111-111111111111';
  js2_id UUID := 'a2222222-2222-2222-2222-222222222222';
  js3_id UUID := 'a3333333-3333-3333-3333-333333333333';
  js4_id UUID := 'a4444444-4444-4444-4444-444444444444';
  js5_id UUID := 'a5555555-5555-5555-5555-555555555555';

  -- Employer UUIDs
  emp1_id UUID := 'b1111111-1111-1111-1111-111111111111';
  emp2_id UUID := 'b2222222-2222-2222-2222-222222222222';
  emp3_id UUID := 'b3333333-3333-3333-3333-333333333333';
  emp4_id UUID := 'b4444444-4444-4444-4444-444444444444';
  emp5_id UUID := 'b5555555-5555-5555-5555-555555555555';

BEGIN
  -- ============================================
  -- INSERT AUTH USERS (Job Seekers)
  -- ============================================

  INSERT INTO auth.users (id, instance_id, email, encrypted_password, email_confirmed_at, created_at, updated_at, raw_user_meta_data, aud, role)
  VALUES
    (js1_id, '00000000-0000-0000-0000-000000000000', 'alex.chen@test.com', test_password_hash, NOW(), NOW(), NOW(),
     '{"full_name": "Alex Chen", "role": "candidate"}'::jsonb, 'authenticated', 'authenticated'),
    (js2_id, '00000000-0000-0000-0000-000000000000', 'sarah.johnson@test.com', test_password_hash, NOW(), NOW(), NOW(),
     '{"full_name": "Sarah Johnson", "role": "candidate"}'::jsonb, 'authenticated', 'authenticated'),
    (js3_id, '00000000-0000-0000-0000-000000000000', 'marcus.williams@test.com', test_password_hash, NOW(), NOW(), NOW(),
     '{"full_name": "Marcus Williams", "role": "candidate"}'::jsonb, 'authenticated', 'authenticated'),
    (js4_id, '00000000-0000-0000-0000-000000000000', 'emily.rodriguez@test.com', test_password_hash, NOW(), NOW(), NOW(),
     '{"full_name": "Emily Rodriguez", "role": "candidate"}'::jsonb, 'authenticated', 'authenticated'),
    (js5_id, '00000000-0000-0000-0000-000000000000', 'david.kim@test.com', test_password_hash, NOW(), NOW(), NOW(),
     '{"full_name": "David Kim", "role": "candidate"}'::jsonb, 'authenticated', 'authenticated')
  ON CONFLICT (id) DO NOTHING;

  -- ============================================
  -- INSERT AUTH USERS (Employers)
  -- ============================================

  INSERT INTO auth.users (id, instance_id, email, encrypted_password, email_confirmed_at, created_at, updated_at, raw_user_meta_data, aud, role)
  VALUES
    (emp1_id, '00000000-0000-0000-0000-000000000000', 'hr@techstartup.test', test_password_hash, NOW(), NOW(), NOW(),
     '{"full_name": "Jessica Martinez", "role": "employer"}'::jsonb, 'authenticated', 'authenticated'),
    (emp2_id, '00000000-0000-0000-0000-000000000000', 'talent@innovatecorp.test', test_password_hash, NOW(), NOW(), NOW(),
     '{"full_name": "Michael Thompson", "role": "employer"}'::jsonb, 'authenticated', 'authenticated'),
    (emp3_id, '00000000-0000-0000-0000-000000000000', 'hiring@creativelabs.test', test_password_hash, NOW(), NOW(), NOW(),
     '{"full_name": "Amanda Foster", "role": "employer"}'::jsonb, 'authenticated', 'authenticated'),
    (emp4_id, '00000000-0000-0000-0000-000000000000', 'careers@financeplus.test', test_password_hash, NOW(), NOW(), NOW(),
     '{"full_name": "Robert Chang", "role": "employer"}'::jsonb, 'authenticated', 'authenticated'),
    (emp5_id, '00000000-0000-0000-0000-000000000000', 'people@healthtech.test', test_password_hash, NOW(), NOW(), NOW(),
     '{"full_name": "Lisa Patel", "role": "employer"}'::jsonb, 'authenticated', 'authenticated')
  ON CONFLICT (id) DO NOTHING;

END $$;

-- ============================================
-- UPDATE PROFILES (trigger should have created them)
-- ============================================

-- Job Seeker Profiles
UPDATE public.profiles SET
  role = 'candidate',
  onboarding_completed = true
WHERE id = 'a1111111-1111-1111-1111-111111111111';

UPDATE public.profiles SET
  role = 'candidate',
  onboarding_completed = true
WHERE id = 'a2222222-2222-2222-2222-222222222222';

UPDATE public.profiles SET
  role = 'candidate',
  onboarding_completed = true
WHERE id = 'a3333333-3333-3333-3333-333333333333';

UPDATE public.profiles SET
  role = 'candidate',
  onboarding_completed = true
WHERE id = 'a4444444-4444-4444-4444-444444444444';

UPDATE public.profiles SET
  role = 'candidate',
  onboarding_completed = true
WHERE id = 'a5555555-5555-5555-5555-555555555555';

-- Employer Profiles
UPDATE public.profiles SET
  role = 'employer',
  onboarding_completed = true
WHERE id = 'b1111111-1111-1111-1111-111111111111';

UPDATE public.profiles SET
  role = 'employer',
  onboarding_completed = true
WHERE id = 'b2222222-2222-2222-2222-222222222222';

UPDATE public.profiles SET
  role = 'employer',
  onboarding_completed = true
WHERE id = 'b3333333-3333-3333-3333-333333333333';

UPDATE public.profiles SET
  role = 'employer',
  onboarding_completed = true
WHERE id = 'b4444444-4444-4444-4444-444444444444';

UPDATE public.profiles SET
  role = 'employer',
  onboarding_completed = true
WHERE id = 'b5555555-5555-5555-5555-555555555555';

-- ============================================
-- CREATE/UPDATE CANDIDATES WITH PERSONALITY DATA
-- ============================================

-- Candidate 1: Alex Chen - The Innovator (High openness, moderate extraversion)
INSERT INTO public.candidates (user_id, headline, bio, location, years_experience,
  openness_score, conscientiousness_score, extraversion_score, agreeableness_score, neuroticism_score,
  top_traits, assessment_status, assessment_completed_at, preferred_work_style, preferred_company_size,
  salary_expectation_min, salary_expectation_max, linkedin_url, github_url, setup_step, setup_completed_at)
VALUES (
  'a1111111-1111-1111-1111-111111111111',
  'Senior Full Stack Developer | React & Node.js Expert',
  'Passionate about building innovative web applications. 6+ years of experience in startups and scale-ups. Love working on greenfield projects and exploring new technologies.',
  'San Francisco, CA',
  6,
  92, 75, 68, 70, 25,
  ARRAY['The Innovator', 'The Explorer'],
  'completed',
  NOW() - INTERVAL '2 days',
  'remote',
  'startup',
  120000, 180000,
  'https://linkedin.com/in/alexchen',
  'https://github.com/alexchen',
  4, NOW()
) ON CONFLICT (user_id) DO UPDATE SET
  headline = EXCLUDED.headline,
  bio = EXCLUDED.bio,
  location = EXCLUDED.location,
  years_experience = EXCLUDED.years_experience,
  openness_score = EXCLUDED.openness_score,
  conscientiousness_score = EXCLUDED.conscientiousness_score,
  extraversion_score = EXCLUDED.extraversion_score,
  agreeableness_score = EXCLUDED.agreeableness_score,
  neuroticism_score = EXCLUDED.neuroticism_score,
  top_traits = EXCLUDED.top_traits,
  assessment_status = EXCLUDED.assessment_status,
  assessment_completed_at = EXCLUDED.assessment_completed_at,
  preferred_work_style = EXCLUDED.preferred_work_style,
  preferred_company_size = EXCLUDED.preferred_company_size,
  salary_expectation_min = EXCLUDED.salary_expectation_min,
  salary_expectation_max = EXCLUDED.salary_expectation_max,
  setup_step = EXCLUDED.setup_step,
  setup_completed_at = EXCLUDED.setup_completed_at;

-- Candidate 2: Sarah Johnson - The Architect (High conscientiousness, structured)
INSERT INTO public.candidates (user_id, headline, bio, location, years_experience,
  openness_score, conscientiousness_score, extraversion_score, agreeableness_score, neuroticism_score,
  top_traits, assessment_status, assessment_completed_at, preferred_work_style, preferred_company_size,
  salary_expectation_min, salary_expectation_max, linkedin_url, setup_step, setup_completed_at)
VALUES (
  'a2222222-2222-2222-2222-222222222222',
  'Product Manager | B2B SaaS Specialist',
  'Detail-oriented PM with 8 years of experience in enterprise software. Expert in roadmap planning, stakeholder management, and data-driven decision making. Thrive in structured environments.',
  'New York, NY',
  8,
  65, 95, 72, 80, 30,
  ARRAY['The Architect', 'The Strategist'],
  'completed',
  NOW() - INTERVAL '5 days',
  'hybrid',
  'medium',
  140000, 200000,
  'https://linkedin.com/in/sarahjohnson',
  4, NOW()
) ON CONFLICT (user_id) DO UPDATE SET
  headline = EXCLUDED.headline,
  bio = EXCLUDED.bio,
  location = EXCLUDED.location,
  years_experience = EXCLUDED.years_experience,
  openness_score = EXCLUDED.openness_score,
  conscientiousness_score = EXCLUDED.conscientiousness_score,
  extraversion_score = EXCLUDED.extraversion_score,
  agreeableness_score = EXCLUDED.agreeableness_score,
  neuroticism_score = EXCLUDED.neuroticism_score,
  top_traits = EXCLUDED.top_traits,
  assessment_status = EXCLUDED.assessment_status,
  assessment_completed_at = EXCLUDED.assessment_completed_at,
  preferred_work_style = EXCLUDED.preferred_work_style,
  preferred_company_size = EXCLUDED.preferred_company_size,
  salary_expectation_min = EXCLUDED.salary_expectation_min,
  salary_expectation_max = EXCLUDED.salary_expectation_max,
  setup_step = EXCLUDED.setup_step,
  setup_completed_at = EXCLUDED.setup_completed_at;

-- Candidate 3: Marcus Williams - The Catalyst (High extraversion, collaborative)
INSERT INTO public.candidates (user_id, headline, bio, location, years_experience,
  openness_score, conscientiousness_score, extraversion_score, agreeableness_score, neuroticism_score,
  top_traits, assessment_status, assessment_completed_at, preferred_work_style, preferred_company_size,
  salary_expectation_min, salary_expectation_max, linkedin_url, setup_step, setup_completed_at)
VALUES (
  'a3333333-3333-3333-3333-333333333333',
  'Sales Engineer | Technical Solutions Expert',
  'High-energy professional who loves connecting with customers and solving complex technical challenges. 5 years bridging the gap between sales and engineering teams. Team player who thrives on collaboration.',
  'Austin, TX',
  5,
  70, 68, 95, 88, 20,
  ARRAY['The Catalyst', 'The Harmonizer'],
  'completed',
  NOW() - INTERVAL '3 days',
  'hybrid',
  'startup',
  100000, 150000,
  'https://linkedin.com/in/marcuswilliams',
  4, NOW()
) ON CONFLICT (user_id) DO UPDATE SET
  headline = EXCLUDED.headline,
  bio = EXCLUDED.bio,
  location = EXCLUDED.location,
  years_experience = EXCLUDED.years_experience,
  openness_score = EXCLUDED.openness_score,
  conscientiousness_score = EXCLUDED.conscientiousness_score,
  extraversion_score = EXCLUDED.extraversion_score,
  agreeableness_score = EXCLUDED.agreeableness_score,
  neuroticism_score = EXCLUDED.neuroticism_score,
  top_traits = EXCLUDED.top_traits,
  assessment_status = EXCLUDED.assessment_status,
  assessment_completed_at = EXCLUDED.assessment_completed_at,
  preferred_work_style = EXCLUDED.preferred_work_style,
  preferred_company_size = EXCLUDED.preferred_company_size,
  salary_expectation_min = EXCLUDED.salary_expectation_min,
  salary_expectation_max = EXCLUDED.salary_expectation_max,
  setup_step = EXCLUDED.setup_step,
  setup_completed_at = EXCLUDED.setup_completed_at;

-- Candidate 4: Emily Rodriguez - The Craftsperson (Balanced, detail-focused)
INSERT INTO public.candidates (user_id, headline, bio, location, years_experience,
  openness_score, conscientiousness_score, extraversion_score, agreeableness_score, neuroticism_score,
  top_traits, assessment_status, assessment_completed_at, preferred_work_style, preferred_company_size,
  salary_expectation_min, salary_expectation_max, linkedin_url, portfolio_url, setup_step, setup_completed_at)
VALUES (
  'a4444444-4444-4444-4444-444444444444',
  'UX/UI Designer | Design Systems Expert',
  'Meticulous designer with 7 years crafting beautiful, accessible interfaces. Specialist in design systems and component libraries. I believe great design is in the details.',
  'Seattle, WA',
  7,
  78, 88, 55, 75, 35,
  ARRAY['The Craftsperson', 'The Architect'],
  'completed',
  NOW() - INTERVAL '1 day',
  'remote',
  'any',
  110000, 160000,
  'https://linkedin.com/in/emilyrodriguez',
  'https://emilydesigns.com',
  4, NOW()
) ON CONFLICT (user_id) DO UPDATE SET
  headline = EXCLUDED.headline,
  bio = EXCLUDED.bio,
  location = EXCLUDED.location,
  years_experience = EXCLUDED.years_experience,
  openness_score = EXCLUDED.openness_score,
  conscientiousness_score = EXCLUDED.conscientiousness_score,
  extraversion_score = EXCLUDED.extraversion_score,
  agreeableness_score = EXCLUDED.agreeableness_score,
  neuroticism_score = EXCLUDED.neuroticism_score,
  top_traits = EXCLUDED.top_traits,
  assessment_status = EXCLUDED.assessment_status,
  assessment_completed_at = EXCLUDED.assessment_completed_at,
  preferred_work_style = EXCLUDED.preferred_work_style,
  preferred_company_size = EXCLUDED.preferred_company_size,
  salary_expectation_min = EXCLUDED.salary_expectation_min,
  salary_expectation_max = EXCLUDED.salary_expectation_max,
  setup_step = EXCLUDED.setup_step,
  setup_completed_at = EXCLUDED.setup_completed_at;

-- Candidate 5: David Kim - The Anchor (High stability, dependable)
INSERT INTO public.candidates (user_id, headline, bio, location, years_experience,
  openness_score, conscientiousness_score, extraversion_score, agreeableness_score, neuroticism_score,
  top_traits, assessment_status, assessment_completed_at, preferred_work_style, preferred_company_size,
  salary_expectation_min, salary_expectation_max, linkedin_url, setup_step, setup_completed_at)
VALUES (
  'a5555555-5555-5555-5555-555555555555',
  'DevOps Engineer | Cloud Infrastructure Specialist',
  'Reliable and methodical engineer with 10 years keeping systems running smoothly. AWS and Kubernetes certified. I value stability, clear processes, and continuous improvement.',
  'Chicago, IL',
  10,
  55, 90, 45, 82, 15,
  ARRAY['The Anchor', 'The Craftsperson'],
  'completed',
  NOW() - INTERVAL '4 days',
  'hybrid',
  'large',
  150000, 220000,
  'https://linkedin.com/in/davidkim',
  4, NOW()
) ON CONFLICT (user_id) DO UPDATE SET
  headline = EXCLUDED.headline,
  bio = EXCLUDED.bio,
  location = EXCLUDED.location,
  years_experience = EXCLUDED.years_experience,
  openness_score = EXCLUDED.openness_score,
  conscientiousness_score = EXCLUDED.conscientiousness_score,
  extraversion_score = EXCLUDED.extraversion_score,
  agreeableness_score = EXCLUDED.agreeableness_score,
  neuroticism_score = EXCLUDED.neuroticism_score,
  top_traits = EXCLUDED.top_traits,
  assessment_status = EXCLUDED.assessment_status,
  assessment_completed_at = EXCLUDED.assessment_completed_at,
  preferred_work_style = EXCLUDED.preferred_work_style,
  preferred_company_size = EXCLUDED.preferred_company_size,
  salary_expectation_min = EXCLUDED.salary_expectation_min,
  salary_expectation_max = EXCLUDED.salary_expectation_max,
  setup_step = EXCLUDED.setup_step,
  setup_completed_at = EXCLUDED.setup_completed_at;

-- ============================================
-- CREATE/UPDATE EMPLOYERS WITH CULTURE DATA
-- ============================================

-- Employer 1: TechStartup Inc - Innovation-focused startup
INSERT INTO public.employers (user_id, company_name, company_website, company_size, industry, description, location,
  culture_values, openness_preference, conscientiousness_preference, extraversion_preference, agreeableness_preference, neuroticism_preference,
  culture_quiz_completed, setup_step, setup_completed_at)
VALUES (
  'b1111111-1111-1111-1111-111111111111',
  'TechStartup Inc',
  'https://techstartup.test',
  '1-10',
  'Technology',
  'Fast-moving AI startup disrupting the healthcare industry. We value innovation, speed, and bold thinking. Looking for people who thrive in ambiguity and love building from scratch.',
  'San Francisco, CA',
  ARRAY['Innovation', 'Speed', 'Autonomy', 'Risk-taking', 'Creativity'],
  90, 65, 75, 70, 40,
  true,
  4, NOW()
) ON CONFLICT (user_id) DO UPDATE SET
  company_name = EXCLUDED.company_name,
  company_website = EXCLUDED.company_website,
  company_size = EXCLUDED.company_size,
  industry = EXCLUDED.industry,
  description = EXCLUDED.description,
  location = EXCLUDED.location,
  culture_values = EXCLUDED.culture_values,
  openness_preference = EXCLUDED.openness_preference,
  conscientiousness_preference = EXCLUDED.conscientiousness_preference,
  extraversion_preference = EXCLUDED.extraversion_preference,
  agreeableness_preference = EXCLUDED.agreeableness_preference,
  neuroticism_preference = EXCLUDED.neuroticism_preference,
  culture_quiz_completed = EXCLUDED.culture_quiz_completed,
  setup_step = EXCLUDED.setup_step,
  setup_completed_at = EXCLUDED.setup_completed_at;

-- Employer 2: InnovateCorp - Balanced mid-size company
INSERT INTO public.employers (user_id, company_name, company_website, company_size, industry, description, location,
  culture_values, openness_preference, conscientiousness_preference, extraversion_preference, agreeableness_preference, neuroticism_preference,
  culture_quiz_completed, setup_step, setup_completed_at)
VALUES (
  'b2222222-2222-2222-2222-222222222222',
  'InnovateCorp',
  'https://innovatecorp.test',
  '51-200',
  'Technology',
  'Growing B2B SaaS company with 200+ employees. We balance innovation with execution. Looking for people who can think strategically while delivering results.',
  'New York, NY',
  ARRAY['Balance', 'Growth', 'Collaboration', 'Excellence', 'Innovation'],
  75, 85, 70, 80, 30,
  true,
  4, NOW()
) ON CONFLICT (user_id) DO UPDATE SET
  company_name = EXCLUDED.company_name,
  company_website = EXCLUDED.company_website,
  company_size = EXCLUDED.company_size,
  industry = EXCLUDED.industry,
  description = EXCLUDED.description,
  location = EXCLUDED.location,
  culture_values = EXCLUDED.culture_values,
  openness_preference = EXCLUDED.openness_preference,
  conscientiousness_preference = EXCLUDED.conscientiousness_preference,
  extraversion_preference = EXCLUDED.extraversion_preference,
  agreeableness_preference = EXCLUDED.agreeableness_preference,
  neuroticism_preference = EXCLUDED.neuroticism_preference,
  culture_quiz_completed = EXCLUDED.culture_quiz_completed,
  setup_step = EXCLUDED.setup_step,
  setup_completed_at = EXCLUDED.setup_completed_at;

-- Employer 3: Creative Labs - Design-focused agency
INSERT INTO public.employers (user_id, company_name, company_website, company_size, industry, description, location,
  culture_values, openness_preference, conscientiousness_preference, extraversion_preference, agreeableness_preference, neuroticism_preference,
  culture_quiz_completed, setup_step, setup_completed_at)
VALUES (
  'b3333333-3333-3333-3333-333333333333',
  'Creative Labs',
  'https://creativelabs.test',
  '11-50',
  'Media',
  'Award-winning design agency creating beautiful digital experiences. We obsess over details and craft. Looking for passionate creatives who take pride in their work.',
  'Los Angeles, CA',
  ARRAY['Creativity', 'Craft', 'Aesthetics', 'Collaboration', 'Quality'],
  88, 82, 65, 78, 35,
  true,
  4, NOW()
) ON CONFLICT (user_id) DO UPDATE SET
  company_name = EXCLUDED.company_name,
  company_website = EXCLUDED.company_website,
  company_size = EXCLUDED.company_size,
  industry = EXCLUDED.industry,
  description = EXCLUDED.description,
  location = EXCLUDED.location,
  culture_values = EXCLUDED.culture_values,
  openness_preference = EXCLUDED.openness_preference,
  conscientiousness_preference = EXCLUDED.conscientiousness_preference,
  extraversion_preference = EXCLUDED.extraversion_preference,
  agreeableness_preference = EXCLUDED.agreeableness_preference,
  neuroticism_preference = EXCLUDED.neuroticism_preference,
  culture_quiz_completed = EXCLUDED.culture_quiz_completed,
  setup_step = EXCLUDED.setup_step,
  setup_completed_at = EXCLUDED.setup_completed_at;

-- Employer 4: FinancePlus - Traditional finance company
INSERT INTO public.employers (user_id, company_name, company_website, company_size, industry, description, location,
  culture_values, openness_preference, conscientiousness_preference, extraversion_preference, agreeableness_preference, neuroticism_preference,
  culture_quiz_completed, setup_step, setup_completed_at)
VALUES (
  'b4444444-4444-4444-4444-444444444444',
  'FinancePlus',
  'https://financeplus.test',
  '500+',
  'Finance',
  'Established financial services firm with 50+ years of history. We value stability, precision, and trust. Looking for detail-oriented professionals who excel in structured environments.',
  'Boston, MA',
  ARRAY['Stability', 'Precision', 'Trust', 'Process', 'Excellence'],
  50, 95, 55, 75, 20,
  true,
  4, NOW()
) ON CONFLICT (user_id) DO UPDATE SET
  company_name = EXCLUDED.company_name,
  company_website = EXCLUDED.company_website,
  company_size = EXCLUDED.company_size,
  industry = EXCLUDED.industry,
  description = EXCLUDED.description,
  location = EXCLUDED.location,
  culture_values = EXCLUDED.culture_values,
  openness_preference = EXCLUDED.openness_preference,
  conscientiousness_preference = EXCLUDED.conscientiousness_preference,
  extraversion_preference = EXCLUDED.extraversion_preference,
  agreeableness_preference = EXCLUDED.agreeableness_preference,
  neuroticism_preference = EXCLUDED.neuroticism_preference,
  culture_quiz_completed = EXCLUDED.culture_quiz_completed,
  setup_step = EXCLUDED.setup_step,
  setup_completed_at = EXCLUDED.setup_completed_at;

-- Employer 5: HealthTech Solutions - Mission-driven healthcare
INSERT INTO public.employers (user_id, company_name, company_website, company_size, industry, description, location,
  culture_values, openness_preference, conscientiousness_preference, extraversion_preference, agreeableness_preference, neuroticism_preference,
  culture_quiz_completed, setup_step, setup_completed_at)
VALUES (
  'b5555555-5555-5555-5555-555555555555',
  'HealthTech Solutions',
  'https://healthtech.test',
  '201-500',
  'Healthcare',
  'Mission-driven healthcare technology company improving patient outcomes. We combine innovation with empathy. Looking for people who want to make a difference and work collaboratively.',
  'Denver, CO',
  ARRAY['Mission', 'Empathy', 'Innovation', 'Collaboration', 'Impact'],
  80, 78, 72, 92, 25,
  true,
  4, NOW()
) ON CONFLICT (user_id) DO UPDATE SET
  company_name = EXCLUDED.company_name,
  company_website = EXCLUDED.company_website,
  company_size = EXCLUDED.company_size,
  industry = EXCLUDED.industry,
  description = EXCLUDED.description,
  location = EXCLUDED.location,
  culture_values = EXCLUDED.culture_values,
  openness_preference = EXCLUDED.openness_preference,
  conscientiousness_preference = EXCLUDED.conscientiousness_preference,
  extraversion_preference = EXCLUDED.extraversion_preference,
  agreeableness_preference = EXCLUDED.agreeableness_preference,
  neuroticism_preference = EXCLUDED.neuroticism_preference,
  culture_quiz_completed = EXCLUDED.culture_quiz_completed,
  setup_step = EXCLUDED.setup_step,
  setup_completed_at = EXCLUDED.setup_completed_at;

-- ============================================
-- VERIFY CREATED DATA
-- ============================================
SELECT 'Created test users:' as status;

SELECT 'Job Seekers:' as type;
SELECT p.email, p.full_name, c.headline, c.openness_score, c.conscientiousness_score, c.extraversion_score
FROM public.profiles p
JOIN public.candidates c ON c.user_id = p.id
WHERE p.role = 'candidate' AND p.email LIKE '%@test.com';

SELECT 'Employers:' as type;
SELECT p.email, e.company_name, e.industry, e.openness_preference, e.conscientiousness_preference
FROM public.profiles p
JOIN public.employers e ON e.user_id = p.id
WHERE p.role = 'employer' AND p.email LIKE '%@%.test';
