/**
 * lib/localQuran.js — Local Surah dataset (ESM)
 *
 * backend/data/surahs/<number>.json holds each Surah's full API payload
 * (text, translations, word-by-word data) as built by scripts/build-quran-data.js.
 * Serving from it means a Surah/Juz request needs no upstream API at all — the
 * routes only fall back to Al-Quran Cloud / Quran.com if a file is missing.
 * Its audio URLs are for Alafasy; routes swap in the requested reciter's.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_DIR = path.join(__dirname, '..', 'data', 'surahs');

/** The stored payload for Surah `num` (1–114), or null if it isn't available. */
export function readLocalSurah(num) {
  try {
    return JSON.parse(fs.readFileSync(path.join(DATA_DIR, `${num}.json`), 'utf8'));
  } catch (err) {
    console.warn(`[localQuran] Surah ${num} not available locally: ${err.message}`);
    return null;
  }
}
