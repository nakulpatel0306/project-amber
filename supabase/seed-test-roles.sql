-- Seed Test Roles for Amber Platform
-- Run this AFTER seed-test-users.sql
-- Creates active roles for each employer to enable matching

-- ============================================
-- ROLES FOR TECHSTARTUP INC (Innovation-focused)
-- ============================================
INSERT INTO public.roles (
  id, employer_id, title, description, requirements, nice_to_have,
  location, work_style, salary_min, salary_max, employment_type,
  required_openness_min, required_openness_max,
  required_conscientiousness_min, required_conscientiousness_max,
  required_extraversion_min, required_extraversion_max,
  required_agreeableness_min, required_agreeableness_max,
  required_neuroticism_min, required_neuroticism_max,
  status
)
VALUES
  (
    '11111111-1111-1111-1111-111111111111',
    (SELECT id FROM public.employers WHERE user_id = 'faec878c-bc59-4eda-ae03-1af945b55cd6'),
    'Senior Full Stack Engineer',
    'Join our fast-moving team building AI-powered healthcare solutions. We need someone who thrives in ambiguity and loves shipping fast.',
    ARRAY['5+ years full stack experience', 'React and Node.js expertise', 'Startup experience preferred'],
    ARRAY['AI/ML experience', 'Healthcare domain knowledge'],
    'San Francisco, CA',
    'remote',
    140000, 200000, 'full_time',
    70, 100,  -- High openness required
    50, 80,   -- Moderate conscientiousness
    50, 90,   -- Moderate to high extraversion
    50, 90,   -- Moderate to high agreeableness
    0, 50,    -- Low neuroticism preferred
    'active'
  ),
  (
    '11111111-1111-1111-1111-111111111112',
    (SELECT id FROM public.employers WHERE user_id = 'faec878c-bc59-4eda-ae03-1af945b55cd6'),
    'Product Designer',
    'Design the future of healthcare. We need a creative thinker who can move fast and iterate quickly.',
    ARRAY['4+ years product design', 'Figma expertise', 'Strong portfolio'],
    ARRAY['Motion design', 'User research experience'],
    'San Francisco, CA',
    'hybrid',
    120000, 170000, 'full_time',
    75, 100,  -- Very high openness
    60, 85,   -- Good conscientiousness
    40, 80,   -- Flexible extraversion
    55, 90,   -- Good agreeableness
    0, 45,    -- Low neuroticism
    'active'
  )
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  status = EXCLUDED.status;

-- ============================================
-- ROLES FOR INNOVATECORP (Balanced growth)
-- ============================================
INSERT INTO public.roles (
  id, employer_id, title, description, requirements, nice_to_have,
  location, work_style, salary_min, salary_max, employment_type,
  required_openness_min, required_openness_max,
  required_conscientiousness_min, required_conscientiousness_max,
  required_extraversion_min, required_extraversion_max,
  required_agreeableness_min, required_agreeableness_max,
  required_neuroticism_min, required_neuroticism_max,
  status
)
VALUES
  (
    '22222222-2222-2222-2222-222222222221',
    (SELECT id FROM public.employers WHERE user_id = 'c5c8b111-e7f0-42c4-b483-571e974ad6fc'),
    'Senior Product Manager',
    'Lead product strategy for our B2B SaaS platform. Balance innovation with execution in a growing company.',
    ARRAY['6+ years PM experience', 'B2B SaaS background', 'Strong analytical skills'],
    ARRAY['Technical background', 'Enterprise sales experience'],
    'New York, NY',
    'hybrid',
    150000, 220000, 'full_time',
    60, 85,   -- Good openness
    70, 95,   -- High conscientiousness
    55, 85,   -- Moderate to high extraversion
    60, 90,   -- Good agreeableness
    0, 40,    -- Low neuroticism
    'active'
  ),
  (
    '22222222-2222-2222-2222-222222222222',
    (SELECT id FROM public.employers WHERE user_id = 'c5c8b111-e7f0-42c4-b483-571e974ad6fc'),
    'DevOps Engineer',
    'Build and maintain our cloud infrastructure. We value reliability and continuous improvement.',
    ARRAY['5+ years DevOps experience', 'AWS/GCP expertise', 'Kubernetes experience'],
    ARRAY['Security certifications', 'Terraform expertise'],
    'New York, NY',
    'remote',
    140000, 190000, 'full_time',
    50, 80,   -- Moderate openness
    75, 100,  -- Very high conscientiousness
    30, 70,   -- Flexible extraversion
    55, 85,   -- Good agreeableness
    0, 35,    -- Very low neuroticism
    'active'
  )
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  status = EXCLUDED.status;

-- ============================================
-- ROLES FOR CREATIVE LABS (Design-focused)
-- ============================================
INSERT INTO public.roles (
  id, employer_id, title, description, requirements, nice_to_have,
  location, work_style, salary_min, salary_max, employment_type,
  required_openness_min, required_openness_max,
  required_conscientiousness_min, required_conscientiousness_max,
  required_extraversion_min, required_extraversion_max,
  required_agreeableness_min, required_agreeableness_max,
  required_neuroticism_min, required_neuroticism_max,
  status
)
VALUES
  (
    '33333333-3333-3333-3333-333333333331',
    (SELECT id FROM public.employers WHERE user_id = 'bcaea40c-c371-4fdf-a1d9-4603771b8fa6'),
    'Senior UX Designer',
    'Craft beautiful, accessible digital experiences. We obsess over details and take pride in our work.',
    ARRAY['5+ years UX design', 'Strong portfolio', 'Design systems experience'],
    ARRAY['Motion design', 'Front-end development skills'],
    'Los Angeles, CA',
    'hybrid',
    130000, 180000, 'full_time',
    75, 100,  -- Very high openness
    70, 95,   -- High conscientiousness
    40, 75,   -- Moderate extraversion
    60, 90,   -- Good agreeableness
    0, 45,    -- Low neuroticism
    'active'
  )
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  status = EXCLUDED.status;

-- ============================================
-- ROLES FOR FINANCEPLUS (Traditional)
-- ============================================
INSERT INTO public.roles (
  id, employer_id, title, description, requirements, nice_to_have,
  location, work_style, salary_min, salary_max, employment_type,
  required_openness_min, required_openness_max,
  required_conscientiousness_min, required_conscientiousness_max,
  required_extraversion_min, required_extraversion_max,
  required_agreeableness_min, required_agreeableness_max,
  required_neuroticism_min, required_neuroticism_max,
  status
)
VALUES
  (
    '44444444-4444-4444-4444-444444444441',
    (SELECT id FROM public.employers WHERE user_id = 'b92fe536-3d7a-41de-89a6-7804e953e6a5'),
    'Senior Software Engineer',
    'Build reliable financial systems that millions depend on. We value precision, stability, and trust.',
    ARRAY['7+ years software engineering', 'Financial services experience', 'Security-minded'],
    ARRAY['Compliance knowledge', 'Performance optimization'],
    'Boston, MA',
    'hybrid',
    160000, 230000, 'full_time',
    40, 70,   -- Moderate openness
    80, 100,  -- Very high conscientiousness
    35, 70,   -- Moderate extraversion
    55, 85,   -- Good agreeableness
    0, 30,    -- Very low neuroticism
    'active'
  )
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  status = EXCLUDED.status;

-- ============================================
-- ROLES FOR HEALTHTECH SOLUTIONS (Mission-driven)
-- ============================================
INSERT INTO public.roles (
  id, employer_id, title, description, requirements, nice_to_have,
  location, work_style, salary_min, salary_max, employment_type,
  required_openness_min, required_openness_max,
  required_conscientiousness_min, required_conscientiousness_max,
  required_extraversion_min, required_extraversion_max,
  required_agreeableness_min, required_agreeableness_max,
  required_neuroticism_min, required_neuroticism_max,
  status
)
VALUES
  (
    '55555555-5555-5555-5555-555555555551',
    (SELECT id FROM public.employers WHERE user_id = '82430c1e-5749-40af-8ee1-0da25cf85cc8'),
    'Sales Engineer',
    'Help healthcare organizations adopt our technology. We need someone who builds genuine relationships and cares about impact.',
    ARRAY['4+ years sales engineering', 'Healthcare experience a plus', 'Strong communication'],
    ARRAY['Clinical workflow knowledge', 'Demo/presentation skills'],
    'Denver, CO',
    'hybrid',
    120000, 170000, 'full_time',
    60, 85,   -- Good openness
    60, 85,   -- Good conscientiousness
    70, 100,  -- High extraversion
    75, 100,  -- Very high agreeableness
    0, 40,    -- Low neuroticism
    'active'
  ),
  (
    '55555555-5555-5555-5555-555555555552',
    (SELECT id FROM public.employers WHERE user_id = '82430c1e-5749-40af-8ee1-0da25cf85cc8'),
    'Frontend Developer',
    'Build the user interfaces that help patients manage their health. Empathy and collaboration are key.',
    ARRAY['4+ years React/TypeScript', 'Accessibility experience', 'Healthcare interest'],
    ARRAY['Design system experience', 'Mobile development'],
    'Denver, CO',
    'remote',
    110000, 160000, 'full_time',
    65, 90,   -- Good openness
    65, 90,   -- Good conscientiousness
    45, 80,   -- Moderate extraversion
    70, 95,   -- High agreeableness
    0, 40,    -- Low neuroticism
    'active'
  )
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  status = EXCLUDED.status;

-- ============================================
-- VERIFY ROLES
-- ============================================
SELECT 'Roles created:' as status;

SELECT
  e.company_name,
  r.title,
  r.work_style,
  r.status,
  r.salary_min || '-' || r.salary_max as salary_range
FROM public.roles r
JOIN public.employers e ON e.id = r.employer_id
WHERE r.status = 'active'
ORDER BY e.company_name, r.title;
