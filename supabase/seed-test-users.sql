-- Seed Test User Data for Amber Platform
-- Run this in Supabase SQL Editor to populate test profile data
-- 5 Job Seekers (candidates) + 5 Employers
--
-- PREREQUISITE: The 10 test auth users must already exist (created via signup API).
-- All users have password: TestPassword123!
--
-- Test User Emails & UUIDs:
-- Candidates:
--   alex.chen@test.com         -> 02286b62-311d-4e7a-bdd6-b4135c6c4e95
--   sarah.johnson@test.com     -> 0b80df4d-3d8f-4e3f-b69d-1e8126efb454
--   marcus.williams@test.com   -> 2b3b0406-4a2b-49b5-97dd-2e55a93610e3
--   emily.rodriguez@test.com   -> 8388a5ba-132a-4dbd-995c-08a76183ffb3
--   david.kim@test.com         -> c88178b4-ae93-46ad-9cfb-bfa3873f9a02
-- Employers:
--   hr@techstartup.test        -> faec878c-bc59-4eda-ae03-1af945b55cd6
--   talent@innovatecorp.test   -> c5c8b111-e7f0-42c4-b483-571e974ad6fc
--   hiring@creativelabs.test   -> bcaea40c-c371-4fdf-a1d9-4603771b8fa6
--   careers@financeplus.test   -> b92fe536-3d7a-41de-89a6-7804e953e6a5
--   people@healthtech.test     -> 82430c1e-5749-40af-8ee1-0da25cf85cc8

-- ============================================
-- UPDATE PROFILES (trigger should have created them on signup)
-- ============================================

-- Job Seeker Profiles
UPDATE public.profiles SET role = 'candidate', onboarding_completed = true
WHERE id = '02286b62-311d-4e7a-bdd6-b4135c6c4e95';

UPDATE public.profiles SET role = 'candidate', onboarding_completed = true
WHERE id = '0b80df4d-3d8f-4e3f-b69d-1e8126efb454';

UPDATE public.profiles SET role = 'candidate', onboarding_completed = true
WHERE id = '2b3b0406-4a2b-49b5-97dd-2e55a93610e3';

UPDATE public.profiles SET role = 'candidate', onboarding_completed = true
WHERE id = '8388a5ba-132a-4dbd-995c-08a76183ffb3';

UPDATE public.profiles SET role = 'candidate', onboarding_completed = true
WHERE id = 'c88178b4-ae93-46ad-9cfb-bfa3873f9a02';

-- Employer Profiles
UPDATE public.profiles SET role = 'employer', onboarding_completed = true
WHERE id = 'faec878c-bc59-4eda-ae03-1af945b55cd6';

UPDATE public.profiles SET role = 'employer', onboarding_completed = true
WHERE id = 'c5c8b111-e7f0-42c4-b483-571e974ad6fc';

UPDATE public.profiles SET role = 'employer', onboarding_completed = true
WHERE id = 'bcaea40c-c371-4fdf-a1d9-4603771b8fa6';

UPDATE public.profiles SET role = 'employer', onboarding_completed = true
WHERE id = 'b92fe536-3d7a-41de-89a6-7804e953e6a5';

UPDATE public.profiles SET role = 'employer', onboarding_completed = true
WHERE id = '82430c1e-5749-40af-8ee1-0da25cf85cc8';

-- ============================================
-- CREATE/UPDATE CANDIDATES WITH PERSONALITY DATA
-- ============================================

-- Candidate 1: Alex Chen - The Innovator (High openness, moderate extraversion)
INSERT INTO public.candidates (user_id, headline, bio, location, years_experience,
  openness_score, conscientiousness_score, extraversion_score, agreeableness_score, neuroticism_score,
  top_traits, assessment_status, assessment_completed_at, preferred_work_style, preferred_company_size,
  salary_expectation_min, salary_expectation_max, linkedin_url, github_url, setup_step, setup_completed_at)
VALUES (
  '02286b62-311d-4e7a-bdd6-b4135c6c4e95',
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
  headline = EXCLUDED.headline, bio = EXCLUDED.bio, location = EXCLUDED.location,
  years_experience = EXCLUDED.years_experience,
  openness_score = EXCLUDED.openness_score, conscientiousness_score = EXCLUDED.conscientiousness_score,
  extraversion_score = EXCLUDED.extraversion_score, agreeableness_score = EXCLUDED.agreeableness_score,
  neuroticism_score = EXCLUDED.neuroticism_score, top_traits = EXCLUDED.top_traits,
  assessment_status = EXCLUDED.assessment_status, assessment_completed_at = EXCLUDED.assessment_completed_at,
  preferred_work_style = EXCLUDED.preferred_work_style, preferred_company_size = EXCLUDED.preferred_company_size,
  salary_expectation_min = EXCLUDED.salary_expectation_min, salary_expectation_max = EXCLUDED.salary_expectation_max,
  setup_step = EXCLUDED.setup_step, setup_completed_at = EXCLUDED.setup_completed_at;

-- Candidate 2: Sarah Johnson - The Architect (High conscientiousness, structured)
INSERT INTO public.candidates (user_id, headline, bio, location, years_experience,
  openness_score, conscientiousness_score, extraversion_score, agreeableness_score, neuroticism_score,
  top_traits, assessment_status, assessment_completed_at, preferred_work_style, preferred_company_size,
  salary_expectation_min, salary_expectation_max, linkedin_url, setup_step, setup_completed_at)
VALUES (
  '0b80df4d-3d8f-4e3f-b69d-1e8126efb454',
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
  headline = EXCLUDED.headline, bio = EXCLUDED.bio, location = EXCLUDED.location,
  years_experience = EXCLUDED.years_experience,
  openness_score = EXCLUDED.openness_score, conscientiousness_score = EXCLUDED.conscientiousness_score,
  extraversion_score = EXCLUDED.extraversion_score, agreeableness_score = EXCLUDED.agreeableness_score,
  neuroticism_score = EXCLUDED.neuroticism_score, top_traits = EXCLUDED.top_traits,
  assessment_status = EXCLUDED.assessment_status, assessment_completed_at = EXCLUDED.assessment_completed_at,
  preferred_work_style = EXCLUDED.preferred_work_style, preferred_company_size = EXCLUDED.preferred_company_size,
  salary_expectation_min = EXCLUDED.salary_expectation_min, salary_expectation_max = EXCLUDED.salary_expectation_max,
  setup_step = EXCLUDED.setup_step, setup_completed_at = EXCLUDED.setup_completed_at;

-- Candidate 3: Marcus Williams - The Catalyst (High extraversion, collaborative)
INSERT INTO public.candidates (user_id, headline, bio, location, years_experience,
  openness_score, conscientiousness_score, extraversion_score, agreeableness_score, neuroticism_score,
  top_traits, assessment_status, assessment_completed_at, preferred_work_style, preferred_company_size,
  salary_expectation_min, salary_expectation_max, linkedin_url, setup_step, setup_completed_at)
VALUES (
  '2b3b0406-4a2b-49b5-97dd-2e55a93610e3',
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
  headline = EXCLUDED.headline, bio = EXCLUDED.bio, location = EXCLUDED.location,
  years_experience = EXCLUDED.years_experience,
  openness_score = EXCLUDED.openness_score, conscientiousness_score = EXCLUDED.conscientiousness_score,
  extraversion_score = EXCLUDED.extraversion_score, agreeableness_score = EXCLUDED.agreeableness_score,
  neuroticism_score = EXCLUDED.neuroticism_score, top_traits = EXCLUDED.top_traits,
  assessment_status = EXCLUDED.assessment_status, assessment_completed_at = EXCLUDED.assessment_completed_at,
  preferred_work_style = EXCLUDED.preferred_work_style, preferred_company_size = EXCLUDED.preferred_company_size,
  salary_expectation_min = EXCLUDED.salary_expectation_min, salary_expectation_max = EXCLUDED.salary_expectation_max,
  setup_step = EXCLUDED.setup_step, setup_completed_at = EXCLUDED.setup_completed_at;

-- Candidate 4: Emily Rodriguez - The Craftsperson (Balanced, detail-focused)
INSERT INTO public.candidates (user_id, headline, bio, location, years_experience,
  openness_score, conscientiousness_score, extraversion_score, agreeableness_score, neuroticism_score,
  top_traits, assessment_status, assessment_completed_at, preferred_work_style, preferred_company_size,
  salary_expectation_min, salary_expectation_max, linkedin_url, portfolio_url, setup_step, setup_completed_at)
VALUES (
  '8388a5ba-132a-4dbd-995c-08a76183ffb3',
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
  headline = EXCLUDED.headline, bio = EXCLUDED.bio, location = EXCLUDED.location,
  years_experience = EXCLUDED.years_experience,
  openness_score = EXCLUDED.openness_score, conscientiousness_score = EXCLUDED.conscientiousness_score,
  extraversion_score = EXCLUDED.extraversion_score, agreeableness_score = EXCLUDED.agreeableness_score,
  neuroticism_score = EXCLUDED.neuroticism_score, top_traits = EXCLUDED.top_traits,
  assessment_status = EXCLUDED.assessment_status, assessment_completed_at = EXCLUDED.assessment_completed_at,
  preferred_work_style = EXCLUDED.preferred_work_style, preferred_company_size = EXCLUDED.preferred_company_size,
  salary_expectation_min = EXCLUDED.salary_expectation_min, salary_expectation_max = EXCLUDED.salary_expectation_max,
  setup_step = EXCLUDED.setup_step, setup_completed_at = EXCLUDED.setup_completed_at;

-- Candidate 5: David Kim - The Anchor (High stability, dependable)
INSERT INTO public.candidates (user_id, headline, bio, location, years_experience,
  openness_score, conscientiousness_score, extraversion_score, agreeableness_score, neuroticism_score,
  top_traits, assessment_status, assessment_completed_at, preferred_work_style, preferred_company_size,
  salary_expectation_min, salary_expectation_max, linkedin_url, setup_step, setup_completed_at)
VALUES (
  'c88178b4-ae93-46ad-9cfb-bfa3873f9a02',
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
  headline = EXCLUDED.headline, bio = EXCLUDED.bio, location = EXCLUDED.location,
  years_experience = EXCLUDED.years_experience,
  openness_score = EXCLUDED.openness_score, conscientiousness_score = EXCLUDED.conscientiousness_score,
  extraversion_score = EXCLUDED.extraversion_score, agreeableness_score = EXCLUDED.agreeableness_score,
  neuroticism_score = EXCLUDED.neuroticism_score, top_traits = EXCLUDED.top_traits,
  assessment_status = EXCLUDED.assessment_status, assessment_completed_at = EXCLUDED.assessment_completed_at,
  preferred_work_style = EXCLUDED.preferred_work_style, preferred_company_size = EXCLUDED.preferred_company_size,
  salary_expectation_min = EXCLUDED.salary_expectation_min, salary_expectation_max = EXCLUDED.salary_expectation_max,
  setup_step = EXCLUDED.setup_step, setup_completed_at = EXCLUDED.setup_completed_at;

-- ============================================
-- CREATE/UPDATE EMPLOYERS WITH CULTURE DATA
-- ============================================

-- Employer 1: TechStartup Inc - Innovation-focused startup
INSERT INTO public.employers (user_id, company_name, company_website, company_size, industry, description, location,
  culture_values, openness_preference, conscientiousness_preference, extraversion_preference, agreeableness_preference, neuroticism_preference,
  culture_quiz_completed, setup_step, setup_completed_at)
VALUES (
  'faec878c-bc59-4eda-ae03-1af945b55cd6',
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
  company_name = EXCLUDED.company_name, company_website = EXCLUDED.company_website,
  company_size = EXCLUDED.company_size, industry = EXCLUDED.industry,
  description = EXCLUDED.description, location = EXCLUDED.location,
  culture_values = EXCLUDED.culture_values,
  openness_preference = EXCLUDED.openness_preference, conscientiousness_preference = EXCLUDED.conscientiousness_preference,
  extraversion_preference = EXCLUDED.extraversion_preference, agreeableness_preference = EXCLUDED.agreeableness_preference,
  neuroticism_preference = EXCLUDED.neuroticism_preference,
  culture_quiz_completed = EXCLUDED.culture_quiz_completed,
  setup_step = EXCLUDED.setup_step, setup_completed_at = EXCLUDED.setup_completed_at;

-- Employer 2: InnovateCorp - Balanced mid-size company
INSERT INTO public.employers (user_id, company_name, company_website, company_size, industry, description, location,
  culture_values, openness_preference, conscientiousness_preference, extraversion_preference, agreeableness_preference, neuroticism_preference,
  culture_quiz_completed, setup_step, setup_completed_at)
VALUES (
  'c5c8b111-e7f0-42c4-b483-571e974ad6fc',
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
  company_name = EXCLUDED.company_name, company_website = EXCLUDED.company_website,
  company_size = EXCLUDED.company_size, industry = EXCLUDED.industry,
  description = EXCLUDED.description, location = EXCLUDED.location,
  culture_values = EXCLUDED.culture_values,
  openness_preference = EXCLUDED.openness_preference, conscientiousness_preference = EXCLUDED.conscientiousness_preference,
  extraversion_preference = EXCLUDED.extraversion_preference, agreeableness_preference = EXCLUDED.agreeableness_preference,
  neuroticism_preference = EXCLUDED.neuroticism_preference,
  culture_quiz_completed = EXCLUDED.culture_quiz_completed,
  setup_step = EXCLUDED.setup_step, setup_completed_at = EXCLUDED.setup_completed_at;

-- Employer 3: Creative Labs - Design-focused agency
INSERT INTO public.employers (user_id, company_name, company_website, company_size, industry, description, location,
  culture_values, openness_preference, conscientiousness_preference, extraversion_preference, agreeableness_preference, neuroticism_preference,
  culture_quiz_completed, setup_step, setup_completed_at)
VALUES (
  'bcaea40c-c371-4fdf-a1d9-4603771b8fa6',
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
  company_name = EXCLUDED.company_name, company_website = EXCLUDED.company_website,
  company_size = EXCLUDED.company_size, industry = EXCLUDED.industry,
  description = EXCLUDED.description, location = EXCLUDED.location,
  culture_values = EXCLUDED.culture_values,
  openness_preference = EXCLUDED.openness_preference, conscientiousness_preference = EXCLUDED.conscientiousness_preference,
  extraversion_preference = EXCLUDED.extraversion_preference, agreeableness_preference = EXCLUDED.agreeableness_preference,
  neuroticism_preference = EXCLUDED.neuroticism_preference,
  culture_quiz_completed = EXCLUDED.culture_quiz_completed,
  setup_step = EXCLUDED.setup_step, setup_completed_at = EXCLUDED.setup_completed_at;

-- Employer 4: FinancePlus - Traditional finance company
INSERT INTO public.employers (user_id, company_name, company_website, company_size, industry, description, location,
  culture_values, openness_preference, conscientiousness_preference, extraversion_preference, agreeableness_preference, neuroticism_preference,
  culture_quiz_completed, setup_step, setup_completed_at)
VALUES (
  'b92fe536-3d7a-41de-89a6-7804e953e6a5',
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
  company_name = EXCLUDED.company_name, company_website = EXCLUDED.company_website,
  company_size = EXCLUDED.company_size, industry = EXCLUDED.industry,
  description = EXCLUDED.description, location = EXCLUDED.location,
  culture_values = EXCLUDED.culture_values,
  openness_preference = EXCLUDED.openness_preference, conscientiousness_preference = EXCLUDED.conscientiousness_preference,
  extraversion_preference = EXCLUDED.extraversion_preference, agreeableness_preference = EXCLUDED.agreeableness_preference,
  neuroticism_preference = EXCLUDED.neuroticism_preference,
  culture_quiz_completed = EXCLUDED.culture_quiz_completed,
  setup_step = EXCLUDED.setup_step, setup_completed_at = EXCLUDED.setup_completed_at;

-- Employer 5: HealthTech Solutions - Mission-driven healthcare
INSERT INTO public.employers (user_id, company_name, company_website, company_size, industry, description, location,
  culture_values, openness_preference, conscientiousness_preference, extraversion_preference, agreeableness_preference, neuroticism_preference,
  culture_quiz_completed, setup_step, setup_completed_at)
VALUES (
  '82430c1e-5749-40af-8ee1-0da25cf85cc8',
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
  company_name = EXCLUDED.company_name, company_website = EXCLUDED.company_website,
  company_size = EXCLUDED.company_size, industry = EXCLUDED.industry,
  description = EXCLUDED.description, location = EXCLUDED.location,
  culture_values = EXCLUDED.culture_values,
  openness_preference = EXCLUDED.openness_preference, conscientiousness_preference = EXCLUDED.conscientiousness_preference,
  extraversion_preference = EXCLUDED.extraversion_preference, agreeableness_preference = EXCLUDED.agreeableness_preference,
  neuroticism_preference = EXCLUDED.neuroticism_preference,
  culture_quiz_completed = EXCLUDED.culture_quiz_completed,
  setup_step = EXCLUDED.setup_step, setup_completed_at = EXCLUDED.setup_completed_at;

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
