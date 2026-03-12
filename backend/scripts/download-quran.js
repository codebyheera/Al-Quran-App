/**
 * scripts/download-quran.js (ESM)
 */

import axios from 'axios';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DATA_DIR  = path.join(__dirname, '..', 'data');
const OUT_FILE  = path.join(DATA_DIR, 'quran-en.json');
const TEMP_FILE = path.join(DATA_DIR, 'quran-en.tmp.json');

const ALQURAN   = 'https://api.alquran.cloud/v1';

async function fetchWithRetry(url, retries = 3, delayMs = 2000) {
  for (let i = 0; i < retries; i++) {
    try {
      const { data } = await axios.get(url, { timeout: 30000 });
      return data;
    } catch (e) {
      console.error(`\n  Attempt ${i + 1}/${retries} failed for ${url}: ${e.message}`);
      if (i < retries - 1) await new Promise((r) => setTimeout(r, delayMs));
    }
  }
  throw new Error(`All ${retries} retries failed for ${url}`);
}

async function main() {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });

  let all = [];
  const doneSet = new Set();
  if (fs.existsSync(TEMP_FILE)) {
    all = JSON.parse(fs.readFileSync(TEMP_FILE, 'utf8'));
    all.forEach((s) => doneSet.add(s.surahNumber));
    console.log(`Resuming — ${doneSet.size} surahs already done.`);
  }

  console.log('⏳ Downloading Saheeh International translation from alquran.cloud…');

  const listData = await fetchWithRetry(`${ALQURAN}/surah`);
  const surahMeta = listData.data;

  for (const meta of surahMeta) {
    if (doneSet.has(meta.number)) {
      process.stdout.write(`  [skip] Surah ${meta.number}/114\r`);
      continue;
    }

    process.stdout.write(`  Fetching Surah ${meta.number}/114 (${meta.englishName})…\r`);

    try {
      const result = await fetchWithRetry(
        `${ALQURAN}/surah/${meta.number}/editions/quran-uthmani,en.sahih`
      );
      const arabic  = result.data[0];
      const english = result.data[1];

      all.push({
        surahNumber: meta.number,
        surahName:   meta.englishName,
        arabicName:  meta.name,
        verses: arabic.ayahs.map((a, i) => ({
          verseNumber:  a.numberInSurah,
          globalNumber: a.number,
          arabic:       a.text,
          translation:  english.ayahs[i]?.text || '',
        })),
      });

      fs.writeFileSync(TEMP_FILE, JSON.stringify(all, null, 0), 'utf8');
    } catch (e) {
      console.error(`\n  ⚠️  Skipping Surah ${meta.number}: ${e.message}`);
    }

    await new Promise((r) => setTimeout(r, 300));
  }

  all.sort((a, b) => a.surahNumber - b.surahNumber);
  fs.writeFileSync(OUT_FILE, JSON.stringify(all, null, 0), 'utf8');

  if (fs.existsSync(TEMP_FILE)) fs.unlinkSync(TEMP_FILE);

  const mb = (fs.statSync(OUT_FILE).size / 1024 / 1024).toFixed(1);
  console.log(`\n✅  Saved ${all.length} surahs to ${OUT_FILE}  (${mb} MB)`);
}

main().catch((e) => { console.error('\nFatal:', e.message); process.exit(1); });
