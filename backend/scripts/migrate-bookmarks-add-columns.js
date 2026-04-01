/**
 * scripts/migrate-bookmarks-add-columns.js
 * Adds surah_name, arabic_text, translation columns to the existing bookmarks table.
 * Safe to run multiple times (uses IF NOT EXISTS via ALTER TABLE ... ADD COLUMN IF NOT EXISTS).
 * Usage: node scripts/migrate-bookmarks-add-columns.js
 */

import 'dotenv/config';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ SUPABASE_URL or SUPABASE_KEY missing from .env');
  process.exit(1);
}

const projectRef = supabaseUrl.replace('https://', '').split('.')[0];

const SQL = `
ALTER TABLE bookmarks ADD COLUMN IF NOT EXISTS surah_name  text;
ALTER TABLE bookmarks ADD COLUMN IF NOT EXISTS arabic_text text;
ALTER TABLE bookmarks ADD COLUMN IF NOT EXISTS translation text;
`;

console.log('🔧 Running migration: adding surah_name, arabic_text, translation columns...');
console.log('📡 Project:', projectRef);

const response = await fetch(
  `https://api.supabase.com/v1/projects/${projectRef}/database/query`,
  {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${supabaseKey}`,
    },
    body: JSON.stringify({ query: SQL }),
  }
);

if (response.ok) {
  const result = await response.json();
  console.log('✅ Migration successful!');
  console.log('Result:', JSON.stringify(result, null, 2));
  process.exit(0);
}

const text = await response.text();
console.warn(`⚠️  Management API failed (${response.status}): ${text}`);
console.log('\n📋 Please run this SQL manually in the Supabase SQL Editor:');
console.log(`   https://supabase.com/dashboard/project/${projectRef}/sql/new\n`);
console.log(SQL);
process.exit(1);
