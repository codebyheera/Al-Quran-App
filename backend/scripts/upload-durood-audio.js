/**
 * scripts/upload-durood-audio.js (ESM)
 *
 * One-off uploader for the Durood-e-Ibrahim recitation clip used by the
 * Play/Pause button on DuroodSharifPage (frontend/src/pages/DuroodSharifPage.jsx).
 * Uploads a local mp3 file into a new "misc-audio" Supabase Storage bucket
 * (created automatically if missing), as "durood-e-ibrahim.mp3" — the exact
 * path frontend/src/lib/audioSource.js's getDuroodAudioUrl() expects.
 *
 * Usage:
 *   node scripts/upload-durood-audio.js "C:\path\to\durood.mp3"
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '..', '.env') });

const BUCKET = 'misc-audio';
const OBJECT_NAME = 'durood-e-ibrahim.mp3';

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('Missing SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY in backend/.env');
  process.exit(1);
}

const filePath = process.argv[2];
if (!filePath) {
  console.error('Usage: node scripts/upload-durood-audio.js <path-to-mp3>');
  process.exit(1);
}
if (!fs.existsSync(filePath)) {
  console.error(`File not found: ${filePath}`);
  process.exit(1);
}
if (path.extname(filePath).toLowerCase() !== '.mp3') {
  console.error('Expected an .mp3 file (the frontend requests this bucket path with a .mp3 extension).');
  process.exit(1);
}

// autoRefreshToken/persistSession: same reasoning as upload-urdu-audio.js —
// this is a one-shot script, and leaving them on keeps a background timer
// alive that crashes Node on exit on Windows.
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

async function ensureBucket() {
  const { data: buckets, error } = await supabase.storage.listBuckets();
  if (error) throw new Error(`listBuckets failed: ${error.message}`);
  if (buckets.some((b) => b.name === BUCKET)) return;

  console.log(`Bucket "${BUCKET}" not found — creating it (public)...`);
  const { error: createErr } = await supabase.storage.createBucket(BUCKET, { public: true });
  if (createErr) throw new Error(`createBucket failed: ${createErr.message}`);
}

async function main() {
  const buffer = fs.readFileSync(filePath);
  console.log(`Read ${filePath} (${(buffer.length / 1024).toFixed(1)} KB)`);

  await ensureBucket();

  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(OBJECT_NAME, buffer, { contentType: 'audio/mpeg', upsert: true });
  if (error) throw new Error(`upload failed: ${error.message}`);

  const { data } = supabase.storage.from(BUCKET).getPublicUrl(OBJECT_NAME);
  console.log('\nUploaded successfully.');
  console.log(`Public URL: ${data.publicUrl}`);
  console.log('\nThe Play button on /durood-sharif will pick this up automatically —');
  console.log('no other config needed (it builds this same URL from VITE_SUPABASE_URL).');
}

main().catch((err) => {
  console.error('\nFatal error:', err.message);
  process.exitCode = 1;
});
