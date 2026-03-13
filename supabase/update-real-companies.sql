-- ==========================================================
-- Update Seed Employers to Real Companies
-- Run this in the Supabase SQL Editor to replace fake company
-- names with real companies + logos + accurate culture data.
-- Also updates profile avatar_url to company logo.
-- Ember Labs (arsh_id) is kept as-is.
-- ==========================================================

-- 1. Anthropic
UPDATE public.employers SET
  company_name = 'Anthropic',
  company_website = 'https://anthropic.com',
  company_logo_url = 'https://logo.clearbit.com/anthropic.com',
  company_size = '51-200',
  industry = 'Artificial Intelligence',
  description = 'AI safety company building reliable, interpretable, and steerable AI systems. Anthropic is the creator of Claude, focusing on AI research that prioritizes safety and beneficial outcomes for humanity.',
  location = 'San Francisco, CA',
  culture_values = ARRAY['Safety','Research','Innovation','Integrity','Impact'],
  openness_preference = 92,
  conscientiousness_preference = 88,
  extraversion_preference = 65,
  agreeableness_preference = 78,
  neuroticism_preference = 30
WHERE company_name IN ('TechStartup Inc', 'Anthropic');

UPDATE public.profiles SET avatar_url = 'https://logo.clearbit.com/anthropic.com'
WHERE id = (SELECT user_id FROM public.employers WHERE company_name = 'Anthropic');

-- 2. Shopify
UPDATE public.employers SET
  company_name = 'Shopify',
  company_website = 'https://shopify.com',
  company_logo_url = 'https://logo.clearbit.com/shopify.com',
  company_size = '51-200',
  industry = 'E-Commerce',
  description = 'Shopify is a leading global commerce company powering millions of businesses worldwide. We make commerce better for everyone with a platform and services engineered for reliability and scale.',
  location = 'Ottawa, ON (Remote-first)',
  culture_values = ARRAY['Entrepreneurship','Collaboration','Growth','Impact','Trust'],
  openness_preference = 80,
  conscientiousness_preference = 82,
  extraversion_preference = 72,
  agreeableness_preference = 85,
  neuroticism_preference = 28
WHERE company_name IN ('InnovateCorp', 'Shopify');

UPDATE public.profiles SET avatar_url = 'https://logo.clearbit.com/shopify.com'
WHERE id = (SELECT user_id FROM public.employers WHERE company_name = 'Shopify');

-- 3. Apple
UPDATE public.employers SET
  company_name = 'Apple',
  company_website = 'https://apple.com',
  company_logo_url = 'https://logo.clearbit.com/apple.com',
  company_size = '51-200',
  industry = 'Technology',
  description = 'Apple designs, manufactures, and markets smartphones, personal computers, tablets, wearables, and accessories. Known worldwide for design excellence, innovation, and products that enrich people''s lives.',
  location = 'Cupertino, CA',
  culture_values = ARRAY['Design','Innovation','Craft','Excellence','Simplicity'],
  openness_preference = 85,
  conscientiousness_preference = 95,
  extraversion_preference = 55,
  agreeableness_preference = 65,
  neuroticism_preference = 25
WHERE company_name IN ('Creative Labs', 'Apple');

UPDATE public.profiles SET avatar_url = 'https://logo.clearbit.com/apple.com'
WHERE id = (SELECT user_id FROM public.employers WHERE company_name = 'Apple');

-- 4. Goldman Sachs
UPDATE public.employers SET
  company_name = 'Goldman Sachs',
  company_website = 'https://goldmansachs.com',
  company_logo_url = 'https://logo.clearbit.com/goldmansachs.com',
  company_size = '51-200',
  industry = 'Financial Services',
  description = 'The Goldman Sachs Group is a leading global financial institution delivering a broad range of financial services across investment banking, securities, asset management, and consumer banking.',
  location = 'New York, NY',
  culture_values = ARRAY['Excellence','Integrity','Client Focus','Teamwork','Leadership'],
  openness_preference = 55,
  conscientiousness_preference = 95,
  extraversion_preference = 70,
  agreeableness_preference = 60,
  neuroticism_preference = 20
WHERE company_name IN ('FinancePlus', 'Goldman Sachs');

UPDATE public.profiles SET avatar_url = 'https://logo.clearbit.com/goldmansachs.com'
WHERE id = (SELECT user_id FROM public.employers WHERE company_name = 'Goldman Sachs');

-- 5. Epic Systems
UPDATE public.employers SET
  company_name = 'Epic Systems',
  company_website = 'https://epic.com',
  company_logo_url = 'https://logo.clearbit.com/epic.com',
  company_size = '51-200',
  industry = 'Healthcare Technology',
  description = 'Epic Systems develops software for mid-size and large medical groups, hospitals, and integrated healthcare organizations. Our software is used by over 300 million patients worldwide to improve healthcare outcomes.',
  location = 'Verona, WI',
  culture_values = ARRAY['Mission','Quality','Innovation','Integrity','Collaboration'],
  openness_preference = 72,
  conscientiousness_preference = 90,
  extraversion_preference = 65,
  agreeableness_preference = 88,
  neuroticism_preference = 22
WHERE company_name IN ('HealthTech Solutions', 'Epic Systems');

UPDATE public.profiles SET avatar_url = 'https://logo.clearbit.com/epic.com'
WHERE id = (SELECT user_id FROM public.employers WHERE company_name = 'Epic Systems');

-- 6. Tesla
UPDATE public.employers SET
  company_name = 'Tesla',
  company_website = 'https://tesla.com',
  company_logo_url = 'https://logo.clearbit.com/tesla.com',
  company_size = '51-200',
  industry = 'Clean Energy & Automotive',
  description = 'Tesla''s mission is to accelerate the world''s transition to sustainable energy. We design, manufacture, and sell electric vehicles, battery energy storage, solar panels, and related products and services.',
  location = 'Austin, TX',
  culture_values = ARRAY['Innovation','Sustainability','Speed','Impact','Excellence'],
  openness_preference = 92,
  conscientiousness_preference = 78,
  extraversion_preference = 75,
  agreeableness_preference = 60,
  neuroticism_preference = 35
WHERE company_name IN ('GreenEnergy Co', 'Tesla');

UPDATE public.profiles SET avatar_url = 'https://logo.clearbit.com/tesla.com'
WHERE id = (SELECT user_id FROM public.employers WHERE company_name = 'Tesla');

-- 7. Snowflake
UPDATE public.employers SET
  company_name = 'Snowflake',
  company_website = 'https://snowflake.com',
  company_logo_url = 'https://logo.clearbit.com/snowflake.com',
  company_size = '51-200',
  industry = 'Cloud Computing',
  description = 'Snowflake delivers the AI Data Cloud — a global network enabling organizations to mobilize their data with near-unlimited scale, concurrency, and performance. Built for engineering excellence and enterprise reliability.',
  location = 'Bozeman, MT',
  culture_values = ARRAY['Engineering Excellence','Integrity','Customer Success','Innovation','Accountability'],
  openness_preference = 72,
  conscientiousness_preference = 92,
  extraversion_preference = 62,
  agreeableness_preference = 70,
  neuroticism_preference = 25
WHERE company_name IN ('DataFlow Systems', 'Snowflake');

UPDATE public.profiles SET avatar_url = 'https://logo.clearbit.com/snowflake.com'
WHERE id = (SELECT user_id FROM public.employers WHERE company_name = 'Snowflake');

-- 8. Airbnb
UPDATE public.employers SET
  company_name = 'Airbnb',
  company_website = 'https://airbnb.com',
  company_logo_url = 'https://logo.clearbit.com/airbnb.com',
  company_size = '51-200',
  industry = 'Travel & Hospitality',
  description = 'Airbnb is a community-based platform for listing, discovering, and booking unique accommodations and experiences around the world. We believe in creating a world where anyone can belong anywhere.',
  location = 'San Francisco, CA',
  culture_values = ARRAY['Belonging','Creativity','Community','Design','Inclusivity'],
  openness_preference = 92,
  conscientiousness_preference = 75,
  extraversion_preference = 82,
  agreeableness_preference = 88,
  neuroticism_preference = 30
WHERE company_name IN ('Artisan Collective', 'Airbnb');

UPDATE public.profiles SET avatar_url = 'https://logo.clearbit.com/airbnb.com'
WHERE id = (SELECT user_id FROM public.employers WHERE company_name = 'Airbnb');

-- 9. Stripe
UPDATE public.employers SET
  company_name = 'Stripe',
  company_website = 'https://stripe.com',
  company_logo_url = 'https://logo.clearbit.com/stripe.com',
  company_size = '51-200',
  industry = 'Fintech',
  description = 'Stripe is a financial infrastructure platform for businesses. Millions of companies — from startups to Fortune 500s — use Stripe to accept payments, grow their revenue, and accelerate new business opportunities.',
  location = 'San Francisco, CA',
  culture_values = ARRAY['Rigor','Craftsmanship','Trust','User Focus','Innovation'],
  openness_preference = 78,
  conscientiousness_preference = 90,
  extraversion_preference = 65,
  agreeableness_preference = 72,
  neuroticism_preference = 22
WHERE company_name IN ('MetroBank Digital', 'Stripe');

UPDATE public.profiles SET avatar_url = 'https://logo.clearbit.com/stripe.com'
WHERE id = (SELECT user_id FROM public.employers WHERE company_name = 'Stripe');
