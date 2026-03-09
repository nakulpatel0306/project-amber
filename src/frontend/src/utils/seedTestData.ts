/**
 * Test utility to seed catalog data (photos and hobbies) for testing purposes.
 * Can be imported and used in the browser/React app.
 *
 * Example usage in browser console or component:
 *   import { seedMyProfile, seedAllCandidatesWithTestData } from './utils/seedTestData';
 *   await seedMyProfile(userId);
 */

import { supabase } from '../lib/supabase';
import { HOBBIES } from '../data/hobbies';

// Sample images from picsum.photos (random placeholder images)
const generatePicsumImages = (count: number, userId: string): string[] => {
  const images: string[] = [];
  for (let i = 0; i < count; i++) {
    // Use user ID + index as seed for consistent but unique images per user
    const seed = `${userId.slice(0, 8)}-${i}`;
    images.push(`https://picsum.photos/seed/${seed}/400/400`);
  }
  return images;
};

// Curated Unsplash images for more realistic test data
const CURATED_IMAGES = [
  // Outdoors/Nature
  'https://images.unsplash.com/photo-1551632811-561732d1e306?w=400&h=400&fit=crop',
  'https://images.unsplash.com/photo-1501555088652-021faa106b9b?w=400&h=400&fit=crop',
  'https://images.unsplash.com/photo-1519904981063-b0cf448d479e?w=400&h=400&fit=crop',
  'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=400&h=400&fit=crop',
  // Sports/Fitness
  'https://images.unsplash.com/photo-1530549387789-4c1017266635?w=400&h=400&fit=crop',
  'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=400&h=400&fit=crop',
  'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=400&h=400&fit=crop',
  // Creative/Art
  'https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=400&h=400&fit=crop',
  'https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?w=400&h=400&fit=crop',
  'https://images.unsplash.com/photo-1452860606245-08befc0ff44b?w=400&h=400&fit=crop',
  // Music
  'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=400&h=400&fit=crop',
  'https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?w=400&h=400&fit=crop',
  'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=400&fit=crop',
  // Food/Cooking
  'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&h=400&fit=crop',
  'https://images.unsplash.com/photo-1466637574441-749b8f19452f?w=400&h=400&fit=crop',
  'https://images.unsplash.com/photo-1547592180-85f173990554?w=400&h=400&fit=crop',
  // Travel
  'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=400&h=400&fit=crop',
  'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=400&h=400&fit=crop',
  // Gaming/Tech
  'https://images.unsplash.com/photo-1538481199705-c710c4e965fc?w=400&h=400&fit=crop',
  'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=400&h=400&fit=crop',
  // Pets
  'https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=400&h=400&fit=crop',
  'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=400&h=400&fit=crop',
];

// Get random items from an array
const getRandomItems = <T>(arr: T[], count: number): T[] => {
  const shuffled = [...arr].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, Math.min(count, arr.length));
};

// Get random hobbies
const getRandomHobbies = (count: number): string[] => {
  return getRandomItems(HOBBIES, count).map(h => h.id);
};

// Get random curated images
const getRandomCuratedImages = (count: number): string[] => {
  return getRandomItems(CURATED_IMAGES, count);
};

/**
 * Seed a single user's profile with test data
 */
export async function seedMyProfile(
  userId: string,
  options: { photoCount?: number; hobbyCount?: number; usePicsum?: boolean } = {}
): Promise<{ success: boolean; error?: string }> {
  const { photoCount = 4, hobbyCount = 6, usePicsum = false } = options;

  try {
    const photos = usePicsum
      ? generatePicsumImages(photoCount, userId)
      : getRandomCuratedImages(photoCount);
    const hobbies = getRandomHobbies(hobbyCount);

    const { error } = await supabase
      .from('candidates')
      .update({
        catalog_photos: photos,
        hobbies: hobbies,
      })
      .eq('user_id', userId);

    if (error) throw error;

    console.log(`Seeded profile for user ${userId}:`);
    console.log(`  Photos: ${photos.length}`);
    console.log(`  Hobbies: ${hobbies.join(', ')}`);

    return { success: true };
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : 'Unknown error';
    console.error('Failed to seed profile:', errorMsg);
    return { success: false, error: errorMsg };
  }
}

/**
 * Seed all candidates with random test data
 */
export async function seedAllCandidatesWithTestData(
  options: { usePicsum?: boolean } = {}
): Promise<{ success: number; failed: number; total: number }> {
  const { usePicsum = false } = options;

  // Fetch all candidates
  const { data: candidates, error: fetchError } = await supabase
    .from('candidates')
    .select('user_id');

  if (fetchError) {
    console.error('Failed to fetch candidates:', fetchError);
    return { success: 0, failed: 0, total: 0 };
  }

  if (!candidates || candidates.length === 0) {
    console.log('No candidates found');
    return { success: 0, failed: 0, total: 0 };
  }

  console.log(`Seeding ${candidates.length} candidates...`);

  let success = 0;
  let failed = 0;

  for (const candidate of candidates) {
    // Randomize counts for variety
    const photoCount = Math.floor(Math.random() * 4) + 2; // 2-5 photos
    const hobbyCount = Math.floor(Math.random() * 5) + 4; // 4-8 hobbies

    const result = await seedMyProfile(candidate.user_id, {
      photoCount,
      hobbyCount,
      usePicsum,
    });

    if (result.success) {
      success++;
    } else {
      failed++;
    }
  }

  console.log(`\nSeeding complete: ${success} success, ${failed} failed, ${candidates.length} total`);
  return { success, failed, total: candidates.length };
}

/**
 * Clear catalog data for a user (reset to empty)
 */
export async function clearMyProfile(userId: string): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase
      .from('candidates')
      .update({
        catalog_photos: [],
        hobbies: [],
      })
      .eq('user_id', userId);

    if (error) throw error;

    console.log(`Cleared profile data for user ${userId}`);
    return { success: true };
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : 'Unknown error';
    console.error('Failed to clear profile:', errorMsg);
    return { success: false, error: errorMsg };
  }
}
