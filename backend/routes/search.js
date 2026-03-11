/**
 * routes/search.js — Local full-text verse search
 *
 * Strategy:
 *  1. Load data/quran-en.json (if it exists) for fast local search.
 *  2. If file doesn't exist yet, fall back to fetching surahs live from
 *     AlQuran Cloud and cache them in memory.
 *
 * Run `node scripts/download-quran.js` once to build the local cache and
 * make searches instant.
 */

const express = require('express');
const axios   = require('axios');
const fs      = require('fs');
const path    = require('path');
const router  = express.Router();

const DATA_FILE     = path.join(__dirname, '..', 'data', 'quran-en.json');
const ALQURAN_BASE  = 'https://api.alquran.cloud/v1';

/** In-memory cache: array of { surahNumber, surahName, arabicName, verses[] } */
let quranCache = null;

/**
 * Load the Quran data into memory.
 * Priority: local JSON file → live API fetch (slower).
 */
async function loadQuranData() {
  if (quranCache) return quranCache;               // already loaded

  // ── 1. Try local file ──────────────────────────────────────────────────────
  if (fs.existsSync(DATA_FILE)) {
    console.log('[search] Loading local quran-en.json…');
    quranCache = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
    console.log(`[search] Loaded ${quranCache.length} surahs from file.`);
    return quranCache;
  }

  // ── 2. Fetch live and cache in memory ──────────────────────────────────────
  console.warn('[search] data/quran-en.json not found — fetching live (slow). Run scripts/download-quran.js to cache locally.');

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
    } catch { /* skip failed surah */ }
  }

  quranCache = all;
  return all;
}

// Pre-warm cache when server starts (non-blocking)
loadQuranData().catch(() => {});

/**
 * GET /api/search?q=keyword[&surah=1]
 * Returns matching verses with highlighted context.
 *
 * Also matches surah names so "baqarah" or "al-fatihah" return results.
 */
router.get('/', async (req, res) => {
  const { q, surah: surahParam } = req.query;

  if (!q || q.trim().length < 1) {
    return res.status(400).json({ error: 'Query cannot be empty.' });
  }

  const keyword   = q.trim().toLowerCase();
  const surahOnly = surahParam ? parseInt(surahParam) : null; // optional per-surah filter

  try {
    const data = await loadQuranData();

    const matches = [];

    for (const surah of data) {
      // Skip if caller wants a specific surah and this isn't it
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
        if (matches.length >= 100) break; // cap at 100 results
      }
      if (matches.length >= 100) break;
    }

    res.json({ count: matches.length, matches });
  } catch (err) {
    console.error('[search] Error:', err.message);
    res.status(500).json({ error: 'Search temporarily unavailable. Please try again.' });
  }
});

module.exports = router;
