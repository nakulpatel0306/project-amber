-- Sample Jobs/Roles for Amber Platform
-- This script adds diverse job listings across different industries
-- Run this after your employers are set up

-- ============================================
-- STEP 1: Ensure employers have culture quiz completed
-- (Required for jobs to appear in candidate dashboard)
-- ============================================
UPDATE public.employers
SET
  culture_quiz_completed = TRUE,
  openness_preference = COALESCE(openness_preference, 60),
  conscientiousness_preference = COALESCE(conscientiousness_preference, 70),
  extraversion_preference = COALESCE(extraversion_preference, 55),
  agreeableness_preference = COALESCE(agreeableness_preference, 65),
  neuroticism_preference = COALESCE(neuroticism_preference, 35),
  culture_values = COALESCE(culture_values, ARRAY['innovation', 'collaboration', 'growth'])
WHERE culture_quiz_completed IS NOT TRUE;

-- ============================================
-- STEP 2: Create sample jobs for ALL employers
-- Uses a function to dynamically assign jobs to existing employers
-- ============================================

-- Create a temporary function to insert roles
DO $$
DECLARE
  emp RECORD;
  emp_count INTEGER := 0;
  role_templates JSONB := '[
    {
      "title": "Senior Software Engineer",
      "description": "Join our engineering team to build scalable, high-performance applications. You''ll work on challenging problems and have a direct impact on our product.",
      "requirements": ["5+ years of software development experience", "Proficiency in modern programming languages", "Experience with cloud platforms (AWS/GCP/Azure)", "Strong problem-solving skills"],
      "nice_to_have": ["Experience with microservices architecture", "Leadership experience"],
      "work_style": "hybrid",
      "salary_min": 140000,
      "salary_max": 200000,
      "employment_type": "full_time",
      "o_min": 60, "o_max": 90,
      "c_min": 70, "c_max": 95,
      "e_min": 40, "e_max": 80,
      "a_min": 55, "a_max": 85,
      "n_min": 0, "n_max": 40
    },
    {
      "title": "Product Manager",
      "description": "Drive product strategy and execution from ideation to launch. Work closely with engineering, design, and business teams to deliver exceptional products.",
      "requirements": ["4+ years product management experience", "Strong analytical and data skills", "Excellent communication abilities", "Track record of shipping successful products"],
      "nice_to_have": ["Technical background", "Experience with agile methodologies"],
      "work_style": "hybrid",
      "salary_min": 130000,
      "salary_max": 180000,
      "employment_type": "full_time",
      "o_min": 65, "o_max": 95,
      "c_min": 70, "c_max": 90,
      "e_min": 60, "e_max": 90,
      "a_min": 60, "a_max": 90,
      "n_min": 0, "n_max": 35
    },
    {
      "title": "UX/UI Designer",
      "description": "Create beautiful, intuitive user experiences that delight our customers. You''ll own the design process from research to final implementation.",
      "requirements": ["4+ years of UX/UI design experience", "Strong portfolio demonstrating design process", "Proficiency in Figma or similar tools", "Understanding of accessibility standards"],
      "nice_to_have": ["Motion design skills", "Front-end development knowledge"],
      "work_style": "remote",
      "salary_min": 110000,
      "salary_max": 160000,
      "employment_type": "full_time",
      "o_min": 75, "o_max": 100,
      "c_min": 65, "c_max": 90,
      "e_min": 45, "e_max": 80,
      "a_min": 60, "a_max": 90,
      "n_min": 0, "n_max": 45
    },
    {
      "title": "Data Scientist",
      "description": "Transform data into actionable insights that drive business decisions. Build ML models and analytics solutions that scale.",
      "requirements": ["3+ years in data science or ML", "Strong Python and SQL skills", "Experience with ML frameworks (TensorFlow, PyTorch)", "Statistics and mathematics background"],
      "nice_to_have": ["PhD in quantitative field", "Experience with big data technologies"],
      "work_style": "remote",
      "salary_min": 135000,
      "salary_max": 190000,
      "employment_type": "full_time",
      "o_min": 70, "o_max": 95,
      "c_min": 75, "c_max": 100,
      "e_min": 35, "e_max": 70,
      "a_min": 50, "a_max": 80,
      "n_min": 0, "n_max": 35
    },
    {
      "title": "Marketing Manager",
      "description": "Lead marketing initiatives to grow brand awareness and drive customer acquisition. You''ll develop and execute multi-channel marketing strategies.",
      "requirements": ["5+ years marketing experience", "Experience with digital marketing channels", "Strong analytical skills", "Proven track record of successful campaigns"],
      "nice_to_have": ["B2B SaaS experience", "Content marketing expertise"],
      "work_style": "hybrid",
      "salary_min": 100000,
      "salary_max": 150000,
      "employment_type": "full_time",
      "o_min": 65, "o_max": 90,
      "c_min": 65, "c_max": 85,
      "e_min": 65, "e_max": 95,
      "a_min": 60, "a_max": 90,
      "n_min": 0, "n_max": 40
    },
    {
      "title": "DevOps Engineer",
      "description": "Build and maintain our cloud infrastructure and CI/CD pipelines. Enable teams to ship faster with reliability and security.",
      "requirements": ["4+ years DevOps/SRE experience", "Strong Kubernetes and Docker skills", "Experience with IaC (Terraform, CloudFormation)", "Scripting proficiency (Python, Bash)"],
      "nice_to_have": ["Security certifications", "Experience with observability tools"],
      "work_style": "remote",
      "salary_min": 140000,
      "salary_max": 195000,
      "employment_type": "full_time",
      "o_min": 55, "o_max": 80,
      "c_min": 80, "c_max": 100,
      "e_min": 30, "e_max": 65,
      "a_min": 50, "a_max": 80,
      "n_min": 0, "n_max": 30
    },
    {
      "title": "Customer Success Manager",
      "description": "Be the trusted advisor to our customers, ensuring they achieve their goals with our product. Drive retention, expansion, and advocacy.",
      "requirements": ["3+ years in customer success or account management", "Excellent communication and relationship skills", "Experience with SaaS products", "Problem-solving mindset"],
      "nice_to_have": ["Technical background", "Experience with enterprise customers"],
      "work_style": "hybrid",
      "salary_min": 85000,
      "salary_max": 130000,
      "employment_type": "full_time",
      "o_min": 55, "o_max": 80,
      "c_min": 70, "c_max": 90,
      "e_min": 70, "e_max": 100,
      "a_min": 75, "a_max": 100,
      "n_min": 0, "n_max": 35
    },
    {
      "title": "Frontend Developer",
      "description": "Build responsive, accessible web applications that users love. Work with React/TypeScript and modern frontend technologies.",
      "requirements": ["3+ years frontend development", "Expert in React and TypeScript", "Strong CSS and responsive design skills", "Understanding of web performance"],
      "nice_to_have": ["Experience with Next.js", "Animation and motion design"],
      "work_style": "remote",
      "salary_min": 110000,
      "salary_max": 165000,
      "employment_type": "full_time",
      "o_min": 65, "o_max": 90,
      "c_min": 70, "c_max": 95,
      "e_min": 40, "e_max": 75,
      "a_min": 55, "a_max": 85,
      "n_min": 0, "n_max": 40
    },
    {
      "title": "Sales Development Representative",
      "description": "Generate and qualify leads to fuel our sales pipeline. You''ll be the first point of contact for potential customers.",
      "requirements": ["1+ years in sales or SDR role", "Excellent verbal and written communication", "Self-motivated and goal-oriented", "Comfortable with cold outreach"],
      "nice_to_have": ["Experience with Salesforce", "Tech industry experience"],
      "work_style": "onsite",
      "salary_min": 55000,
      "salary_max": 80000,
      "employment_type": "full_time",
      "o_min": 50, "o_max": 80,
      "c_min": 65, "c_max": 90,
      "e_min": 75, "e_max": 100,
      "a_min": 60, "a_max": 90,
      "n_min": 0, "n_max": 45
    },
    {
      "title": "Technical Writer",
      "description": "Create clear, comprehensive documentation for our products. Help users and developers understand and get the most from our platform.",
      "requirements": ["3+ years technical writing experience", "Strong writing and editing skills", "Ability to understand complex technical concepts", "Experience with documentation tools"],
      "nice_to_have": ["Software development background", "API documentation experience"],
      "work_style": "remote",
      "salary_min": 80000,
      "salary_max": 120000,
      "employment_type": "full_time",
      "o_min": 60, "o_max": 85,
      "c_min": 80, "c_max": 100,
      "e_min": 30, "e_max": 65,
      "a_min": 60, "a_max": 90,
      "n_min": 0, "n_max": 35
    },
    {
      "title": "Backend Engineer",
      "description": "Design and build robust APIs and services that power our platform. Work with distributed systems at scale.",
      "requirements": ["4+ years backend development", "Experience with Python, Go, or Java", "Database design and optimization skills", "API design best practices"],
      "nice_to_have": ["Experience with event-driven architecture", "Performance optimization expertise"],
      "work_style": "hybrid",
      "salary_min": 130000,
      "salary_max": 185000,
      "employment_type": "full_time",
      "o_min": 55, "o_max": 85,
      "c_min": 75, "c_max": 100,
      "e_min": 35, "e_max": 70,
      "a_min": 50, "a_max": 80,
      "n_min": 0, "n_max": 35
    },
    {
      "title": "HR Business Partner",
      "description": "Partner with leadership to develop and execute people strategies. Drive culture, engagement, and talent development initiatives.",
      "requirements": ["5+ years HR experience", "Strong interpersonal and coaching skills", "Experience with performance management", "Knowledge of employment law"],
      "nice_to_have": ["SHRM certification", "Experience in tech companies"],
      "work_style": "hybrid",
      "salary_min": 95000,
      "salary_max": 140000,
      "employment_type": "full_time",
      "o_min": 55, "o_max": 80,
      "c_min": 70, "c_max": 90,
      "e_min": 60, "e_max": 90,
      "a_min": 75, "a_max": 100,
      "n_min": 0, "n_max": 40
    }
  ]'::JSONB;
  template JSONB;
  template_idx INTEGER;
BEGIN
  -- Loop through all employers
  FOR emp IN SELECT id, company_name, location FROM public.employers LOOP
    emp_count := emp_count + 1;

    -- Each employer gets 2-4 jobs (cycling through templates)
    FOR template_idx IN 0..((emp_count % 3) + 1) LOOP
      template := role_templates->((emp_count * 3 + template_idx) % jsonb_array_length(role_templates));

      INSERT INTO public.roles (
        employer_id,
        title,
        description,
        requirements,
        nice_to_have,
        location,
        work_style,
        salary_min,
        salary_max,
        employment_type,
        required_openness_min,
        required_openness_max,
        required_conscientiousness_min,
        required_conscientiousness_max,
        required_extraversion_min,
        required_extraversion_max,
        required_agreeableness_min,
        required_agreeableness_max,
        required_neuroticism_min,
        required_neuroticism_max,
        status
      )
      VALUES (
        emp.id,
        template->>'title',
        template->>'description',
        ARRAY(SELECT jsonb_array_elements_text(template->'requirements')),
        ARRAY(SELECT jsonb_array_elements_text(template->'nice_to_have')),
        COALESCE(emp.location, 'Remote'),
        template->>'work_style',
        (template->>'salary_min')::INTEGER,
        (template->>'salary_max')::INTEGER,
        template->>'employment_type',
        (template->>'o_min')::INTEGER,
        (template->>'o_max')::INTEGER,
        (template->>'c_min')::INTEGER,
        (template->>'c_max')::INTEGER,
        (template->>'e_min')::INTEGER,
        (template->>'e_max')::INTEGER,
        (template->>'a_min')::INTEGER,
        (template->>'a_max')::INTEGER,
        (template->>'n_min')::INTEGER,
        (template->>'n_max')::INTEGER,
        'active'
      )
      ON CONFLICT DO NOTHING;
    END LOOP;
  END LOOP;

  RAISE NOTICE 'Created jobs for % employers', emp_count;
END $$;

-- ============================================
-- STEP 3: Verify the jobs were created
-- ============================================
SELECT 'Jobs created per company:' as info;

SELECT
  e.company_name,
  COUNT(r.id) as job_count,
  STRING_AGG(r.title, ', ' ORDER BY r.title) as roles
FROM public.employers e
LEFT JOIN public.roles r ON r.employer_id = e.id AND r.status = 'active'
GROUP BY e.id, e.company_name
ORDER BY e.company_name;

SELECT 'Total active jobs: ' || COUNT(*) as total FROM public.roles WHERE status = 'active';
