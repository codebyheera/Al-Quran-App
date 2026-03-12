/**
 * routes/search.js — Local full-text verse search (ESM)
 */

import express from 'express';
import axios from 'axios';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const router = express.Router();

// __dirname equivalent for ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DATA_FILE     = path.join(__dirname, '..', 'data', 'quran-en.json');
const ALQURAN_BASE  = 'https://api.alquran.cloud/v1';

let quranCache = null;

async function loadQuranData() {
  if (quranCache) return quranCache;

  if (fs.existsSync(DATA_FILE)) {
    console.log('[search] Loading local quran-en.json…');
    quranCache = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
    console.log(`[search] Loaded ${quranCache.length} surahs from file.`);
    return quranCache;
  }

  console.warn('[search] data/quran-en.json not found — fetching live (slow).');

  const { data: listData } = await axios.get(`${ALQURAN_BASE}/surah`, { timeout: 20000 });
  const surahMeta = listData.data;

  const all = [];
  for (const meta of surahMeta) {
    try {
      const { data } = await axios.get(
        `${ALQURAN_BASE}/surah/${meta.number}/editions/quran-uthmani,en.sahih`,
        { timeout: 15000 }
      );
      const arabic  = data.data[0];
      const english = data.data[1];

      all.push({
        surahNumber: meta.number,
        surahName:   meta.englishName,
        arabicName:  meta.name,
        verses: arabic.ayahs.map((a, i) => ({
          verseNumber:  a.numberInSurah,
          globalNumber: a.number,
          translation:  english.ayahs[i]?.text || '',
        })),
      });
    } catch { /* skip */ }
  }

  quranCache = all;
  return all;
}

loadQuranData().catch(() => {});

router.get('/', async (req, res) => {
  const { q, surah: surahParam } = req.query;

  if (!q || q.trim().length < 1) {
    return res.status(400).json({ error: 'Query cannot be empty.' });
  }

  const keyword   = q.trim().toLowerCase();
  const surahOnly = surahParam ? parseInt(surahParam) : null;

  try {
    const data = await loadQuranData();
    const matches = [];

    for (const surah of data) {
      if (surahOnly && surah.surahNumber !== surahOnly) continue;

      const surahNameMatch = surah.surahName.toLowerCase().includes(keyword);
      const surahNumberMatch = surah.surahNumber.toString() === keyword;

      for (const verse of surah.verses) {
        const text = verse.translation || '';
        const verseMatch = text.toLowerCase().includes(keyword);

        if (surahNameMatch || surahNumberMatch || verseMatch) {
          matches.push({
            globalNumber: verse.globalNumber,
            surahNumber:  surah.surahNumber,
            surahName:    surah.surahName,
            verseNumber:  verse.verseNumber,
            text,
            matchType: surahNameMatch ? 'Surah Name' : surahNumberMatch ? 'Surah Number' : 'Verse Text'
          });
        }
        if (matches.length >= 100) break;
      }
      if (matches.length >= 100) break;
    }

    res.json({ count: matches.length, matches });
  } catch (err) {
    console.error('[search] Error:', err.message);
    res.status(500).json({ error: 'Search temporarily unavailable.' });
  }
});

export default router;
