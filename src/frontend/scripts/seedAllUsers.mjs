/**
 * Script to seed all candidates with random photos and hobbies.
 * Run with: node scripts/seedAllUsers.mjs
 */

import { createClient } from '@supabase/supabase-js';

// Supabase config
const supabaseUrl = 'https://fnjjilryapsxhzxoqyzi.supabase.co';
const supabaseKey = 'sb_publishable_04F3fCq6svuNIt-8OFE_KA_Dja1mA6D';

const supabase = createClient(supabaseUrl, supabaseKey);

// Hobbies data
const HOBBIES = [
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

// Curated images
const CURATED_IMAGES = [
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
];

// Get random items from array
function getRandomItems(arr, count) {
  const shuffled = [...arr].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, Math.min(count, arr.length));
}

// Seed a single user
async function seedUser(userId, index) {
  const photoCount = Math.floor(Math.random() * 4) + 2; // 2-5 photos
  const hobbyCount = Math.floor(Math.random() * 5) + 4; // 4-8 hobbies

  const photos = getRandomItems(CURATED_IMAGES, photoCount);
  const hobbies = getRandomItems(HOBBIES, hobbyCount);

  const { error } = await supabase
    .from('candidates')
    .update({
      catalog_photos: photos,
      hobbies: hobbies,
    })
    .eq('user_id', userId);

  if (error) {
    console.error(`  [${index}] Error seeding ${userId}:`, error.message);
    return false;
  }

  console.log(`  [${index}] Seeded ${userId}: ${photos.length} photos, ${hobbies.length} hobbies`);
  return true;
}

// Main function
async function main() {
  console.log('Fetching all candidates...\n');

  const { data: candidates, error: fetchError } = await supabase
    .from('candidates')
    .select('user_id');

  if (fetchError) {
    console.error('Error fetching candidates:', fetchError);
    process.exit(1);
  }

  if (!candidates || candidates.length === 0) {
    console.log('No candidates found in database.');
    process.exit(0);
  }

  console.log(`Found ${candidates.length} candidates. Seeding...\n`);

  let success = 0;
  let failed = 0;

  for (let i = 0; i < candidates.length; i++) {
    const result = await seedUser(candidates[i].user_id, i + 1);
    if (result) {
      success++;
    } else {
      failed++;
    }
  }

  console.log('\n========================================');
  console.log(`Seeding complete!`);
  console.log(`  Success: ${success}`);
  console.log(`  Failed: ${failed}`);
  console.log(`  Total: ${candidates.length}`);
  console.log('========================================\n');
}

main().catch(console.error);
