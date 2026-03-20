/**
 * Check all tables for user data
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://fnjjilryapsxhzxoqyzi.supabase.co';
const supabaseKey = 'sb_publishable_04F3fCq6svuNIt-8OFE_KA_Dja1mA6D';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkTable(tableName) {
  const { count, error } = await supabase
    .from(tableName)
    .select('*', { count: 'exact', head: true });

  if (error) {
    console.log(`  ${tableName}: ERROR - ${error.message}`);
  } else {
    console.log(`  ${tableName}: ${count} rows`);
  }
}

async function main() {
  console.log('Checking tables...\n');

  await checkTable('profiles');
  await checkTable('candidates');
  await checkTable('employers');
  await checkTable('roles');

  console.log('\nNote: If counts are 0, either:');
  console.log('  - No users have signed up yet');
  console.log('  - RLS policies are blocking anon access');
  console.log('\nYou may need to sign up some test users first.');
}

main().catch(console.error);
