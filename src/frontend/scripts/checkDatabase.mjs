/**
 * Check database status
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://fnjjilryapsxhzxoqyzi.supabase.co';
const supabaseKey = 'sb_publishable_04F3fCq6svuNIt-8OFE_KA_Dja1mA6D';

const supabase = createClient(supabaseUrl, supabaseKey);

async function main() {
  console.log('Checking database...\n');

  // Check candidates table
  const { data: candidates, error: candidatesError, count } = await supabase
    .from('candidates')
    .select('*', { count: 'exact', head: true });

  if (candidatesError) {
    console.log('Candidates table error:', candidatesError.message);
  } else {
    console.log('Candidates count:', count);
  }

  // Try to get table structure
  const { data: sample, error: sampleError } = await supabase
    .from('candidates')
    .select('user_id, hobbies, catalog_photos')
    .limit(1);

  if (sampleError) {
    console.log('Sample query error:', sampleError.message);
  } else {
    console.log('Sample data:', sample);
  }
}

main().catch(console.error);
