/**
 * scripts/add-indopak-text.js
 * Adds the IndoPak (Nastaleeq) text to the stored Surah data, in place:
 *   - backend/data/surahs/<number>.json      (served by the API)
 *   - frontend/src/data/surahs/<name>.json    (the cache download-surahs.js
 *                                               keeps and build-quran-data.js copies)
 * Each word gets `text_indopak` and each verse `indopakEnd` (ayah number with
 * Ruku/Sajda signs). See lib/indopak.js.
 *
 * Usage (from backend/):  node scripts/add-indopak-text.js
 * Fails without writing anything if any verse doesn't match exactly.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { fetchIndopakChapter, applyIndopakToVerse } from '../lib/indopak.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const BACKEND_DIR = path.resolve(__dirname, '../data/surahs');
const FRONTEND_DIR = path.resolve(__dirname, '../../frontend/src/data/surahs');

// The frontend cache is named by English name, so index it by surahNumber.
function indexFrontendCache() {
  const map = {};
  for (const f of fs.readdirSync(FRONTEND_DIR).filter((x) => x.endsWith('.json'))) {
    const json = JSON.parse(fs.readFileSync(path.join(FRONTEND_DIR, f), 'utf8'));
    map[json.surahNumber] = { file: path.join(FRONTEND_DIR, f), json };
  }
  return map;
}

async function main() {
  const frontend = indexFrontendCache();
  const pending = [];
  const problems = [];
  let verses = 0;

  for (let num = 1; num <= 114; num++) {
    process.stdout.write(`\rSurah ${num}/114`);
    const chapter = await fetchIndopakChapter(num);
    const backendFile = path.join(BACKEND_DIR, `${num}.json`);
    const targets = [
      { file: backendFile, json: JSON.parse(fs.readFileSync(backendFile, 'utf8')), minify: true },
      frontend[num] && { ...frontend[num], minify: false },
    ].filter(Boolean);
    if (targets.length !== 2) problems.push(`${num}: missing from frontend cache`);

    for (const t of targets) {
      for (const v of t.json.verses) {
        const err = applyIndopakToVerse(v, chapter);
        if (err && t.minify) problems.push(`${num}:${v.number} — ${err}`);
      }
      pending.push(t);
    }
    verses += targets[0].json.verses.length;
    await new Promise((r) => setTimeout(r, 150)); // be gentle with Quran.com
  }
  process.stdout.write('\n');

  if (problems.length) {
    console.error(`❌ ${problems.length} problem(s), nothing written:\n  ${problems.join('\n  ')}`);
    process.exit(1);
  }
  if (verses !== 6236) {
    console.error(`❌ Expected 6236 verses, found ${verses}. Nothing written.`);
    process.exit(1);
  }

  for (const t of pending) {
    fs.writeFileSync(t.file, t.minify ? JSON.stringify(t.json) : JSON.stringify(t.json, null, 2), 'utf8');
  }
  console.log(`✅ IndoPak text added to all ${verses} verses (${pending.length} files).`);
}

main().catch((err) => {
  console.error('Failed:', err.message);
  process.exit(1);
});
