/**
 * lib/supabase.js — Supabase single client instance (ESM)
 * Used to securely connect to Supabase PostgreSQL over Serverless HTTP APIs.
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_KEY || '';

if (!supabaseUrl || !supabaseKey) {
  console.warn('⚠️ Missing Supabase URL or Key in environment variables.');
}

export const supabase = createClient(supabaseUrl, supabaseKey);
