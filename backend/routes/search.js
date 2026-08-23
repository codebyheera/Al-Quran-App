/**
 * routes/search.js — Local full-text verse search (ESM)
 */

import express from 'express';
import { loadQuranData } from '../lib/quranData.js';

const router = express.Router();

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
