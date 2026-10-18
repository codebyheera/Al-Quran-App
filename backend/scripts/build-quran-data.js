/**
 * scripts/build-quran-data.js
 * Copies the 114 Surah payloads cached by frontend/scripts/download-surahs.js
 * into backend/data/surahs/<number>.json (minified), so /api/surah/:id and
 * /api/juz/:id are served from local data instead of depending on Al-Quran
 * Cloud / Quran.com being up for every request.
 *
 * Usage (from backend/):  node scripts/build-quran-data.js
 * Re-run after refreshing the frontend cache, then commit backend/data/surahs.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SRC_DIR = path.resolve(__dirname, '../../frontend/src/data/surahs');
const OUT_DIR = path.resolve(__dirname, '../data/surahs');

const files = fs.readdirSync(SRC_DIR).filter((f) => f.endsWith('.json'));
if (files.length !== 114) {
  console.error(`❌ Expected 114 Surah files in ${SRC_DIR}, found ${files.length}.`);
  process.exit(1);
}

fs.mkdirSync(OUT_DIR, { recursive: true });
let totalVerses = 0;

for (const file of files) {
  const raw = fs.readFileSync(path.join(SRC_DIR, file), 'utf8');
  if (raw.includes('�')) {
    console.error(`❌ ${file} contains U+FFFD (corrupted text) — re-run frontend/scripts/download-surahs.js first.`);
    process.exit(1);
  }
  const surah = JSON.parse(raw);
  if (surah.verses?.length !== surah.versesCount || surah.verses.some((v) => !v.words?.length)) {
    console.error(`❌ ${file} is incomplete (verses or word-by-word data missing).`);
    process.exit(1);
  }
  delete surah.preloadedReciter;
  fs.writeFileSync(path.join(OUT_DIR, `${surah.surahNumber}.json`), JSON.stringify(surah), 'utf8');
  totalVerses += surah.verses.length;
}

if (totalVerses !== 6236) {
  console.error(`❌ Expected 6236 verses in total, found ${totalVerses}.`);
  process.exit(1);
}
console.log(`✅ Wrote 114 Surahs (${totalVerses} verses) to ${OUT_DIR}`);
