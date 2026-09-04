/**
 * scripts/upload-urdu-audio.js (ESM)
 *
 * Downloads the Urdu translation audio for all 114 Surahs / 6236 Ayahs
 * from the Al Quran Cloud API (edition "ur.khan") and uploads each ayah
 * as an MP3 into the Supabase Storage bucket "quran-audio-urdu".
 *
 * Resumable: progress is written to progress.json after every ayah, so
 * re-running the script (or recovering from Ctrl+C) skips whatever is
 * already uploaded. Ayahs that fail after retries are logged to
 * failed-ayats.json instead of stopping the run.
 *
 * Usage:
 *   node scripts/upload-urdu-audio.js
 */

import axios from 'axios';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '..', '.env') });

const ALQURAN_EDITION_URL = 'https://api.alquran.cloud/v1/quran/ur.khan';
const BUCKET = 'quran-audio-urdu';

const PROGRESS_FILE = path.join(__dirname, 'progress.json');
const FAILED_FILE = path.join(__dirname, 'failed-ayats.json');

const MAX_ATTEMPTS = 3; // 1 initial try + 2 retries
const RETRY_BACKOFF_MS = 1500;
const MIN_DELAY_MS = 400;
const MAX_DELAY_MS = 500;
const DOWNLOAD_TIMEOUT_MS = 30000;

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('Missing SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY in backend/.env');
  process.exit(1);
}

// autoRefreshToken/persistSession are irrelevant for a service-role script
// and, left on, keep a background timer alive that crashes Node on exit
// (libuv "UV_HANDLE_CLOSING" assertion on Windows) when process.exit() runs.
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

// ---------- progress / failure tracking ----------

function loadProgress() {
  if (!fs.existsSync(PROGRESS_FILE)) return new Set();
  try {
    const raw = JSON.parse(fs.readFileSync(PROGRESS_FILE, 'utf8'));
    return new Set(Array.isArray(raw) ? raw : raw.done || []);
  } catch {
    return new Set();
  }
}

let doneSet = loadProgress();
let failedList = [];
if (fs.existsSync(FAILED_FILE)) {
  try {
    failedList = JSON.parse(fs.readFileSync(FAILED_FILE, 'utf8'));
  } catch {
    failedList = [];
  }
}

function saveProgress() {
  fs.writeFileSync(PROGRESS_FILE, JSON.stringify([...doneSet], null, 0), 'utf8');
}

function saveFailed() {
  fs.writeFileSync(FAILED_FILE, JSON.stringify(failedList, null, 2), 'utf8');
}

// ---------- graceful Ctrl+C handling ----------

let interrupted = false;
process.on('SIGINT', () => {
  if (interrupted) {
    process.exitCode = 1; // second Ctrl+C forces immediate exit
    return;
  }
  interrupted = true;
  console.log('\n\nInterrupt received — finishing current ayah then stopping...');
});

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const randomDelay = () => sleep(MIN_DELAY_MS + Math.random() * (MAX_DELAY_MS - MIN_DELAY_MS));

// ---------- core work ----------

async function fetchQuranData() {
  console.log('Fetching full Quran data (ur.khan edition)...');
  const { data } = await axios.get(ALQURAN_EDITION_URL, { timeout: DOWNLOAD_TIMEOUT_MS });
  if (!data || data.code !== 200 || !data.data || !data.data.surahs) {
    throw new Error('Unexpected response shape from Al Quran Cloud API');
  }
  return data.data.surahs; // array of 114 surahs, each with .ayahs[]
}

async function ensureBucket() {
  const { data: buckets, error } = await supabase.storage.listBuckets();
  if (error) throw new Error(`listBuckets failed: ${error.message}`);
  if (buckets.some((b) => b.name === BUCKET)) return;

  console.log(`Bucket "${BUCKET}" not found — creating it...`);
  const { error: createErr } = await supabase.storage.createBucket(BUCKET, { public: true });
  if (createErr) throw new Error(`createBucket failed: ${createErr.message}`);
}

async function downloadAudio(url) {
  const res = await axios.get(url, {
    responseType: 'arraybuffer',
    timeout: DOWNLOAD_TIMEOUT_MS,
  });
  return Buffer.from(res.data);
}

async function uploadToSupabase(fileName, buffer) {
  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(fileName, buffer, { contentType: 'audio/mpeg', upsert: true });
  if (error) throw new Error(`upload failed: ${error.message}`);
}

async function processAyah(ayah) {
  const buffer = await downloadAudio(ayah.audioUrl);
  await uploadToSupabase(ayah.fileName, buffer);
}

async function processWithRetry(ayah) {
  let lastError;
  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    try {
      await processAyah(ayah);
      return { ok: true };
    } catch (err) {
      lastError = err;
      if (attempt < MAX_ATTEMPTS) {
        await sleep(RETRY_BACKOFF_MS * attempt);
      }
    }
  }
  return { ok: false, error: lastError };
}

async function main() {
  const surahs = await fetchQuranData();

  const ayahs = [];
  for (const surah of surahs) {
    for (const ayah of surah.ayahs) {
      const numInSurah = String(ayah.numberInSurah).padStart(3, '0');
      const surahNum = String(surah.number).padStart(3, '0');
      ayahs.push({
        surahNumber: surah.number,
        ayahNumberInSurah: ayah.numberInSurah,
        globalNumber: ayah.number,
        audioUrl: ayah.audio,
        fileName: `${surahNum}_${numInSurah}.mp3`,
        key: `${surahNum}_${numInSurah}`,
      });
    }
  }

  const total = ayahs.length;
  console.log(`Loaded ${total} ayahs across ${surahs.length} surahs.`);

  await ensureBucket();

  let uploaded = 0;
  let skipped = 0;
  let failed = 0;

  for (let i = 0; i < ayahs.length; i++) {
    if (interrupted) break;

    const ayah = ayahs[i];
    const progressLabel = `[${i + 1}/${total}] Surah ${ayah.surahNumber}, Ayat ${ayah.ayahNumberInSurah}`;

    if (doneSet.has(ayah.key)) {
      skipped++;
      console.log(`${progressLabel} - skipped (already done)`);
      continue;
    }

    if (!ayah.audioUrl) {
      failed++;
      failedList.push({
        key: ayah.key,
        surahNumber: ayah.surahNumber,
        ayahNumberInSurah: ayah.ayahNumberInSurah,
        globalNumber: ayah.globalNumber,
        error: 'No audioUrl in API response',
      });
      saveFailed();
      console.log(`${progressLabel} - failed (no audio url)`);
      continue;
    }

    const result = await processWithRetry(ayah);

    if (result.ok) {
      uploaded++;
      doneSet.add(ayah.key);
      saveProgress();
      console.log(`${progressLabel} - uploaded`);
    } else {
      failed++;
      failedList.push({
        key: ayah.key,
        surahNumber: ayah.surahNumber,
        ayahNumberInSurah: ayah.ayahNumberInSurah,
        globalNumber: ayah.globalNumber,
        error: result.error?.message || String(result.error),
      });
      saveFailed();
      console.log(`${progressLabel} - failed (${result.error?.message || result.error})`);
    }

    await randomDelay();
  }

  saveProgress();
  saveFailed();

  console.log('\n----- Summary -----');
  console.log(`Total ayahs:     ${total}`);
  console.log(`Uploaded:        ${uploaded}`);
  console.log(`Skipped (done):  ${skipped}`);
  console.log(`Failed:          ${failed}`);
  if (interrupted) console.log('Run was interrupted — progress saved, re-run to resume.');
  if (failed > 0) console.log(`See ${FAILED_FILE} for details on failed ayahs.`);
}

main()
  .then(() => {
    process.exitCode = interrupted ? 130 : 0;
  })
  .catch((e) => {
    console.error('\nFatal error:', e.message);
    saveProgress();
    saveFailed();
    process.exitCode = 1;
  });
