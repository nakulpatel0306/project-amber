"""Seed Arsh and Nakul personality profiles."""
import os
from dotenv import load_dotenv
load_dotenv()
from supabase import create_client

client = create_client(os.environ['SUPABASE_URL'], os.environ['SUPABASE_SERVICE_ROLE_KEY'])

profiles_to_update = {
    'arshpatel2121@gmail.com': {
        # Arsh Patel - "The Strategist"
        # Analytical thinker with strong vision, balanced personality
        # A tech-savvy business mind who connects strategy with execution
        'headline': 'Software Developer | Strategic Thinker | Tech Entrepreneur',
        'bio': 'I love building products that solve real problems. I combine technical skills with business strategy to create meaningful impact. I approach challenges analytically but am always open to creative solutions from the team.',
        'location': 'Toronto, ON',
        'linkedin_url': 'https://linkedin.com/in/arshpatel',
        'github_url': 'https://github.com/arshpatel',
        'years_experience': 3,
        'openness_score': 74,
        'conscientiousness_score': 80,
        'extraversion_score': 62,
        'agreeableness_score': 68,
        'neuroticism_score': 32,
        'culture_fit_score': 79,
        'work_style_score': 82,
        'communication_score': 74,
        'values_score': 77,
        'top_traits': ['Strategic Planner', 'Self-Directed', 'Continuous Learner'],
        'assessment_status': 'completed',
        'assessment_completed_at': '2026-02-08T10:00:00+00:00',
        'preferred_work_style': 'hybrid',
        'preferred_company_size': 'startup',
        'salary_expectation_min': 90000,
        'salary_expectation_max': 140000,
        'setup_step': 4,
        'setup_completed_at': '2026-02-08T10:00:00+00:00',
    },
    'arsh4@icloud.com': {
        # AP (Arsh's alt) - same personality as Arsh but slightly different
        # Give it a creative twist since it's a secondary account
        'headline': 'CS Student | Side Project Builder | Startup Enthusiast',
        'bio': 'Always hacking on something new. Passionate about startups, AI, and building things that people actually want to use. I prefer moving fast and learning from mistakes over planning forever.',
        'location': 'Toronto, ON',
        'years_experience': 2,
        'openness_score': 82,
        'conscientiousness_score': 65,
        'extraversion_score': 70,
        'agreeableness_score': 60,
        'neuroticism_score': 38,
        'culture_fit_score': 75,
        'work_style_score': 72,
        'communication_score': 70,
        'values_score': 74,
        'top_traits': ['Growth-Minded', 'Highly Adaptable', 'Impact-Driven'],
        'assessment_status': 'completed',
        'assessment_completed_at': '2026-02-08T10:00:00+00:00',
        'preferred_work_style': 'remote',
        'preferred_company_size': 'startup',
        'salary_expectation_min': 70000,
        'salary_expectation_max': 120000,
        'setup_step': 4,
        'setup_completed_at': '2026-02-08T10:00:00+00:00',
    },
    'nakul0306@gmail.com': {
        # Nakul already has OCEAN scores (O:66 C:63 E:58 A:65 N:48)
        # Just fill out the profile info that might be missing
        'bio': 'Business student with a passion for growth marketing and machine learning. I believe in combining data-driven insights with creative thinking to build products that scale. Always looking for the next challenge.',
        'location': 'Waterloo, ON',
        'linkedin_url': 'https://linkedin.com/in/nakulpatel',
        'github_url': 'https://github.com/nakulpatel0306',
        'years_experience': 2,
        'preferred_work_style': 'hybrid',
        'preferred_company_size': 'startup',
        'salary_expectation_min': 80000,
        'salary_expectation_max': 130000,
    },
}

for email, updates in profiles_to_update.items():
    profile = client.table('profiles').select('id').eq('email', email).single().execute()
    if not profile.data:
        print(f'Profile not found: {email}')
        continue

    candidate = client.table('candidates').select('id').eq('user_id', profile.data['id']).single().execute()
    if not candidate.data:
        print(f'Candidate not found: {email}')
        continue

    result = client.table('candidates').update(updates).eq('id', candidate.data['id']).execute()
    o = updates.get('openness_score', '?')
    c = updates.get('conscientiousness_score', '?')
    e = updates.get('extraversion_score', '?')
    a = updates.get('agreeableness_score', '?')
    n = updates.get('neuroticism_score', '?')
    print(f'Updated {email} - O:{o} C:{c} E:{e} A:{a} N:{n}')

print('\nDone!')
