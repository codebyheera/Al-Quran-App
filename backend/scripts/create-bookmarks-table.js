/**
 * scripts/create-bookmarks-table.js
 * Runs the bookmarks table setup SQL via Supabase's pg_query RPC.
 * Usage: node scripts/create-bookmarks-table.js
 */

import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ SUPABASE_URL or SUPABASE_KEY missing from .env');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// We'll use the Supabase REST API to execute DDL via the Management API
// Since we only have the anon key, we'll use the pg extension if available,
// otherwise we'll use the REST endpoint directly.

async function runSQL(sql) {
  const response = await fetch(`${supabaseUrl}/rest/v1/rpc/exec_sql`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'apikey': supabaseKey,
      'Authorization': `Bearer ${supabaseKey}`,
    },
    body: JSON.stringify({ sql }),
  });

  const text = await response.text();
  return { status: response.status, body: text };
}

async function createTableViaManagementAPI() {
  // Extract project ref from URL: https://<ref>.supabase.co
  const projectRef = supabaseUrl.replace('https://', '').split('.')[0];

  // Try Supabase Management API (requires service_role or management token)
  const SQL = `
    CREATE TABLE IF NOT EXISTS bookmarks (
      id         uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id    text        NOT NULL,
      post_id    text        NOT NULL,
      created_at timestamptz NOT NULL DEFAULT now(),
      CONSTRAINT bookmarks_user_post_unique UNIQUE (user_id, post_id)
    );

    CREATE INDEX IF NOT EXISTS idx_bookmarks_user_id ON bookmarks (user_id);

    ALTER TABLE bookmarks DISABLE ROW LEVEL SECURITY;
  `;

  console.log('🔧 Attempting to create bookmarks table...');
  console.log('📡 Supabase URL:', supabaseUrl);
  console.log('🏷️  Project ref:', projectRef);

  // Method 1: Try using Management API
  const mgmtResponse = await fetch(
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

  if (mgmtResponse.ok) {
    const result = await mgmtResponse.json();
    console.log('✅ Table created successfully via Management API!');
    console.log('Result:', JSON.stringify(result, null, 2));
    return true;
  }

  const mgmtText = await mgmtResponse.text();
  console.log(`⚠️  Management API failed (${mgmtResponse.status}): ${mgmtText}`);

  // Method 2: Try inserting a test row to check if table already exists
  console.log('\n🔍 Checking if bookmarks table already exists...');
  const { data, error } = await supabase
    .from('bookmarks')
    .select('id')
    .limit(1);

  if (!error) {
    console.log('✅ bookmarks table already exists and is accessible!');
    console.log('   Rows found:', data?.length ?? 0);
    return true;
  }

  if (error.code === '42P01') {
    console.error('❌ Table does not exist yet.');
    console.log('\n📋 Please run this SQL manually in the Supabase SQL Editor:');
    console.log('   https://supabase.com/dashboard/project/' + projectRef + '/sql/new\n');
    console.log(SQL);
    return false;
  }

  if (error.code === '42501') {
    console.error('❌ Table exists but Row Level Security (RLS) is blocking access.');
    console.log('   → Go to Supabase > Authentication > Policies and disable RLS for the bookmarks table,');
    console.log('   OR run: ALTER TABLE bookmarks DISABLE ROW LEVEL SECURITY;');
    return false;
  }

  console.error('❌ Unexpected error:', error.message, '(code:', error.code, ')');
  return false;
}

createTableViaManagementAPI().then((success) => {
  process.exit(success ? 0 : 1);
});
