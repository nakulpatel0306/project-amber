-- Seed Test Users for Amber Platform
-- Run this in Supabase SQL Editor to create 9 confirmed test users
-- 4 Candidates + 5 Employers (Alex Chen already exists manually)
-- All users have password: TestPassword123!
--
-- This script creates users directly in auth.users with confirmed emails
-- and includes complete assessment responses

-- ============================================
-- ENABLE EXTENSIONS (if not already enabled)
-- ============================================
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- ============================================
-- TEST USERS:
-- Candidates (4 new - Alex Chen already exists):
--   sarah.johnson@test.com  -> Sarah Johnson (The Architect)
--   marcus.williams@test.com -> Marcus Williams (The Catalyst)
--   emily.rodriguez@test.com -> Emily Rodriguez (The Craftsperson)
--   david.kim@test.com       -> David Kim (The Anchor)
-- Employers (5):
--   hr@techstartup.test      -> TechStartup Inc
--   talent@innovatecorp.test -> InnovateCorp
--   hiring@creativelabs.test -> Creative Labs
--   careers@financeplus.test -> FinancePlus
--   people@healthtech.test   -> HealthTech Solutions
-- ============================================

DO $$
DECLARE
  -- Candidate IDs
  sarah_id uuid := gen_random_uuid();
  marcus_id uuid := gen_random_uuid();
  emily_id uuid := gen_random_uuid();
  david_id uuid := gen_random_uuid();
  -- Employer IDs
  techstartup_id uuid := gen_random_uuid();
  innovatecorp_id uuid := gen_random_uuid();
  creativelabs_id uuid := gen_random_uuid();
  financeplus_id uuid := gen_random_uuid();
  healthtech_id uuid := gen_random_uuid();
  -- Assessment IDs
  sarah_assessment_id uuid := gen_random_uuid();
  marcus_assessment_id uuid := gen_random_uuid();
  emily_assessment_id uuid := gen_random_uuid();
  david_assessment_id uuid := gen_random_uuid();
  techstartup_assessment_id uuid := gen_random_uuid();
  innovatecorp_assessment_id uuid := gen_random_uuid();
  creativelabs_assessment_id uuid := gen_random_uuid();
  financeplus_assessment_id uuid := gen_random_uuid();
  healthtech_assessment_id uuid := gen_random_uuid();
  -- Password hash
  password_hash text;
BEGIN
  -- Hash the password (TestPassword123!)
  password_hash := crypt('TestPassword123!', gen_salt('bf'));

  -- Delete existing test users if they exist (clean slate)
  DELETE FROM auth.users WHERE email IN (
    'sarah.johnson@test.com', 'marcus.williams@test.com',
    'emily.rodriguez@test.com', 'david.kim@test.com',
    'hr@techstartup.test', 'talent@innovatecorp.test',
    'hiring@creativelabs.test', 'careers@financeplus.test',
    'people@healthtech.test'
  );

  -- ============================================
  -- INSERT CANDIDATE USERS
  -- ============================================

  -- Sarah Johnson - The Architect
  INSERT INTO auth.users (
    id, instance_id, email, encrypted_password, email_confirmed_at,
    raw_app_meta_data, raw_user_meta_data, aud, role,
    created_at, updated_at, confirmation_token, recovery_token,
    email_change, email_change_token_new, email_change_token_current,
    phone_change_token, reauthentication_token
  ) VALUES (
    sarah_id, '00000000-0000-0000-0000-000000000000',
    'sarah.johnson@test.com', password_hash, NOW(),
    '{"provider": "email", "providers": ["email"]}',
    '{"full_name": "Sarah Johnson"}',
    'authenticated', 'authenticated', NOW(), NOW(), '', '',
    '', '', '', '', ''
  );

  -- Marcus Williams - The Catalyst
  INSERT INTO auth.users (
    id, instance_id, email, encrypted_password, email_confirmed_at,
    raw_app_meta_data, raw_user_meta_data, aud, role,
    created_at, updated_at, confirmation_token, recovery_token,
    email_change, email_change_token_new, email_change_token_current,
    phone_change_token, reauthentication_token
  ) VALUES (
    marcus_id, '00000000-0000-0000-0000-000000000000',
    'marcus.williams@test.com', password_hash, NOW(),
    '{"provider": "email", "providers": ["email"]}',
    '{"full_name": "Marcus Williams"}',
    'authenticated', 'authenticated', NOW(), NOW(), '', '',
    '', '', '', '', ''
  );

  -- Emily Rodriguez - The Craftsperson
  INSERT INTO auth.users (
    id, instance_id, email, encrypted_password, email_confirmed_at,
    raw_app_meta_data, raw_user_meta_data, aud, role,
    created_at, updated_at, confirmation_token, recovery_token,
    email_change, email_change_token_new, email_change_token_current,
    phone_change_token, reauthentication_token
  ) VALUES (
    emily_id, '00000000-0000-0000-0000-000000000000',
    'emily.rodriguez@test.com', password_hash, NOW(),
    '{"provider": "email", "providers": ["email"]}',
    '{"full_name": "Emily Rodriguez"}',
    'authenticated', 'authenticated', NOW(), NOW(), '', '',
    '', '', '', '', ''
  );

  -- David Kim - The Anchor
  INSERT INTO auth.users (
    id, instance_id, email, encrypted_password, email_confirmed_at,
    raw_app_meta_data, raw_user_meta_data, aud, role,
    created_at, updated_at, confirmation_token, recovery_token,
    email_change, email_change_token_new, email_change_token_current,
    phone_change_token, reauthentication_token
  ) VALUES (
    david_id, '00000000-0000-0000-0000-000000000000',
    'david.kim@test.com', password_hash, NOW(),
    '{"provider": "email", "providers": ["email"]}',
    '{"full_name": "David Kim"}',
    'authenticated', 'authenticated', NOW(), NOW(), '', '',
    '', '', '', '', ''
  );

  -- ============================================
  -- INSERT EMPLOYER USERS
  -- ============================================

  -- TechStartup Inc
  INSERT INTO auth.users (
    id, instance_id, email, encrypted_password, email_confirmed_at,
    raw_app_meta_data, raw_user_meta_data, aud, role,
    created_at, updated_at, confirmation_token, recovery_token,
    email_change, email_change_token_new, email_change_token_current,
    phone_change_token, reauthentication_token
  ) VALUES (
    techstartup_id, '00000000-0000-0000-0000-000000000000',
    'hr@techstartup.test', password_hash, NOW(),
    '{"provider": "email", "providers": ["email"]}',
    '{"full_name": "Alex Rivera"}',
    'authenticated', 'authenticated', NOW(), NOW(), '', '',
    '', '', '', '', ''
  );

  -- InnovateCorp
  INSERT INTO auth.users (
    id, instance_id, email, encrypted_password, email_confirmed_at,
    raw_app_meta_data, raw_user_meta_data, aud, role,
    created_at, updated_at, confirmation_token, recovery_token,
    email_change, email_change_token_new, email_change_token_current,
    phone_change_token, reauthentication_token
  ) VALUES (
    innovatecorp_id, '00000000-0000-0000-0000-000000000000',
    'talent@innovatecorp.test', password_hash, NOW(),
    '{"provider": "email", "providers": ["email"]}',
    '{"full_name": "Jordan Smith"}',
    'authenticated', 'authenticated', NOW(), NOW(), '', '',
    '', '', '', '', ''
  );

  -- Creative Labs
  INSERT INTO auth.users (
    id, instance_id, email, encrypted_password, email_confirmed_at,
    raw_app_meta_data, raw_user_meta_data, aud, role,
    created_at, updated_at, confirmation_token, recovery_token,
    email_change, email_change_token_new, email_change_token_current,
    phone_change_token, reauthentication_token
  ) VALUES (
    creativelabs_id, '00000000-0000-0000-0000-000000000000',
    'hiring@creativelabs.test', password_hash, NOW(),
    '{"provider": "email", "providers": ["email"]}',
    '{"full_name": "Morgan Lee"}',
    'authenticated', 'authenticated', NOW(), NOW(), '', '',
    '', '', '', '', ''
  );

  -- FinancePlus
  INSERT INTO auth.users (
    id, instance_id, email, encrypted_password, email_confirmed_at,
    raw_app_meta_data, raw_user_meta_data, aud, role,
    created_at, updated_at, confirmation_token, recovery_token,
    email_change, email_change_token_new, email_change_token_current,
    phone_change_token, reauthentication_token
  ) VALUES (
    financeplus_id, '00000000-0000-0000-0000-000000000000',
    'careers@financeplus.test', password_hash, NOW(),
    '{"provider": "email", "providers": ["email"]}',
    '{"full_name": "Taylor Chen"}',
    'authenticated', 'authenticated', NOW(), NOW(), '', '',
    '', '', '', '', ''
  );

  -- HealthTech Solutions
  INSERT INTO auth.users (
    id, instance_id, email, encrypted_password, email_confirmed_at,
    raw_app_meta_data, raw_user_meta_data, aud, role,
    created_at, updated_at, confirmation_token, recovery_token,
    email_change, email_change_token_new, email_change_token_current,
    phone_change_token, reauthentication_token
  ) VALUES (
    healthtech_id, '00000000-0000-0000-0000-000000000000',
    'people@healthtech.test', password_hash, NOW(),
    '{"provider": "email", "providers": ["email"]}',
    '{"full_name": "Casey Martinez"}',
    'authenticated', 'authenticated', NOW(), NOW(), '', '',
    '', '', '', '', ''
  );

  -- ============================================
  -- CREATE IDENTITIES (required for email login)
  -- ============================================
  INSERT INTO auth.identities (id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at)
  VALUES
    (gen_random_uuid(), sarah_id, jsonb_build_object('sub', sarah_id::text, 'email', 'sarah.johnson@test.com'), 'email', sarah_id::text, NOW(), NOW(), NOW()),
    (gen_random_uuid(), marcus_id, jsonb_build_object('sub', marcus_id::text, 'email', 'marcus.williams@test.com'), 'email', marcus_id::text, NOW(), NOW(), NOW()),
    (gen_random_uuid(), emily_id, jsonb_build_object('sub', emily_id::text, 'email', 'emily.rodriguez@test.com'), 'email', emily_id::text, NOW(), NOW(), NOW()),
    (gen_random_uuid(), david_id, jsonb_build_object('sub', david_id::text, 'email', 'david.kim@test.com'), 'email', david_id::text, NOW(), NOW(), NOW()),
    (gen_random_uuid(), techstartup_id, jsonb_build_object('sub', techstartup_id::text, 'email', 'hr@techstartup.test'), 'email', techstartup_id::text, NOW(), NOW(), NOW()),
    (gen_random_uuid(), innovatecorp_id, jsonb_build_object('sub', innovatecorp_id::text, 'email', 'talent@innovatecorp.test'), 'email', innovatecorp_id::text, NOW(), NOW(), NOW()),
    (gen_random_uuid(), creativelabs_id, jsonb_build_object('sub', creativelabs_id::text, 'email', 'hiring@creativelabs.test'), 'email', creativelabs_id::text, NOW(), NOW(), NOW()),
    (gen_random_uuid(), financeplus_id, jsonb_build_object('sub', financeplus_id::text, 'email', 'careers@financeplus.test'), 'email', financeplus_id::text, NOW(), NOW(), NOW()),
    (gen_random_uuid(), healthtech_id, jsonb_build_object('sub', healthtech_id::text, 'email', 'people@healthtech.test'), 'email', healthtech_id::text, NOW(), NOW(), NOW());

  -- ============================================
  -- CREATE PROFILES
  -- ============================================
  INSERT INTO public.profiles (id, email, full_name, role, onboarding_completed, created_at, updated_at)
  VALUES
    (sarah_id, 'sarah.johnson@test.com', 'Sarah Johnson', 'candidate', true, NOW(), NOW()),
    (marcus_id, 'marcus.williams@test.com', 'Marcus Williams', 'candidate', true, NOW(), NOW()),
    (emily_id, 'emily.rodriguez@test.com', 'Emily Rodriguez', 'candidate', true, NOW(), NOW()),
    (david_id, 'david.kim@test.com', 'David Kim', 'candidate', true, NOW(), NOW()),
    (techstartup_id, 'hr@techstartup.test', 'Alex Rivera', 'employer', true, NOW(), NOW()),
    (innovatecorp_id, 'talent@innovatecorp.test', 'Jordan Smith', 'employer', true, NOW(), NOW()),
    (creativelabs_id, 'hiring@creativelabs.test', 'Morgan Lee', 'employer', true, NOW(), NOW()),
    (financeplus_id, 'careers@financeplus.test', 'Taylor Chen', 'employer', true, NOW(), NOW()),
    (healthtech_id, 'people@healthtech.test', 'Casey Martinez', 'employer', true, NOW(), NOW())
  ON CONFLICT (id) DO UPDATE SET
    role = EXCLUDED.role, full_name = EXCLUDED.full_name,
    onboarding_completed = EXCLUDED.onboarding_completed, updated_at = NOW();

  -- ============================================
  -- CREATE CANDIDATES WITH PERSONALITY DATA
  -- ============================================

  -- Sarah Johnson - The Architect (High conscientiousness, structured)
  INSERT INTO public.candidates (user_id, headline, bio, location, years_experience,
    openness_score, conscientiousness_score, extraversion_score, agreeableness_score, neuroticism_score,
    top_traits, assessment_status, assessment_completed_at, preferred_work_style, preferred_company_size,
    salary_expectation_min, salary_expectation_max, linkedin_url, setup_step, setup_completed_at)
  VALUES (
    sarah_id,
    'Product Manager | B2B SaaS Specialist',
    'Detail-oriented PM with 8 years of experience in enterprise software. Expert in roadmap planning, stakeholder management, and data-driven decision making. Thrive in structured environments.',
    'New York, NY', 8,
    65, 95, 72, 80, 30,
    ARRAY['The Architect', 'The Strategist'],
    'completed', NOW() - INTERVAL '5 days',
    'hybrid', 'medium',
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

  -- Marcus Williams - The Catalyst (High extraversion, collaborative)
  INSERT INTO public.candidates (user_id, headline, bio, location, years_experience,
    openness_score, conscientiousness_score, extraversion_score, agreeableness_score, neuroticism_score,
    top_traits, assessment_status, assessment_completed_at, preferred_work_style, preferred_company_size,
    salary_expectation_min, salary_expectation_max, linkedin_url, setup_step, setup_completed_at)
  VALUES (
    marcus_id,
    'Sales Engineer | Technical Solutions Expert',
    'High-energy professional who loves connecting with customers and solving complex technical challenges. 5 years bridging the gap between sales and engineering teams.',
    'Austin, TX', 5,
    70, 68, 95, 88, 20,
    ARRAY['The Catalyst', 'The Harmonizer'],
    'completed', NOW() - INTERVAL '3 days',
    'hybrid', 'startup',
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

  -- Emily Rodriguez - The Craftsperson (Balanced, detail-focused)
  INSERT INTO public.candidates (user_id, headline, bio, location, years_experience,
    openness_score, conscientiousness_score, extraversion_score, agreeableness_score, neuroticism_score,
    top_traits, assessment_status, assessment_completed_at, preferred_work_style, preferred_company_size,
    salary_expectation_min, salary_expectation_max, linkedin_url, portfolio_url, setup_step, setup_completed_at)
  VALUES (
    emily_id,
    'UX/UI Designer | Design Systems Expert',
    'Meticulous designer with 7 years crafting beautiful, accessible interfaces. Specialist in design systems and component libraries. I believe great design is in the details.',
    'Seattle, WA', 7,
    78, 88, 55, 75, 35,
    ARRAY['The Craftsperson', 'The Architect'],
    'completed', NOW() - INTERVAL '1 day',
    'remote', 'any',
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

  -- David Kim - The Anchor (High stability, dependable)
  INSERT INTO public.candidates (user_id, headline, bio, location, years_experience,
    openness_score, conscientiousness_score, extraversion_score, agreeableness_score, neuroticism_score,
    top_traits, assessment_status, assessment_completed_at, preferred_work_style, preferred_company_size,
    salary_expectation_min, salary_expectation_max, linkedin_url, setup_step, setup_completed_at)
  VALUES (
    david_id,
    'DevOps Engineer | Cloud Infrastructure Specialist',
    'Reliable and methodical engineer with 10 years keeping systems running smoothly. AWS and Kubernetes certified. I value stability, clear processes, and continuous improvement.',
    'Chicago, IL', 10,
    55, 90, 45, 82, 15,
    ARRAY['The Anchor', 'The Craftsperson'],
    'completed', NOW() - INTERVAL '4 days',
    'hybrid', 'large',
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
  -- CREATE EMPLOYERS WITH CULTURE DATA
  -- ============================================

  -- TechStartup Inc - Innovation-focused startup
  INSERT INTO public.employers (user_id, company_name, company_website, company_size, industry, description, location,
    culture_values, openness_preference, conscientiousness_preference, extraversion_preference, agreeableness_preference, neuroticism_preference,
    culture_quiz_completed, setup_step, setup_completed_at)
  VALUES (
    techstartup_id,
    'TechStartup Inc', 'https://techstartup.test', '1-10', 'Technology',
    'Fast-moving AI startup disrupting the healthcare industry. We value innovation, speed, and bold thinking.',
    'San Francisco, CA',
    ARRAY['Innovation', 'Speed', 'Autonomy', 'Risk-taking', 'Creativity'],
    90, 65, 75, 70, 40, true, 4, NOW()
  ) ON CONFLICT (user_id) DO UPDATE SET
    company_name = EXCLUDED.company_name, company_website = EXCLUDED.company_website,
    company_size = EXCLUDED.company_size, industry = EXCLUDED.industry,
    description = EXCLUDED.description, location = EXCLUDED.location,
    culture_values = EXCLUDED.culture_values,
    openness_preference = EXCLUDED.openness_preference, conscientiousness_preference = EXCLUDED.conscientiousness_preference,
    extraversion_preference = EXCLUDED.extraversion_preference, agreeableness_preference = EXCLUDED.agreeableness_preference,
    neuroticism_preference = EXCLUDED.neuroticism_preference, culture_quiz_completed = EXCLUDED.culture_quiz_completed,
    setup_step = EXCLUDED.setup_step, setup_completed_at = EXCLUDED.setup_completed_at;

  -- InnovateCorp - Balanced mid-size company
  INSERT INTO public.employers (user_id, company_name, company_website, company_size, industry, description, location,
    culture_values, openness_preference, conscientiousness_preference, extraversion_preference, agreeableness_preference, neuroticism_preference,
    culture_quiz_completed, setup_step, setup_completed_at)
  VALUES (
    innovatecorp_id,
    'InnovateCorp', 'https://innovatecorp.test', '51-200', 'Technology',
    'Growing B2B SaaS company with 200+ employees. We balance innovation with execution.',
    'New York, NY',
    ARRAY['Balance', 'Growth', 'Collaboration', 'Excellence', 'Innovation'],
    75, 85, 70, 80, 30, true, 4, NOW()
  ) ON CONFLICT (user_id) DO UPDATE SET
    company_name = EXCLUDED.company_name, company_website = EXCLUDED.company_website,
    company_size = EXCLUDED.company_size, industry = EXCLUDED.industry,
    description = EXCLUDED.description, location = EXCLUDED.location,
    culture_values = EXCLUDED.culture_values,
    openness_preference = EXCLUDED.openness_preference, conscientiousness_preference = EXCLUDED.conscientiousness_preference,
    extraversion_preference = EXCLUDED.extraversion_preference, agreeableness_preference = EXCLUDED.agreeableness_preference,
    neuroticism_preference = EXCLUDED.neuroticism_preference, culture_quiz_completed = EXCLUDED.culture_quiz_completed,
    setup_step = EXCLUDED.setup_step, setup_completed_at = EXCLUDED.setup_completed_at;

  -- Creative Labs - Design-focused agency
  INSERT INTO public.employers (user_id, company_name, company_website, company_size, industry, description, location,
    culture_values, openness_preference, conscientiousness_preference, extraversion_preference, agreeableness_preference, neuroticism_preference,
    culture_quiz_completed, setup_step, setup_completed_at)
  VALUES (
    creativelabs_id,
    'Creative Labs', 'https://creativelabs.test', '11-50', 'Media',
    'Award-winning design agency creating beautiful digital experiences. We obsess over details and craft.',
    'Los Angeles, CA',
    ARRAY['Creativity', 'Craft', 'Aesthetics', 'Collaboration', 'Quality'],
    88, 82, 65, 78, 35, true, 4, NOW()
  ) ON CONFLICT (user_id) DO UPDATE SET
    company_name = EXCLUDED.company_name, company_website = EXCLUDED.company_website,
    company_size = EXCLUDED.company_size, industry = EXCLUDED.industry,
    description = EXCLUDED.description, location = EXCLUDED.location,
    culture_values = EXCLUDED.culture_values,
    openness_preference = EXCLUDED.openness_preference, conscientiousness_preference = EXCLUDED.conscientiousness_preference,
    extraversion_preference = EXCLUDED.extraversion_preference, agreeableness_preference = EXCLUDED.agreeableness_preference,
    neuroticism_preference = EXCLUDED.neuroticism_preference, culture_quiz_completed = EXCLUDED.culture_quiz_completed,
    setup_step = EXCLUDED.setup_step, setup_completed_at = EXCLUDED.setup_completed_at;

  -- FinancePlus - Traditional finance company
  INSERT INTO public.employers (user_id, company_name, company_website, company_size, industry, description, location,
    culture_values, openness_preference, conscientiousness_preference, extraversion_preference, agreeableness_preference, neuroticism_preference,
    culture_quiz_completed, setup_step, setup_completed_at)
  VALUES (
    financeplus_id,
    'FinancePlus', 'https://financeplus.test', '500+', 'Finance',
    'Established financial services firm with 50+ years of history. We value stability, precision, and trust.',
    'Boston, MA',
    ARRAY['Stability', 'Precision', 'Trust', 'Process', 'Excellence'],
    50, 95, 55, 75, 20, true, 4, NOW()
  ) ON CONFLICT (user_id) DO UPDATE SET
    company_name = EXCLUDED.company_name, company_website = EXCLUDED.company_website,
    company_size = EXCLUDED.company_size, industry = EXCLUDED.industry,
    description = EXCLUDED.description, location = EXCLUDED.location,
    culture_values = EXCLUDED.culture_values,
    openness_preference = EXCLUDED.openness_preference, conscientiousness_preference = EXCLUDED.conscientiousness_preference,
    extraversion_preference = EXCLUDED.extraversion_preference, agreeableness_preference = EXCLUDED.agreeableness_preference,
    neuroticism_preference = EXCLUDED.neuroticism_preference, culture_quiz_completed = EXCLUDED.culture_quiz_completed,
    setup_step = EXCLUDED.setup_step, setup_completed_at = EXCLUDED.setup_completed_at;

  -- HealthTech Solutions - Mission-driven healthcare
  INSERT INTO public.employers (user_id, company_name, company_website, company_size, industry, description, location,
    culture_values, openness_preference, conscientiousness_preference, extraversion_preference, agreeableness_preference, neuroticism_preference,
    culture_quiz_completed, setup_step, setup_completed_at)
  VALUES (
    healthtech_id,
    'HealthTech Solutions', 'https://healthtech.test', '201-500', 'Healthcare',
    'Mission-driven healthcare technology company improving patient outcomes. We combine innovation with empathy.',
    'Denver, CO',
    ARRAY['Mission', 'Empathy', 'Innovation', 'Collaboration', 'Impact'],
    80, 78, 72, 92, 25, true, 4, NOW()
  ) ON CONFLICT (user_id) DO UPDATE SET
    company_name = EXCLUDED.company_name, company_website = EXCLUDED.company_website,
    company_size = EXCLUDED.company_size, industry = EXCLUDED.industry,
    description = EXCLUDED.description, location = EXCLUDED.location,
    culture_values = EXCLUDED.culture_values,
    openness_preference = EXCLUDED.openness_preference, conscientiousness_preference = EXCLUDED.conscientiousness_preference,
    extraversion_preference = EXCLUDED.extraversion_preference, agreeableness_preference = EXCLUDED.agreeableness_preference,
    neuroticism_preference = EXCLUDED.neuroticism_preference, culture_quiz_completed = EXCLUDED.culture_quiz_completed,
    setup_step = EXCLUDED.setup_step, setup_completed_at = EXCLUDED.setup_completed_at;

  -- ============================================
  -- CREATE USER SETTINGS
  -- ============================================
  INSERT INTO public.user_settings (user_id)
  VALUES (sarah_id), (marcus_id), (emily_id), (david_id),
         (techstartup_id), (innovatecorp_id), (creativelabs_id), (financeplus_id), (healthtech_id)
  ON CONFLICT (user_id) DO NOTHING;

  -- ============================================
  -- CREATE ASSESSMENTS WITH RESPONSES
  -- ============================================

  -- Sarah Johnson's personality assessment
  INSERT INTO public.assessments (id, user_id, assessment_type, started_at, completed_at, responses)
  VALUES (
    sarah_assessment_id, sarah_id, 'candidate_personality',
    NOW() - INTERVAL '5 days', NOW() - INTERVAL '5 days',
    '{
      "c1": {"answer": "c1d", "traitScores": {"organization": 90, "leadership": 75, "analytical": 80}},
      "c2": {"answer": "c2b", "traitScores": {"ambition": 95, "independence": 80, "achievement": 90}},
      "c3": {"answer": "c3b", "traitScores": {"quality": 95, "patience": 80, "precision": 90}},
      "c4": {"answer": "c4b", "traitScores": {"diplomacy": 90, "empathy": 85, "patience": 80}},
      "c5": {"value": 35},
      "c6": {"ranking": ["c6b", "c6a", "c6c", "c6f", "c6d", "c6e"]},
      "c7": {"answer": "c7b", "traitScores": {"diplomacy": 90, "respect": 85, "strategy": 80}},
      "c8": {"answer": "c8b", "traitScores": {"structure": 95, "planning": 90, "precision": 85}},
      "c9": {"answer": "c9b", "traitScores": {"pragmatism": 95, "reliability": 85, "efficiency": 80}},
      "c10": {"value": 85},
      "c11": {"answer": "c11b", "traitScores": {"stability": 85, "mastery": 90, "patience": 80}},
      "c12": {"text": "Leading a cross-functional team to ship a major product launch on time and under budget."},
      "c13": {"answer": "c13c", "traitScores": {"support": 95, "reliability": 90, "humility": 85}},
      "c14": {"answer": "c14a", "traitScores": {"depth": 95, "focus": 90, "mastery": 85}},
      "c15": {"answer": "c15b", "traitScores": {"ownership": 90, "problem_solving": 85, "initiative": 80}},
      "c16": {"value": 40}
    }'::jsonb
  ) ON CONFLICT DO NOTHING;

  -- Marcus Williams's personality assessment
  INSERT INTO public.assessments (id, user_id, assessment_type, started_at, completed_at, responses)
  VALUES (
    marcus_assessment_id, marcus_id, 'candidate_personality',
    NOW() - INTERVAL '3 days', NOW() - INTERVAL '3 days',
    '{
      "c1": {"answer": "c1a", "traitScores": {"collaboration": 90, "intensity": 70, "leadership": 80}},
      "c2": {"answer": "c2a", "traitScores": {"collaboration": 95, "structure": 80, "social": 90}},
      "c3": {"answer": "c3a", "traitScores": {"speed": 95, "risk": 80, "action": 90}},
      "c4": {"answer": "c4a", "traitScores": {"directness": 95, "courage": 85, "honesty": 90}},
      "c5": {"value": 85},
      "c6": {"ranking": ["c6e", "c6a", "c6b", "c6d", "c6f", "c6c"]},
      "c7": {"answer": "c7a", "traitScores": {"assertiveness": 95, "courage": 90, "directness": 85}},
      "c8": {"answer": "c8d", "traitScores": {"intensity": 95, "passion": 90, "impact": 85}},
      "c9": {"answer": "c9a", "traitScores": {"innovation": 95, "risk": 80, "creativity": 90}},
      "c10": {"value": 25},
      "c11": {"answer": "c11a", "traitScores": {"risk": 95, "growth": 90, "adventure": 85}},
      "c12": {"text": "Closing a major deal by building genuine relationships with the client team and finding creative solutions."},
      "c13": {"answer": "c13a", "traitScores": {"leadership": 95, "visibility": 90, "influence": 85}},
      "c14": {"answer": "c14b", "traitScores": {"breadth": 95, "curiosity": 90, "versatility": 85}},
      "c15": {"answer": "c15a", "traitScores": {"honesty": 95, "accountability": 90, "courage": 85}},
      "c16": {"value": 75}
    }'::jsonb
  ) ON CONFLICT DO NOTHING;

  -- Emily Rodriguez's personality assessment
  INSERT INTO public.assessments (id, user_id, assessment_type, started_at, completed_at, responses)
  VALUES (
    emily_assessment_id, emily_id, 'candidate_personality',
    NOW() - INTERVAL '1 day', NOW() - INTERVAL '1 day',
    '{
      "c1": {"answer": "c1b", "traitScores": {"independence": 90, "intensity": 85, "ownership": 90}},
      "c2": {"answer": "c2d", "traitScores": {"depth": 90, "independence": 70, "reflection": 85}},
      "c3": {"answer": "c3b", "traitScores": {"quality": 95, "patience": 80, "precision": 90}},
      "c4": {"answer": "c4b", "traitScores": {"diplomacy": 90, "empathy": 85, "patience": 80}},
      "c5": {"value": 30},
      "c6": {"ranking": ["c6b", "c6f", "c6a", "c6c", "c6e", "c6d"]},
      "c7": {"answer": "c7b", "traitScores": {"diplomacy": 90, "respect": 85, "strategy": 80}},
      "c8": {"answer": "c8b", "traitScores": {"structure": 95, "planning": 90, "precision": 85}},
      "c9": {"answer": "c9a", "traitScores": {"innovation": 95, "risk": 80, "creativity": 90}},
      "c10": {"value": 70},
      "c11": {"answer": "c11c", "traitScores": {"strategy": 90, "caution": 80, "flexibility": 85}},
      "c12": {"text": "Designing a component library that the entire team loved using and made their work easier."},
      "c13": {"answer": "c13b", "traitScores": {"expertise": 95, "independence": 85, "recognition": 80}},
      "c14": {"answer": "c14a", "traitScores": {"depth": 95, "focus": 90, "mastery": 85}},
      "c15": {"answer": "c15b", "traitScores": {"ownership": 90, "problem_solving": 85, "initiative": 80}},
      "c16": {"value": 35}
    }'::jsonb
  ) ON CONFLICT DO NOTHING;

  -- David Kim's personality assessment
  INSERT INTO public.assessments (id, user_id, assessment_type, started_at, completed_at, responses)
  VALUES (
    david_assessment_id, david_id, 'candidate_personality',
    NOW() - INTERVAL '4 days', NOW() - INTERVAL '4 days',
    '{
      "c1": {"answer": "c1d", "traitScores": {"organization": 90, "leadership": 75, "analytical": 80}},
      "c2": {"answer": "c2d", "traitScores": {"depth": 90, "independence": 70, "reflection": 85}},
      "c3": {"answer": "c3b", "traitScores": {"quality": 95, "patience": 80, "precision": 90}},
      "c4": {"answer": "c4c", "traitScores": {"independence": 85, "avoidance": 60, "efficiency": 75}},
      "c5": {"value": 25},
      "c6": {"ranking": ["c6c", "c6b", "c6a", "c6f", "c6e", "c6d"]},
      "c7": {"answer": "c7d", "traitScores": {"trust": 80, "patience": 85, "adaptability": 75}},
      "c8": {"answer": "c8c", "traitScores": {"consistency": 90, "iteration": 85, "focus": 80}},
      "c9": {"answer": "c9b", "traitScores": {"pragmatism": 95, "reliability": 85, "efficiency": 80}},
      "c10": {"value": 90},
      "c11": {"answer": "c11b", "traitScores": {"stability": 85, "mastery": 90, "patience": 80}},
      "c12": {"text": "Designing a zero-downtime deployment system that kept our services running for 2 years straight."},
      "c13": {"answer": "c13c", "traitScores": {"support": 95, "reliability": 90, "humility": 85}},
      "c14": {"answer": "c14a", "traitScores": {"depth": 95, "focus": 90, "mastery": 85}},
      "c15": {"answer": "c15c", "traitScores": {"analytical": 85, "caution": 80, "strategic": 75}},
      "c16": {"value": 25}
    }'::jsonb
  ) ON CONFLICT DO NOTHING;

  -- TechStartup Inc's culture assessment
  INSERT INTO public.assessments (id, user_id, assessment_type, started_at, completed_at, responses)
  VALUES (
    techstartup_assessment_id, techstartup_id, 'employer_culture',
    NOW() - INTERVAL '10 days', NOW() - INTERVAL '10 days',
    '{
      "e1": {"answer": "e1d", "traitScores": {"flexibility": 90, "strategic": 85, "pragmatism": 80}},
      "e2": {"answer": "e2a", "traitScores": {"innovation": 95, "scrappiness": 90, "risk": 85}},
      "e3": {"answer": "e3a", "traitScores": {"speed": 95, "autonomy": 85, "action": 90}},
      "e4": {"answer": "e4d", "traitScores": {"decisiveness": 95, "results": 85, "tough_love": 80}},
      "e5": {"value": 20},
      "e6": {"ranking": ["e6b", "e6a", "e6e", "e6d", "e6c", "e6f"]},
      "e7": {"answer": "e7a", "traitScores": {"risk": 95, "vision": 90, "boldness": 85}},
      "e8": {"answer": "e8b", "traitScores": {"creativity": 95, "collaboration": 90, "spontaneity": 85}},
      "e9": {"answer": "e9b", "traitScores": {"potential": 95, "development": 85, "optimism": 80}},
      "e10": {"value": 85},
      "e11": {"answer": "e11d", "traitScores": {"resilience": 90, "action": 85, "forward": 80}},
      "e12": {"text": "Shipping our first product in 3 months with a team of 4, working around the clock and celebrating with champagne."},
      "e13": {"value": 85},
      "e14": {"answer": "e14a", "traitScores": {"flexibility": 95, "trust": 90, "results": 85}},
      "e15": {"answer": "e15a", "traitScores": {"transparency": 95, "trust": 90, "openness": 85}},
      "e16": {"value": 90}
    }'::jsonb
  ) ON CONFLICT DO NOTHING;

  -- InnovateCorp's culture assessment
  INSERT INTO public.assessments (id, user_id, assessment_type, started_at, completed_at, responses)
  VALUES (
    innovatecorp_assessment_id, innovatecorp_id, 'employer_culture',
    NOW() - INTERVAL '8 days', NOW() - INTERVAL '8 days',
    '{
      "e1": {"answer": "e1b", "traitScores": {"culture_focus": 95, "development": 85, "long_term": 80}},
      "e2": {"answer": "e2b", "traitScores": {"depth": 95, "expertise": 90, "deliberation": 85}},
      "e3": {"answer": "e3b", "traitScores": {"consensus": 95, "inclusion": 85, "thoroughness": 80}},
      "e4": {"answer": "e4b", "traitScores": {"development": 90, "empathy": 85, "creative_solutions": 80}},
      "e5": {"value": 45},
      "e6": {"ranking": ["e6c", "e6e", "e6d", "e6b", "e6a", "e6f"]},
      "e7": {"answer": "e7c", "traitScores": {"analytical": 90, "measured": 85, "learning": 80}},
      "e8": {"answer": "e8c", "traitScores": {"efficiency": 95, "clarity": 90, "action": 85}},
      "e9": {"answer": "e9a", "traitScores": {"experience": 95, "risk_averse": 85, "predictability": 80}},
      "e10": {"value": 55},
      "e11": {"answer": "e11b", "traitScores": {"analytical": 90, "measured": 85, "thoroughness": 80}},
      "e12": {"text": "When our entire company rallied to help a struggling team meet a deadline, without being asked."},
      "e13": {"value": 55},
      "e14": {"answer": "e14b", "traitScores": {"balance": 90, "pragmatism": 85, "collaboration": 80}},
      "e15": {"answer": "e15a", "traitScores": {"transparency": 95, "trust": 90, "openness": 85}},
      "e16": {"value": 65}
    }'::jsonb
  ) ON CONFLICT DO NOTHING;

  -- Creative Labs's culture assessment
  INSERT INTO public.assessments (id, user_id, assessment_type, started_at, completed_at, responses)
  VALUES (
    creativelabs_assessment_id, creativelabs_id, 'employer_culture',
    NOW() - INTERVAL '6 days', NOW() - INTERVAL '6 days',
    '{
      "e1": {"answer": "e1c", "traitScores": {"high_bar": 95, "patience": 80, "perfectionism": 75}},
      "e2": {"answer": "e2d", "traitScores": {"warmth": 95, "connection": 90, "comfort": 85}},
      "e3": {"answer": "e3b", "traitScores": {"consensus": 95, "inclusion": 85, "thoroughness": 80}},
      "e4": {"answer": "e4b", "traitScores": {"development": 90, "empathy": 85, "creative_solutions": 80}},
      "e5": {"value": 30},
      "e6": {"ranking": ["e6d", "e6c", "e6b", "e6e", "e6f", "e6a"]},
      "e7": {"answer": "e7c", "traitScores": {"analytical": 90, "measured": 85, "learning": 80}},
      "e8": {"answer": "e8d", "traitScores": {"connection": 95, "storytelling": 90, "warmth": 85}},
      "e9": {"answer": "e9b", "traitScores": {"potential": 95, "development": 85, "optimism": 80}},
      "e10": {"value": 70},
      "e11": {"answer": "e11c", "traitScores": {"people_first": 95, "empathy": 90, "team": 85}},
      "e12": {"text": "When we won our first design award and the whole team went to the ceremony together."},
      "e13": {"value": 50},
      "e14": {"answer": "e14b", "traitScores": {"balance": 90, "pragmatism": 85, "collaboration": 80}},
      "e15": {"answer": "e15a", "traitScores": {"transparency": 95, "trust": 90, "openness": 85}},
      "e16": {"value": 75}
    }'::jsonb
  ) ON CONFLICT DO NOTHING;

  -- FinancePlus's culture assessment
  INSERT INTO public.assessments (id, user_id, assessment_type, started_at, completed_at, responses)
  VALUES (
    financeplus_assessment_id, financeplus_id, 'employer_culture',
    NOW() - INTERVAL '12 days', NOW() - INTERVAL '12 days',
    '{
      "e1": {"answer": "e1a", "traitScores": {"skills_focus": 95, "efficiency": 85, "pragmatism": 80}},
      "e2": {"answer": "e2b", "traitScores": {"depth": 95, "expertise": 90, "deliberation": 85}},
      "e3": {"answer": "e3b", "traitScores": {"consensus": 95, "inclusion": 85, "thoroughness": 80}},
      "e4": {"answer": "e4a", "traitScores": {"directness": 95, "fairness": 85, "clarity": 90}},
      "e5": {"value": 80},
      "e6": {"ranking": ["e6f", "e6d", "e6a", "e6c", "e6e", "e6b"]},
      "e7": {"answer": "e7b", "traitScores": {"stability": 90, "prudence": 85, "protection": 80}},
      "e8": {"answer": "e8c", "traitScores": {"efficiency": 95, "clarity": 90, "action": 85}},
      "e9": {"answer": "e9a", "traitScores": {"experience": 95, "risk_averse": 85, "predictability": 80}},
      "e10": {"value": 25},
      "e11": {"answer": "e11a", "traitScores": {"accountability": 95, "leadership": 90, "protection": 85}},
      "e12": {"text": "When our compliance team caught an issue that saved the company from major regulatory fines."},
      "e13": {"value": 35},
      "e14": {"answer": "e14c", "traitScores": {"consistency": 90, "fairness": 85, "culture": 80}},
      "e15": {"answer": "e15b", "traitScores": {"discretion": 90, "focus": 85, "protection": 80}},
      "e16": {"value": 25}
    }'::jsonb
  ) ON CONFLICT DO NOTHING;

  -- HealthTech Solutions's culture assessment
  INSERT INTO public.assessments (id, user_id, assessment_type, started_at, completed_at, responses)
  VALUES (
    healthtech_assessment_id, healthtech_id, 'employer_culture',
    NOW() - INTERVAL '7 days', NOW() - INTERVAL '7 days',
    '{
      "e1": {"answer": "e1b", "traitScores": {"culture_focus": 95, "development": 85, "long_term": 80}},
      "e2": {"answer": "e2d", "traitScores": {"warmth": 95, "connection": 90, "comfort": 85}},
      "e3": {"answer": "e3b", "traitScores": {"consensus": 95, "inclusion": 85, "thoroughness": 80}},
      "e4": {"answer": "e4c", "traitScores": {"support": 90, "patience": 85, "investment": 80}},
      "e5": {"value": 40},
      "e6": {"ranking": ["e6c", "e6f", "e6e", "e6d", "e6a", "e6b"]},
      "e7": {"answer": "e7d", "traitScores": {"growth": 90, "ambition": 85, "resourcefulness": 80}},
      "e8": {"answer": "e8d", "traitScores": {"connection": 95, "storytelling": 90, "warmth": 85}},
      "e9": {"answer": "e9b", "traitScores": {"potential": 95, "development": 85, "optimism": 80}},
      "e10": {"value": 60},
      "e11": {"answer": "e11c", "traitScores": {"people_first": 95, "empathy": 90, "team": 85}},
      "e12": {"text": "Receiving a letter from a patient whose life was improved by our technology."},
      "e13": {"value": 45},
      "e14": {"answer": "e14a", "traitScores": {"flexibility": 95, "trust": 90, "results": 85}},
      "e15": {"answer": "e15a", "traitScores": {"transparency": 95, "trust": 90, "openness": 85}},
      "e16": {"value": 70}
    }'::jsonb
  ) ON CONFLICT DO NOTHING;

  -- ============================================
  -- CREATE ASSESSMENT RESPONSES (individual question responses)
  -- ============================================

  -- Sarah's assessment responses
  INSERT INTO public.assessment_responses (assessment_id, user_id, question_code, answer, answered_at)
  VALUES
    (sarah_assessment_id, sarah_id, 'c1', '{"selected": "c1d"}'::jsonb, NOW() - INTERVAL '5 days'),
    (sarah_assessment_id, sarah_id, 'c2', '{"selected": "c2b"}'::jsonb, NOW() - INTERVAL '5 days'),
    (sarah_assessment_id, sarah_id, 'c3', '{"selected": "c3b"}'::jsonb, NOW() - INTERVAL '5 days'),
    (sarah_assessment_id, sarah_id, 'c4', '{"selected": "c4b"}'::jsonb, NOW() - INTERVAL '5 days'),
    (sarah_assessment_id, sarah_id, 'c5', '{"value": 35}'::jsonb, NOW() - INTERVAL '5 days'),
    (sarah_assessment_id, sarah_id, 'c6', '{"ranking": ["c6b", "c6a", "c6c", "c6f", "c6d", "c6e"]}'::jsonb, NOW() - INTERVAL '5 days'),
    (sarah_assessment_id, sarah_id, 'c7', '{"selected": "c7b"}'::jsonb, NOW() - INTERVAL '5 days'),
    (sarah_assessment_id, sarah_id, 'c8', '{"selected": "c8b"}'::jsonb, NOW() - INTERVAL '5 days'),
    (sarah_assessment_id, sarah_id, 'c9', '{"selected": "c9b"}'::jsonb, NOW() - INTERVAL '5 days'),
    (sarah_assessment_id, sarah_id, 'c10', '{"value": 85}'::jsonb, NOW() - INTERVAL '5 days'),
    (sarah_assessment_id, sarah_id, 'c11', '{"selected": "c11b"}'::jsonb, NOW() - INTERVAL '5 days'),
    (sarah_assessment_id, sarah_id, 'c12', '{"text": "Leading a cross-functional team to ship a major product launch on time and under budget."}'::jsonb, NOW() - INTERVAL '5 days'),
    (sarah_assessment_id, sarah_id, 'c13', '{"selected": "c13c"}'::jsonb, NOW() - INTERVAL '5 days'),
    (sarah_assessment_id, sarah_id, 'c14', '{"selected": "c14a"}'::jsonb, NOW() - INTERVAL '5 days'),
    (sarah_assessment_id, sarah_id, 'c15', '{"selected": "c15b"}'::jsonb, NOW() - INTERVAL '5 days'),
    (sarah_assessment_id, sarah_id, 'c16', '{"value": 40}'::jsonb, NOW() - INTERVAL '5 days')
  ON CONFLICT (assessment_id, question_code) DO NOTHING;

  -- Marcus's assessment responses
  INSERT INTO public.assessment_responses (assessment_id, user_id, question_code, answer, answered_at)
  VALUES
    (marcus_assessment_id, marcus_id, 'c1', '{"selected": "c1a"}'::jsonb, NOW() - INTERVAL '3 days'),
    (marcus_assessment_id, marcus_id, 'c2', '{"selected": "c2a"}'::jsonb, NOW() - INTERVAL '3 days'),
    (marcus_assessment_id, marcus_id, 'c3', '{"selected": "c3a"}'::jsonb, NOW() - INTERVAL '3 days'),
    (marcus_assessment_id, marcus_id, 'c4', '{"selected": "c4a"}'::jsonb, NOW() - INTERVAL '3 days'),
    (marcus_assessment_id, marcus_id, 'c5', '{"value": 85}'::jsonb, NOW() - INTERVAL '3 days'),
    (marcus_assessment_id, marcus_id, 'c6', '{"ranking": ["c6e", "c6a", "c6b", "c6d", "c6f", "c6c"]}'::jsonb, NOW() - INTERVAL '3 days'),
    (marcus_assessment_id, marcus_id, 'c7', '{"selected": "c7a"}'::jsonb, NOW() - INTERVAL '3 days'),
    (marcus_assessment_id, marcus_id, 'c8', '{"selected": "c8d"}'::jsonb, NOW() - INTERVAL '3 days'),
    (marcus_assessment_id, marcus_id, 'c9', '{"selected": "c9a"}'::jsonb, NOW() - INTERVAL '3 days'),
    (marcus_assessment_id, marcus_id, 'c10', '{"value": 25}'::jsonb, NOW() - INTERVAL '3 days'),
    (marcus_assessment_id, marcus_id, 'c11', '{"selected": "c11a"}'::jsonb, NOW() - INTERVAL '3 days'),
    (marcus_assessment_id, marcus_id, 'c12', '{"text": "Closing a major deal by building genuine relationships with the client team and finding creative solutions."}'::jsonb, NOW() - INTERVAL '3 days'),
    (marcus_assessment_id, marcus_id, 'c13', '{"selected": "c13a"}'::jsonb, NOW() - INTERVAL '3 days'),
    (marcus_assessment_id, marcus_id, 'c14', '{"selected": "c14b"}'::jsonb, NOW() - INTERVAL '3 days'),
    (marcus_assessment_id, marcus_id, 'c15', '{"selected": "c15a"}'::jsonb, NOW() - INTERVAL '3 days'),
    (marcus_assessment_id, marcus_id, 'c16', '{"value": 75}'::jsonb, NOW() - INTERVAL '3 days')
  ON CONFLICT (assessment_id, question_code) DO NOTHING;

  -- Emily's assessment responses
  INSERT INTO public.assessment_responses (assessment_id, user_id, question_code, answer, answered_at)
  VALUES
    (emily_assessment_id, emily_id, 'c1', '{"selected": "c1b"}'::jsonb, NOW() - INTERVAL '1 day'),
    (emily_assessment_id, emily_id, 'c2', '{"selected": "c2d"}'::jsonb, NOW() - INTERVAL '1 day'),
    (emily_assessment_id, emily_id, 'c3', '{"selected": "c3b"}'::jsonb, NOW() - INTERVAL '1 day'),
    (emily_assessment_id, emily_id, 'c4', '{"selected": "c4b"}'::jsonb, NOW() - INTERVAL '1 day'),
    (emily_assessment_id, emily_id, 'c5', '{"value": 30}'::jsonb, NOW() - INTERVAL '1 day'),
    (emily_assessment_id, emily_id, 'c6', '{"ranking": ["c6b", "c6f", "c6a", "c6c", "c6e", "c6d"]}'::jsonb, NOW() - INTERVAL '1 day'),
    (emily_assessment_id, emily_id, 'c7', '{"selected": "c7b"}'::jsonb, NOW() - INTERVAL '1 day'),
    (emily_assessment_id, emily_id, 'c8', '{"selected": "c8b"}'::jsonb, NOW() - INTERVAL '1 day'),
    (emily_assessment_id, emily_id, 'c9', '{"selected": "c9a"}'::jsonb, NOW() - INTERVAL '1 day'),
    (emily_assessment_id, emily_id, 'c10', '{"value": 70}'::jsonb, NOW() - INTERVAL '1 day'),
    (emily_assessment_id, emily_id, 'c11', '{"selected": "c11c"}'::jsonb, NOW() - INTERVAL '1 day'),
    (emily_assessment_id, emily_id, 'c12', '{"text": "Designing a component library that the entire team loved using and made their work easier."}'::jsonb, NOW() - INTERVAL '1 day'),
    (emily_assessment_id, emily_id, 'c13', '{"selected": "c13b"}'::jsonb, NOW() - INTERVAL '1 day'),
    (emily_assessment_id, emily_id, 'c14', '{"selected": "c14a"}'::jsonb, NOW() - INTERVAL '1 day'),
    (emily_assessment_id, emily_id, 'c15', '{"selected": "c15b"}'::jsonb, NOW() - INTERVAL '1 day'),
    (emily_assessment_id, emily_id, 'c16', '{"value": 35}'::jsonb, NOW() - INTERVAL '1 day')
  ON CONFLICT (assessment_id, question_code) DO NOTHING;

  -- David's assessment responses
  INSERT INTO public.assessment_responses (assessment_id, user_id, question_code, answer, answered_at)
  VALUES
    (david_assessment_id, david_id, 'c1', '{"selected": "c1d"}'::jsonb, NOW() - INTERVAL '4 days'),
    (david_assessment_id, david_id, 'c2', '{"selected": "c2d"}'::jsonb, NOW() - INTERVAL '4 days'),
    (david_assessment_id, david_id, 'c3', '{"selected": "c3b"}'::jsonb, NOW() - INTERVAL '4 days'),
    (david_assessment_id, david_id, 'c4', '{"selected": "c4c"}'::jsonb, NOW() - INTERVAL '4 days'),
    (david_assessment_id, david_id, 'c5', '{"value": 25}'::jsonb, NOW() - INTERVAL '4 days'),
    (david_assessment_id, david_id, 'c6', '{"ranking": ["c6c", "c6b", "c6a", "c6f", "c6e", "c6d"]}'::jsonb, NOW() - INTERVAL '4 days'),
    (david_assessment_id, david_id, 'c7', '{"selected": "c7d"}'::jsonb, NOW() - INTERVAL '4 days'),
    (david_assessment_id, david_id, 'c8', '{"selected": "c8c"}'::jsonb, NOW() - INTERVAL '4 days'),
    (david_assessment_id, david_id, 'c9', '{"selected": "c9b"}'::jsonb, NOW() - INTERVAL '4 days'),
    (david_assessment_id, david_id, 'c10', '{"value": 90}'::jsonb, NOW() - INTERVAL '4 days'),
    (david_assessment_id, david_id, 'c11', '{"selected": "c11b"}'::jsonb, NOW() - INTERVAL '4 days'),
    (david_assessment_id, david_id, 'c12', '{"text": "Designing a zero-downtime deployment system that kept our services running for 2 years straight."}'::jsonb, NOW() - INTERVAL '4 days'),
    (david_assessment_id, david_id, 'c13', '{"selected": "c13c"}'::jsonb, NOW() - INTERVAL '4 days'),
    (david_assessment_id, david_id, 'c14', '{"selected": "c14a"}'::jsonb, NOW() - INTERVAL '4 days'),
    (david_assessment_id, david_id, 'c15', '{"selected": "c15c"}'::jsonb, NOW() - INTERVAL '4 days'),
    (david_assessment_id, david_id, 'c16', '{"value": 25}'::jsonb, NOW() - INTERVAL '4 days')
  ON CONFLICT (assessment_id, question_code) DO NOTHING;

  -- Employer assessment responses (TechStartup)
  INSERT INTO public.assessment_responses (assessment_id, user_id, question_code, answer, answered_at)
  VALUES
    (techstartup_assessment_id, techstartup_id, 'e1', '{"selected": "e1d"}'::jsonb, NOW() - INTERVAL '10 days'),
    (techstartup_assessment_id, techstartup_id, 'e2', '{"selected": "e2a"}'::jsonb, NOW() - INTERVAL '10 days'),
    (techstartup_assessment_id, techstartup_id, 'e3', '{"selected": "e3a"}'::jsonb, NOW() - INTERVAL '10 days'),
    (techstartup_assessment_id, techstartup_id, 'e4', '{"selected": "e4d"}'::jsonb, NOW() - INTERVAL '10 days'),
    (techstartup_assessment_id, techstartup_id, 'e5', '{"value": 20}'::jsonb, NOW() - INTERVAL '10 days'),
    (techstartup_assessment_id, techstartup_id, 'e6', '{"ranking": ["e6b", "e6a", "e6e", "e6d", "e6c", "e6f"]}'::jsonb, NOW() - INTERVAL '10 days'),
    (techstartup_assessment_id, techstartup_id, 'e7', '{"selected": "e7a"}'::jsonb, NOW() - INTERVAL '10 days'),
    (techstartup_assessment_id, techstartup_id, 'e8', '{"selected": "e8b"}'::jsonb, NOW() - INTERVAL '10 days'),
    (techstartup_assessment_id, techstartup_id, 'e9', '{"selected": "e9b"}'::jsonb, NOW() - INTERVAL '10 days'),
    (techstartup_assessment_id, techstartup_id, 'e10', '{"value": 85}'::jsonb, NOW() - INTERVAL '10 days'),
    (techstartup_assessment_id, techstartup_id, 'e11', '{"selected": "e11d"}'::jsonb, NOW() - INTERVAL '10 days'),
    (techstartup_assessment_id, techstartup_id, 'e12', '{"text": "Shipping our first product in 3 months with a team of 4, working around the clock and celebrating with champagne."}'::jsonb, NOW() - INTERVAL '10 days'),
    (techstartup_assessment_id, techstartup_id, 'e13', '{"value": 85}'::jsonb, NOW() - INTERVAL '10 days'),
    (techstartup_assessment_id, techstartup_id, 'e14', '{"selected": "e14a"}'::jsonb, NOW() - INTERVAL '10 days'),
    (techstartup_assessment_id, techstartup_id, 'e15', '{"selected": "e15a"}'::jsonb, NOW() - INTERVAL '10 days'),
    (techstartup_assessment_id, techstartup_id, 'e16', '{"value": 90}'::jsonb, NOW() - INTERVAL '10 days')
  ON CONFLICT (assessment_id, question_code) DO NOTHING;

  -- InnovateCorp assessment responses
  INSERT INTO public.assessment_responses (assessment_id, user_id, question_code, answer, answered_at)
  VALUES
    (innovatecorp_assessment_id, innovatecorp_id, 'e1', '{"selected": "e1b"}'::jsonb, NOW() - INTERVAL '8 days'),
    (innovatecorp_assessment_id, innovatecorp_id, 'e2', '{"selected": "e2b"}'::jsonb, NOW() - INTERVAL '8 days'),
    (innovatecorp_assessment_id, innovatecorp_id, 'e3', '{"selected": "e3b"}'::jsonb, NOW() - INTERVAL '8 days'),
    (innovatecorp_assessment_id, innovatecorp_id, 'e4', '{"selected": "e4b"}'::jsonb, NOW() - INTERVAL '8 days'),
    (innovatecorp_assessment_id, innovatecorp_id, 'e5', '{"value": 45}'::jsonb, NOW() - INTERVAL '8 days'),
    (innovatecorp_assessment_id, innovatecorp_id, 'e6', '{"ranking": ["e6c", "e6e", "e6d", "e6b", "e6a", "e6f"]}'::jsonb, NOW() - INTERVAL '8 days'),
    (innovatecorp_assessment_id, innovatecorp_id, 'e7', '{"selected": "e7c"}'::jsonb, NOW() - INTERVAL '8 days'),
    (innovatecorp_assessment_id, innovatecorp_id, 'e8', '{"selected": "e8c"}'::jsonb, NOW() - INTERVAL '8 days'),
    (innovatecorp_assessment_id, innovatecorp_id, 'e9', '{"selected": "e9a"}'::jsonb, NOW() - INTERVAL '8 days'),
    (innovatecorp_assessment_id, innovatecorp_id, 'e10', '{"value": 55}'::jsonb, NOW() - INTERVAL '8 days'),
    (innovatecorp_assessment_id, innovatecorp_id, 'e11', '{"selected": "e11b"}'::jsonb, NOW() - INTERVAL '8 days'),
    (innovatecorp_assessment_id, innovatecorp_id, 'e12', '{"text": "When our entire company rallied to help a struggling team meet a deadline, without being asked."}'::jsonb, NOW() - INTERVAL '8 days'),
    (innovatecorp_assessment_id, innovatecorp_id, 'e13', '{"value": 55}'::jsonb, NOW() - INTERVAL '8 days'),
    (innovatecorp_assessment_id, innovatecorp_id, 'e14', '{"selected": "e14b"}'::jsonb, NOW() - INTERVAL '8 days'),
    (innovatecorp_assessment_id, innovatecorp_id, 'e15', '{"selected": "e15a"}'::jsonb, NOW() - INTERVAL '8 days'),
    (innovatecorp_assessment_id, innovatecorp_id, 'e16', '{"value": 65}'::jsonb, NOW() - INTERVAL '8 days')
  ON CONFLICT (assessment_id, question_code) DO NOTHING;

  -- Creative Labs assessment responses
  INSERT INTO public.assessment_responses (assessment_id, user_id, question_code, answer, answered_at)
  VALUES
    (creativelabs_assessment_id, creativelabs_id, 'e1', '{"selected": "e1c"}'::jsonb, NOW() - INTERVAL '6 days'),
    (creativelabs_assessment_id, creativelabs_id, 'e2', '{"selected": "e2d"}'::jsonb, NOW() - INTERVAL '6 days'),
    (creativelabs_assessment_id, creativelabs_id, 'e3', '{"selected": "e3b"}'::jsonb, NOW() - INTERVAL '6 days'),
    (creativelabs_assessment_id, creativelabs_id, 'e4', '{"selected": "e4b"}'::jsonb, NOW() - INTERVAL '6 days'),
    (creativelabs_assessment_id, creativelabs_id, 'e5', '{"value": 30}'::jsonb, NOW() - INTERVAL '6 days'),
    (creativelabs_assessment_id, creativelabs_id, 'e6', '{"ranking": ["e6d", "e6c", "e6b", "e6e", "e6f", "e6a"]}'::jsonb, NOW() - INTERVAL '6 days'),
    (creativelabs_assessment_id, creativelabs_id, 'e7', '{"selected": "e7c"}'::jsonb, NOW() - INTERVAL '6 days'),
    (creativelabs_assessment_id, creativelabs_id, 'e8', '{"selected": "e8d"}'::jsonb, NOW() - INTERVAL '6 days'),
    (creativelabs_assessment_id, creativelabs_id, 'e9', '{"selected": "e9b"}'::jsonb, NOW() - INTERVAL '6 days'),
    (creativelabs_assessment_id, creativelabs_id, 'e10', '{"value": 70}'::jsonb, NOW() - INTERVAL '6 days'),
    (creativelabs_assessment_id, creativelabs_id, 'e11', '{"selected": "e11c"}'::jsonb, NOW() - INTERVAL '6 days'),
    (creativelabs_assessment_id, creativelabs_id, 'e12', '{"text": "When we won our first design award and the whole team went to the ceremony together."}'::jsonb, NOW() - INTERVAL '6 days'),
    (creativelabs_assessment_id, creativelabs_id, 'e13', '{"value": 50}'::jsonb, NOW() - INTERVAL '6 days'),
    (creativelabs_assessment_id, creativelabs_id, 'e14', '{"selected": "e14b"}'::jsonb, NOW() - INTERVAL '6 days'),
    (creativelabs_assessment_id, creativelabs_id, 'e15', '{"selected": "e15a"}'::jsonb, NOW() - INTERVAL '6 days'),
    (creativelabs_assessment_id, creativelabs_id, 'e16', '{"value": 75}'::jsonb, NOW() - INTERVAL '6 days')
  ON CONFLICT (assessment_id, question_code) DO NOTHING;

  -- FinancePlus assessment responses
  INSERT INTO public.assessment_responses (assessment_id, user_id, question_code, answer, answered_at)
  VALUES
    (financeplus_assessment_id, financeplus_id, 'e1', '{"selected": "e1a"}'::jsonb, NOW() - INTERVAL '12 days'),
    (financeplus_assessment_id, financeplus_id, 'e2', '{"selected": "e2b"}'::jsonb, NOW() - INTERVAL '12 days'),
    (financeplus_assessment_id, financeplus_id, 'e3', '{"selected": "e3b"}'::jsonb, NOW() - INTERVAL '12 days'),
    (financeplus_assessment_id, financeplus_id, 'e4', '{"selected": "e4a"}'::jsonb, NOW() - INTERVAL '12 days'),
    (financeplus_assessment_id, financeplus_id, 'e5', '{"value": 80}'::jsonb, NOW() - INTERVAL '12 days'),
    (financeplus_assessment_id, financeplus_id, 'e6', '{"ranking": ["e6f", "e6d", "e6a", "e6c", "e6e", "e6b"]}'::jsonb, NOW() - INTERVAL '12 days'),
    (financeplus_assessment_id, financeplus_id, 'e7', '{"selected": "e7b"}'::jsonb, NOW() - INTERVAL '12 days'),
    (financeplus_assessment_id, financeplus_id, 'e8', '{"selected": "e8c"}'::jsonb, NOW() - INTERVAL '12 days'),
    (financeplus_assessment_id, financeplus_id, 'e9', '{"selected": "e9a"}'::jsonb, NOW() - INTERVAL '12 days'),
    (financeplus_assessment_id, financeplus_id, 'e10', '{"value": 25}'::jsonb, NOW() - INTERVAL '12 days'),
    (financeplus_assessment_id, financeplus_id, 'e11', '{"selected": "e11a"}'::jsonb, NOW() - INTERVAL '12 days'),
    (financeplus_assessment_id, financeplus_id, 'e12', '{"text": "When our compliance team caught an issue that saved the company from major regulatory fines."}'::jsonb, NOW() - INTERVAL '12 days'),
    (financeplus_assessment_id, financeplus_id, 'e13', '{"value": 35}'::jsonb, NOW() - INTERVAL '12 days'),
    (financeplus_assessment_id, financeplus_id, 'e14', '{"selected": "e14c"}'::jsonb, NOW() - INTERVAL '12 days'),
    (financeplus_assessment_id, financeplus_id, 'e15', '{"selected": "e15b"}'::jsonb, NOW() - INTERVAL '12 days'),
    (financeplus_assessment_id, financeplus_id, 'e16', '{"value": 25}'::jsonb, NOW() - INTERVAL '12 days')
  ON CONFLICT (assessment_id, question_code) DO NOTHING;

  -- HealthTech assessment responses
  INSERT INTO public.assessment_responses (assessment_id, user_id, question_code, answer, answered_at)
  VALUES
    (healthtech_assessment_id, healthtech_id, 'e1', '{"selected": "e1b"}'::jsonb, NOW() - INTERVAL '7 days'),
    (healthtech_assessment_id, healthtech_id, 'e2', '{"selected": "e2d"}'::jsonb, NOW() - INTERVAL '7 days'),
    (healthtech_assessment_id, healthtech_id, 'e3', '{"selected": "e3b"}'::jsonb, NOW() - INTERVAL '7 days'),
    (healthtech_assessment_id, healthtech_id, 'e4', '{"selected": "e4c"}'::jsonb, NOW() - INTERVAL '7 days'),
    (healthtech_assessment_id, healthtech_id, 'e5', '{"value": 40}'::jsonb, NOW() - INTERVAL '7 days'),
    (healthtech_assessment_id, healthtech_id, 'e6', '{"ranking": ["e6c", "e6f", "e6e", "e6d", "e6a", "e6b"]}'::jsonb, NOW() - INTERVAL '7 days'),
    (healthtech_assessment_id, healthtech_id, 'e7', '{"selected": "e7d"}'::jsonb, NOW() - INTERVAL '7 days'),
    (healthtech_assessment_id, healthtech_id, 'e8', '{"selected": "e8d"}'::jsonb, NOW() - INTERVAL '7 days'),
    (healthtech_assessment_id, healthtech_id, 'e9', '{"selected": "e9b"}'::jsonb, NOW() - INTERVAL '7 days'),
    (healthtech_assessment_id, healthtech_id, 'e10', '{"value": 60}'::jsonb, NOW() - INTERVAL '7 days'),
    (healthtech_assessment_id, healthtech_id, 'e11', '{"selected": "e11c"}'::jsonb, NOW() - INTERVAL '7 days'),
    (healthtech_assessment_id, healthtech_id, 'e12', '{"text": "Receiving a letter from a patient whose life was improved by our technology."}'::jsonb, NOW() - INTERVAL '7 days'),
    (healthtech_assessment_id, healthtech_id, 'e13', '{"value": 45}'::jsonb, NOW() - INTERVAL '7 days'),
    (healthtech_assessment_id, healthtech_id, 'e14', '{"selected": "e14a"}'::jsonb, NOW() - INTERVAL '7 days'),
    (healthtech_assessment_id, healthtech_id, 'e15', '{"selected": "e15a"}'::jsonb, NOW() - INTERVAL '7 days'),
    (healthtech_assessment_id, healthtech_id, 'e16', '{"value": 70}'::jsonb, NOW() - INTERVAL '7 days')
  ON CONFLICT (assessment_id, question_code) DO NOTHING;

  RAISE NOTICE 'Successfully created 9 test users (4 candidates, 5 employers)';
  RAISE NOTICE 'All users have password: TestPassword123!';
  RAISE NOTICE 'Candidate emails: sarah.johnson@test.com, marcus.williams@test.com, emily.rodriguez@test.com, david.kim@test.com';
  RAISE NOTICE 'Employer emails: hr@techstartup.test, talent@innovatecorp.test, hiring@creativelabs.test, careers@financeplus.test, people@healthtech.test';
  RAISE NOTICE 'Note: Alex Chen should already exist as a manually created test account';

END $$;

-- ============================================
-- VERIFY CREATED DATA
-- ============================================
SELECT 'Test Users Created:' as status;

SELECT 'Candidates:' as type;
SELECT u.email, p.full_name, c.headline, c.assessment_status
FROM auth.users u
JOIN public.profiles p ON p.id = u.id
LEFT JOIN public.candidates c ON c.user_id = u.id
WHERE u.email LIKE '%.%@test.com'
ORDER BY u.email;

SELECT 'Employers:' as type;
SELECT u.email, p.full_name, e.company_name, e.industry
FROM auth.users u
JOIN public.profiles p ON p.id = u.id
LEFT JOIN public.employers e ON e.user_id = u.id
WHERE u.email LIKE '%@%.test'
ORDER BY u.email;

SELECT 'Assessments:' as type;
SELECT a.assessment_type, p.full_name, a.completed_at IS NOT NULL as completed
FROM public.assessments a
JOIN public.profiles p ON p.id = a.user_id
ORDER BY a.assessment_type, p.full_name;
