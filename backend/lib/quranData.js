/**
 * lib/quranData.js — Cached local Quran English-translation dataset (ESM)
 *
 * Shared by routes/search.js (site search) and routes/chat.js (chatbot
 * verse grounding) so both read the exact same cached data instead of
 * loading backend/data/quran-en.json twice. Falls back to fetching from
 * the site's authoritative source, Al-Quran Cloud, if the local file is
 * missing.
 */

import axios from 'axios';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DATA_FILE = path.join(__dirname, '..', 'data', 'quran-en.json');
const ALQURAN_BASE = 'https://api.alquran.cloud/v1';

let quranCache = null;
let loadPromise = null;

async function loadFresh() {
  if (fs.existsSync(DATA_FILE)) {
    console.log('[quranData] Loading local quran-en.json…');
    quranCache = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
    console.log(`[quranData] Loaded ${quranCache.length} surahs from file.`);
    return quranCache;
  }

  console.warn('[quranData] data/quran-en.json not found — fetching live (slow).');

  const { data: listData } = await axios.get(`${ALQURAN_BASE}/surah`, { timeout: 20000 });
  const surahMeta = listData.data;

  const all = [];
  for (const meta of surahMeta) {
    try {
      const { data } = await axios.get(
        `${ALQURAN_BASE}/surah/${meta.number}/editions/quran-uthmani,en.sahih`,
        { timeout: 15000 },
      );
      const arabic = data.data[0];
      const english = data.data[1];

      all.push({
        surahNumber: meta.number,
        surahName: meta.englishName,
        arabicName: meta.name,
        verses: arabic.ayahs.map((a, i) => ({
          verseNumber: a.numberInSurah,
          globalNumber: a.number,
          translation: english.ayahs[i]?.text || '',
        })),
      });
    } catch {
      /* skip */
    }
  }

  quranCache = all;
  return all;
}

export async function loadQuranData() {
  if (quranCache) return quranCache;
  if (!loadPromise) loadPromise = loadFresh();
  return loadPromise;
}
