-- ==========================================================
-- Seed Full Test Data: 10 Candidates + 10 Employers
-- All accounts fully populated with completed assessments
-- Password for email auth accounts: TestPassword123!
-- Google accounts: nakul0306@gmail.com (candidate), arshpatel2121@gmail.com (employer)
-- Run in Supabase SQL Editor
-- ==========================================================
CREATE EXTENSION IF NOT EXISTS pgcrypto;

DO $$
DECLARE
  -- Google account IDs (looked up dynamically)
  nakul_id uuid; arsh_id uuid;
  -- New candidate user IDs
  sarah_id uuid := gen_random_uuid(); marcus_id uuid := gen_random_uuid();
  emily_id uuid := gen_random_uuid(); david_id uuid := gen_random_uuid();
  olivia_id uuid := gen_random_uuid(); james_id uuid := gen_random_uuid();
  priya_id uuid := gen_random_uuid(); tyler_id uuid := gen_random_uuid();
  maria_id uuid := gen_random_uuid();
  -- New employer user IDs
  techstartup_id uuid := gen_random_uuid(); innovatecorp_id uuid := gen_random_uuid();
  creativelabs_id uuid := gen_random_uuid(); financeplus_id uuid := gen_random_uuid();
  healthtech_id uuid := gen_random_uuid(); greenenergy_id uuid := gen_random_uuid();
  dataflow_id uuid := gen_random_uuid(); artisan_id uuid := gen_random_uuid();
  metrobank_id uuid := gen_random_uuid();
  -- Core assessment IDs (candidate_personality / employer_culture)
  nakul_a uuid := gen_random_uuid(); sarah_a uuid := gen_random_uuid();
  marcus_a uuid := gen_random_uuid(); emily_a uuid := gen_random_uuid();
  david_a uuid := gen_random_uuid(); olivia_a uuid := gen_random_uuid();
  james_a uuid := gen_random_uuid(); priya_a uuid := gen_random_uuid();
  tyler_a uuid := gen_random_uuid(); maria_a uuid := gen_random_uuid();
  arsh_a uuid := gen_random_uuid(); techstartup_a uuid := gen_random_uuid();
  innovatecorp_a uuid := gen_random_uuid(); creativelabs_a uuid := gen_random_uuid();
  financeplus_a uuid := gen_random_uuid(); healthtech_a uuid := gen_random_uuid();
  greenenergy_a uuid := gen_random_uuid(); dataflow_a uuid := gen_random_uuid();
  artisan_a uuid := gen_random_uuid(); metrobank_a uuid := gen_random_uuid();
  -- Supplementary assessment IDs (vp/cp/sj/wv per candidate)
  nakul_vp uuid := gen_random_uuid(); nakul_cp uuid := gen_random_uuid();
  nakul_sj uuid := gen_random_uuid(); nakul_wv uuid := gen_random_uuid();
  sarah_vp uuid := gen_random_uuid(); sarah_cp uuid := gen_random_uuid();
  sarah_sj uuid := gen_random_uuid(); sarah_wv uuid := gen_random_uuid();
  marcus_vp uuid := gen_random_uuid(); marcus_cp uuid := gen_random_uuid();
  marcus_sj uuid := gen_random_uuid(); marcus_wv uuid := gen_random_uuid();
  emily_vp uuid := gen_random_uuid(); emily_cp uuid := gen_random_uuid();
  emily_sj uuid := gen_random_uuid(); emily_wv uuid := gen_random_uuid();
  david_vp uuid := gen_random_uuid(); david_cp uuid := gen_random_uuid();
  david_sj uuid := gen_random_uuid(); david_wv uuid := gen_random_uuid();
  olivia_vp uuid := gen_random_uuid(); olivia_cp uuid := gen_random_uuid();
  olivia_sj uuid := gen_random_uuid(); olivia_wv uuid := gen_random_uuid();
  james_vp uuid := gen_random_uuid(); james_cp uuid := gen_random_uuid();
  james_sj uuid := gen_random_uuid(); james_wv uuid := gen_random_uuid();
  priya_vp uuid := gen_random_uuid(); priya_cp uuid := gen_random_uuid();
  priya_sj uuid := gen_random_uuid(); priya_wv uuid := gen_random_uuid();
  tyler_vp uuid := gen_random_uuid(); tyler_cp uuid := gen_random_uuid();
  tyler_sj uuid := gen_random_uuid(); tyler_wv uuid := gen_random_uuid();
  maria_vp uuid := gen_random_uuid(); maria_cp uuid := gen_random_uuid();
  maria_sj uuid := gen_random_uuid(); maria_wv uuid := gen_random_uuid();
  pw text;
BEGIN
  pw := crypt('TestPassword123!', gen_salt('bf'));

  -- Look up existing Google OAuth accounts
  SELECT id INTO nakul_id FROM auth.users WHERE email = 'nakul0306@gmail.com';
  SELECT id INTO arsh_id FROM auth.users WHERE email = 'arshpatel2121@gmail.com';
  IF nakul_id IS NULL THEN RAISE EXCEPTION 'Google account nakul0306@gmail.com not found in auth.users'; END IF;
  IF arsh_id IS NULL THEN RAISE EXCEPTION 'Google account arshpatel2121@gmail.com not found in auth.users'; END IF;

  -- Clean up old seed test users (cascade deletes profiles, candidates, employers, assessments, etc.)
  DELETE FROM auth.users WHERE email IN (
    'sarah.johnson@test.com','marcus.williams@test.com','emily.rodriguez@test.com','david.kim@test.com',
    'olivia.nguyen@test.com','james.cooper@test.com','priya.sharma@test.com','tyler.brooks@test.com','maria.santos@test.com',
    'hr@techstartup.test','talent@innovatecorp.test','hiring@creativelabs.test','careers@financeplus.test',
    'people@healthtech.test','hr@greenenergy.test','talent@dataflow.test','hiring@artisancollective.test','careers@metrobank.test'
  );
  -- Clean existing assessment data for Google accounts (so we can re-seed)
  DELETE FROM public.assessments WHERE user_id IN (nakul_id, arsh_id);

  -- ============================================
  -- AUTH.USERS: 9 new candidates
  -- ============================================
  INSERT INTO auth.users (id,instance_id,email,encrypted_password,email_confirmed_at,raw_app_meta_data,raw_user_meta_data,aud,role,created_at,updated_at,confirmation_token,recovery_token,email_change,email_change_token_new,email_change_token_current,phone_change_token,reauthentication_token) VALUES
  (sarah_id,'00000000-0000-0000-0000-000000000000','sarah.johnson@test.com',pw,NOW(),'{"provider":"email","providers":["email"]}','{"full_name":"Sarah Johnson"}','authenticated','authenticated',NOW(),NOW(),'','','','','','',''),
  (marcus_id,'00000000-0000-0000-0000-000000000000','marcus.williams@test.com',pw,NOW(),'{"provider":"email","providers":["email"]}','{"full_name":"Marcus Williams"}','authenticated','authenticated',NOW(),NOW(),'','','','','','',''),
  (emily_id,'00000000-0000-0000-0000-000000000000','emily.rodriguez@test.com',pw,NOW(),'{"provider":"email","providers":["email"]}','{"full_name":"Emily Rodriguez"}','authenticated','authenticated',NOW(),NOW(),'','','','','','',''),
  (david_id,'00000000-0000-0000-0000-000000000000','david.kim@test.com',pw,NOW(),'{"provider":"email","providers":["email"]}','{"full_name":"David Kim"}','authenticated','authenticated',NOW(),NOW(),'','','','','','',''),
  (olivia_id,'00000000-0000-0000-0000-000000000000','olivia.nguyen@test.com',pw,NOW(),'{"provider":"email","providers":["email"]}','{"full_name":"Olivia Nguyen"}','authenticated','authenticated',NOW(),NOW(),'','','','','','',''),
  (james_id,'00000000-0000-0000-0000-000000000000','james.cooper@test.com',pw,NOW(),'{"provider":"email","providers":["email"]}','{"full_name":"James Cooper"}','authenticated','authenticated',NOW(),NOW(),'','','','','','',''),
  (priya_id,'00000000-0000-0000-0000-000000000000','priya.sharma@test.com',pw,NOW(),'{"provider":"email","providers":["email"]}','{"full_name":"Priya Sharma"}','authenticated','authenticated',NOW(),NOW(),'','','','','','',''),
  (tyler_id,'00000000-0000-0000-0000-000000000000','tyler.brooks@test.com',pw,NOW(),'{"provider":"email","providers":["email"]}','{"full_name":"Tyler Brooks"}','authenticated','authenticated',NOW(),NOW(),'','','','','','',''),
  (maria_id,'00000000-0000-0000-0000-000000000000','maria.santos@test.com',pw,NOW(),'{"provider":"email","providers":["email"]}','{"full_name":"Maria Santos"}','authenticated','authenticated',NOW(),NOW(),'','','','','','','');

  -- AUTH.USERS: 9 new employers
  INSERT INTO auth.users (id,instance_id,email,encrypted_password,email_confirmed_at,raw_app_meta_data,raw_user_meta_data,aud,role,created_at,updated_at,confirmation_token,recovery_token,email_change,email_change_token_new,email_change_token_current,phone_change_token,reauthentication_token) VALUES
  (techstartup_id,'00000000-0000-0000-0000-000000000000','hr@techstartup.test',pw,NOW(),'{"provider":"email","providers":["email"]}','{"full_name":"Alex Rivera"}','authenticated','authenticated',NOW(),NOW(),'','','','','','',''),
  (innovatecorp_id,'00000000-0000-0000-0000-000000000000','talent@innovatecorp.test',pw,NOW(),'{"provider":"email","providers":["email"]}','{"full_name":"Jordan Smith"}','authenticated','authenticated',NOW(),NOW(),'','','','','','',''),
  (creativelabs_id,'00000000-0000-0000-0000-000000000000','hiring@creativelabs.test',pw,NOW(),'{"provider":"email","providers":["email"]}','{"full_name":"Morgan Lee"}','authenticated','authenticated',NOW(),NOW(),'','','','','','',''),
  (financeplus_id,'00000000-0000-0000-0000-000000000000','careers@financeplus.test',pw,NOW(),'{"provider":"email","providers":["email"]}','{"full_name":"Taylor Chen"}','authenticated','authenticated',NOW(),NOW(),'','','','','','',''),
  (healthtech_id,'00000000-0000-0000-0000-000000000000','people@healthtech.test',pw,NOW(),'{"provider":"email","providers":["email"]}','{"full_name":"Casey Martinez"}','authenticated','authenticated',NOW(),NOW(),'','','','','','',''),
  (greenenergy_id,'00000000-0000-0000-0000-000000000000','hr@greenenergy.test',pw,NOW(),'{"provider":"email","providers":["email"]}','{"full_name":"Sam Wilson"}','authenticated','authenticated',NOW(),NOW(),'','','','','','',''),
  (dataflow_id,'00000000-0000-0000-0000-000000000000','talent@dataflow.test',pw,NOW(),'{"provider":"email","providers":["email"]}','{"full_name":"Robin Park"}','authenticated','authenticated',NOW(),NOW(),'','','','','','',''),
  (artisan_id,'00000000-0000-0000-0000-000000000000','hiring@artisancollective.test',pw,NOW(),'{"provider":"email","providers":["email"]}','{"full_name":"Jamie Torres"}','authenticated','authenticated',NOW(),NOW(),'','','','','','',''),
  (metrobank_id,'00000000-0000-0000-0000-000000000000','careers@metrobank.test',pw,NOW(),'{"provider":"email","providers":["email"]}','{"full_name":"Pat O''Brien"}','authenticated','authenticated',NOW(),NOW(),'','','','','','','');

  -- ============================================
  -- AUTH.IDENTITIES for 18 new accounts
  -- ============================================
  INSERT INTO auth.identities (id,user_id,identity_data,provider,provider_id,last_sign_in_at,created_at,updated_at) VALUES
  (gen_random_uuid(),sarah_id,jsonb_build_object('sub',sarah_id::text,'email','sarah.johnson@test.com'),'email',sarah_id::text,NOW(),NOW(),NOW()),
  (gen_random_uuid(),marcus_id,jsonb_build_object('sub',marcus_id::text,'email','marcus.williams@test.com'),'email',marcus_id::text,NOW(),NOW(),NOW()),
  (gen_random_uuid(),emily_id,jsonb_build_object('sub',emily_id::text,'email','emily.rodriguez@test.com'),'email',emily_id::text,NOW(),NOW(),NOW()),
  (gen_random_uuid(),david_id,jsonb_build_object('sub',david_id::text,'email','david.kim@test.com'),'email',david_id::text,NOW(),NOW(),NOW()),
  (gen_random_uuid(),olivia_id,jsonb_build_object('sub',olivia_id::text,'email','olivia.nguyen@test.com'),'email',olivia_id::text,NOW(),NOW(),NOW()),
  (gen_random_uuid(),james_id,jsonb_build_object('sub',james_id::text,'email','james.cooper@test.com'),'email',james_id::text,NOW(),NOW(),NOW()),
  (gen_random_uuid(),priya_id,jsonb_build_object('sub',priya_id::text,'email','priya.sharma@test.com'),'email',priya_id::text,NOW(),NOW(),NOW()),
  (gen_random_uuid(),tyler_id,jsonb_build_object('sub',tyler_id::text,'email','tyler.brooks@test.com'),'email',tyler_id::text,NOW(),NOW(),NOW()),
  (gen_random_uuid(),maria_id,jsonb_build_object('sub',maria_id::text,'email','maria.santos@test.com'),'email',maria_id::text,NOW(),NOW(),NOW()),
  (gen_random_uuid(),techstartup_id,jsonb_build_object('sub',techstartup_id::text,'email','hr@techstartup.test'),'email',techstartup_id::text,NOW(),NOW(),NOW()),
  (gen_random_uuid(),innovatecorp_id,jsonb_build_object('sub',innovatecorp_id::text,'email','talent@innovatecorp.test'),'email',innovatecorp_id::text,NOW(),NOW(),NOW()),
  (gen_random_uuid(),creativelabs_id,jsonb_build_object('sub',creativelabs_id::text,'email','hiring@creativelabs.test'),'email',creativelabs_id::text,NOW(),NOW(),NOW()),
  (gen_random_uuid(),financeplus_id,jsonb_build_object('sub',financeplus_id::text,'email','careers@financeplus.test'),'email',financeplus_id::text,NOW(),NOW(),NOW()),
  (gen_random_uuid(),healthtech_id,jsonb_build_object('sub',healthtech_id::text,'email','people@healthtech.test'),'email',healthtech_id::text,NOW(),NOW(),NOW()),
  (gen_random_uuid(),greenenergy_id,jsonb_build_object('sub',greenenergy_id::text,'email','hr@greenenergy.test'),'email',greenenergy_id::text,NOW(),NOW(),NOW()),
  (gen_random_uuid(),dataflow_id,jsonb_build_object('sub',dataflow_id::text,'email','talent@dataflow.test'),'email',dataflow_id::text,NOW(),NOW(),NOW()),
  (gen_random_uuid(),artisan_id,jsonb_build_object('sub',artisan_id::text,'email','hiring@artisancollective.test'),'email',artisan_id::text,NOW(),NOW(),NOW()),
  (gen_random_uuid(),metrobank_id,jsonb_build_object('sub',metrobank_id::text,'email','careers@metrobank.test'),'email',metrobank_id::text,NOW(),NOW(),NOW());

  -- ============================================
  -- PROFILES for all 20 accounts
  -- ============================================
  INSERT INTO public.profiles (id,email,full_name,role,onboarding_completed,created_at,updated_at) VALUES
  (nakul_id,'nakul0306@gmail.com','Nakul Patel','candidate',true,NOW(),NOW()),
  (sarah_id,'sarah.johnson@test.com','Sarah Johnson','candidate',true,NOW(),NOW()),
  (marcus_id,'marcus.williams@test.com','Marcus Williams','candidate',true,NOW(),NOW()),
  (emily_id,'emily.rodriguez@test.com','Emily Rodriguez','candidate',true,NOW(),NOW()),
  (david_id,'david.kim@test.com','David Kim','candidate',true,NOW(),NOW()),
  (olivia_id,'olivia.nguyen@test.com','Olivia Nguyen','candidate',true,NOW(),NOW()),
  (james_id,'james.cooper@test.com','James Cooper','candidate',true,NOW(),NOW()),
  (priya_id,'priya.sharma@test.com','Priya Sharma','candidate',true,NOW(),NOW()),
  (tyler_id,'tyler.brooks@test.com','Tyler Brooks','candidate',true,NOW(),NOW()),
  (maria_id,'maria.santos@test.com','Maria Santos','candidate',true,NOW(),NOW()),
  (arsh_id,'arshpatel2121@gmail.com','Arsh Patel','employer',true,NOW(),NOW()),
  (techstartup_id,'hr@techstartup.test','Alex Rivera','employer',true,NOW(),NOW()),
  (innovatecorp_id,'talent@innovatecorp.test','Jordan Smith','employer',true,NOW(),NOW()),
  (creativelabs_id,'hiring@creativelabs.test','Morgan Lee','employer',true,NOW(),NOW()),
  (financeplus_id,'careers@financeplus.test','Taylor Chen','employer',true,NOW(),NOW()),
  (healthtech_id,'people@healthtech.test','Casey Martinez','employer',true,NOW(),NOW()),
  (greenenergy_id,'hr@greenenergy.test','Sam Wilson','employer',true,NOW(),NOW()),
  (dataflow_id,'talent@dataflow.test','Robin Park','employer',true,NOW(),NOW()),
  (artisan_id,'hiring@artisancollective.test','Jamie Torres','employer',true,NOW(),NOW()),
  (metrobank_id,'careers@metrobank.test','Pat O''Brien','employer',true,NOW(),NOW())
  ON CONFLICT (id) DO UPDATE SET role=EXCLUDED.role, full_name=EXCLUDED.full_name, onboarding_completed=EXCLUDED.onboarding_completed, updated_at=NOW();

  -- ============================================
  -- USER SETTINGS for all 20
  -- ============================================
  INSERT INTO public.user_settings (user_id) VALUES
  (nakul_id),(sarah_id),(marcus_id),(emily_id),(david_id),(olivia_id),(james_id),(priya_id),(tyler_id),(maria_id),
  (arsh_id),(techstartup_id),(innovatecorp_id),(creativelabs_id),(financeplus_id),(healthtech_id),(greenenergy_id),(dataflow_id),(artisan_id),(metrobank_id)
  ON CONFLICT (user_id) DO NOTHING;

  -- ============================================
  -- CANDIDATES TABLE (10 candidates with OCEAN + supplementary data)
  -- ============================================

  -- 1. Nakul Patel - The Strategist (Google account)
  INSERT INTO public.candidates (user_id,headline,bio,location,years_experience,openness_score,conscientiousness_score,extraversion_score,agreeableness_score,neuroticism_score,top_traits,assessment_status,assessment_completed_at,preferred_work_style,preferred_company_size,salary_expectation_min,salary_expectation_max,linkedin_url,setup_step,setup_completed_at,visual_perception_data,cognitive_patterns_data,situational_judgment_data,work_values_data) VALUES (
    nakul_id,'Full-Stack Developer | React & Node.js','Versatile full-stack developer with 6 years building scalable web apps. Strategic thinker who loves architecting clean solutions. Passionate about developer experience and team productivity.','San Francisco, CA',6,
    75,85,68,72,28,ARRAY['The Strategist','The Architect'],'completed',NOW()-INTERVAL '2 days','hybrid','startup',120000,180000,'https://linkedin.com/in/nakulpatel',4,NOW(),
    '{"answers":{"vp1":"b","vp2":"a","vp3":"c","vp4":"b","vp5":"a"},"ocean_scores":{"openness":3,"conscientiousness":5,"extraversion":-2,"agreeableness":1,"neuroticism":-3},"completed_at":"2026-02-16T10:00:00Z"}'::jsonb,
    '{"answers":{"cp1":"c","cp2":"a","cp3":"b","cp4":"d","cp5":"a","cp6":"c","cp7":"b","cp8":"a"},"ocean_scores":{"openness":2,"conscientiousness":4,"extraversion":1,"agreeableness":-1,"neuroticism":-2},"completed_at":"2026-02-16T11:00:00Z"}'::jsonb,
    '{"answers":{"sj1":"b","sj2":"c","sj3":"a","sj4":"b","sj5":"d","sj6":"a","sj7":"c","sj8":"b"},"ocean_scores":{"openness":-1,"conscientiousness":3,"extraversion":2,"agreeableness":3,"neuroticism":-1},"completed_at":"2026-02-16T12:00:00Z"}'::jsonb,
    '{"answers":{"wv1":"a","wv2":"c","wv3":"b","wv4":"a","wv5":"d","wv6":"b","wv7":"c","wv8":"a"},"ocean_scores":{"openness":1,"conscientiousness":2,"extraversion":-1,"agreeableness":2,"neuroticism":-2},"completed_at":"2026-02-16T13:00:00Z"}'::jsonb
  ) ON CONFLICT (user_id) DO UPDATE SET headline=EXCLUDED.headline,bio=EXCLUDED.bio,location=EXCLUDED.location,years_experience=EXCLUDED.years_experience,openness_score=EXCLUDED.openness_score,conscientiousness_score=EXCLUDED.conscientiousness_score,extraversion_score=EXCLUDED.extraversion_score,agreeableness_score=EXCLUDED.agreeableness_score,neuroticism_score=EXCLUDED.neuroticism_score,top_traits=EXCLUDED.top_traits,assessment_status=EXCLUDED.assessment_status,assessment_completed_at=EXCLUDED.assessment_completed_at,preferred_work_style=EXCLUDED.preferred_work_style,preferred_company_size=EXCLUDED.preferred_company_size,salary_expectation_min=EXCLUDED.salary_expectation_min,salary_expectation_max=EXCLUDED.salary_expectation_max,setup_step=EXCLUDED.setup_step,setup_completed_at=EXCLUDED.setup_completed_at,visual_perception_data=EXCLUDED.visual_perception_data,cognitive_patterns_data=EXCLUDED.cognitive_patterns_data,situational_judgment_data=EXCLUDED.situational_judgment_data,work_values_data=EXCLUDED.work_values_data;

  -- 2. Sarah Johnson - The Architect
  INSERT INTO public.candidates (user_id,headline,bio,location,years_experience,openness_score,conscientiousness_score,extraversion_score,agreeableness_score,neuroticism_score,top_traits,assessment_status,assessment_completed_at,preferred_work_style,preferred_company_size,salary_expectation_min,salary_expectation_max,linkedin_url,setup_step,setup_completed_at,visual_perception_data,cognitive_patterns_data,situational_judgment_data,work_values_data) VALUES (
    sarah_id,'Product Manager | B2B SaaS Specialist','Detail-oriented PM with 8 years in enterprise software. Expert in roadmap planning, stakeholder management, and data-driven decisions.','New York, NY',8,
    65,95,72,80,30,ARRAY['The Architect','The Strategist'],'completed',NOW()-INTERVAL '5 days','hybrid','medium',140000,200000,'https://linkedin.com/in/sarahjohnson',4,NOW(),
    '{"answers":{"vp1":"c","vp2":"b","vp3":"a","vp4":"c","vp5":"b"},"ocean_scores":{"openness":-2,"conscientiousness":5,"extraversion":3,"agreeableness":2,"neuroticism":-1},"completed_at":"2026-02-13T09:00:00Z"}'::jsonb,
    '{"answers":{"cp1":"b","cp2":"c","cp3":"a","cp4":"b","cp5":"d","cp6":"a","cp7":"c","cp8":"b"},"ocean_scores":{"openness":1,"conscientiousness":6,"extraversion":-1,"agreeableness":1,"neuroticism":-2},"completed_at":"2026-02-13T10:00:00Z"}'::jsonb,
    '{"answers":{"sj1":"a","sj2":"b","sj3":"c","sj4":"a","sj5":"b","sj6":"d","sj7":"a","sj8":"c"},"ocean_scores":{"openness":2,"conscientiousness":3,"extraversion":1,"agreeableness":2,"neuroticism":-3},"completed_at":"2026-02-13T11:00:00Z"}'::jsonb,
    '{"answers":{"wv1":"b","wv2":"a","wv3":"c","wv4":"b","wv5":"a","wv6":"c","wv7":"b","wv8":"d"},"ocean_scores":{"openness":-1,"conscientiousness":4,"extraversion":2,"agreeableness":3,"neuroticism":-1},"completed_at":"2026-02-13T12:00:00Z"}'::jsonb
  ) ON CONFLICT (user_id) DO UPDATE SET headline=EXCLUDED.headline,bio=EXCLUDED.bio,location=EXCLUDED.location,years_experience=EXCLUDED.years_experience,openness_score=EXCLUDED.openness_score,conscientiousness_score=EXCLUDED.conscientiousness_score,extraversion_score=EXCLUDED.extraversion_score,agreeableness_score=EXCLUDED.agreeableness_score,neuroticism_score=EXCLUDED.neuroticism_score,top_traits=EXCLUDED.top_traits,assessment_status=EXCLUDED.assessment_status,assessment_completed_at=EXCLUDED.assessment_completed_at,preferred_work_style=EXCLUDED.preferred_work_style,preferred_company_size=EXCLUDED.preferred_company_size,salary_expectation_min=EXCLUDED.salary_expectation_min,salary_expectation_max=EXCLUDED.salary_expectation_max,setup_step=EXCLUDED.setup_step,setup_completed_at=EXCLUDED.setup_completed_at,visual_perception_data=EXCLUDED.visual_perception_data,cognitive_patterns_data=EXCLUDED.cognitive_patterns_data,situational_judgment_data=EXCLUDED.situational_judgment_data,work_values_data=EXCLUDED.work_values_data;

  -- 3. Marcus Williams - The Catalyst
  INSERT INTO public.candidates (user_id,headline,bio,location,years_experience,openness_score,conscientiousness_score,extraversion_score,agreeableness_score,neuroticism_score,top_traits,assessment_status,assessment_completed_at,preferred_work_style,preferred_company_size,salary_expectation_min,salary_expectation_max,linkedin_url,setup_step,setup_completed_at,visual_perception_data,cognitive_patterns_data,situational_judgment_data,work_values_data) VALUES (
    marcus_id,'Sales Engineer | Technical Solutions Expert','High-energy professional who loves connecting with customers and solving complex technical challenges. 5 years bridging sales and engineering.','Austin, TX',5,
    70,68,95,88,20,ARRAY['The Catalyst','The Harmonizer'],'completed',NOW()-INTERVAL '3 days','hybrid','startup',100000,150000,'https://linkedin.com/in/marcuswilliams',4,NOW(),
    '{"answers":{"vp1":"a","vp2":"c","vp3":"b","vp4":"a","vp5":"c"},"ocean_scores":{"openness":3,"conscientiousness":-2,"extraversion":5,"agreeableness":4,"neuroticism":-1},"completed_at":"2026-02-15T09:00:00Z"}'::jsonb,
    '{"answers":{"cp1":"d","cp2":"a","cp3":"c","cp4":"b","cp5":"a","cp6":"d","cp7":"a","cp8":"c"},"ocean_scores":{"openness":1,"conscientiousness":1,"extraversion":3,"agreeableness":2,"neuroticism":-2},"completed_at":"2026-02-15T10:00:00Z"}'::jsonb,
    '{"answers":{"sj1":"c","sj2":"a","sj3":"d","sj4":"c","sj5":"a","sj6":"b","sj7":"d","sj8":"a"},"ocean_scores":{"openness":2,"conscientiousness":-1,"extraversion":4,"agreeableness":3,"neuroticism":-1},"completed_at":"2026-02-15T11:00:00Z"}'::jsonb,
    '{"answers":{"wv1":"c","wv2":"b","wv3":"a","wv4":"d","wv5":"c","wv6":"a","wv7":"d","wv8":"b"},"ocean_scores":{"openness":-1,"conscientiousness":2,"extraversion":3,"agreeableness":1,"neuroticism":-3},"completed_at":"2026-02-15T12:00:00Z"}'::jsonb
  ) ON CONFLICT (user_id) DO UPDATE SET headline=EXCLUDED.headline,bio=EXCLUDED.bio,location=EXCLUDED.location,years_experience=EXCLUDED.years_experience,openness_score=EXCLUDED.openness_score,conscientiousness_score=EXCLUDED.conscientiousness_score,extraversion_score=EXCLUDED.extraversion_score,agreeableness_score=EXCLUDED.agreeableness_score,neuroticism_score=EXCLUDED.neuroticism_score,top_traits=EXCLUDED.top_traits,assessment_status=EXCLUDED.assessment_status,assessment_completed_at=EXCLUDED.assessment_completed_at,preferred_work_style=EXCLUDED.preferred_work_style,preferred_company_size=EXCLUDED.preferred_company_size,salary_expectation_min=EXCLUDED.salary_expectation_min,salary_expectation_max=EXCLUDED.salary_expectation_max,setup_step=EXCLUDED.setup_step,setup_completed_at=EXCLUDED.setup_completed_at,visual_perception_data=EXCLUDED.visual_perception_data,cognitive_patterns_data=EXCLUDED.cognitive_patterns_data,situational_judgment_data=EXCLUDED.situational_judgment_data,work_values_data=EXCLUDED.work_values_data;

  -- 4. Emily Rodriguez - The Craftsperson
  INSERT INTO public.candidates (user_id,headline,bio,location,years_experience,openness_score,conscientiousness_score,extraversion_score,agreeableness_score,neuroticism_score,top_traits,assessment_status,assessment_completed_at,preferred_work_style,preferred_company_size,salary_expectation_min,salary_expectation_max,linkedin_url,portfolio_url,setup_step,setup_completed_at,visual_perception_data,cognitive_patterns_data,situational_judgment_data,work_values_data) VALUES (
    emily_id,'UX/UI Designer | Design Systems Expert','Meticulous designer with 7 years crafting beautiful, accessible interfaces. Specialist in design systems and component libraries.','Seattle, WA',7,
    78,88,55,75,35,ARRAY['The Craftsperson','The Architect'],'completed',NOW()-INTERVAL '1 day','remote','any',110000,160000,'https://linkedin.com/in/emilyrodriguez','https://emilydesigns.com',4,NOW(),
    '{"answers":{"vp1":"b","vp2":"a","vp3":"c","vp4":"a","vp5":"b"},"ocean_scores":{"openness":4,"conscientiousness":3,"extraversion":-3,"agreeableness":2,"neuroticism":1},"completed_at":"2026-02-17T09:00:00Z"}'::jsonb,
    '{"answers":{"cp1":"a","cp2":"b","cp3":"d","cp4":"c","cp5":"b","cp6":"a","cp7":"d","cp8":"c"},"ocean_scores":{"openness":2,"conscientiousness":4,"extraversion":-1,"agreeableness":1,"neuroticism":-2},"completed_at":"2026-02-17T10:00:00Z"}'::jsonb,
    '{"answers":{"sj1":"d","sj2":"c","sj3":"b","sj4":"a","sj5":"c","sj6":"d","sj7":"b","sj8":"a"},"ocean_scores":{"openness":3,"conscientiousness":2,"extraversion":-2,"agreeableness":3,"neuroticism":1},"completed_at":"2026-02-17T11:00:00Z"}'::jsonb,
    '{"answers":{"wv1":"d","wv2":"c","wv3":"a","wv4":"b","wv5":"c","wv6":"d","wv7":"a","wv8":"b"},"ocean_scores":{"openness":1,"conscientiousness":3,"extraversion":-1,"agreeableness":2,"neuroticism":-1},"completed_at":"2026-02-17T12:00:00Z"}'::jsonb
  ) ON CONFLICT (user_id) DO UPDATE SET headline=EXCLUDED.headline,bio=EXCLUDED.bio,location=EXCLUDED.location,years_experience=EXCLUDED.years_experience,openness_score=EXCLUDED.openness_score,conscientiousness_score=EXCLUDED.conscientiousness_score,extraversion_score=EXCLUDED.extraversion_score,agreeableness_score=EXCLUDED.agreeableness_score,neuroticism_score=EXCLUDED.neuroticism_score,top_traits=EXCLUDED.top_traits,assessment_status=EXCLUDED.assessment_status,assessment_completed_at=EXCLUDED.assessment_completed_at,preferred_work_style=EXCLUDED.preferred_work_style,preferred_company_size=EXCLUDED.preferred_company_size,salary_expectation_min=EXCLUDED.salary_expectation_min,salary_expectation_max=EXCLUDED.salary_expectation_max,setup_step=EXCLUDED.setup_step,setup_completed_at=EXCLUDED.setup_completed_at,visual_perception_data=EXCLUDED.visual_perception_data,cognitive_patterns_data=EXCLUDED.cognitive_patterns_data,situational_judgment_data=EXCLUDED.situational_judgment_data,work_values_data=EXCLUDED.work_values_data;

  -- 5. David Kim - The Anchor
  INSERT INTO public.candidates (user_id,headline,bio,location,years_experience,openness_score,conscientiousness_score,extraversion_score,agreeableness_score,neuroticism_score,top_traits,assessment_status,assessment_completed_at,preferred_work_style,preferred_company_size,salary_expectation_min,salary_expectation_max,linkedin_url,setup_step,setup_completed_at,visual_perception_data,cognitive_patterns_data,situational_judgment_data,work_values_data) VALUES (
    david_id,'DevOps Engineer | Cloud Infrastructure Specialist','Reliable and methodical engineer with 10 years keeping systems running. AWS and Kubernetes certified. Values stability and clear processes.','Chicago, IL',10,
    55,90,45,82,15,ARRAY['The Anchor','The Craftsperson'],'completed',NOW()-INTERVAL '4 days','hybrid','large',150000,220000,'https://linkedin.com/in/davidkim',4,NOW(),
    '{"answers":{"vp1":"c","vp2":"b","vp3":"a","vp4":"c","vp5":"a"},"ocean_scores":{"openness":-2,"conscientiousness":4,"extraversion":-3,"agreeableness":3,"neuroticism":-2},"completed_at":"2026-02-14T09:00:00Z"}'::jsonb,
    '{"answers":{"cp1":"b","cp2":"d","cp3":"a","cp4":"c","cp5":"b","cp6":"d","cp7":"a","cp8":"b"},"ocean_scores":{"openness":-1,"conscientiousness":5,"extraversion":-2,"agreeableness":2,"neuroticism":-3},"completed_at":"2026-02-14T10:00:00Z"}'::jsonb,
    '{"answers":{"sj1":"a","sj2":"d","sj3":"c","sj4":"b","sj5":"a","sj6":"c","sj7":"d","sj8":"b"},"ocean_scores":{"openness":1,"conscientiousness":3,"extraversion":-1,"agreeableness":4,"neuroticism":-1},"completed_at":"2026-02-14T11:00:00Z"}'::jsonb,
    '{"answers":{"wv1":"b","wv2":"d","wv3":"c","wv4":"a","wv5":"b","wv6":"d","wv7":"c","wv8":"a"},"ocean_scores":{"openness":-2,"conscientiousness":4,"extraversion":1,"agreeableness":3,"neuroticism":-2},"completed_at":"2026-02-14T12:00:00Z"}'::jsonb
  ) ON CONFLICT (user_id) DO UPDATE SET headline=EXCLUDED.headline,bio=EXCLUDED.bio,location=EXCLUDED.location,years_experience=EXCLUDED.years_experience,openness_score=EXCLUDED.openness_score,conscientiousness_score=EXCLUDED.conscientiousness_score,extraversion_score=EXCLUDED.extraversion_score,agreeableness_score=EXCLUDED.agreeableness_score,neuroticism_score=EXCLUDED.neuroticism_score,top_traits=EXCLUDED.top_traits,assessment_status=EXCLUDED.assessment_status,assessment_completed_at=EXCLUDED.assessment_completed_at,preferred_work_style=EXCLUDED.preferred_work_style,preferred_company_size=EXCLUDED.preferred_company_size,salary_expectation_min=EXCLUDED.salary_expectation_min,salary_expectation_max=EXCLUDED.salary_expectation_max,setup_step=EXCLUDED.setup_step,setup_completed_at=EXCLUDED.setup_completed_at,visual_perception_data=EXCLUDED.visual_perception_data,cognitive_patterns_data=EXCLUDED.cognitive_patterns_data,situational_judgment_data=EXCLUDED.situational_judgment_data,work_values_data=EXCLUDED.work_values_data;

  -- 6. Olivia Nguyen - The Innovator
  INSERT INTO public.candidates (user_id,headline,bio,location,years_experience,openness_score,conscientiousness_score,extraversion_score,agreeableness_score,neuroticism_score,top_traits,assessment_status,assessment_completed_at,preferred_work_style,preferred_company_size,salary_expectation_min,salary_expectation_max,linkedin_url,setup_step,setup_completed_at,visual_perception_data,cognitive_patterns_data,situational_judgment_data,work_values_data) VALUES (
    olivia_id,'Data Scientist | Machine Learning Engineer','Creative data scientist with 4 years pushing boundaries in ML/AI. Love experimenting with novel approaches and finding unexpected insights in data.','Boston, MA',4,
    92,52,74,68,38,ARRAY['The Innovator','The Explorer'],'completed',NOW()-INTERVAL '6 days','remote','startup',130000,190000,'https://linkedin.com/in/olivianguyen',4,NOW(),
    '{"answers":{"vp1":"a","vp2":"c","vp3":"b","vp4":"a","vp5":"c"},"ocean_scores":{"openness":5,"conscientiousness":-3,"extraversion":2,"agreeableness":-1,"neuroticism":2},"completed_at":"2026-02-12T09:00:00Z"}'::jsonb,
    '{"answers":{"cp1":"c","cp2":"a","cp3":"d","cp4":"b","cp5":"c","cp6":"a","cp7":"d","cp8":"b"},"ocean_scores":{"openness":4,"conscientiousness":-2,"extraversion":1,"agreeableness":1,"neuroticism":-1},"completed_at":"2026-02-12T10:00:00Z"}'::jsonb,
    '{"answers":{"sj1":"b","sj2":"a","sj3":"c","sj4":"d","sj5":"b","sj6":"a","sj7":"c","sj8":"d"},"ocean_scores":{"openness":3,"conscientiousness":1,"extraversion":2,"agreeableness":-2,"neuroticism":1},"completed_at":"2026-02-12T11:00:00Z"}'::jsonb,
    '{"answers":{"wv1":"a","wv2":"d","wv3":"b","wv4":"c","wv5":"a","wv6":"d","wv7":"b","wv8":"c"},"ocean_scores":{"openness":6,"conscientiousness":-4,"extraversion":3,"agreeableness":1,"neuroticism":-1},"completed_at":"2026-02-12T12:00:00Z"}'::jsonb
  ) ON CONFLICT (user_id) DO UPDATE SET headline=EXCLUDED.headline,bio=EXCLUDED.bio,location=EXCLUDED.location,years_experience=EXCLUDED.years_experience,openness_score=EXCLUDED.openness_score,conscientiousness_score=EXCLUDED.conscientiousness_score,extraversion_score=EXCLUDED.extraversion_score,agreeableness_score=EXCLUDED.agreeableness_score,neuroticism_score=EXCLUDED.neuroticism_score,top_traits=EXCLUDED.top_traits,assessment_status=EXCLUDED.assessment_status,assessment_completed_at=EXCLUDED.assessment_completed_at,preferred_work_style=EXCLUDED.preferred_work_style,preferred_company_size=EXCLUDED.preferred_company_size,salary_expectation_min=EXCLUDED.salary_expectation_min,salary_expectation_max=EXCLUDED.salary_expectation_max,setup_step=EXCLUDED.setup_step,setup_completed_at=EXCLUDED.setup_completed_at,visual_perception_data=EXCLUDED.visual_perception_data,cognitive_patterns_data=EXCLUDED.cognitive_patterns_data,situational_judgment_data=EXCLUDED.situational_judgment_data,work_values_data=EXCLUDED.work_values_data;

  -- 7. James Cooper - The Connector
  INSERT INTO public.candidates (user_id,headline,bio,location,years_experience,openness_score,conscientiousness_score,extraversion_score,agreeableness_score,neuroticism_score,top_traits,assessment_status,assessment_completed_at,preferred_work_style,preferred_company_size,salary_expectation_min,salary_expectation_max,linkedin_url,setup_step,setup_completed_at,visual_perception_data,cognitive_patterns_data,situational_judgment_data,work_values_data) VALUES (
    james_id,'Marketing Manager | Growth & Brand Strategy','People-oriented marketing leader with 6 years building brands and communities. Thrive on cross-functional collaboration and relationship building.','Portland, OR',6,
    65,60,88,85,22,ARRAY['The Connector','The Catalyst'],'completed',NOW()-INTERVAL '7 days','flexible','small',95000,140000,'https://linkedin.com/in/jamescooper',4,NOW(),
    '{"answers":{"vp1":"c","vp2":"a","vp3":"b","vp4":"c","vp5":"a"},"ocean_scores":{"openness":1,"conscientiousness":-2,"extraversion":4,"agreeableness":3,"neuroticism":-1},"completed_at":"2026-02-11T09:00:00Z"}'::jsonb,
    '{"answers":{"cp1":"a","cp2":"c","cp3":"b","cp4":"a","cp5":"d","cp6":"c","cp7":"b","cp8":"a"},"ocean_scores":{"openness":2,"conscientiousness":1,"extraversion":3,"agreeableness":2,"neuroticism":-2},"completed_at":"2026-02-11T10:00:00Z"}'::jsonb,
    '{"answers":{"sj1":"c","sj2":"b","sj3":"a","sj4":"d","sj5":"c","sj6":"b","sj7":"a","sj8":"d"},"ocean_scores":{"openness":-1,"conscientiousness":2,"extraversion":5,"agreeableness":4,"neuroticism":1},"completed_at":"2026-02-11T11:00:00Z"}'::jsonb,
    '{"answers":{"wv1":"c","wv2":"a","wv3":"d","wv4":"b","wv5":"c","wv6":"a","wv7":"d","wv8":"b"},"ocean_scores":{"openness":1,"conscientiousness":-1,"extraversion":2,"agreeableness":3,"neuroticism":-1},"completed_at":"2026-02-11T12:00:00Z"}'::jsonb
  ) ON CONFLICT (user_id) DO UPDATE SET headline=EXCLUDED.headline,bio=EXCLUDED.bio,location=EXCLUDED.location,years_experience=EXCLUDED.years_experience,openness_score=EXCLUDED.openness_score,conscientiousness_score=EXCLUDED.conscientiousness_score,extraversion_score=EXCLUDED.extraversion_score,agreeableness_score=EXCLUDED.agreeableness_score,neuroticism_score=EXCLUDED.neuroticism_score,top_traits=EXCLUDED.top_traits,assessment_status=EXCLUDED.assessment_status,assessment_completed_at=EXCLUDED.assessment_completed_at,preferred_work_style=EXCLUDED.preferred_work_style,preferred_company_size=EXCLUDED.preferred_company_size,salary_expectation_min=EXCLUDED.salary_expectation_min,salary_expectation_max=EXCLUDED.salary_expectation_max,setup_step=EXCLUDED.setup_step,setup_completed_at=EXCLUDED.setup_completed_at,visual_perception_data=EXCLUDED.visual_perception_data,cognitive_patterns_data=EXCLUDED.cognitive_patterns_data,situational_judgment_data=EXCLUDED.situational_judgment_data,work_values_data=EXCLUDED.work_values_data;

  -- 8. Priya Sharma - The Strategist
  INSERT INTO public.candidates (user_id,headline,bio,location,years_experience,openness_score,conscientiousness_score,extraversion_score,agreeableness_score,neuroticism_score,top_traits,assessment_status,assessment_completed_at,preferred_work_style,preferred_company_size,salary_expectation_min,salary_expectation_max,linkedin_url,setup_step,setup_completed_at,visual_perception_data,cognitive_patterns_data,situational_judgment_data,work_values_data) VALUES (
    priya_id,'Software Engineer | Backend Systems','Methodical backend engineer with 5 years designing distributed systems. Strong analytical skills and a focus on performance optimization.','San Jose, CA',5,
    72,86,62,70,32,ARRAY['The Strategist','The Craftsperson'],'completed',NOW()-INTERVAL '8 days','hybrid','medium',135000,195000,'https://linkedin.com/in/priyasharma',4,NOW(),
    '{"answers":{"vp1":"b","vp2":"c","vp3":"a","vp4":"b","vp5":"c"},"ocean_scores":{"openness":2,"conscientiousness":4,"extraversion":-1,"agreeableness":1,"neuroticism":-2},"completed_at":"2026-02-10T09:00:00Z"}'::jsonb,
    '{"answers":{"cp1":"d","cp2":"b","cp3":"c","cp4":"a","cp5":"d","cp6":"b","cp7":"c","cp8":"a"},"ocean_scores":{"openness":3,"conscientiousness":3,"extraversion":1,"agreeableness":-1,"neuroticism":-1},"completed_at":"2026-02-10T10:00:00Z"}'::jsonb,
    '{"answers":{"sj1":"a","sj2":"c","sj3":"d","sj4":"b","sj5":"a","sj6":"c","sj7":"d","sj8":"b"},"ocean_scores":{"openness":-1,"conscientiousness":5,"extraversion":2,"agreeableness":2,"neuroticism":-3},"completed_at":"2026-02-10T11:00:00Z"}'::jsonb,
    '{"answers":{"wv1":"d","wv2":"b","wv3":"a","wv4":"c","wv5":"d","wv6":"b","wv7":"a","wv8":"c"},"ocean_scores":{"openness":2,"conscientiousness":2,"extraversion":-2,"agreeableness":1,"neuroticism":-1},"completed_at":"2026-02-10T12:00:00Z"}'::jsonb
  ) ON CONFLICT (user_id) DO UPDATE SET headline=EXCLUDED.headline,bio=EXCLUDED.bio,location=EXCLUDED.location,years_experience=EXCLUDED.years_experience,openness_score=EXCLUDED.openness_score,conscientiousness_score=EXCLUDED.conscientiousness_score,extraversion_score=EXCLUDED.extraversion_score,agreeableness_score=EXCLUDED.agreeableness_score,neuroticism_score=EXCLUDED.neuroticism_score,top_traits=EXCLUDED.top_traits,assessment_status=EXCLUDED.assessment_status,assessment_completed_at=EXCLUDED.assessment_completed_at,preferred_work_style=EXCLUDED.preferred_work_style,preferred_company_size=EXCLUDED.preferred_company_size,salary_expectation_min=EXCLUDED.salary_expectation_min,salary_expectation_max=EXCLUDED.salary_expectation_max,setup_step=EXCLUDED.setup_step,setup_completed_at=EXCLUDED.setup_completed_at,visual_perception_data=EXCLUDED.visual_perception_data,cognitive_patterns_data=EXCLUDED.cognitive_patterns_data,situational_judgment_data=EXCLUDED.situational_judgment_data,work_values_data=EXCLUDED.work_values_data;

  -- 9. Tyler Brooks - The Explorer
  INSERT INTO public.candidates (user_id,headline,bio,location,years_experience,openness_score,conscientiousness_score,extraversion_score,agreeableness_score,neuroticism_score,top_traits,assessment_status,assessment_completed_at,preferred_work_style,preferred_company_size,salary_expectation_min,salary_expectation_max,linkedin_url,portfolio_url,setup_step,setup_completed_at,visual_perception_data,cognitive_patterns_data,situational_judgment_data,work_values_data) VALUES (
    tyler_id,'Graphic Designer | Brand Identity Specialist','Adventurous designer with 4 years exploring visual storytelling. Always seeking new creative challenges and unconventional approaches.','Denver, CO',4,
    85,55,70,60,30,ARRAY['The Explorer','The Innovator'],'completed',NOW()-INTERVAL '9 days','remote','startup',80000,120000,'https://linkedin.com/in/tylerbrooks','https://tylerbrooks.design',4,NOW(),
    '{"answers":{"vp1":"a","vp2":"b","vp3":"c","vp4":"a","vp5":"b"},"ocean_scores":{"openness":5,"conscientiousness":-3,"extraversion":2,"agreeableness":-2,"neuroticism":1},"completed_at":"2026-02-09T09:00:00Z"}'::jsonb,
    '{"answers":{"cp1":"c","cp2":"d","cp3":"a","cp4":"b","cp5":"c","cp6":"d","cp7":"a","cp8":"b"},"ocean_scores":{"openness":3,"conscientiousness":-1,"extraversion":1,"agreeableness":1,"neuroticism":-2},"completed_at":"2026-02-09T10:00:00Z"}'::jsonb,
    '{"answers":{"sj1":"d","sj2":"a","sj3":"b","sj4":"c","sj5":"d","sj6":"a","sj7":"b","sj8":"c"},"ocean_scores":{"openness":4,"conscientiousness":-2,"extraversion":3,"agreeableness":-1,"neuroticism":1},"completed_at":"2026-02-09T11:00:00Z"}'::jsonb,
    '{"answers":{"wv1":"a","wv2":"c","wv3":"d","wv4":"b","wv5":"a","wv6":"c","wv7":"d","wv8":"b"},"ocean_scores":{"openness":6,"conscientiousness":-4,"extraversion":1,"agreeableness":2,"neuroticism":-1},"completed_at":"2026-02-09T12:00:00Z"}'::jsonb
  ) ON CONFLICT (user_id) DO UPDATE SET headline=EXCLUDED.headline,bio=EXCLUDED.bio,location=EXCLUDED.location,years_experience=EXCLUDED.years_experience,openness_score=EXCLUDED.openness_score,conscientiousness_score=EXCLUDED.conscientiousness_score,extraversion_score=EXCLUDED.extraversion_score,agreeableness_score=EXCLUDED.agreeableness_score,neuroticism_score=EXCLUDED.neuroticism_score,top_traits=EXCLUDED.top_traits,assessment_status=EXCLUDED.assessment_status,assessment_completed_at=EXCLUDED.assessment_completed_at,preferred_work_style=EXCLUDED.preferred_work_style,preferred_company_size=EXCLUDED.preferred_company_size,salary_expectation_min=EXCLUDED.salary_expectation_min,salary_expectation_max=EXCLUDED.salary_expectation_max,setup_step=EXCLUDED.setup_step,setup_completed_at=EXCLUDED.setup_completed_at,visual_perception_data=EXCLUDED.visual_perception_data,cognitive_patterns_data=EXCLUDED.cognitive_patterns_data,situational_judgment_data=EXCLUDED.situational_judgment_data,work_values_data=EXCLUDED.work_values_data;

  -- 10. Maria Santos - The Harmonizer
  INSERT INTO public.candidates (user_id,headline,bio,location,years_experience,openness_score,conscientiousness_score,extraversion_score,agreeableness_score,neuroticism_score,top_traits,assessment_status,assessment_completed_at,preferred_work_style,preferred_company_size,salary_expectation_min,salary_expectation_max,linkedin_url,setup_step,setup_completed_at,visual_perception_data,cognitive_patterns_data,situational_judgment_data,work_values_data) VALUES (
    maria_id,'Financial Analyst | Risk & Portfolio Management','Empathetic and detail-oriented analyst with 6 years in financial services. Excel at building consensus and translating complex data for stakeholders.','Miami, FL',6,
    60,75,58,90,18,ARRAY['The Harmonizer','The Anchor'],'completed',NOW()-INTERVAL '10 days','onsite','large',105000,155000,'https://linkedin.com/in/mariasantos',4,NOW(),
    '{"answers":{"vp1":"b","vp2":"a","vp3":"c","vp4":"b","vp5":"a"},"ocean_scores":{"openness":1,"conscientiousness":2,"extraversion":-1,"agreeableness":4,"neuroticism":-2},"completed_at":"2026-02-08T09:00:00Z"}'::jsonb,
    '{"answers":{"cp1":"b","cp2":"c","cp3":"a","cp4":"d","cp5":"b","cp6":"c","cp7":"a","cp8":"d"},"ocean_scores":{"openness":-1,"conscientiousness":3,"extraversion":1,"agreeableness":3,"neuroticism":-3},"completed_at":"2026-02-08T10:00:00Z"}'::jsonb,
    '{"answers":{"sj1":"c","sj2":"b","sj3":"d","sj4":"a","sj5":"c","sj6":"b","sj7":"d","sj8":"a"},"ocean_scores":{"openness":2,"conscientiousness":1,"extraversion":-2,"agreeableness":5,"neuroticism":-1},"completed_at":"2026-02-08T11:00:00Z"}'::jsonb,
    '{"answers":{"wv1":"b","wv2":"a","wv3":"c","wv4":"d","wv5":"b","wv6":"a","wv7":"c","wv8":"d"},"ocean_scores":{"openness":-1,"conscientiousness":2,"extraversion":1,"agreeableness":4,"neuroticism":-2},"completed_at":"2026-02-08T12:00:00Z"}'::jsonb
  ) ON CONFLICT (user_id) DO UPDATE SET headline=EXCLUDED.headline,bio=EXCLUDED.bio,location=EXCLUDED.location,years_experience=EXCLUDED.years_experience,openness_score=EXCLUDED.openness_score,conscientiousness_score=EXCLUDED.conscientiousness_score,extraversion_score=EXCLUDED.extraversion_score,agreeableness_score=EXCLUDED.agreeableness_score,neuroticism_score=EXCLUDED.neuroticism_score,top_traits=EXCLUDED.top_traits,assessment_status=EXCLUDED.assessment_status,assessment_completed_at=EXCLUDED.assessment_completed_at,preferred_work_style=EXCLUDED.preferred_work_style,preferred_company_size=EXCLUDED.preferred_company_size,salary_expectation_min=EXCLUDED.salary_expectation_min,salary_expectation_max=EXCLUDED.salary_expectation_max,setup_step=EXCLUDED.setup_step,setup_completed_at=EXCLUDED.setup_completed_at,visual_perception_data=EXCLUDED.visual_perception_data,cognitive_patterns_data=EXCLUDED.cognitive_patterns_data,situational_judgment_data=EXCLUDED.situational_judgment_data,work_values_data=EXCLUDED.work_values_data;

  -- ============================================
  -- EMPLOYERS TABLE (10 employers with OCEAN preferences + culture values)
  -- ============================================

  -- 1. Arsh Patel - Ember Labs (Google account)
  INSERT INTO public.employers (user_id,company_name,company_website,company_size,industry,description,location,culture_values,openness_preference,conscientiousness_preference,extraversion_preference,agreeableness_preference,neuroticism_preference,culture_quiz_completed,setup_step,setup_completed_at) VALUES (
    arsh_id,'Ember Labs','https://emberlabs.dev','1-10','Technology','Early-stage startup building AI-powered developer tools. We move fast, experiment boldly, and value creative problem-solving.','San Francisco, CA',
    ARRAY['Innovation','Speed','Autonomy','Creativity','Impact'],88,70,80,75,35,true,4,NOW()
  ) ON CONFLICT (user_id) DO UPDATE SET company_name=EXCLUDED.company_name,company_website=EXCLUDED.company_website,company_size=EXCLUDED.company_size,industry=EXCLUDED.industry,description=EXCLUDED.description,location=EXCLUDED.location,culture_values=EXCLUDED.culture_values,openness_preference=EXCLUDED.openness_preference,conscientiousness_preference=EXCLUDED.conscientiousness_preference,extraversion_preference=EXCLUDED.extraversion_preference,agreeableness_preference=EXCLUDED.agreeableness_preference,neuroticism_preference=EXCLUDED.neuroticism_preference,culture_quiz_completed=EXCLUDED.culture_quiz_completed,setup_step=EXCLUDED.setup_step,setup_completed_at=EXCLUDED.setup_completed_at;

  -- 2. TechStartup Inc
  INSERT INTO public.employers (user_id,company_name,company_website,company_size,industry,description,location,culture_values,openness_preference,conscientiousness_preference,extraversion_preference,agreeableness_preference,neuroticism_preference,culture_quiz_completed,setup_step,setup_completed_at) VALUES (
    techstartup_id,'TechStartup Inc','https://techstartup.test','1-10','Technology','Fast-moving AI startup disrupting healthcare. We value innovation, speed, and bold thinking.','San Francisco, CA',
    ARRAY['Innovation','Speed','Autonomy','Risk-taking','Creativity'],90,65,75,70,40,true,4,NOW()
  ) ON CONFLICT (user_id) DO UPDATE SET company_name=EXCLUDED.company_name,company_website=EXCLUDED.company_website,company_size=EXCLUDED.company_size,industry=EXCLUDED.industry,description=EXCLUDED.description,location=EXCLUDED.location,culture_values=EXCLUDED.culture_values,openness_preference=EXCLUDED.openness_preference,conscientiousness_preference=EXCLUDED.conscientiousness_preference,extraversion_preference=EXCLUDED.extraversion_preference,agreeableness_preference=EXCLUDED.agreeableness_preference,neuroticism_preference=EXCLUDED.neuroticism_preference,culture_quiz_completed=EXCLUDED.culture_quiz_completed,setup_step=EXCLUDED.setup_step,setup_completed_at=EXCLUDED.setup_completed_at;

  -- 3. InnovateCorp
  INSERT INTO public.employers (user_id,company_name,company_website,company_size,industry,description,location,culture_values,openness_preference,conscientiousness_preference,extraversion_preference,agreeableness_preference,neuroticism_preference,culture_quiz_completed,setup_step,setup_completed_at) VALUES (
    innovatecorp_id,'InnovateCorp','https://innovatecorp.test','51-200','Technology','Growing B2B SaaS company. We balance innovation with execution and invest in our people.','New York, NY',
    ARRAY['Balance','Growth','Collaboration','Excellence','Innovation'],75,85,70,80,30,true,4,NOW()
  ) ON CONFLICT (user_id) DO UPDATE SET company_name=EXCLUDED.company_name,company_website=EXCLUDED.company_website,company_size=EXCLUDED.company_size,industry=EXCLUDED.industry,description=EXCLUDED.description,location=EXCLUDED.location,culture_values=EXCLUDED.culture_values,openness_preference=EXCLUDED.openness_preference,conscientiousness_preference=EXCLUDED.conscientiousness_preference,extraversion_preference=EXCLUDED.extraversion_preference,agreeableness_preference=EXCLUDED.agreeableness_preference,neuroticism_preference=EXCLUDED.neuroticism_preference,culture_quiz_completed=EXCLUDED.culture_quiz_completed,setup_step=EXCLUDED.setup_step,setup_completed_at=EXCLUDED.setup_completed_at;

  -- 4. Creative Labs
  INSERT INTO public.employers (user_id,company_name,company_website,company_size,industry,description,location,culture_values,openness_preference,conscientiousness_preference,extraversion_preference,agreeableness_preference,neuroticism_preference,culture_quiz_completed,setup_step,setup_completed_at) VALUES (
    creativelabs_id,'Creative Labs','https://creativelabs.test','11-50','Media','Award-winning design agency creating beautiful digital experiences. We obsess over details and craft.','Los Angeles, CA',
    ARRAY['Creativity','Craft','Aesthetics','Collaboration','Quality'],88,82,65,78,35,true,4,NOW()
  ) ON CONFLICT (user_id) DO UPDATE SET company_name=EXCLUDED.company_name,company_website=EXCLUDED.company_website,company_size=EXCLUDED.company_size,industry=EXCLUDED.industry,description=EXCLUDED.description,location=EXCLUDED.location,culture_values=EXCLUDED.culture_values,openness_preference=EXCLUDED.openness_preference,conscientiousness_preference=EXCLUDED.conscientiousness_preference,extraversion_preference=EXCLUDED.extraversion_preference,agreeableness_preference=EXCLUDED.agreeableness_preference,neuroticism_preference=EXCLUDED.neuroticism_preference,culture_quiz_completed=EXCLUDED.culture_quiz_completed,setup_step=EXCLUDED.setup_step,setup_completed_at=EXCLUDED.setup_completed_at;

  -- 5. FinancePlus
  INSERT INTO public.employers (user_id,company_name,company_website,company_size,industry,description,location,culture_values,openness_preference,conscientiousness_preference,extraversion_preference,agreeableness_preference,neuroticism_preference,culture_quiz_completed,setup_step,setup_completed_at) VALUES (
    financeplus_id,'FinancePlus','https://financeplus.test','500+','Finance','Established financial services firm with 50+ years of history. We value stability, precision, and trust.','Boston, MA',
    ARRAY['Stability','Precision','Trust','Process','Excellence'],50,95,55,75,20,true,4,NOW()
  ) ON CONFLICT (user_id) DO UPDATE SET company_name=EXCLUDED.company_name,company_website=EXCLUDED.company_website,company_size=EXCLUDED.company_size,industry=EXCLUDED.industry,description=EXCLUDED.description,location=EXCLUDED.location,culture_values=EXCLUDED.culture_values,openness_preference=EXCLUDED.openness_preference,conscientiousness_preference=EXCLUDED.conscientiousness_preference,extraversion_preference=EXCLUDED.extraversion_preference,agreeableness_preference=EXCLUDED.agreeableness_preference,neuroticism_preference=EXCLUDED.neuroticism_preference,culture_quiz_completed=EXCLUDED.culture_quiz_completed,setup_step=EXCLUDED.setup_step,setup_completed_at=EXCLUDED.setup_completed_at;

  -- 6. HealthTech Solutions
  INSERT INTO public.employers (user_id,company_name,company_website,company_size,industry,description,location,culture_values,openness_preference,conscientiousness_preference,extraversion_preference,agreeableness_preference,neuroticism_preference,culture_quiz_completed,setup_step,setup_completed_at) VALUES (
    healthtech_id,'HealthTech Solutions','https://healthtech.test','201-500','Healthcare','Mission-driven healthcare technology company improving patient outcomes through innovation and empathy.','Denver, CO',
    ARRAY['Mission','Empathy','Innovation','Collaboration','Impact'],80,78,72,92,25,true,4,NOW()
  ) ON CONFLICT (user_id) DO UPDATE SET company_name=EXCLUDED.company_name,company_website=EXCLUDED.company_website,company_size=EXCLUDED.company_size,industry=EXCLUDED.industry,description=EXCLUDED.description,location=EXCLUDED.location,culture_values=EXCLUDED.culture_values,openness_preference=EXCLUDED.openness_preference,conscientiousness_preference=EXCLUDED.conscientiousness_preference,extraversion_preference=EXCLUDED.extraversion_preference,agreeableness_preference=EXCLUDED.agreeableness_preference,neuroticism_preference=EXCLUDED.neuroticism_preference,culture_quiz_completed=EXCLUDED.culture_quiz_completed,setup_step=EXCLUDED.setup_step,setup_completed_at=EXCLUDED.setup_completed_at;

  -- 7. GreenEnergy Co
  INSERT INTO public.employers (user_id,company_name,company_website,company_size,industry,description,location,culture_values,openness_preference,conscientiousness_preference,extraversion_preference,agreeableness_preference,neuroticism_preference,culture_quiz_completed,setup_step,setup_completed_at) VALUES (
    greenenergy_id,'GreenEnergy Co','https://greenenergy.test','11-50','Sustainability','Clean energy startup on a mission to accelerate the transition to renewable power. Passionate, collaborative team.','Austin, TX',
    ARRAY['Sustainability','Collaboration','Purpose','Innovation','Integrity'],82,74,78,88,30,true,4,NOW()
  ) ON CONFLICT (user_id) DO UPDATE SET company_name=EXCLUDED.company_name,company_website=EXCLUDED.company_website,company_size=EXCLUDED.company_size,industry=EXCLUDED.industry,description=EXCLUDED.description,location=EXCLUDED.location,culture_values=EXCLUDED.culture_values,openness_preference=EXCLUDED.openness_preference,conscientiousness_preference=EXCLUDED.conscientiousness_preference,extraversion_preference=EXCLUDED.extraversion_preference,agreeableness_preference=EXCLUDED.agreeableness_preference,neuroticism_preference=EXCLUDED.neuroticism_preference,culture_quiz_completed=EXCLUDED.culture_quiz_completed,setup_step=EXCLUDED.setup_step,setup_completed_at=EXCLUDED.setup_completed_at;

  -- 8. DataFlow Systems
  INSERT INTO public.employers (user_id,company_name,company_website,company_size,industry,description,location,culture_values,openness_preference,conscientiousness_preference,extraversion_preference,agreeableness_preference,neuroticism_preference,culture_quiz_completed,setup_step,setup_completed_at) VALUES (
    dataflow_id,'DataFlow Systems','https://dataflow.test','201-500','Enterprise SaaS','Enterprise data platform company. We build reliable, scalable infrastructure with engineering excellence.','Seattle, WA',
    ARRAY['Engineering Excellence','Reliability','Scalability','Process','Quality'],68,92,60,72,25,true,4,NOW()
  ) ON CONFLICT (user_id) DO UPDATE SET company_name=EXCLUDED.company_name,company_website=EXCLUDED.company_website,company_size=EXCLUDED.company_size,industry=EXCLUDED.industry,description=EXCLUDED.description,location=EXCLUDED.location,culture_values=EXCLUDED.culture_values,openness_preference=EXCLUDED.openness_preference,conscientiousness_preference=EXCLUDED.conscientiousness_preference,extraversion_preference=EXCLUDED.extraversion_preference,agreeableness_preference=EXCLUDED.agreeableness_preference,neuroticism_preference=EXCLUDED.neuroticism_preference,culture_quiz_completed=EXCLUDED.culture_quiz_completed,setup_step=EXCLUDED.setup_step,setup_completed_at=EXCLUDED.setup_completed_at;

  -- 9. Artisan Collective
  INSERT INTO public.employers (user_id,company_name,company_website,company_size,industry,description,location,culture_values,openness_preference,conscientiousness_preference,extraversion_preference,agreeableness_preference,neuroticism_preference,culture_quiz_completed,setup_step,setup_completed_at) VALUES (
    artisan_id,'Artisan Collective','https://artisancollective.test','1-10','Design','Boutique design studio specializing in brand identity and creative direction. Small team, big vision.','Brooklyn, NY',
    ARRAY['Creativity','Vision','Craft','Freedom','Authenticity'],95,58,72,80,40,true,4,NOW()
  ) ON CONFLICT (user_id) DO UPDATE SET company_name=EXCLUDED.company_name,company_website=EXCLUDED.company_website,company_size=EXCLUDED.company_size,industry=EXCLUDED.industry,description=EXCLUDED.description,location=EXCLUDED.location,culture_values=EXCLUDED.culture_values,openness_preference=EXCLUDED.openness_preference,conscientiousness_preference=EXCLUDED.conscientiousness_preference,extraversion_preference=EXCLUDED.extraversion_preference,agreeableness_preference=EXCLUDED.agreeableness_preference,neuroticism_preference=EXCLUDED.neuroticism_preference,culture_quiz_completed=EXCLUDED.culture_quiz_completed,setup_step=EXCLUDED.setup_step,setup_completed_at=EXCLUDED.setup_completed_at;

  -- 10. MetroBank Digital
  INSERT INTO public.employers (user_id,company_name,company_website,company_size,industry,description,location,culture_values,openness_preference,conscientiousness_preference,extraversion_preference,agreeableness_preference,neuroticism_preference,culture_quiz_completed,setup_step,setup_completed_at) VALUES (
    metrobank_id,'MetroBank Digital','https://metrobankdigital.test','500+','Fintech','Digital banking division of MetroBank. Bridging traditional finance with modern technology. Structured yet forward-thinking.','Charlotte, NC',
    ARRAY['Trust','Innovation','Compliance','Customer Focus','Reliability'],62,88,65,70,22,true,4,NOW()
  ) ON CONFLICT (user_id) DO UPDATE SET company_name=EXCLUDED.company_name,company_website=EXCLUDED.company_website,company_size=EXCLUDED.company_size,industry=EXCLUDED.industry,description=EXCLUDED.description,location=EXCLUDED.location,culture_values=EXCLUDED.culture_values,openness_preference=EXCLUDED.openness_preference,conscientiousness_preference=EXCLUDED.conscientiousness_preference,extraversion_preference=EXCLUDED.extraversion_preference,agreeableness_preference=EXCLUDED.agreeableness_preference,neuroticism_preference=EXCLUDED.neuroticism_preference,culture_quiz_completed=EXCLUDED.culture_quiz_completed,setup_step=EXCLUDED.setup_step,setup_completed_at=EXCLUDED.setup_completed_at;

  -- ============================================
  -- ASSESSMENTS: Core personality/culture assessments (20 rows)
  -- ============================================
  INSERT INTO public.assessments (id,user_id,assessment_type,started_at,completed_at,responses) VALUES
  -- 10 candidate_personality assessments
  (nakul_a,nakul_id,'candidate_personality',NOW()-INTERVAL '2 days',NOW()-INTERVAL '2 days',
   '{"c1":{"answer":"c1d","traitScores":{"organization":90,"leadership":75,"analytical":80}},"c2":{"answer":"c2b","traitScores":{"ambition":95,"independence":80,"achievement":90}},"c3":{"answer":"c3b","traitScores":{"quality":95,"patience":80,"precision":90}},"c4":{"answer":"c4b","traitScores":{"diplomacy":90,"empathy":85,"patience":80}},"c5":{"value":40},"c6":{"ranking":["c6a","c6b","c6f","c6d","c6e","c6c"]},"c7":{"answer":"c7b","traitScores":{"diplomacy":90,"respect":85,"strategy":80}},"c8":{"answer":"c8b","traitScores":{"structure":95,"planning":90,"precision":85}},"c9":{"answer":"c9a","traitScores":{"innovation":95,"risk":80,"creativity":90}},"c10":{"value":80},"c11":{"answer":"c11c","traitScores":{"strategy":90,"caution":80,"flexibility":85}},"c12":{"text":"Architecting a microservices migration that improved team velocity by 3x while maintaining zero downtime."},"c13":{"answer":"c13b","traitScores":{"expertise":95,"independence":85,"recognition":80}},"c14":{"answer":"c14a","traitScores":{"depth":95,"focus":90,"mastery":85}},"c15":{"answer":"c15b","traitScores":{"ownership":90,"problem_solving":85,"initiative":80}},"c16":{"value":45}}'::jsonb),
  (sarah_a,sarah_id,'candidate_personality',NOW()-INTERVAL '5 days',NOW()-INTERVAL '5 days',
   '{"c1":{"answer":"c1d","traitScores":{"organization":90,"leadership":75,"analytical":80}},"c2":{"answer":"c2b","traitScores":{"ambition":95,"independence":80,"achievement":90}},"c3":{"answer":"c3b","traitScores":{"quality":95,"patience":80,"precision":90}},"c4":{"answer":"c4b","traitScores":{"diplomacy":90,"empathy":85,"patience":80}},"c5":{"value":35},"c6":{"ranking":["c6b","c6a","c6c","c6f","c6d","c6e"]},"c7":{"answer":"c7b","traitScores":{"diplomacy":90,"respect":85,"strategy":80}},"c8":{"answer":"c8b","traitScores":{"structure":95,"planning":90,"precision":85}},"c9":{"answer":"c9b","traitScores":{"pragmatism":95,"reliability":85,"efficiency":80}},"c10":{"value":85},"c11":{"answer":"c11b","traitScores":{"stability":85,"mastery":90,"patience":80}},"c12":{"text":"Leading a cross-functional team to ship a major product launch on time and under budget."},"c13":{"answer":"c13c","traitScores":{"support":95,"reliability":90,"humility":85}},"c14":{"answer":"c14a","traitScores":{"depth":95,"focus":90,"mastery":85}},"c15":{"answer":"c15b","traitScores":{"ownership":90,"problem_solving":85,"initiative":80}},"c16":{"value":40}}'::jsonb),
  (marcus_a,marcus_id,'candidate_personality',NOW()-INTERVAL '3 days',NOW()-INTERVAL '3 days',
   '{"c1":{"answer":"c1a","traitScores":{"collaboration":90,"intensity":70,"leadership":80}},"c2":{"answer":"c2a","traitScores":{"collaboration":95,"structure":80,"social":90}},"c3":{"answer":"c3a","traitScores":{"speed":95,"risk":80,"action":90}},"c4":{"answer":"c4a","traitScores":{"directness":95,"courage":85,"honesty":90}},"c5":{"value":85},"c6":{"ranking":["c6e","c6a","c6b","c6d","c6f","c6c"]},"c7":{"answer":"c7a","traitScores":{"assertiveness":95,"courage":90,"directness":85}},"c8":{"answer":"c8d","traitScores":{"intensity":95,"passion":90,"impact":85}},"c9":{"answer":"c9a","traitScores":{"innovation":95,"risk":80,"creativity":90}},"c10":{"value":25},"c11":{"answer":"c11a","traitScores":{"risk":95,"growth":90,"adventure":85}},"c12":{"text":"Closing a major deal by building genuine relationships with the client team and finding creative solutions."},"c13":{"answer":"c13a","traitScores":{"leadership":95,"visibility":90,"influence":85}},"c14":{"answer":"c14b","traitScores":{"breadth":95,"curiosity":90,"versatility":85}},"c15":{"answer":"c15a","traitScores":{"honesty":95,"accountability":90,"courage":85}},"c16":{"value":75}}'::jsonb),
  (emily_a,emily_id,'candidate_personality',NOW()-INTERVAL '1 day',NOW()-INTERVAL '1 day',
   '{"c1":{"answer":"c1b","traitScores":{"independence":90,"intensity":85,"ownership":90}},"c2":{"answer":"c2d","traitScores":{"depth":90,"independence":70,"reflection":85}},"c3":{"answer":"c3b","traitScores":{"quality":95,"patience":80,"precision":90}},"c4":{"answer":"c4b","traitScores":{"diplomacy":90,"empathy":85,"patience":80}},"c5":{"value":30},"c6":{"ranking":["c6b","c6f","c6a","c6c","c6e","c6d"]},"c7":{"answer":"c7b","traitScores":{"diplomacy":90,"respect":85,"strategy":80}},"c8":{"answer":"c8b","traitScores":{"structure":95,"planning":90,"precision":85}},"c9":{"answer":"c9a","traitScores":{"innovation":95,"risk":80,"creativity":90}},"c10":{"value":70},"c11":{"answer":"c11c","traitScores":{"strategy":90,"caution":80,"flexibility":85}},"c12":{"text":"Designing a component library that the entire team loved using and made their work easier."},"c13":{"answer":"c13b","traitScores":{"expertise":95,"independence":85,"recognition":80}},"c14":{"answer":"c14a","traitScores":{"depth":95,"focus":90,"mastery":85}},"c15":{"answer":"c15b","traitScores":{"ownership":90,"problem_solving":85,"initiative":80}},"c16":{"value":35}}'::jsonb),
  (david_a,david_id,'candidate_personality',NOW()-INTERVAL '4 days',NOW()-INTERVAL '4 days',
   '{"c1":{"answer":"c1d","traitScores":{"organization":90,"leadership":75,"analytical":80}},"c2":{"answer":"c2d","traitScores":{"depth":90,"independence":70,"reflection":85}},"c3":{"answer":"c3b","traitScores":{"quality":95,"patience":80,"precision":90}},"c4":{"answer":"c4c","traitScores":{"independence":85,"avoidance":60,"efficiency":75}},"c5":{"value":25},"c6":{"ranking":["c6c","c6b","c6a","c6f","c6e","c6d"]},"c7":{"answer":"c7d","traitScores":{"trust":80,"patience":85,"adaptability":75}},"c8":{"answer":"c8c","traitScores":{"consistency":90,"iteration":85,"focus":80}},"c9":{"answer":"c9b","traitScores":{"pragmatism":95,"reliability":85,"efficiency":80}},"c10":{"value":90},"c11":{"answer":"c11b","traitScores":{"stability":85,"mastery":90,"patience":80}},"c12":{"text":"Designing a zero-downtime deployment system that kept our services running for 2 years straight."},"c13":{"answer":"c13c","traitScores":{"support":95,"reliability":90,"humility":85}},"c14":{"answer":"c14a","traitScores":{"depth":95,"focus":90,"mastery":85}},"c15":{"answer":"c15c","traitScores":{"analytical":85,"caution":80,"strategic":75}},"c16":{"value":25}}'::jsonb),
  (olivia_a,olivia_id,'candidate_personality',NOW()-INTERVAL '6 days',NOW()-INTERVAL '6 days',
   '{"c1":{"answer":"c1b","traitScores":{"independence":90,"intensity":85,"ownership":90}},"c2":{"answer":"c2c","traitScores":{"exploration":95,"independence":85,"curiosity":90}},"c3":{"answer":"c3a","traitScores":{"speed":95,"risk":80,"action":90}},"c4":{"answer":"c4a","traitScores":{"directness":95,"courage":85,"honesty":90}},"c5":{"value":55},"c6":{"ranking":["c6a","c6f","c6b","c6d","c6e","c6c"]},"c7":{"answer":"c7a","traitScores":{"assertiveness":95,"courage":90,"directness":85}},"c8":{"answer":"c8a","traitScores":{"improvisation":95,"creativity":90,"spontaneity":85}},"c9":{"answer":"c9a","traitScores":{"innovation":95,"risk":80,"creativity":90}},"c10":{"value":20},"c11":{"answer":"c11a","traitScores":{"risk":95,"growth":90,"adventure":85}},"c12":{"text":"Building a novel ML model that discovered patterns no one expected, leading to a breakthrough product feature."},"c13":{"answer":"c13b","traitScores":{"expertise":95,"independence":85,"recognition":80}},"c14":{"answer":"c14b","traitScores":{"breadth":95,"curiosity":90,"versatility":85}},"c15":{"answer":"c15b","traitScores":{"ownership":90,"problem_solving":85,"initiative":80}},"c16":{"value":65}}'::jsonb),
  (james_a,james_id,'candidate_personality',NOW()-INTERVAL '7 days',NOW()-INTERVAL '7 days',
   '{"c1":{"answer":"c1a","traitScores":{"collaboration":90,"intensity":70,"leadership":80}},"c2":{"answer":"c2a","traitScores":{"collaboration":95,"structure":80,"social":90}},"c3":{"answer":"c3a","traitScores":{"speed":95,"risk":80,"action":90}},"c4":{"answer":"c4b","traitScores":{"diplomacy":90,"empathy":85,"patience":80}},"c5":{"value":80},"c6":{"ranking":["c6e","c6b","c6a","c6d","c6c","c6f"]},"c7":{"answer":"c7c","traitScores":{"alliance":90,"consensus":85,"strategy":80}},"c8":{"answer":"c8d","traitScores":{"intensity":95,"passion":90,"impact":85}},"c9":{"answer":"c9a","traitScores":{"innovation":95,"risk":80,"creativity":90}},"c10":{"value":35},"c11":{"answer":"c11a","traitScores":{"risk":95,"growth":90,"adventure":85}},"c12":{"text":"Launching a viral marketing campaign that tripled our user base through authentic community building."},"c13":{"answer":"c13a","traitScores":{"leadership":95,"visibility":90,"influence":85}},"c14":{"answer":"c14b","traitScores":{"breadth":95,"curiosity":90,"versatility":85}},"c15":{"answer":"c15a","traitScores":{"honesty":95,"accountability":90,"courage":85}},"c16":{"value":70}}'::jsonb),
  (priya_a,priya_id,'candidate_personality',NOW()-INTERVAL '8 days',NOW()-INTERVAL '8 days',
   '{"c1":{"answer":"c1d","traitScores":{"organization":90,"leadership":75,"analytical":80}},"c2":{"answer":"c2b","traitScores":{"ambition":95,"independence":80,"achievement":90}},"c3":{"answer":"c3b","traitScores":{"quality":95,"patience":80,"precision":90}},"c4":{"answer":"c4b","traitScores":{"diplomacy":90,"empathy":85,"patience":80}},"c5":{"value":38},"c6":{"ranking":["c6a","c6b","c6c","c6f","c6d","c6e"]},"c7":{"answer":"c7b","traitScores":{"diplomacy":90,"respect":85,"strategy":80}},"c8":{"answer":"c8b","traitScores":{"structure":95,"planning":90,"precision":85}},"c9":{"answer":"c9b","traitScores":{"pragmatism":95,"reliability":85,"efficiency":80}},"c10":{"value":82},"c11":{"answer":"c11c","traitScores":{"strategy":90,"caution":80,"flexibility":85}},"c12":{"text":"Optimizing a database query pipeline that reduced API response times by 90% and saved $50K/month in infra costs."},"c13":{"answer":"c13b","traitScores":{"expertise":95,"independence":85,"recognition":80}},"c14":{"answer":"c14a","traitScores":{"depth":95,"focus":90,"mastery":85}},"c15":{"answer":"c15b","traitScores":{"ownership":90,"problem_solving":85,"initiative":80}},"c16":{"value":38}}'::jsonb),
  (tyler_a,tyler_id,'candidate_personality',NOW()-INTERVAL '9 days',NOW()-INTERVAL '9 days',
   '{"c1":{"answer":"c1b","traitScores":{"independence":90,"intensity":85,"ownership":90}},"c2":{"answer":"c2c","traitScores":{"exploration":95,"independence":85,"curiosity":90}},"c3":{"answer":"c3a","traitScores":{"speed":95,"risk":80,"action":90}},"c4":{"answer":"c4a","traitScores":{"directness":95,"courage":85,"honesty":90}},"c5":{"value":50},"c6":{"ranking":["c6f","c6a","c6b","c6e","c6d","c6c"]},"c7":{"answer":"c7a","traitScores":{"assertiveness":95,"courage":90,"directness":85}},"c8":{"answer":"c8a","traitScores":{"improvisation":95,"creativity":90,"spontaneity":85}},"c9":{"answer":"c9a","traitScores":{"innovation":95,"risk":80,"creativity":90}},"c10":{"value":22},"c11":{"answer":"c11a","traitScores":{"risk":95,"growth":90,"adventure":85}},"c12":{"text":"Creating an entire visual brand identity from scratch that perfectly captured a startup''s ethos and went viral."},"c13":{"answer":"c13b","traitScores":{"expertise":95,"independence":85,"recognition":80}},"c14":{"answer":"c14b","traitScores":{"breadth":95,"curiosity":90,"versatility":85}},"c15":{"answer":"c15a","traitScores":{"honesty":95,"accountability":90,"courage":85}},"c16":{"value":60}}'::jsonb),
  (maria_a,maria_id,'candidate_personality',NOW()-INTERVAL '10 days',NOW()-INTERVAL '10 days',
   '{"c1":{"answer":"c1a","traitScores":{"collaboration":90,"intensity":70,"leadership":80}},"c2":{"answer":"c2a","traitScores":{"collaboration":95,"structure":80,"social":90}},"c3":{"answer":"c3b","traitScores":{"quality":95,"patience":80,"precision":90}},"c4":{"answer":"c4b","traitScores":{"diplomacy":90,"empathy":85,"patience":80}},"c5":{"value":42},"c6":{"ranking":["c6c","c6e","c6b","c6a","c6f","c6d"]},"c7":{"answer":"c7b","traitScores":{"diplomacy":90,"respect":85,"strategy":80}},"c8":{"answer":"c8c","traitScores":{"consistency":90,"iteration":85,"focus":80}},"c9":{"answer":"c9b","traitScores":{"pragmatism":95,"reliability":85,"efficiency":80}},"c10":{"value":75},"c11":{"answer":"c11b","traitScores":{"stability":85,"mastery":90,"patience":80}},"c12":{"text":"Building consensus across three departments to implement a new risk framework that everyone embraced."},"c13":{"answer":"c13c","traitScores":{"support":95,"reliability":90,"humility":85}},"c14":{"answer":"c14a","traitScores":{"depth":95,"focus":90,"mastery":85}},"c15":{"answer":"c15c","traitScores":{"analytical":85,"caution":80,"strategic":75}},"c16":{"value":30}}'::jsonb);

  -- 10 employer_culture assessments
  INSERT INTO public.assessments (id,user_id,assessment_type,started_at,completed_at,responses) VALUES
  (arsh_a,arsh_id,'employer_culture',NOW()-INTERVAL '11 days',NOW()-INTERVAL '11 days',
   '{"e1":{"answer":"e1d","traitScores":{"flexibility":90,"strategic":85,"pragmatism":80}},"e2":{"answer":"e2a","traitScores":{"innovation":95,"scrappiness":90,"risk":85}},"e3":{"answer":"e3a","traitScores":{"speed":95,"autonomy":85,"action":90}},"e4":{"answer":"e4b","traitScores":{"development":90,"empathy":85,"creative_solutions":80}},"e5":{"value":22},"e6":{"ranking":["e6b","e6a","e6e","e6d","e6c","e6f"]},"e7":{"answer":"e7a","traitScores":{"risk":95,"vision":90,"boldness":85}},"e8":{"answer":"e8b","traitScores":{"creativity":95,"collaboration":90,"spontaneity":85}},"e9":{"answer":"e9b","traitScores":{"potential":95,"development":85,"optimism":80}},"e10":{"value":82},"e11":{"answer":"e11d","traitScores":{"resilience":90,"action":85,"forward":80}},"e12":{"text":"Shipping our MVP in 6 weeks with just 3 people, fueled by late-night coding sessions and shared conviction."},"e13":{"value":80},"e14":{"answer":"e14a","traitScores":{"flexibility":95,"trust":90,"results":85}},"e15":{"answer":"e15a","traitScores":{"transparency":95,"trust":90,"openness":85}},"e16":{"value":88}}'::jsonb),
  (techstartup_a,techstartup_id,'employer_culture',NOW()-INTERVAL '10 days',NOW()-INTERVAL '10 days',
   '{"e1":{"answer":"e1d","traitScores":{"flexibility":90,"strategic":85,"pragmatism":80}},"e2":{"answer":"e2a","traitScores":{"innovation":95,"scrappiness":90,"risk":85}},"e3":{"answer":"e3a","traitScores":{"speed":95,"autonomy":85,"action":90}},"e4":{"answer":"e4d","traitScores":{"decisiveness":95,"results":85,"tough_love":80}},"e5":{"value":20},"e6":{"ranking":["e6b","e6a","e6e","e6d","e6c","e6f"]},"e7":{"answer":"e7a","traitScores":{"risk":95,"vision":90,"boldness":85}},"e8":{"answer":"e8b","traitScores":{"creativity":95,"collaboration":90,"spontaneity":85}},"e9":{"answer":"e9b","traitScores":{"potential":95,"development":85,"optimism":80}},"e10":{"value":85},"e11":{"answer":"e11d","traitScores":{"resilience":90,"action":85,"forward":80}},"e12":{"text":"Shipping our first product in 3 months with a team of 4, working around the clock and celebrating with champagne."},"e13":{"value":85},"e14":{"answer":"e14a","traitScores":{"flexibility":95,"trust":90,"results":85}},"e15":{"answer":"e15a","traitScores":{"transparency":95,"trust":90,"openness":85}},"e16":{"value":90}}'::jsonb),
  (innovatecorp_a,innovatecorp_id,'employer_culture',NOW()-INTERVAL '8 days',NOW()-INTERVAL '8 days',
   '{"e1":{"answer":"e1b","traitScores":{"culture_focus":95,"development":85,"long_term":80}},"e2":{"answer":"e2b","traitScores":{"depth":95,"expertise":90,"deliberation":85}},"e3":{"answer":"e3b","traitScores":{"consensus":95,"inclusion":85,"thoroughness":80}},"e4":{"answer":"e4b","traitScores":{"development":90,"empathy":85,"creative_solutions":80}},"e5":{"value":45},"e6":{"ranking":["e6c","e6e","e6d","e6b","e6a","e6f"]},"e7":{"answer":"e7c","traitScores":{"analytical":90,"measured":85,"learning":80}},"e8":{"answer":"e8c","traitScores":{"efficiency":95,"clarity":90,"action":85}},"e9":{"answer":"e9a","traitScores":{"experience":95,"risk_averse":85,"predictability":80}},"e10":{"value":55},"e11":{"answer":"e11b","traitScores":{"analytical":90,"measured":85,"thoroughness":80}},"e12":{"text":"When our entire company rallied to help a struggling team meet a deadline, without being asked."},"e13":{"value":55},"e14":{"answer":"e14b","traitScores":{"balance":90,"pragmatism":85,"collaboration":80}},"e15":{"answer":"e15a","traitScores":{"transparency":95,"trust":90,"openness":85}},"e16":{"value":65}}'::jsonb),
  (creativelabs_a,creativelabs_id,'employer_culture',NOW()-INTERVAL '6 days',NOW()-INTERVAL '6 days',
   '{"e1":{"answer":"e1c","traitScores":{"high_bar":95,"patience":80,"perfectionism":75}},"e2":{"answer":"e2d","traitScores":{"warmth":95,"connection":90,"comfort":85}},"e3":{"answer":"e3b","traitScores":{"consensus":95,"inclusion":85,"thoroughness":80}},"e4":{"answer":"e4b","traitScores":{"development":90,"empathy":85,"creative_solutions":80}},"e5":{"value":30},"e6":{"ranking":["e6d","e6c","e6b","e6e","e6f","e6a"]},"e7":{"answer":"e7c","traitScores":{"analytical":90,"measured":85,"learning":80}},"e8":{"answer":"e8d","traitScores":{"connection":95,"storytelling":90,"warmth":85}},"e9":{"answer":"e9b","traitScores":{"potential":95,"development":85,"optimism":80}},"e10":{"value":70},"e11":{"answer":"e11c","traitScores":{"people_first":95,"empathy":90,"team":85}},"e12":{"text":"When we won our first design award and the whole team went to the ceremony together."},"e13":{"value":50},"e14":{"answer":"e14b","traitScores":{"balance":90,"pragmatism":85,"collaboration":80}},"e15":{"answer":"e15a","traitScores":{"transparency":95,"trust":90,"openness":85}},"e16":{"value":75}}'::jsonb),
  (financeplus_a,financeplus_id,'employer_culture',NOW()-INTERVAL '12 days',NOW()-INTERVAL '12 days',
   '{"e1":{"answer":"e1a","traitScores":{"skills_focus":95,"efficiency":85,"pragmatism":80}},"e2":{"answer":"e2b","traitScores":{"depth":95,"expertise":90,"deliberation":85}},"e3":{"answer":"e3b","traitScores":{"consensus":95,"inclusion":85,"thoroughness":80}},"e4":{"answer":"e4a","traitScores":{"directness":95,"fairness":85,"clarity":90}},"e5":{"value":80},"e6":{"ranking":["e6f","e6d","e6a","e6c","e6e","e6b"]},"e7":{"answer":"e7b","traitScores":{"stability":90,"prudence":85,"protection":80}},"e8":{"answer":"e8c","traitScores":{"efficiency":95,"clarity":90,"action":85}},"e9":{"answer":"e9a","traitScores":{"experience":95,"risk_averse":85,"predictability":80}},"e10":{"value":25},"e11":{"answer":"e11a","traitScores":{"accountability":95,"leadership":90,"protection":85}},"e12":{"text":"When our compliance team caught an issue that saved the company from major regulatory fines."},"e13":{"value":35},"e14":{"answer":"e14c","traitScores":{"consistency":90,"fairness":85,"culture":80}},"e15":{"answer":"e15b","traitScores":{"discretion":90,"focus":85,"protection":80}},"e16":{"value":25}}'::jsonb),
  (healthtech_a,healthtech_id,'employer_culture',NOW()-INTERVAL '7 days',NOW()-INTERVAL '7 days',
   '{"e1":{"answer":"e1b","traitScores":{"culture_focus":95,"development":85,"long_term":80}},"e2":{"answer":"e2d","traitScores":{"warmth":95,"connection":90,"comfort":85}},"e3":{"answer":"e3b","traitScores":{"consensus":95,"inclusion":85,"thoroughness":80}},"e4":{"answer":"e4c","traitScores":{"support":90,"patience":85,"investment":80}},"e5":{"value":40},"e6":{"ranking":["e6c","e6f","e6e","e6d","e6a","e6b"]},"e7":{"answer":"e7d","traitScores":{"growth":90,"ambition":85,"resourcefulness":80}},"e8":{"answer":"e8d","traitScores":{"connection":95,"storytelling":90,"warmth":85}},"e9":{"answer":"e9b","traitScores":{"potential":95,"development":85,"optimism":80}},"e10":{"value":60},"e11":{"answer":"e11c","traitScores":{"people_first":95,"empathy":90,"team":85}},"e12":{"text":"Receiving a letter from a patient whose life was improved by our technology."},"e13":{"value":45},"e14":{"answer":"e14a","traitScores":{"flexibility":95,"trust":90,"results":85}},"e15":{"answer":"e15a","traitScores":{"transparency":95,"trust":90,"openness":85}},"e16":{"value":70}}'::jsonb),
  (greenenergy_a,greenenergy_id,'employer_culture',NOW()-INTERVAL '9 days',NOW()-INTERVAL '9 days',
   '{"e1":{"answer":"e1b","traitScores":{"culture_focus":95,"development":85,"long_term":80}},"e2":{"answer":"e2a","traitScores":{"innovation":95,"scrappiness":90,"risk":85}},"e3":{"answer":"e3b","traitScores":{"consensus":95,"inclusion":85,"thoroughness":80}},"e4":{"answer":"e4c","traitScores":{"support":90,"patience":85,"investment":80}},"e5":{"value":28},"e6":{"ranking":["e6f","e6c","e6e","e6b","e6d","e6a"]},"e7":{"answer":"e7c","traitScores":{"analytical":90,"measured":85,"learning":80}},"e8":{"answer":"e8d","traitScores":{"connection":95,"storytelling":90,"warmth":85}},"e9":{"answer":"e9b","traitScores":{"potential":95,"development":85,"optimism":80}},"e10":{"value":65},"e11":{"answer":"e11c","traitScores":{"people_first":95,"empathy":90,"team":85}},"e12":{"text":"Celebrating our first solar installation with the entire team, knowing we were making a real difference."},"e13":{"value":55},"e14":{"answer":"e14a","traitScores":{"flexibility":95,"trust":90,"results":85}},"e15":{"answer":"e15a","traitScores":{"transparency":95,"trust":90,"openness":85}},"e16":{"value":72}}'::jsonb),
  (dataflow_a,dataflow_id,'employer_culture',NOW()-INTERVAL '13 days',NOW()-INTERVAL '13 days',
   '{"e1":{"answer":"e1a","traitScores":{"skills_focus":95,"efficiency":85,"pragmatism":80}},"e2":{"answer":"e2b","traitScores":{"depth":95,"expertise":90,"deliberation":85}},"e3":{"answer":"e3b","traitScores":{"consensus":95,"inclusion":85,"thoroughness":80}},"e4":{"answer":"e4a","traitScores":{"directness":95,"fairness":85,"clarity":90}},"e5":{"value":55},"e6":{"ranking":["e6d","e6a","e6c","e6f","e6e","e6b"]},"e7":{"answer":"e7b","traitScores":{"stability":90,"prudence":85,"protection":80}},"e8":{"answer":"e8c","traitScores":{"efficiency":95,"clarity":90,"action":85}},"e9":{"answer":"e9a","traitScores":{"experience":95,"risk_averse":85,"predictability":80}},"e10":{"value":40},"e11":{"answer":"e11b","traitScores":{"analytical":90,"measured":85,"thoroughness":80}},"e12":{"text":"Achieving 99.99% uptime across all our enterprise clients for an entire quarter through rigorous engineering."},"e13":{"value":40},"e14":{"answer":"e14b","traitScores":{"balance":90,"pragmatism":85,"collaboration":80}},"e15":{"answer":"e15b","traitScores":{"discretion":90,"focus":85,"protection":80}},"e16":{"value":35}}'::jsonb),
  (artisan_a,artisan_id,'employer_culture',NOW()-INTERVAL '5 days',NOW()-INTERVAL '5 days',
   '{"e1":{"answer":"e1c","traitScores":{"high_bar":95,"patience":80,"perfectionism":75}},"e2":{"answer":"e2d","traitScores":{"warmth":95,"connection":90,"comfort":85}},"e3":{"answer":"e3a","traitScores":{"speed":95,"autonomy":85,"action":90}},"e4":{"answer":"e4b","traitScores":{"development":90,"empathy":85,"creative_solutions":80}},"e5":{"value":18},"e6":{"ranking":["e6b","e6d","e6e","e6c","e6a","e6f"]},"e7":{"answer":"e7a","traitScores":{"risk":95,"vision":90,"boldness":85}},"e8":{"answer":"e8b","traitScores":{"creativity":95,"collaboration":90,"spontaneity":85}},"e9":{"answer":"e9b","traitScores":{"potential":95,"development":85,"optimism":80}},"e10":{"value":75},"e11":{"answer":"e11d","traitScores":{"resilience":90,"action":85,"forward":80}},"e12":{"text":"When a client cried seeing the brand identity we created because it captured their vision perfectly."},"e13":{"value":60},"e14":{"answer":"e14a","traitScores":{"flexibility":95,"trust":90,"results":85}},"e15":{"answer":"e15a","traitScores":{"transparency":95,"trust":90,"openness":85}},"e16":{"value":82}}'::jsonb),
  (metrobank_a,metrobank_id,'employer_culture',NOW()-INTERVAL '14 days',NOW()-INTERVAL '14 days',
   '{"e1":{"answer":"e1d","traitScores":{"flexibility":90,"strategic":85,"pragmatism":80}},"e2":{"answer":"e2b","traitScores":{"depth":95,"expertise":90,"deliberation":85}},"e3":{"answer":"e3b","traitScores":{"consensus":95,"inclusion":85,"thoroughness":80}},"e4":{"answer":"e4a","traitScores":{"directness":95,"fairness":85,"clarity":90}},"e5":{"value":65},"e6":{"ranking":["e6f","e6d","e6c","e6a","e6e","e6b"]},"e7":{"answer":"e7c","traitScores":{"analytical":90,"measured":85,"learning":80}},"e8":{"answer":"e8c","traitScores":{"efficiency":95,"clarity":90,"action":85}},"e9":{"answer":"e9a","traitScores":{"experience":95,"risk_averse":85,"predictability":80}},"e10":{"value":35},"e11":{"answer":"e11b","traitScores":{"analytical":90,"measured":85,"thoroughness":80}},"e12":{"text":"Launching our mobile banking app that surpassed 1M downloads in the first month through careful planning and execution."},"e13":{"value":42},"e14":{"answer":"e14b","traitScores":{"balance":90,"pragmatism":85,"collaboration":80}},"e15":{"answer":"e15b","traitScores":{"discretion":90,"focus":85,"protection":80}},"e16":{"value":48}}'::jsonb)
  ON CONFLICT DO NOTHING;

  -- ============================================
  -- SUPPLEMENTARY ASSESSMENTS for 10 candidates (4 each = 40 rows)
  -- ============================================
  INSERT INTO public.assessments (id,user_id,assessment_type,started_at,completed_at) VALUES
  (nakul_vp,nakul_id,'visual_perception',NOW()-INTERVAL '2 days',NOW()-INTERVAL '2 days'),
  (nakul_cp,nakul_id,'cognitive_patterns',NOW()-INTERVAL '2 days',NOW()-INTERVAL '2 days'),
  (nakul_sj,nakul_id,'situational_judgment',NOW()-INTERVAL '2 days',NOW()-INTERVAL '2 days'),
  (nakul_wv,nakul_id,'work_values',NOW()-INTERVAL '2 days',NOW()-INTERVAL '2 days'),
  (sarah_vp,sarah_id,'visual_perception',NOW()-INTERVAL '5 days',NOW()-INTERVAL '5 days'),
  (sarah_cp,sarah_id,'cognitive_patterns',NOW()-INTERVAL '5 days',NOW()-INTERVAL '5 days'),
  (sarah_sj,sarah_id,'situational_judgment',NOW()-INTERVAL '5 days',NOW()-INTERVAL '5 days'),
  (sarah_wv,sarah_id,'work_values',NOW()-INTERVAL '5 days',NOW()-INTERVAL '5 days'),
  (marcus_vp,marcus_id,'visual_perception',NOW()-INTERVAL '3 days',NOW()-INTERVAL '3 days'),
  (marcus_cp,marcus_id,'cognitive_patterns',NOW()-INTERVAL '3 days',NOW()-INTERVAL '3 days'),
  (marcus_sj,marcus_id,'situational_judgment',NOW()-INTERVAL '3 days',NOW()-INTERVAL '3 days'),
  (marcus_wv,marcus_id,'work_values',NOW()-INTERVAL '3 days',NOW()-INTERVAL '3 days'),
  (emily_vp,emily_id,'visual_perception',NOW()-INTERVAL '1 day',NOW()-INTERVAL '1 day'),
  (emily_cp,emily_id,'cognitive_patterns',NOW()-INTERVAL '1 day',NOW()-INTERVAL '1 day'),
  (emily_sj,emily_id,'situational_judgment',NOW()-INTERVAL '1 day',NOW()-INTERVAL '1 day'),
  (emily_wv,emily_id,'work_values',NOW()-INTERVAL '1 day',NOW()-INTERVAL '1 day'),
  (david_vp,david_id,'visual_perception',NOW()-INTERVAL '4 days',NOW()-INTERVAL '4 days'),
  (david_cp,david_id,'cognitive_patterns',NOW()-INTERVAL '4 days',NOW()-INTERVAL '4 days'),
  (david_sj,david_id,'situational_judgment',NOW()-INTERVAL '4 days',NOW()-INTERVAL '4 days'),
  (david_wv,david_id,'work_values',NOW()-INTERVAL '4 days',NOW()-INTERVAL '4 days'),
  (olivia_vp,olivia_id,'visual_perception',NOW()-INTERVAL '6 days',NOW()-INTERVAL '6 days'),
  (olivia_cp,olivia_id,'cognitive_patterns',NOW()-INTERVAL '6 days',NOW()-INTERVAL '6 days'),
  (olivia_sj,olivia_id,'situational_judgment',NOW()-INTERVAL '6 days',NOW()-INTERVAL '6 days'),
  (olivia_wv,olivia_id,'work_values',NOW()-INTERVAL '6 days',NOW()-INTERVAL '6 days'),
  (james_vp,james_id,'visual_perception',NOW()-INTERVAL '7 days',NOW()-INTERVAL '7 days'),
  (james_cp,james_id,'cognitive_patterns',NOW()-INTERVAL '7 days',NOW()-INTERVAL '7 days'),
  (james_sj,james_id,'situational_judgment',NOW()-INTERVAL '7 days',NOW()-INTERVAL '7 days'),
  (james_wv,james_id,'work_values',NOW()-INTERVAL '7 days',NOW()-INTERVAL '7 days'),
  (priya_vp,priya_id,'visual_perception',NOW()-INTERVAL '8 days',NOW()-INTERVAL '8 days'),
  (priya_cp,priya_id,'cognitive_patterns',NOW()-INTERVAL '8 days',NOW()-INTERVAL '8 days'),
  (priya_sj,priya_id,'situational_judgment',NOW()-INTERVAL '8 days',NOW()-INTERVAL '8 days'),
  (priya_wv,priya_id,'work_values',NOW()-INTERVAL '8 days',NOW()-INTERVAL '8 days'),
  (tyler_vp,tyler_id,'visual_perception',NOW()-INTERVAL '9 days',NOW()-INTERVAL '9 days'),
  (tyler_cp,tyler_id,'cognitive_patterns',NOW()-INTERVAL '9 days',NOW()-INTERVAL '9 days'),
  (tyler_sj,tyler_id,'situational_judgment',NOW()-INTERVAL '9 days',NOW()-INTERVAL '9 days'),
  (tyler_wv,tyler_id,'work_values',NOW()-INTERVAL '9 days',NOW()-INTERVAL '9 days'),
  (maria_vp,maria_id,'visual_perception',NOW()-INTERVAL '10 days',NOW()-INTERVAL '10 days'),
  (maria_cp,maria_id,'cognitive_patterns',NOW()-INTERVAL '10 days',NOW()-INTERVAL '10 days'),
  (maria_sj,maria_id,'situational_judgment',NOW()-INTERVAL '10 days',NOW()-INTERVAL '10 days'),
  (maria_wv,maria_id,'work_values',NOW()-INTERVAL '10 days',NOW()-INTERVAL '10 days')
  ON CONFLICT DO NOTHING;

  -- ============================================
  -- ASSESSMENT RESPONSES: 10 candidates (c1-c16 each)
  -- ============================================
  INSERT INTO public.assessment_responses (assessment_id, user_id, question_code, answer, answered_at) VALUES
  -- Nakul (2 days ago)
  (nakul_a, nakul_id, 'c1', '{"selected": "c1d"}', NOW() - INTERVAL '2 days'),
  (nakul_a, nakul_id, 'c2', '{"selected": "c2b"}', NOW() - INTERVAL '2 days'),
  (nakul_a, nakul_id, 'c3', '{"selected": "c3b"}', NOW() - INTERVAL '2 days'),
  (nakul_a, nakul_id, 'c4', '{"selected": "c4b"}', NOW() - INTERVAL '2 days'),
  (nakul_a, nakul_id, 'c5', '{"value": 40}', NOW() - INTERVAL '2 days'),
  (nakul_a, nakul_id, 'c6', '{"ranking": ["c6a","c6b","c6f","c6d","c6e","c6c"]}', NOW() - INTERVAL '2 days'),
  (nakul_a, nakul_id, 'c7', '{"selected": "c7b"}', NOW() - INTERVAL '2 days'),
  (nakul_a, nakul_id, 'c8', '{"selected": "c8b"}', NOW() - INTERVAL '2 days'),
  (nakul_a, nakul_id, 'c9', '{"selected": "c9a"}', NOW() - INTERVAL '2 days'),
  (nakul_a, nakul_id, 'c10', '{"value": 80}', NOW() - INTERVAL '2 days'),
  (nakul_a, nakul_id, 'c11', '{"selected": "c11c"}', NOW() - INTERVAL '2 days'),
  (nakul_a, nakul_id, 'c12', '{"text": "Architecting a microservices migration that improved team velocity by 3x."}', NOW() - INTERVAL '2 days'),
  (nakul_a, nakul_id, 'c13', '{"selected": "c13b"}', NOW() - INTERVAL '2 days'),
  (nakul_a, nakul_id, 'c14', '{"selected": "c14a"}', NOW() - INTERVAL '2 days'),
  (nakul_a, nakul_id, 'c15', '{"selected": "c15b"}', NOW() - INTERVAL '2 days'),
  (nakul_a, nakul_id, 'c16', '{"value": 45}', NOW() - INTERVAL '2 days'),
  -- Sarah (5 days ago)
  (sarah_a, sarah_id, 'c1', '{"selected": "c1d"}', NOW() - INTERVAL '5 days'),
  (sarah_a, sarah_id, 'c2', '{"selected": "c2b"}', NOW() - INTERVAL '5 days'),
  (sarah_a, sarah_id, 'c3', '{"selected": "c3b"}', NOW() - INTERVAL '5 days'),
  (sarah_a, sarah_id, 'c4', '{"selected": "c4b"}', NOW() - INTERVAL '5 days'),
  (sarah_a, sarah_id, 'c5', '{"value": 35}', NOW() - INTERVAL '5 days'),
  (sarah_a, sarah_id, 'c6', '{"ranking": ["c6b","c6a","c6c","c6f","c6d","c6e"]}', NOW() - INTERVAL '5 days'),
  (sarah_a, sarah_id, 'c7', '{"selected": "c7b"}', NOW() - INTERVAL '5 days'),
  (sarah_a, sarah_id, 'c8', '{"selected": "c8b"}', NOW() - INTERVAL '5 days'),
  (sarah_a, sarah_id, 'c9', '{"selected": "c9b"}', NOW() - INTERVAL '5 days'),
  (sarah_a, sarah_id, 'c10', '{"value": 85}', NOW() - INTERVAL '5 days'),
  (sarah_a, sarah_id, 'c11', '{"selected": "c11b"}', NOW() - INTERVAL '5 days'),
  (sarah_a, sarah_id, 'c12', '{"text": "Leading a cross-functional team to ship a major product launch on time."}', NOW() - INTERVAL '5 days'),
  (sarah_a, sarah_id, 'c13', '{"selected": "c13c"}', NOW() - INTERVAL '5 days'),
  (sarah_a, sarah_id, 'c14', '{"selected": "c14a"}', NOW() - INTERVAL '5 days'),
  (sarah_a, sarah_id, 'c15', '{"selected": "c15b"}', NOW() - INTERVAL '5 days'),
  (sarah_a, sarah_id, 'c16', '{"value": 40}', NOW() - INTERVAL '5 days'),
  -- Marcus (3 days ago)
  (marcus_a, marcus_id, 'c1', '{"selected": "c1a"}', NOW() - INTERVAL '3 days'),
  (marcus_a, marcus_id, 'c2', '{"selected": "c2a"}', NOW() - INTERVAL '3 days'),
  (marcus_a, marcus_id, 'c3', '{"selected": "c3a"}', NOW() - INTERVAL '3 days'),
  (marcus_a, marcus_id, 'c4', '{"selected": "c4a"}', NOW() - INTERVAL '3 days'),
  (marcus_a, marcus_id, 'c5', '{"value": 85}', NOW() - INTERVAL '3 days'),
  (marcus_a, marcus_id, 'c6', '{"ranking": ["c6e","c6a","c6b","c6d","c6f","c6c"]}', NOW() - INTERVAL '3 days'),
  (marcus_a, marcus_id, 'c7', '{"selected": "c7a"}', NOW() - INTERVAL '3 days'),
  (marcus_a, marcus_id, 'c8', '{"selected": "c8d"}', NOW() - INTERVAL '3 days'),
  (marcus_a, marcus_id, 'c9', '{"selected": "c9a"}', NOW() - INTERVAL '3 days'),
  (marcus_a, marcus_id, 'c10', '{"value": 25}', NOW() - INTERVAL '3 days'),
  (marcus_a, marcus_id, 'c11', '{"selected": "c11a"}', NOW() - INTERVAL '3 days'),
  (marcus_a, marcus_id, 'c12', '{"text": "Closing a major deal by building genuine relationships with the client team."}', NOW() - INTERVAL '3 days'),
  (marcus_a, marcus_id, 'c13', '{"selected": "c13a"}', NOW() - INTERVAL '3 days'),
  (marcus_a, marcus_id, 'c14', '{"selected": "c14b"}', NOW() - INTERVAL '3 days'),
  (marcus_a, marcus_id, 'c15', '{"selected": "c15a"}', NOW() - INTERVAL '3 days'),
  (marcus_a, marcus_id, 'c16', '{"value": 75}', NOW() - INTERVAL '3 days'),
  -- Emily (1 day ago)
  (emily_a, emily_id, 'c1', '{"selected": "c1b"}', NOW() - INTERVAL '1 day'),
  (emily_a, emily_id, 'c2', '{"selected": "c2d"}', NOW() - INTERVAL '1 day'),
  (emily_a, emily_id, 'c3', '{"selected": "c3b"}', NOW() - INTERVAL '1 day'),
  (emily_a, emily_id, 'c4', '{"selected": "c4b"}', NOW() - INTERVAL '1 day'),
  (emily_a, emily_id, 'c5', '{"value": 30}', NOW() - INTERVAL '1 day'),
  (emily_a, emily_id, 'c6', '{"ranking": ["c6b","c6f","c6a","c6c","c6e","c6d"]}', NOW() - INTERVAL '1 day'),
  (emily_a, emily_id, 'c7', '{"selected": "c7b"}', NOW() - INTERVAL '1 day'),
  (emily_a, emily_id, 'c8', '{"selected": "c8b"}', NOW() - INTERVAL '1 day'),
  (emily_a, emily_id, 'c9', '{"selected": "c9a"}', NOW() - INTERVAL '1 day'),
  (emily_a, emily_id, 'c10', '{"value": 70}', NOW() - INTERVAL '1 day'),
  (emily_a, emily_id, 'c11', '{"selected": "c11c"}', NOW() - INTERVAL '1 day'),
  (emily_a, emily_id, 'c12', '{"text": "Designing a component library that the entire team loved using."}', NOW() - INTERVAL '1 day'),
  (emily_a, emily_id, 'c13', '{"selected": "c13b"}', NOW() - INTERVAL '1 day'),
  (emily_a, emily_id, 'c14', '{"selected": "c14a"}', NOW() - INTERVAL '1 day'),
  (emily_a, emily_id, 'c15', '{"selected": "c15b"}', NOW() - INTERVAL '1 day'),
  (emily_a, emily_id, 'c16', '{"value": 35}', NOW() - INTERVAL '1 day'),
  -- David (4 days ago)
  (david_a, david_id, 'c1', '{"selected": "c1d"}', NOW() - INTERVAL '4 days'),
  (david_a, david_id, 'c2', '{"selected": "c2d"}', NOW() - INTERVAL '4 days'),
  (david_a, david_id, 'c3', '{"selected": "c3b"}', NOW() - INTERVAL '4 days'),
  (david_a, david_id, 'c4', '{"selected": "c4c"}', NOW() - INTERVAL '4 days'),
  (david_a, david_id, 'c5', '{"value": 25}', NOW() - INTERVAL '4 days'),
  (david_a, david_id, 'c6', '{"ranking": ["c6c","c6b","c6a","c6f","c6e","c6d"]}', NOW() - INTERVAL '4 days'),
  (david_a, david_id, 'c7', '{"selected": "c7d"}', NOW() - INTERVAL '4 days'),
  (david_a, david_id, 'c8', '{"selected": "c8c"}', NOW() - INTERVAL '4 days'),
  (david_a, david_id, 'c9', '{"selected": "c9b"}', NOW() - INTERVAL '4 days'),
  (david_a, david_id, 'c10', '{"value": 90}', NOW() - INTERVAL '4 days'),
  (david_a, david_id, 'c11', '{"selected": "c11b"}', NOW() - INTERVAL '4 days'),
  (david_a, david_id, 'c12', '{"text": "Designing a zero-downtime deployment system that kept services running 2 years."}', NOW() - INTERVAL '4 days'),
  (david_a, david_id, 'c13', '{"selected": "c13c"}', NOW() - INTERVAL '4 days'),
  (david_a, david_id, 'c14', '{"selected": "c14a"}', NOW() - INTERVAL '4 days'),
  (david_a, david_id, 'c15', '{"selected": "c15c"}', NOW() - INTERVAL '4 days'),
  (david_a, david_id, 'c16', '{"value": 25}', NOW() - INTERVAL '4 days'),
  -- Olivia (6 days ago)
  (olivia_a, olivia_id, 'c1', '{"selected": "c1b"}', NOW() - INTERVAL '6 days'),
  (olivia_a, olivia_id, 'c2', '{"selected": "c2c"}', NOW() - INTERVAL '6 days'),
  (olivia_a, olivia_id, 'c3', '{"selected": "c3a"}', NOW() - INTERVAL '6 days'),
  (olivia_a, olivia_id, 'c4', '{"selected": "c4a"}', NOW() - INTERVAL '6 days'),
  (olivia_a, olivia_id, 'c5', '{"value": 55}', NOW() - INTERVAL '6 days'),
  (olivia_a, olivia_id, 'c6', '{"ranking": ["c6a","c6f","c6b","c6d","c6e","c6c"]}', NOW() - INTERVAL '6 days'),
  (olivia_a, olivia_id, 'c7', '{"selected": "c7a"}', NOW() - INTERVAL '6 days'),
  (olivia_a, olivia_id, 'c8', '{"selected": "c8a"}', NOW() - INTERVAL '6 days'),
  (olivia_a, olivia_id, 'c9', '{"selected": "c9a"}', NOW() - INTERVAL '6 days'),
  (olivia_a, olivia_id, 'c10', '{"value": 20}', NOW() - INTERVAL '6 days'),
  (olivia_a, olivia_id, 'c11', '{"selected": "c11a"}', NOW() - INTERVAL '6 days'),
  (olivia_a, olivia_id, 'c12', '{"text": "Building a novel ML model that discovered patterns no one expected."}', NOW() - INTERVAL '6 days'),
  (olivia_a, olivia_id, 'c13', '{"selected": "c13b"}', NOW() - INTERVAL '6 days'),
  (olivia_a, olivia_id, 'c14', '{"selected": "c14b"}', NOW() - INTERVAL '6 days'),
  (olivia_a, olivia_id, 'c15', '{"selected": "c15b"}', NOW() - INTERVAL '6 days'),
  (olivia_a, olivia_id, 'c16', '{"value": 65}', NOW() - INTERVAL '6 days'),
  -- James (7 days ago)
  (james_a, james_id, 'c1', '{"selected": "c1a"}', NOW() - INTERVAL '7 days'),
  (james_a, james_id, 'c2', '{"selected": "c2a"}', NOW() - INTERVAL '7 days'),
  (james_a, james_id, 'c3', '{"selected": "c3a"}', NOW() - INTERVAL '7 days'),
  (james_a, james_id, 'c4', '{"selected": "c4b"}', NOW() - INTERVAL '7 days'),
  (james_a, james_id, 'c5', '{"value": 80}', NOW() - INTERVAL '7 days'),
  (james_a, james_id, 'c6', '{"ranking": ["c6e","c6b","c6a","c6d","c6c","c6f"]}', NOW() - INTERVAL '7 days'),
  (james_a, james_id, 'c7', '{"selected": "c7c"}', NOW() - INTERVAL '7 days'),
  (james_a, james_id, 'c8', '{"selected": "c8d"}', NOW() - INTERVAL '7 days'),
  (james_a, james_id, 'c9', '{"selected": "c9a"}', NOW() - INTERVAL '7 days'),
  (james_a, james_id, 'c10', '{"value": 35}', NOW() - INTERVAL '7 days'),
  (james_a, james_id, 'c11', '{"selected": "c11a"}', NOW() - INTERVAL '7 days'),
  (james_a, james_id, 'c12', '{"text": "Launching a viral marketing campaign that tripled our user base."}', NOW() - INTERVAL '7 days'),
  (james_a, james_id, 'c13', '{"selected": "c13a"}', NOW() - INTERVAL '7 days'),
  (james_a, james_id, 'c14', '{"selected": "c14b"}', NOW() - INTERVAL '7 days'),
  (james_a, james_id, 'c15', '{"selected": "c15a"}', NOW() - INTERVAL '7 days'),
  (james_a, james_id, 'c16', '{"value": 70}', NOW() - INTERVAL '7 days'),
  -- Priya (8 days ago)
  (priya_a, priya_id, 'c1', '{"selected": "c1d"}', NOW() - INTERVAL '8 days'),
  (priya_a, priya_id, 'c2', '{"selected": "c2b"}', NOW() - INTERVAL '8 days'),
  (priya_a, priya_id, 'c3', '{"selected": "c3b"}', NOW() - INTERVAL '8 days'),
  (priya_a, priya_id, 'c4', '{"selected": "c4b"}', NOW() - INTERVAL '8 days'),
  (priya_a, priya_id, 'c5', '{"value": 38}', NOW() - INTERVAL '8 days'),
  (priya_a, priya_id, 'c6', '{"ranking": ["c6a","c6b","c6c","c6f","c6d","c6e"]}', NOW() - INTERVAL '8 days'),
  (priya_a, priya_id, 'c7', '{"selected": "c7b"}', NOW() - INTERVAL '8 days'),
  (priya_a, priya_id, 'c8', '{"selected": "c8b"}', NOW() - INTERVAL '8 days'),
  (priya_a, priya_id, 'c9', '{"selected": "c9b"}', NOW() - INTERVAL '8 days'),
  (priya_a, priya_id, 'c10', '{"value": 82}', NOW() - INTERVAL '8 days'),
  (priya_a, priya_id, 'c11', '{"selected": "c11c"}', NOW() - INTERVAL '8 days'),
  (priya_a, priya_id, 'c12', '{"text": "Optimizing a database pipeline that reduced API response times by 90%."}', NOW() - INTERVAL '8 days'),
  (priya_a, priya_id, 'c13', '{"selected": "c13b"}', NOW() - INTERVAL '8 days'),
  (priya_a, priya_id, 'c14', '{"selected": "c14a"}', NOW() - INTERVAL '8 days'),
  (priya_a, priya_id, 'c15', '{"selected": "c15b"}', NOW() - INTERVAL '8 days'),
  (priya_a, priya_id, 'c16', '{"value": 38}', NOW() - INTERVAL '8 days'),
  -- Tyler (9 days ago)
  (tyler_a, tyler_id, 'c1', '{"selected": "c1b"}', NOW() - INTERVAL '9 days'),
  (tyler_a, tyler_id, 'c2', '{"selected": "c2c"}', NOW() - INTERVAL '9 days'),
  (tyler_a, tyler_id, 'c3', '{"selected": "c3a"}', NOW() - INTERVAL '9 days'),
  (tyler_a, tyler_id, 'c4', '{"selected": "c4a"}', NOW() - INTERVAL '9 days'),
  (tyler_a, tyler_id, 'c5', '{"value": 50}', NOW() - INTERVAL '9 days'),
  (tyler_a, tyler_id, 'c6', '{"ranking": ["c6f","c6a","c6b","c6e","c6d","c6c"]}', NOW() - INTERVAL '9 days'),
  (tyler_a, tyler_id, 'c7', '{"selected": "c7a"}', NOW() - INTERVAL '9 days'),
  (tyler_a, tyler_id, 'c8', '{"selected": "c8a"}', NOW() - INTERVAL '9 days'),
  (tyler_a, tyler_id, 'c9', '{"selected": "c9a"}', NOW() - INTERVAL '9 days'),
  (tyler_a, tyler_id, 'c10', '{"value": 22}', NOW() - INTERVAL '9 days'),
  (tyler_a, tyler_id, 'c11', '{"selected": "c11a"}', NOW() - INTERVAL '9 days'),
  (tyler_a, tyler_id, 'c12', '{"text": "Creating a visual brand identity from scratch that went viral."}', NOW() - INTERVAL '9 days'),
  (tyler_a, tyler_id, 'c13', '{"selected": "c13b"}', NOW() - INTERVAL '9 days'),
  (tyler_a, tyler_id, 'c14', '{"selected": "c14b"}', NOW() - INTERVAL '9 days'),
  (tyler_a, tyler_id, 'c15', '{"selected": "c15a"}', NOW() - INTERVAL '9 days'),
  (tyler_a, tyler_id, 'c16', '{"value": 60}', NOW() - INTERVAL '9 days'),
  -- Maria (10 days ago)
  (maria_a, maria_id, 'c1', '{"selected": "c1a"}', NOW() - INTERVAL '10 days'),
  (maria_a, maria_id, 'c2', '{"selected": "c2a"}', NOW() - INTERVAL '10 days'),
  (maria_a, maria_id, 'c3', '{"selected": "c3b"}', NOW() - INTERVAL '10 days'),
  (maria_a, maria_id, 'c4', '{"selected": "c4b"}', NOW() - INTERVAL '10 days'),
  (maria_a, maria_id, 'c5', '{"value": 42}', NOW() - INTERVAL '10 days'),
  (maria_a, maria_id, 'c6', '{"ranking": ["c6c","c6e","c6b","c6a","c6f","c6d"]}', NOW() - INTERVAL '10 days'),
  (maria_a, maria_id, 'c7', '{"selected": "c7b"}', NOW() - INTERVAL '10 days'),
  (maria_a, maria_id, 'c8', '{"selected": "c8c"}', NOW() - INTERVAL '10 days'),
  (maria_a, maria_id, 'c9', '{"selected": "c9b"}', NOW() - INTERVAL '10 days'),
  (maria_a, maria_id, 'c10', '{"value": 75}', NOW() - INTERVAL '10 days'),
  (maria_a, maria_id, 'c11', '{"selected": "c11b"}', NOW() - INTERVAL '10 days'),
  (maria_a, maria_id, 'c12', '{"text": "Building consensus across departments to implement a new risk framework."}', NOW() - INTERVAL '10 days'),
  (maria_a, maria_id, 'c13', '{"selected": "c13c"}', NOW() - INTERVAL '10 days'),
  (maria_a, maria_id, 'c14', '{"selected": "c14a"}', NOW() - INTERVAL '10 days'),
  (maria_a, maria_id, 'c15', '{"selected": "c15c"}', NOW() - INTERVAL '10 days'),
  (maria_a, maria_id, 'c16', '{"value": 30}', NOW() - INTERVAL '10 days')
  ON CONFLICT (assessment_id, question_code) DO NOTHING;

  -- ============================================
  -- ASSESSMENT RESPONSES: 10 employers (e1-e16 each)
  -- ============================================
  INSERT INTO public.assessment_responses (assessment_id, user_id, question_code, answer, answered_at) VALUES
  -- Arsh / Ember Labs (11 days ago)
  (arsh_a, arsh_id, 'e1', '{"selected": "e1d"}', NOW() - INTERVAL '11 days'),
  (arsh_a, arsh_id, 'e2', '{"selected": "e2a"}', NOW() - INTERVAL '11 days'),
  (arsh_a, arsh_id, 'e3', '{"selected": "e3a"}', NOW() - INTERVAL '11 days'),
  (arsh_a, arsh_id, 'e4', '{"selected": "e4b"}', NOW() - INTERVAL '11 days'),
  (arsh_a, arsh_id, 'e5', '{"value": 22}', NOW() - INTERVAL '11 days'),
  (arsh_a, arsh_id, 'e6', '{"ranking": ["e6b","e6a","e6e","e6d","e6c","e6f"]}', NOW() - INTERVAL '11 days'),
  (arsh_a, arsh_id, 'e7', '{"selected": "e7a"}', NOW() - INTERVAL '11 days'),
  (arsh_a, arsh_id, 'e8', '{"selected": "e8b"}', NOW() - INTERVAL '11 days'),
  (arsh_a, arsh_id, 'e9', '{"selected": "e9b"}', NOW() - INTERVAL '11 days'),
  (arsh_a, arsh_id, 'e10', '{"value": 82}', NOW() - INTERVAL '11 days'),
  (arsh_a, arsh_id, 'e11', '{"selected": "e11d"}', NOW() - INTERVAL '11 days'),
  (arsh_a, arsh_id, 'e12', '{"text": "Shipping our MVP in 6 weeks with just 3 people fueled by shared conviction."}', NOW() - INTERVAL '11 days'),
  (arsh_a, arsh_id, 'e13', '{"value": 80}', NOW() - INTERVAL '11 days'),
  (arsh_a, arsh_id, 'e14', '{"selected": "e14a"}', NOW() - INTERVAL '11 days'),
  (arsh_a, arsh_id, 'e15', '{"selected": "e15a"}', NOW() - INTERVAL '11 days'),
  (arsh_a, arsh_id, 'e16', '{"value": 88}', NOW() - INTERVAL '11 days'),
  -- TechStartup Inc (10 days ago)
  (techstartup_a, techstartup_id, 'e1', '{"selected": "e1d"}', NOW() - INTERVAL '10 days'),
  (techstartup_a, techstartup_id, 'e2', '{"selected": "e2a"}', NOW() - INTERVAL '10 days'),
  (techstartup_a, techstartup_id, 'e3', '{"selected": "e3a"}', NOW() - INTERVAL '10 days'),
  (techstartup_a, techstartup_id, 'e4', '{"selected": "e4d"}', NOW() - INTERVAL '10 days'),
  (techstartup_a, techstartup_id, 'e5', '{"value": 20}', NOW() - INTERVAL '10 days'),
  (techstartup_a, techstartup_id, 'e6', '{"ranking": ["e6b","e6a","e6e","e6d","e6c","e6f"]}', NOW() - INTERVAL '10 days'),
  (techstartup_a, techstartup_id, 'e7', '{"selected": "e7a"}', NOW() - INTERVAL '10 days'),
  (techstartup_a, techstartup_id, 'e8', '{"selected": "e8b"}', NOW() - INTERVAL '10 days'),
  (techstartup_a, techstartup_id, 'e9', '{"selected": "e9b"}', NOW() - INTERVAL '10 days'),
  (techstartup_a, techstartup_id, 'e10', '{"value": 85}', NOW() - INTERVAL '10 days'),
  (techstartup_a, techstartup_id, 'e11', '{"selected": "e11d"}', NOW() - INTERVAL '10 days'),
  (techstartup_a, techstartup_id, 'e12', '{"text": "Shipping our first product in 3 months with a team of 4."}', NOW() - INTERVAL '10 days'),
  (techstartup_a, techstartup_id, 'e13', '{"value": 85}', NOW() - INTERVAL '10 days'),
  (techstartup_a, techstartup_id, 'e14', '{"selected": "e14a"}', NOW() - INTERVAL '10 days'),
  (techstartup_a, techstartup_id, 'e15', '{"selected": "e15a"}', NOW() - INTERVAL '10 days'),
  (techstartup_a, techstartup_id, 'e16', '{"value": 90}', NOW() - INTERVAL '10 days'),
  -- InnovateCorp (8 days ago)
  (innovatecorp_a, innovatecorp_id, 'e1', '{"selected": "e1b"}', NOW() - INTERVAL '8 days'),
  (innovatecorp_a, innovatecorp_id, 'e2', '{"selected": "e2b"}', NOW() - INTERVAL '8 days'),
  (innovatecorp_a, innovatecorp_id, 'e3', '{"selected": "e3b"}', NOW() - INTERVAL '8 days'),
  (innovatecorp_a, innovatecorp_id, 'e4', '{"selected": "e4b"}', NOW() - INTERVAL '8 days'),
  (innovatecorp_a, innovatecorp_id, 'e5', '{"value": 45}', NOW() - INTERVAL '8 days'),
  (innovatecorp_a, innovatecorp_id, 'e6', '{"ranking": ["e6c","e6e","e6d","e6b","e6a","e6f"]}', NOW() - INTERVAL '8 days'),
  (innovatecorp_a, innovatecorp_id, 'e7', '{"selected": "e7c"}', NOW() - INTERVAL '8 days'),
  (innovatecorp_a, innovatecorp_id, 'e8', '{"selected": "e8c"}', NOW() - INTERVAL '8 days'),
  (innovatecorp_a, innovatecorp_id, 'e9', '{"selected": "e9a"}', NOW() - INTERVAL '8 days'),
  (innovatecorp_a, innovatecorp_id, 'e10', '{"value": 55}', NOW() - INTERVAL '8 days'),
  (innovatecorp_a, innovatecorp_id, 'e11', '{"selected": "e11b"}', NOW() - INTERVAL '8 days'),
  (innovatecorp_a, innovatecorp_id, 'e12', '{"text": "When our entire company rallied to help a struggling team meet a deadline."}', NOW() - INTERVAL '8 days'),
  (innovatecorp_a, innovatecorp_id, 'e13', '{"value": 55}', NOW() - INTERVAL '8 days'),
  (innovatecorp_a, innovatecorp_id, 'e14', '{"selected": "e14b"}', NOW() - INTERVAL '8 days'),
  (innovatecorp_a, innovatecorp_id, 'e15', '{"selected": "e15a"}', NOW() - INTERVAL '8 days'),
  (innovatecorp_a, innovatecorp_id, 'e16', '{"value": 65}', NOW() - INTERVAL '8 days'),
  -- Creative Labs (6 days ago)
  (creativelabs_a, creativelabs_id, 'e1', '{"selected": "e1c"}', NOW() - INTERVAL '6 days'),
  (creativelabs_a, creativelabs_id, 'e2', '{"selected": "e2d"}', NOW() - INTERVAL '6 days'),
  (creativelabs_a, creativelabs_id, 'e3', '{"selected": "e3b"}', NOW() - INTERVAL '6 days'),
  (creativelabs_a, creativelabs_id, 'e4', '{"selected": "e4b"}', NOW() - INTERVAL '6 days'),
  (creativelabs_a, creativelabs_id, 'e5', '{"value": 30}', NOW() - INTERVAL '6 days'),
  (creativelabs_a, creativelabs_id, 'e6', '{"ranking": ["e6d","e6c","e6b","e6e","e6f","e6a"]}', NOW() - INTERVAL '6 days'),
  (creativelabs_a, creativelabs_id, 'e7', '{"selected": "e7c"}', NOW() - INTERVAL '6 days'),
  (creativelabs_a, creativelabs_id, 'e8', '{"selected": "e8d"}', NOW() - INTERVAL '6 days'),
  (creativelabs_a, creativelabs_id, 'e9', '{"selected": "e9b"}', NOW() - INTERVAL '6 days'),
  (creativelabs_a, creativelabs_id, 'e10', '{"value": 70}', NOW() - INTERVAL '6 days'),
  (creativelabs_a, creativelabs_id, 'e11', '{"selected": "e11c"}', NOW() - INTERVAL '6 days'),
  (creativelabs_a, creativelabs_id, 'e12', '{"text": "When we won our first design award and the whole team went to the ceremony."}', NOW() - INTERVAL '6 days'),
  (creativelabs_a, creativelabs_id, 'e13', '{"value": 50}', NOW() - INTERVAL '6 days'),
  (creativelabs_a, creativelabs_id, 'e14', '{"selected": "e14b"}', NOW() - INTERVAL '6 days'),
  (creativelabs_a, creativelabs_id, 'e15', '{"selected": "e15a"}', NOW() - INTERVAL '6 days'),
  (creativelabs_a, creativelabs_id, 'e16', '{"value": 75}', NOW() - INTERVAL '6 days'),
  -- FinancePlus (12 days ago)
  (financeplus_a, financeplus_id, 'e1', '{"selected": "e1a"}', NOW() - INTERVAL '12 days'),
  (financeplus_a, financeplus_id, 'e2', '{"selected": "e2b"}', NOW() - INTERVAL '12 days'),
  (financeplus_a, financeplus_id, 'e3', '{"selected": "e3b"}', NOW() - INTERVAL '12 days'),
  (financeplus_a, financeplus_id, 'e4', '{"selected": "e4a"}', NOW() - INTERVAL '12 days'),
  (financeplus_a, financeplus_id, 'e5', '{"value": 80}', NOW() - INTERVAL '12 days'),
  (financeplus_a, financeplus_id, 'e6', '{"ranking": ["e6f","e6d","e6a","e6c","e6e","e6b"]}', NOW() - INTERVAL '12 days'),
  (financeplus_a, financeplus_id, 'e7', '{"selected": "e7b"}', NOW() - INTERVAL '12 days'),
  (financeplus_a, financeplus_id, 'e8', '{"selected": "e8c"}', NOW() - INTERVAL '12 days'),
  (financeplus_a, financeplus_id, 'e9', '{"selected": "e9a"}', NOW() - INTERVAL '12 days'),
  (financeplus_a, financeplus_id, 'e10', '{"value": 25}', NOW() - INTERVAL '12 days'),
  (financeplus_a, financeplus_id, 'e11', '{"selected": "e11a"}', NOW() - INTERVAL '12 days'),
  (financeplus_a, financeplus_id, 'e12', '{"text": "When our compliance team caught an issue that saved us from regulatory fines."}', NOW() - INTERVAL '12 days'),
  (financeplus_a, financeplus_id, 'e13', '{"value": 35}', NOW() - INTERVAL '12 days'),
  (financeplus_a, financeplus_id, 'e14', '{"selected": "e14c"}', NOW() - INTERVAL '12 days'),
  (financeplus_a, financeplus_id, 'e15', '{"selected": "e15b"}', NOW() - INTERVAL '12 days'),
  (financeplus_a, financeplus_id, 'e16', '{"value": 25}', NOW() - INTERVAL '12 days'),
  -- HealthTech Solutions (7 days ago)
  (healthtech_a, healthtech_id, 'e1', '{"selected": "e1b"}', NOW() - INTERVAL '7 days'),
  (healthtech_a, healthtech_id, 'e2', '{"selected": "e2d"}', NOW() - INTERVAL '7 days'),
  (healthtech_a, healthtech_id, 'e3', '{"selected": "e3b"}', NOW() - INTERVAL '7 days'),
  (healthtech_a, healthtech_id, 'e4', '{"selected": "e4c"}', NOW() - INTERVAL '7 days'),
  (healthtech_a, healthtech_id, 'e5', '{"value": 40}', NOW() - INTERVAL '7 days'),
  (healthtech_a, healthtech_id, 'e6', '{"ranking": ["e6c","e6f","e6e","e6d","e6a","e6b"]}', NOW() - INTERVAL '7 days'),
  (healthtech_a, healthtech_id, 'e7', '{"selected": "e7d"}', NOW() - INTERVAL '7 days'),
  (healthtech_a, healthtech_id, 'e8', '{"selected": "e8d"}', NOW() - INTERVAL '7 days'),
  (healthtech_a, healthtech_id, 'e9', '{"selected": "e9b"}', NOW() - INTERVAL '7 days'),
  (healthtech_a, healthtech_id, 'e10', '{"value": 60}', NOW() - INTERVAL '7 days'),
  (healthtech_a, healthtech_id, 'e11', '{"selected": "e11c"}', NOW() - INTERVAL '7 days'),
  (healthtech_a, healthtech_id, 'e12', '{"text": "Receiving a letter from a patient whose life was improved by our technology."}', NOW() - INTERVAL '7 days'),
  (healthtech_a, healthtech_id, 'e13', '{"value": 45}', NOW() - INTERVAL '7 days'),
  (healthtech_a, healthtech_id, 'e14', '{"selected": "e14a"}', NOW() - INTERVAL '7 days'),
  (healthtech_a, healthtech_id, 'e15', '{"selected": "e15a"}', NOW() - INTERVAL '7 days'),
  (healthtech_a, healthtech_id, 'e16', '{"value": 70}', NOW() - INTERVAL '7 days'),
  -- GreenEnergy Co (9 days ago)
  (greenenergy_a, greenenergy_id, 'e1', '{"selected": "e1b"}', NOW() - INTERVAL '9 days'),
  (greenenergy_a, greenenergy_id, 'e2', '{"selected": "e2a"}', NOW() - INTERVAL '9 days'),
  (greenenergy_a, greenenergy_id, 'e3', '{"selected": "e3b"}', NOW() - INTERVAL '9 days'),
  (greenenergy_a, greenenergy_id, 'e4', '{"selected": "e4c"}', NOW() - INTERVAL '9 days'),
  (greenenergy_a, greenenergy_id, 'e5', '{"value": 28}', NOW() - INTERVAL '9 days'),
  (greenenergy_a, greenenergy_id, 'e6', '{"ranking": ["e6f","e6c","e6e","e6b","e6d","e6a"]}', NOW() - INTERVAL '9 days'),
  (greenenergy_a, greenenergy_id, 'e7', '{"selected": "e7c"}', NOW() - INTERVAL '9 days'),
  (greenenergy_a, greenenergy_id, 'e8', '{"selected": "e8d"}', NOW() - INTERVAL '9 days'),
  (greenenergy_a, greenenergy_id, 'e9', '{"selected": "e9b"}', NOW() - INTERVAL '9 days'),
  (greenenergy_a, greenenergy_id, 'e10', '{"value": 65}', NOW() - INTERVAL '9 days'),
  (greenenergy_a, greenenergy_id, 'e11', '{"selected": "e11c"}', NOW() - INTERVAL '9 days'),
  (greenenergy_a, greenenergy_id, 'e12', '{"text": "Celebrating our first solar installation knowing we were making a real difference."}', NOW() - INTERVAL '9 days'),
  (greenenergy_a, greenenergy_id, 'e13', '{"value": 55}', NOW() - INTERVAL '9 days'),
  (greenenergy_a, greenenergy_id, 'e14', '{"selected": "e14a"}', NOW() - INTERVAL '9 days'),
  (greenenergy_a, greenenergy_id, 'e15', '{"selected": "e15a"}', NOW() - INTERVAL '9 days'),
  (greenenergy_a, greenenergy_id, 'e16', '{"value": 72}', NOW() - INTERVAL '9 days'),
  -- DataFlow Systems (13 days ago)
  (dataflow_a, dataflow_id, 'e1', '{"selected": "e1a"}', NOW() - INTERVAL '13 days'),
  (dataflow_a, dataflow_id, 'e2', '{"selected": "e2b"}', NOW() - INTERVAL '13 days'),
  (dataflow_a, dataflow_id, 'e3', '{"selected": "e3b"}', NOW() - INTERVAL '13 days'),
  (dataflow_a, dataflow_id, 'e4', '{"selected": "e4a"}', NOW() - INTERVAL '13 days'),
  (dataflow_a, dataflow_id, 'e5', '{"value": 55}', NOW() - INTERVAL '13 days'),
  (dataflow_a, dataflow_id, 'e6', '{"ranking": ["e6d","e6a","e6c","e6f","e6e","e6b"]}', NOW() - INTERVAL '13 days'),
  (dataflow_a, dataflow_id, 'e7', '{"selected": "e7b"}', NOW() - INTERVAL '13 days'),
  (dataflow_a, dataflow_id, 'e8', '{"selected": "e8c"}', NOW() - INTERVAL '13 days'),
  (dataflow_a, dataflow_id, 'e9', '{"selected": "e9a"}', NOW() - INTERVAL '13 days'),
  (dataflow_a, dataflow_id, 'e10', '{"value": 40}', NOW() - INTERVAL '13 days'),
  (dataflow_a, dataflow_id, 'e11', '{"selected": "e11b"}', NOW() - INTERVAL '13 days'),
  (dataflow_a, dataflow_id, 'e12', '{"text": "Achieving 99.99% uptime across all enterprise clients for an entire quarter."}', NOW() - INTERVAL '13 days'),
  (dataflow_a, dataflow_id, 'e13', '{"value": 40}', NOW() - INTERVAL '13 days'),
  (dataflow_a, dataflow_id, 'e14', '{"selected": "e14b"}', NOW() - INTERVAL '13 days'),
  (dataflow_a, dataflow_id, 'e15', '{"selected": "e15b"}', NOW() - INTERVAL '13 days'),
  (dataflow_a, dataflow_id, 'e16', '{"value": 35}', NOW() - INTERVAL '13 days'),
  -- Artisan Collective (5 days ago)
  (artisan_a, artisan_id, 'e1', '{"selected": "e1c"}', NOW() - INTERVAL '5 days'),
  (artisan_a, artisan_id, 'e2', '{"selected": "e2d"}', NOW() - INTERVAL '5 days'),
  (artisan_a, artisan_id, 'e3', '{"selected": "e3a"}', NOW() - INTERVAL '5 days'),
  (artisan_a, artisan_id, 'e4', '{"selected": "e4b"}', NOW() - INTERVAL '5 days'),
  (artisan_a, artisan_id, 'e5', '{"value": 18}', NOW() - INTERVAL '5 days'),
  (artisan_a, artisan_id, 'e6', '{"ranking": ["e6b","e6d","e6e","e6c","e6a","e6f"]}', NOW() - INTERVAL '5 days'),
  (artisan_a, artisan_id, 'e7', '{"selected": "e7a"}', NOW() - INTERVAL '5 days'),
  (artisan_a, artisan_id, 'e8', '{"selected": "e8b"}', NOW() - INTERVAL '5 days'),
  (artisan_a, artisan_id, 'e9', '{"selected": "e9b"}', NOW() - INTERVAL '5 days'),
  (artisan_a, artisan_id, 'e10', '{"value": 75}', NOW() - INTERVAL '5 days'),
  (artisan_a, artisan_id, 'e11', '{"selected": "e11d"}', NOW() - INTERVAL '5 days'),
  (artisan_a, artisan_id, 'e12', '{"text": "When a client cried seeing the brand identity we created for them."}', NOW() - INTERVAL '5 days'),
  (artisan_a, artisan_id, 'e13', '{"value": 60}', NOW() - INTERVAL '5 days'),
  (artisan_a, artisan_id, 'e14', '{"selected": "e14a"}', NOW() - INTERVAL '5 days'),
  (artisan_a, artisan_id, 'e15', '{"selected": "e15a"}', NOW() - INTERVAL '5 days'),
  (artisan_a, artisan_id, 'e16', '{"value": 82}', NOW() - INTERVAL '5 days'),
  -- MetroBank Digital (14 days ago)
  (metrobank_a, metrobank_id, 'e1', '{"selected": "e1d"}', NOW() - INTERVAL '14 days'),
  (metrobank_a, metrobank_id, 'e2', '{"selected": "e2b"}', NOW() - INTERVAL '14 days'),
  (metrobank_a, metrobank_id, 'e3', '{"selected": "e3b"}', NOW() - INTERVAL '14 days'),
  (metrobank_a, metrobank_id, 'e4', '{"selected": "e4a"}', NOW() - INTERVAL '14 days'),
  (metrobank_a, metrobank_id, 'e5', '{"value": 65}', NOW() - INTERVAL '14 days'),
  (metrobank_a, metrobank_id, 'e6', '{"ranking": ["e6f","e6d","e6c","e6a","e6e","e6b"]}', NOW() - INTERVAL '14 days'),
  (metrobank_a, metrobank_id, 'e7', '{"selected": "e7c"}', NOW() - INTERVAL '14 days'),
  (metrobank_a, metrobank_id, 'e8', '{"selected": "e8c"}', NOW() - INTERVAL '14 days'),
  (metrobank_a, metrobank_id, 'e9', '{"selected": "e9a"}', NOW() - INTERVAL '14 days'),
  (metrobank_a, metrobank_id, 'e10', '{"value": 35}', NOW() - INTERVAL '14 days'),
  (metrobank_a, metrobank_id, 'e11', '{"selected": "e11b"}', NOW() - INTERVAL '14 days'),
  (metrobank_a, metrobank_id, 'e12', '{"text": "Launching our mobile banking app that surpassed 1M downloads in the first month."}', NOW() - INTERVAL '14 days'),
  (metrobank_a, metrobank_id, 'e13', '{"value": 42}', NOW() - INTERVAL '14 days'),
  (metrobank_a, metrobank_id, 'e14', '{"selected": "e14b"}', NOW() - INTERVAL '14 days'),
  (metrobank_a, metrobank_id, 'e15', '{"selected": "e15b"}', NOW() - INTERVAL '14 days'),
  (metrobank_a, metrobank_id, 'e16', '{"value": 48}', NOW() - INTERVAL '14 days')
  ON CONFLICT (assessment_id, question_code) DO NOTHING;

  RAISE NOTICE 'Successfully seeded 20 test accounts (10 candidates + 10 employers)';
  RAISE NOTICE 'Email auth password: TestPassword123!';
  RAISE NOTICE 'Google accounts: nakul0306@gmail.com (candidate), arshpatel2121@gmail.com (employer)';

END $$;

-- ============================================
-- VERIFICATION QUERIES
-- ============================================
SELECT '=== CANDIDATES ===' as section;
SELECT u.email, p.full_name, c.headline, c.assessment_status,
       c.openness_score as O, c.conscientiousness_score as C,
       c.extraversion_score as E, c.agreeableness_score as A, c.neuroticism_score as N,
       c.top_traits[1] as archetype,
       c.visual_perception_data IS NOT NULL as has_vp,
       c.cognitive_patterns_data IS NOT NULL as has_cp,
       c.situational_judgment_data IS NOT NULL as has_sj,
       c.work_values_data IS NOT NULL as has_wv
FROM auth.users u
JOIN public.profiles p ON p.id = u.id
JOIN public.candidates c ON c.user_id = u.id
WHERE p.role = 'candidate'
ORDER BY p.full_name;

SELECT '=== EMPLOYERS ===' as section;
SELECT u.email, p.full_name, e.company_name, e.industry, e.company_size,
       e.openness_preference as O, e.conscientiousness_preference as C,
       e.extraversion_preference as E, e.agreeableness_preference as A,
       e.neuroticism_preference as N, e.culture_quiz_completed
FROM auth.users u
JOIN public.profiles p ON p.id = u.id
JOIN public.employers e ON e.user_id = u.id
WHERE p.role = 'employer'
ORDER BY e.company_name;

SELECT '=== ASSESSMENT COUNTS ===' as section;
SELECT p.full_name, p.role, COUNT(a.id) as assessment_count,
       COUNT(ar.id) as response_count
FROM public.profiles p
LEFT JOIN public.assessments a ON a.user_id = p.id
LEFT JOIN public.assessment_responses ar ON ar.user_id = p.id
WHERE p.onboarding_completed = true
GROUP BY p.full_name, p.role
ORDER BY p.role, p.full_name;
