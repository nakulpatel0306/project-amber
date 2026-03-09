-- ============================================
-- SEED CATALOG DATA (Hobbies & Photos)
-- ============================================
-- This script adds hobbies and catalog_photos columns to candidates table
-- and seeds all existing candidates with random test data.
--
-- Run this in your Supabase SQL Editor.

-- Step 1: Add columns if they don't exist
ALTER TABLE candidates
ADD COLUMN IF NOT EXISTS hobbies text[] DEFAULT '{}';

ALTER TABLE candidates
ADD COLUMN IF NOT EXISTS catalog_photos text[] DEFAULT '{}';

-- Add catalog_photos_data for photos with captions (JSONB array)
-- Format: [{"url": "...", "caption": "..."}, ...]
ALTER TABLE candidates
ADD COLUMN IF NOT EXISTS catalog_photos_data jsonb DEFAULT '[]'::jsonb;

-- Step 1b: Ensure RLS policy allows reading other candidates' catalog data
-- Drop existing policy if it exists to avoid conflicts
DROP POLICY IF EXISTS "Users can view all candidate profiles" ON candidates;

-- Create policy to allow authenticated users to view all candidates
CREATE POLICY "Users can view all candidate profiles"
ON candidates FOR SELECT
TO authenticated
USING (true);

-- Ensure profiles are also readable
DROP POLICY IF EXISTS "Users can view all profiles" ON profiles;

CREATE POLICY "Users can view all profiles"
ON profiles FOR SELECT
TO authenticated
USING (true);

-- Step 2: Create arrays of sample data
DO $$
DECLARE
  candidate_record RECORD;
  random_hobbies text[];
  random_photos text[];
  all_hobbies text[] := ARRAY[
    'painting', 'drawing', 'photography', 'writing', 'sculpting', 'digital-art', 'calligraphy', 'origami',
    'running', 'swimming', 'cycling', 'yoga', 'basketball', 'soccer', 'tennis', 'golf', 'hiking', 'climbing',
    'camping', 'fishing', 'surfing', 'skiing', 'snowboarding', 'kayaking',
    'video-games', 'board-games', 'chess', 'poker', 'dnd', 'esports',
    'guitar', 'piano', 'drums', 'singing', 'dj', 'violin', 'music-production',
    'cooking', 'baking', 'grilling', 'wine-tasting', 'coffee', 'mixology',
    'reading', 'languages', 'history', 'science', 'philosophy', 'podcasts',
    'travel', 'volunteering', 'networking', 'dancing', 'karaoke',
    'meditation', 'fitness', 'martial-arts', 'spa', 'nutrition',
    'coding', 'robotics', '3d-printing', 'electronics', 'ai-ml',
    'woodworking', 'knitting', 'pottery', 'jewelry', 'leather-craft', 'sewing',
    'coins', 'stamps', 'vinyl', 'sneakers', 'art-collecting', 'antiques'
  ];
  all_photos text[] := ARRAY[
    'https://images.unsplash.com/photo-1551632811-561732d1e306?w=400&h=400&fit=crop',
    'https://images.unsplash.com/photo-1501555088652-021faa106b9b?w=400&h=400&fit=crop',
    'https://images.unsplash.com/photo-1519904981063-b0cf448d479e?w=400&h=400&fit=crop',
    'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=400&h=400&fit=crop',
    'https://images.unsplash.com/photo-1530549387789-4c1017266635?w=400&h=400&fit=crop',
    'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=400&h=400&fit=crop',
    'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=400&h=400&fit=crop',
    'https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=400&h=400&fit=crop',
    'https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?w=400&h=400&fit=crop',
    'https://images.unsplash.com/photo-1452860606245-08befc0ff44b?w=400&h=400&fit=crop',
    'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=400&h=400&fit=crop',
    'https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?w=400&h=400&fit=crop',
    'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=400&fit=crop',
    'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&h=400&fit=crop',
    'https://images.unsplash.com/photo-1466637574441-749b8f19452f?w=400&h=400&fit=crop',
    'https://images.unsplash.com/photo-1547592180-85f173990554?w=400&h=400&fit=crop',
    'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=400&h=400&fit=crop',
    'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=400&h=400&fit=crop',
    'https://images.unsplash.com/photo-1538481199705-c710c4e965fc?w=400&h=400&fit=crop',
    'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=400&h=400&fit=crop',
    'https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=400&h=400&fit=crop',
    'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=400&h=400&fit=crop',
    'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=400&fit=crop',
    'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=400&h=400&fit=crop',
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop',
    'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=400&h=400&fit=crop',
    'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&h=400&fit=crop',
    'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=400&h=400&fit=crop',
    'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400&h=400&fit=crop',
    'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=400&h=400&fit=crop'
  ];
  hobby_count int;
  photo_count int;
  shuffled_hobbies text[];
  shuffled_photos text[];
BEGIN
  -- Loop through all candidates
  FOR candidate_record IN SELECT id, user_id FROM candidates LOOP
    -- Random number of hobbies (4-8)
    hobby_count := 4 + floor(random() * 5)::int;
    -- Random number of photos (2-5)
    photo_count := 2 + floor(random() * 4)::int;

    -- Shuffle and pick random hobbies
    SELECT array_agg(h ORDER BY random())
    INTO shuffled_hobbies
    FROM unnest(all_hobbies) AS h;

    random_hobbies := shuffled_hobbies[1:hobby_count];

    -- Shuffle and pick random photos
    SELECT array_agg(p ORDER BY random())
    INTO shuffled_photos
    FROM unnest(all_photos) AS p;

    random_photos := shuffled_photos[1:photo_count];

    -- Update the candidate
    UPDATE candidates
    SET
      hobbies = random_hobbies,
      catalog_photos = random_photos
    WHERE id = candidate_record.id;

    RAISE NOTICE 'Seeded candidate %: % hobbies, % photos',
      candidate_record.user_id,
      array_length(random_hobbies, 1),
      array_length(random_photos, 1);
  END LOOP;
END $$;

-- Step 3: Verify the results
SELECT
  c.id,
  p.full_name,
  array_length(c.hobbies, 1) as hobby_count,
  array_length(c.catalog_photos, 1) as photo_count,
  c.hobbies[1:3] as sample_hobbies
FROM candidates c
JOIN profiles p ON c.user_id = p.id
ORDER BY p.full_name;
