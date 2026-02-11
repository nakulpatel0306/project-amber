"""
Seed script for Ember Agent - Populates candidate profiles, creates roles table, and adds job postings.
Leaves Arsh and Nakul accounts untouched.
"""
import json
import os
from dotenv import load_dotenv
load_dotenv()

from supabase import create_client

url = os.environ.get('SUPABASE_URL', '')
key = os.environ.get('SUPABASE_SERVICE_ROLE_KEY', '')
client = create_client(url, key)

# ============================================
# Step 1: Create the roles table via raw SQL
# ============================================
print("Step 1: Creating roles table if it doesn't exist...")

try:
    # Use the Supabase REST API to run SQL
    # First check if the table exists by trying to query it
    try:
        client.table('roles').select('id').limit(1).execute()
        print("  Roles table already exists.")
    except Exception:
        print("  Roles table doesn't exist. Creating via SQL...")
        # We'll use the postgrest-py rpc function or direct SQL
        # Since we can't run raw SQL directly through the client easily,
        # we'll create it through an RPC call or the management API
        # For now, let's try using the SQL editor approach via rpc
        sql = """
        CREATE TABLE IF NOT EXISTS public.roles (
            id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            employer_id UUID NOT NULL REFERENCES public.employers(id) ON DELETE CASCADE,
            title TEXT NOT NULL,
            description TEXT,
            requirements TEXT[],
            nice_to_have TEXT[],
            location TEXT,
            work_style TEXT CHECK (work_style IN ('remote', 'hybrid', 'onsite')),
            salary_min INTEGER,
            salary_max INTEGER,
            employment_type TEXT CHECK (employment_type IN ('full_time', 'part_time', 'contract', 'internship')),
            required_openness_min INTEGER,
            required_openness_max INTEGER,
            required_conscientiousness_min INTEGER,
            required_conscientiousness_max INTEGER,
            required_extraversion_min INTEGER,
            required_extraversion_max INTEGER,
            required_agreeableness_min INTEGER,
            required_agreeableness_max INTEGER,
            required_neuroticism_min INTEGER,
            required_neuroticism_max INTEGER,
            status TEXT CHECK (status IN ('draft', 'active', 'paused', 'closed')) DEFAULT 'draft',
            created_at TIMESTAMPTZ DEFAULT NOW(),
            updated_at TIMESTAMPTZ DEFAULT NOW()
        );
        """
        client.rpc('exec_sql', {'sql': sql}).execute()
        print("  Roles table created successfully.")
except Exception as e:
    print(f"  Note: {e}")
    print("  Please ensure the roles table exists. Run schema.sql in Supabase SQL Editor if needed.")

# ============================================
# Step 2: Get existing user IDs
# ============================================
print("\nStep 2: Fetching existing users...")

profiles = client.table('profiles').select('id, email, full_name, role').execute()
candidates_data = client.table('candidates').select('id, user_id').execute()
employers_data = client.table('employers').select('id, user_id, company_name').execute()

# Build lookup maps
profile_map = {p['email']: p for p in profiles.data}
candidate_map = {c['user_id']: c for c in candidates_data.data}
employer_map = {e['user_id']: e for e in employers_data.data}

# IDs we need
SKIP_EMAILS = ['arshpatel2121@gmail.com', 'arsh4@icloud.com', 'nakul0306@gmail.com']

print(f"  Found {len(profiles.data)} profiles, {len(candidates_data.data)} candidates, {len(employers_data.data)} employers")

# ============================================
# Step 3: Update candidate profiles with unique personalities
# ============================================
print("\nStep 3: Updating candidate personality profiles...")

# Each candidate gets a unique, realistic personality profile based on OCEAN model
candidate_personalities = {
    'alex.chen@test.com': {
        # Alex Chen - "The Analytical Innovator"
        # High openness + high conscientiousness = creative but disciplined
        # A software engineer who loves solving complex problems methodically
        'headline': 'Full-Stack Engineer | Problem Solver | Open Source Contributor',
        'bio': 'I thrive at the intersection of creativity and logic. I love building elegant solutions to complex problems and contributing to open-source projects. Always curious about new technologies and approaches.',
        'location': 'San Francisco, CA',
        'linkedin_url': 'https://linkedin.com/in/alexchen',
        'github_url': 'https://github.com/alexchen',
        'years_experience': 5,
        'openness_score': 85,           # Very creative and curious
        'conscientiousness_score': 78,   # Organized and reliable
        'extraversion_score': 45,        # Slightly introverted
        'agreeableness_score': 65,       # Cooperative but independent
        'neuroticism_score': 30,         # Emotionally stable
        'culture_fit_score': 78,
        'work_style_score': 82,
        'communication_score': 68,
        'values_score': 75,
        'top_traits': ['Creative Problem-Solving', 'Continuous Learner', 'Self-Directed'],
        'assessment_status': 'completed',
        'preferred_work_style': 'remote',
        'preferred_company_size': 'startup',
        'salary_expectation_min': 130000,
        'salary_expectation_max': 180000,
        'setup_step': 4,
    },
    'sarah.johnson@test.com': {
        # Sarah Johnson - "The Empathetic Leader"
        # High extraversion + high agreeableness = natural team leader
        # A product manager who brings people together
        'headline': 'Senior Product Manager | Team Builder | User Advocate',
        'bio': 'Passionate about building products that genuinely help people. I believe the best work happens when diverse teams feel safe to share ideas. My strength is translating user needs into actionable product strategy.',
        'location': 'New York, NY',
        'linkedin_url': 'https://linkedin.com/in/sarahjohnson',
        'years_experience': 7,
        'openness_score': 72,           # Open to new ideas
        'conscientiousness_score': 70,   # Reliable and organized
        'extraversion_score': 88,        # Very social and energetic
        'agreeableness_score': 90,       # Extremely cooperative and empathetic
        'neuroticism_score': 35,         # Generally stable, some sensitivity
        'culture_fit_score': 85,
        'work_style_score': 75,
        'communication_score': 92,
        'values_score': 88,
        'top_traits': ['Team Player', 'Strong Communicator', 'Impact-Driven'],
        'assessment_status': 'completed',
        'preferred_work_style': 'hybrid',
        'preferred_company_size': 'medium',
        'salary_expectation_min': 140000,
        'salary_expectation_max': 190000,
        'setup_step': 4,
    },
    'marcus.williams@test.com': {
        # Marcus Williams - "The Ambitious Maverick"
        # High openness + low agreeableness + high extraversion = bold risk-taker
        # An entrepreneur/growth hacker who challenges the status quo
        'headline': 'Growth Lead | Startup Enthusiast | Bold Thinker',
        'bio': 'I move fast and challenge assumptions. I\'ve scaled two startups from zero to acquisition and I\'m looking for the next rocket ship. I value speed over perfection and results over process.',
        'location': 'Austin, TX',
        'linkedin_url': 'https://linkedin.com/in/marcuswilliams',
        'years_experience': 6,
        'openness_score': 92,           # Extremely creative and open
        'conscientiousness_score': 48,   # Less structured, more spontaneous
        'extraversion_score': 82,        # Outgoing and assertive
        'agreeableness_score': 40,       # Direct and competitive
        'neuroticism_score': 55,         # Some emotional intensity
        'culture_fit_score': 72,
        'work_style_score': 65,
        'communication_score': 78,
        'values_score': 70,
        'top_traits': ['Growth-Minded', 'Highly Adaptable', 'Direct Communicator'],
        'assessment_status': 'completed',
        'preferred_work_style': 'flexible',
        'preferred_company_size': 'startup',
        'salary_expectation_min': 120000,
        'salary_expectation_max': 200000,
        'setup_step': 4,
    },
    'emily.rodriguez@test.com': {
        # Emily Rodriguez - "The Steady Craftsperson"
        # High conscientiousness + moderate agreeableness + low openness = quality-focused
        # A QA/design perfectionist who values consistency and excellence
        'headline': 'UX Designer | Detail-Oriented | Quality Advocate',
        'bio': 'I believe great design is in the details. I approach every project with meticulous care, ensuring pixel-perfect execution and seamless user experiences. I prefer depth over breadth and quality over speed.',
        'location': 'Portland, OR',
        'linkedin_url': 'https://linkedin.com/in/emilyrodriguez',
        'portfolio_url': 'https://emilyrodriguez.design',
        'years_experience': 4,
        'openness_score': 55,           # Moderate openness, pragmatic
        'conscientiousness_score': 95,   # Extremely organized and detail-oriented
        'extraversion_score': 38,        # Introverted, prefers small groups
        'agreeableness_score': 72,       # Cooperative and supportive
        'neuroticism_score': 42,         # Somewhat anxious about quality
        'culture_fit_score': 80,
        'work_style_score': 90,
        'communication_score': 65,
        'values_score': 82,
        'top_traits': ['Process-Oriented', 'Deep Focus', 'Strategic Planner'],
        'assessment_status': 'completed',
        'preferred_work_style': 'hybrid',
        'preferred_company_size': 'small',
        'salary_expectation_min': 110000,
        'salary_expectation_max': 150000,
        'setup_step': 4,
    },
    'david.kim@test.com': {
        # David Kim - "The Social Connector"
        # High extraversion + high agreeableness + high openness = people person
        # A sales/BD professional who thrives on relationships
        'headline': 'Business Development Manager | Relationship Builder | Connector',
        'bio': 'I believe every great business outcome starts with a genuine connection. I love meeting new people, understanding their challenges, and finding ways to create win-win partnerships. Energy and enthusiasm are my superpowers.',
        'location': 'Chicago, IL',
        'linkedin_url': 'https://linkedin.com/in/davidkim',
        'years_experience': 5,
        'openness_score': 75,           # Open and curious
        'conscientiousness_score': 58,   # Moderate structure
        'extraversion_score': 95,        # Extremely outgoing
        'agreeableness_score': 85,       # Very warm and trusting
        'neuroticism_score': 25,         # Very emotionally stable
        'culture_fit_score': 82,
        'work_style_score': 70,
        'communication_score': 95,
        'values_score': 80,
        'top_traits': ['Team Player', 'Strong Communicator', 'Flexible Worker'],
        'assessment_status': 'completed',
        'preferred_work_style': 'onsite',
        'preferred_company_size': 'any',
        'salary_expectation_min': 100000,
        'salary_expectation_max': 160000,
        'setup_step': 4,
    },
}

for email, personality in candidate_personalities.items():
    profile = profile_map.get(email)
    if not profile:
        print(f"  WARNING: Profile not found for {email}")
        continue

    candidate = candidate_map.get(profile['id'])
    if not candidate:
        print(f"  WARNING: Candidate record not found for {email}")
        continue

    candidate_id = candidate['id']

    try:
        result = client.table('candidates').update({
            **personality,
            'assessment_completed_at': '2026-02-05T12:00:00+00:00',
            'setup_completed_at': '2026-02-05T12:00:00+00:00',
        }).eq('id', candidate_id).execute()
        print(f"  Updated {email} ({profile['full_name']}) - O:{personality['openness_score']} C:{personality['conscientiousness_score']} E:{personality['extraversion_score']} A:{personality['agreeableness_score']} N:{personality['neuroticism_score']}")
    except Exception as e:
        print(f"  ERROR updating {email}: {e}")

# ============================================
# Step 4: Create job roles for each employer
# ============================================
print("\nStep 4: Creating job roles...")

# Map employer names to their IDs
employer_id_map = {}
for e in employers_data.data:
    employer_id_map[e['company_name']] = e['id']

print(f"  Employer IDs: {json.dumps(employer_id_map, indent=2)}")

roles_to_create = [
    # TechStartup Inc - AI startup (Innovation, Speed, Autonomy)
    {
        'employer_id': employer_id_map.get('TechStartup Inc'),
        'title': 'AI/ML Engineer',
        'description': 'Join our founding team to build cutting-edge AI models for healthcare diagnostics. You\'ll have full ownership of the ML pipeline and work directly with our CTO.',
        'requirements': ['3+ years ML/AI experience', 'Python proficiency', 'Experience with PyTorch or TensorFlow'],
        'nice_to_have': ['Healthcare domain knowledge', 'Published research'],
        'location': 'San Francisco, CA',
        'work_style': 'remote',
        'salary_min': 150000,
        'salary_max': 220000,
        'employment_type': 'full_time',
        'required_openness_min': 70,
        'required_openness_max': 100,
        'required_conscientiousness_min': 50,
        'required_conscientiousness_max': 90,
        'required_extraversion_min': 30,
        'required_extraversion_max': 80,
        'required_agreeableness_min': 40,
        'required_agreeableness_max': 85,
        'required_neuroticism_min': 10,
        'required_neuroticism_max': 50,
        'status': 'active',
    },
    {
        'employer_id': employer_id_map.get('TechStartup Inc'),
        'title': 'Growth Marketing Lead',
        'description': 'Lead our go-to-market strategy and build the growth engine from scratch. Perfect for someone who thrives in ambiguity and wants to move fast.',
        'requirements': ['5+ years growth/marketing experience', 'Data-driven mindset', 'Startup experience'],
        'nice_to_have': ['B2B SaaS experience', 'Content marketing skills'],
        'location': 'San Francisco, CA',
        'work_style': 'hybrid',
        'salary_min': 130000,
        'salary_max': 180000,
        'employment_type': 'full_time',
        'required_openness_min': 65,
        'required_openness_max': 100,
        'required_conscientiousness_min': 40,
        'required_conscientiousness_max': 80,
        'required_extraversion_min': 60,
        'required_extraversion_max': 100,
        'required_agreeableness_min': 35,
        'required_agreeableness_max': 75,
        'required_neuroticism_min': 10,
        'required_neuroticism_max': 55,
        'status': 'active',
    },

    # InnovateCorp - B2B SaaS (Balance, Growth, Collaboration)
    {
        'employer_id': employer_id_map.get('InnovateCorp'),
        'title': 'Senior Product Manager',
        'description': 'Own the roadmap for our core B2B platform. You\'ll work cross-functionally with engineering, design, and sales to deliver features that drive customer value.',
        'requirements': ['5+ years product management', 'B2B SaaS experience', 'Strong analytical skills'],
        'nice_to_have': ['Technical background', 'Enterprise sales experience'],
        'location': 'New York, NY',
        'work_style': 'hybrid',
        'salary_min': 140000,
        'salary_max': 190000,
        'employment_type': 'full_time',
        'required_openness_min': 55,
        'required_openness_max': 90,
        'required_conscientiousness_min': 60,
        'required_conscientiousness_max': 95,
        'required_extraversion_min': 55,
        'required_extraversion_max': 95,
        'required_agreeableness_min': 60,
        'required_agreeableness_max': 100,
        'required_neuroticism_min': 10,
        'required_neuroticism_max': 45,
        'status': 'active',
    },
    {
        'employer_id': employer_id_map.get('InnovateCorp'),
        'title': 'Full-Stack Developer',
        'description': 'Build scalable features for our platform used by 10K+ businesses. We value clean code, thoughtful architecture, and strong collaboration.',
        'requirements': ['3+ years full-stack development', 'React + Node.js', 'SQL databases'],
        'nice_to_have': ['TypeScript expertise', 'AWS experience'],
        'location': 'New York, NY',
        'work_style': 'hybrid',
        'salary_min': 120000,
        'salary_max': 170000,
        'employment_type': 'full_time',
        'required_openness_min': 55,
        'required_openness_max': 90,
        'required_conscientiousness_min': 65,
        'required_conscientiousness_max': 100,
        'required_extraversion_min': 40,
        'required_extraversion_max': 85,
        'required_agreeableness_min': 55,
        'required_agreeableness_max': 95,
        'required_neuroticism_min': 10,
        'required_neuroticism_max': 40,
        'status': 'active',
    },

    # Creative Labs - Design agency (Creativity, Craft, Aesthetics)
    {
        'employer_id': employer_id_map.get('Creative Labs'),
        'title': 'Senior UX/UI Designer',
        'description': 'Create beautiful, intuitive digital experiences for our premium clients. We obsess over details and believe design should delight and inspire.',
        'requirements': ['4+ years UX/UI design', 'Strong portfolio', 'Figma mastery'],
        'nice_to_have': ['Motion design skills', 'Design systems experience'],
        'location': 'Los Angeles, CA',
        'work_style': 'hybrid',
        'salary_min': 110000,
        'salary_max': 160000,
        'employment_type': 'full_time',
        'required_openness_min': 70,
        'required_openness_max': 100,
        'required_conscientiousness_min': 70,
        'required_conscientiousness_max': 100,
        'required_extraversion_min': 30,
        'required_extraversion_max': 75,
        'required_agreeableness_min': 55,
        'required_agreeableness_max': 90,
        'required_neuroticism_min': 10,
        'required_neuroticism_max': 50,
        'status': 'active',
    },
    {
        'employer_id': employer_id_map.get('Creative Labs'),
        'title': 'Creative Director',
        'description': 'Lead our creative vision and mentor a team of designers. You\'ll set the artistic direction for high-profile brand campaigns and digital products.',
        'requirements': ['7+ years creative experience', 'Leadership experience', 'Award-winning portfolio'],
        'nice_to_have': ['Agency background', 'Brand strategy experience'],
        'location': 'Los Angeles, CA',
        'work_style': 'onsite',
        'salary_min': 150000,
        'salary_max': 200000,
        'employment_type': 'full_time',
        'required_openness_min': 80,
        'required_openness_max': 100,
        'required_conscientiousness_min': 60,
        'required_conscientiousness_max': 95,
        'required_extraversion_min': 55,
        'required_extraversion_max': 95,
        'required_agreeableness_min': 50,
        'required_agreeableness_max': 85,
        'required_neuroticism_min': 10,
        'required_neuroticism_max': 45,
        'status': 'active',
    },

    # FinancePlus - Finance (Integrity, Stability, Trust)
    {
        'employer_id': employer_id_map.get('FinancePlus'),
        'title': 'Risk Analyst',
        'description': 'Analyze and model financial risk across our portfolio. We need someone who is meticulous, data-driven, and thrives in a structured environment.',
        'requirements': ['3+ years risk analysis', 'Advanced Excel/Python', 'Statistics background'],
        'nice_to_have': ['CFA certification', 'Machine learning for finance'],
        'location': 'Boston, MA',
        'work_style': 'onsite',
        'salary_min': 100000,
        'salary_max': 150000,
        'employment_type': 'full_time',
        'required_openness_min': 35,
        'required_openness_max': 70,
        'required_conscientiousness_min': 80,
        'required_conscientiousness_max': 100,
        'required_extraversion_min': 30,
        'required_extraversion_max': 70,
        'required_agreeableness_min': 55,
        'required_agreeableness_max': 90,
        'required_neuroticism_min': 10,
        'required_neuroticism_max': 35,
        'status': 'active',
    },
    {
        'employer_id': employer_id_map.get('FinancePlus'),
        'title': 'Client Relations Manager',
        'description': 'Build and maintain relationships with our high-value clients. We need someone who combines professionalism with genuine warmth and trustworthiness.',
        'requirements': ['5+ years client management', 'Financial services experience', 'Excellent communication'],
        'nice_to_have': ['Series 7 license', 'CRM expertise'],
        'location': 'Boston, MA',
        'work_style': 'hybrid',
        'salary_min': 90000,
        'salary_max': 140000,
        'employment_type': 'full_time',
        'required_openness_min': 40,
        'required_openness_max': 75,
        'required_conscientiousness_min': 70,
        'required_conscientiousness_max': 100,
        'required_extraversion_min': 60,
        'required_extraversion_max': 95,
        'required_agreeableness_min': 70,
        'required_agreeableness_max': 100,
        'required_neuroticism_min': 10,
        'required_neuroticism_max': 35,
        'status': 'active',
    },

    # HealthTech Solutions - Healthcare (Mission, Empathy, Innovation)
    {
        'employer_id': employer_id_map.get('HealthTech Solutions'),
        'title': 'Product Designer - Patient Experience',
        'description': 'Design intuitive healthcare interfaces that improve patient outcomes. Empathy is the #1 requirement - you\'ll work closely with patients and providers to understand their needs.',
        'requirements': ['3+ years product design', 'User research experience', 'Accessibility knowledge'],
        'nice_to_have': ['Healthcare/medtech experience', 'Design thinking certification'],
        'location': 'Denver, CO',
        'work_style': 'hybrid',
        'salary_min': 105000,
        'salary_max': 145000,
        'employment_type': 'full_time',
        'required_openness_min': 60,
        'required_openness_max': 95,
        'required_conscientiousness_min': 60,
        'required_conscientiousness_max': 90,
        'required_extraversion_min': 50,
        'required_extraversion_max': 85,
        'required_agreeableness_min': 75,
        'required_agreeableness_max': 100,
        'required_neuroticism_min': 10,
        'required_neuroticism_max': 40,
        'status': 'active',
    },
    {
        'employer_id': employer_id_map.get('HealthTech Solutions'),
        'title': 'Backend Engineer - Health Data',
        'description': 'Build robust, secure APIs handling sensitive health data. HIPAA compliance is critical. We need someone who is thorough, collaborative, and mission-driven.',
        'requirements': ['4+ years backend development', 'Python or Go', 'Security best practices'],
        'nice_to_have': ['HIPAA compliance experience', 'Healthcare data standards (HL7/FHIR)'],
        'location': 'Denver, CO',
        'work_style': 'remote',
        'salary_min': 130000,
        'salary_max': 175000,
        'employment_type': 'full_time',
        'required_openness_min': 55,
        'required_openness_max': 85,
        'required_conscientiousness_min': 75,
        'required_conscientiousness_max': 100,
        'required_extraversion_min': 35,
        'required_extraversion_max': 75,
        'required_agreeableness_min': 60,
        'required_agreeableness_max': 95,
        'required_neuroticism_min': 10,
        'required_neuroticism_max': 35,
        'status': 'active',
    },
]

# Filter out roles with missing employer IDs
roles_to_create = [r for r in roles_to_create if r.get('employer_id')]

try:
    # Delete existing roles first to avoid duplicates
    existing_roles = client.table('roles').select('id').execute()
    if existing_roles.data:
        for r in existing_roles.data:
            client.table('roles').delete().eq('id', r['id']).execute()
        print(f"  Cleared {len(existing_roles.data)} existing roles.")

    # Insert new roles
    for role in roles_to_create:
        result = client.table('roles').insert(role).execute()
        if result.data:
            print(f"  Created role: {role['title']} at {role['location']}")
        else:
            print(f"  WARNING: Failed to create role: {role['title']}")
except Exception as e:
    print(f"  ERROR creating roles: {e}")
    print("  You may need to create the roles table first. Run this SQL in Supabase SQL Editor:")
    print("  (Copy from supabase/schema.sql - the roles table section)")

# ============================================
# Step 5: Verify the data
# ============================================
print("\nStep 5: Verifying data...")

try:
    candidates = client.table('candidates').select('*, profiles!inner(full_name, email)').not_.is_('openness_score', 'null').execute()
    print(f"\n  Candidates with OCEAN scores: {len(candidates.data)}")
    for c in candidates.data:
        p = c.get('profiles', {})
        print(f"    {p.get('full_name', 'Unknown')} ({p.get('email', '')})")
        print(f"      O:{c['openness_score']} C:{c['conscientiousness_score']} E:{c['extraversion_score']} A:{c['agreeableness_score']} N:{c['neuroticism_score']}")
        print(f"      Traits: {c['top_traits']}")
except Exception as e:
    print(f"  Error verifying candidates: {e}")

try:
    roles = client.table('roles').select('*, employers!inner(company_name)').eq('status', 'active').execute()
    print(f"\n  Active roles: {len(roles.data)}")
    for r in roles.data:
        employer = r.get('employers', {})
        print(f"    {r['title']} at {employer.get('company_name', 'Unknown')} ({r['work_style']}) - ${r['salary_min']}-${r['salary_max']}")
except Exception as e:
    print(f"  Error verifying roles: {e}")

print("\nDone! Seed data is ready for the Ember agent.")
