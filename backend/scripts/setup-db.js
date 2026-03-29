/**
 * scripts/setup-db.js — Create Supabase tables if they don't exist
 * Run once: node scripts/setup-db.js
 */

import dotenv from 'dotenv';
dotenv.config();

import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);

async function setup() {
  console.log('🔧 Setting up Supabase tables...');
  console.log('   URL:', process.env.SUPABASE_URL);

  // Test connection first
  const { data: test, error: testErr } = await supabase
    .from('bookmarks')
    .select('count')
    .limit(1);

  if (testErr && testErr.code === '42P01') {
    console.log('⚠️  Table does not exist — please create it via Supabase SQL Editor:');
    console.log(`
CREATE TABLE IF NOT EXISTS bookmarks (
  id           uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id    text NOT NULL,
  surah_number integer NOT NULL,
  surah_name   text,
  verse_number integer NOT NULL,
  arabic_text  text,
  translation  text,
  note         text DEFAULT '',
  created_at   timestamptz DEFAULT now(),
  UNIQUE(client_id, surah_number, verse_number)
);
    `);
  } else if (testErr) {
    console.error('❌ Connection error:', testErr.message);
    console.log('\n💡 Make sure SUPABASE_URL and SUPABASE_KEY are correct in .env');
  } else {
    console.log('✅ Connected! bookmarks table exists and is ready.');
  }
}

setup();
