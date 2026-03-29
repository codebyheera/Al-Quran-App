/**
 * lib/supabase.js — Supabase client singleton (ESM)
 * Connects to Supabase using the project URL and anon/publishable key.
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ SUPABASE_URL or SUPABASE_KEY missing from environment variables!');
} else {
  console.log('✅ Supabase client initialized:', supabaseUrl);
}

export const supabase = createClient(supabaseUrl, supabaseKey);
