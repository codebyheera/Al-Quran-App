/**
 * lib/supabase.js — Supabase client singleton (ESM)
 * Connects to Supabase using the project URL and the service_role key
 * (falls back to the anon key if SUPABASE_SERVICE_ROLE_KEY is not set).
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ SUPABASE_URL or SUPABASE_KEY missing from environment variables! API queries will fail.');
} else {
  console.log('✅ Supabase client initialized:', supabaseUrl);
}

// Fallback to dummy strings to prevent instant server crash on import
export const supabase = createClient(
  supabaseUrl || 'https://missing-url.supabase.co',
  supabaseKey || 'missing-key'
);
