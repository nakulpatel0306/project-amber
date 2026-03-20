/**
 * Test script to seed catalog data (photos and hobbies) for candidate users.
 *
 * Run this script to populate test users with random profile photos and hobbies.
 *
 * Usage:
 *   npx ts-node src/scripts/seedCatalogData.ts
 *
 * Or import and call seedCatalogData() from your code.
 */

import { createClient } from '@supabase/supabase-js';
import { HOBBIES } from '../data/hobbies';

// Initialize Supabase client - use environment variables or replace with your values
const supabaseUrl = process.env.VITE_SUPABASE_URL || '';
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || '';

const supabase = createClient(supabaseUrl, supabaseKey);

// Random image sources - using picsum.photos for placeholder images
const getRandomImages = (count: number): string[] => {
  const images: string[] = [];
  for (let i = 0; i < count; i++) {
    // Each image gets a unique seed based on timestamp + index for variety
    const seed = Date.now() + i * 1000;
    images.push(`https://picsum.photos/seed/${seed}/400/400`);
  }
  return images;
};

// Get random hobbies from the hobbies list
const getRandomHobbies = (count: number): string[] => {
  const shuffled = [...HOBBIES].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count).map(h => h.id);
};

// Seed data for a specific user
export async function seedUserCatalog(userId: string, photoCount = 4, hobbyCount = 6) {
  const photos = getRandomImages(photoCount);
  const hobbies = getRandomHobbies(hobbyCount);

  const { error } = await supabase
    .from('candidates')
    .update({
      catalog_photos: photos,
      hobbies: hobbies,
    })
    .eq('user_id', userId);

  if (error) {
    console.error(`Error seeding user ${userId}:`, error);
    return false;
  }

  console.log(`Seeded user ${userId} with ${photoCount} photos and ${hobbyCount} hobbies`);
  return true;
}

// Seed catalog data for all candidates
export async function seedAllCandidates(_photoCount = 4, _hobbyCount = 6) {
  // Fetch all candidate user IDs
  const { data: candidates, error: fetchError } = await supabase
    .from('candidates')
    .select('user_id');

  if (fetchError) {
    console.error('Error fetching candidates:', fetchError);
    return;
  }

  if (!candidates || candidates.length === 0) {
    console.log('No candidates found to seed');
    return;
  }

  console.log(`Found ${candidates.length} candidates to seed...`);

  let successCount = 0;
  for (const candidate of candidates) {
    // Randomize counts slightly for variety
    const photos = Math.floor(Math.random() * 3) + 2; // 2-4 photos
    const hobbies = Math.floor(Math.random() * 5) + 4; // 4-8 hobbies

    const success = await seedUserCatalog(candidate.user_id, photos, hobbies);
    if (success) successCount++;
  }

  console.log(`\nSeeding complete! ${successCount}/${candidates.length} candidates updated.`);
}

// Alternative image sources if picsum doesn't work
export const SAMPLE_HOBBY_IMAGES = {
  outdoors: [
    'https://images.unsplash.com/photo-1551632811-561732d1e306?w=400&h=400&fit=crop',
    'https://images.unsplash.com/photo-1501555088652-021faa106b9b?w=400&h=400&fit=crop',
    'https://images.unsplash.com/photo-1519904981063-b0cf448d479e?w=400&h=400&fit=crop',
  ],
  sports: [
    'https://images.unsplash.com/photo-1461896836934- voices-of-hope?w=400&h=400&fit=crop',
    'https://images.unsplash.com/photo-1530549387789-4c1017266635?w=400&h=400&fit=crop',
    'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=400&h=400&fit=crop',
  ],
  creative: [
    'https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=400&h=400&fit=crop',
    'https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?w=400&h=400&fit=crop',
    'https://images.unsplash.com/photo-1452860606245-08befc0ff44b?w=400&h=400&fit=crop',
  ],
  music: [
    'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=400&h=400&fit=crop',
    'https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?w=400&h=400&fit=crop',
    'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=400&fit=crop',
  ],
  food: [
    'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&h=400&fit=crop',
    'https://images.unsplash.com/photo-1466637574441-749b8f19452f?w=400&h=400&fit=crop',
    'https://images.unsplash.com/photo-1547592180-85f173990554?w=400&h=400&fit=crop',
  ],
  travel: [
    'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=400&h=400&fit=crop',
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop',
    'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=400&h=400&fit=crop',
  ],
};

// Get random images from curated Unsplash collection
export const getRandomUnsplashImages = (count: number): string[] => {
  const allImages = Object.values(SAMPLE_HOBBY_IMAGES).flat();
  const shuffled = [...allImages].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
};

// Seed with curated Unsplash images instead of picsum
export async function seedUserCatalogWithUnsplash(userId: string, photoCount = 4, hobbyCount = 6) {
  const photos = getRandomUnsplashImages(photoCount);
  const hobbies = getRandomHobbies(hobbyCount);

  const { error } = await supabase
    .from('candidates')
    .update({
      catalog_photos: photos,
      hobbies: hobbies,
    })
    .eq('user_id', userId);

  if (error) {
    console.error(`Error seeding user ${userId}:`, error);
    return false;
  }

  console.log(`Seeded user ${userId} with ${photoCount} Unsplash photos and ${hobbyCount} hobbies`);
  return true;
}

// Main execution
if (require.main === module) {
  console.log('Starting catalog data seeding...\n');
  seedAllCandidates()
    .then(() => console.log('\nDone!'))
    .catch(err => console.error('Seeding failed:', err));
}
