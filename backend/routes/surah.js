/**
 * routes/surah.js — Surah data route (ESM)
 */

import express from 'express';
import axios from 'axios';
const router = express.Router();

const ALQURAN_BASE = 'https://api.alquran.cloud/v1';

router.get('/:surahNumber', async (req, res) => {
  const { surahNumber } = req.params;
  const num = parseInt(surahNumber);

  if (isNaN(num) || num < 1 || num > 114) {
    return res.status(400).json({ error: 'Invalid surah number. Must be 1–114.' });
  }

  try {
    const url = `${ALQURAN_BASE}/surah/${num}/editions/quran-uthmani,en.asad`;
    const { data } = await axios.get(url);

    const arabicEdition  = data.data[0];
    const englishEdition = data.data[1];

    const verses = arabicEdition.ayahs.map((ayah, i) => ({
      number:       ayah.numberInSurah,
      globalNumber: ayah.number,
      arabic:       ayah.text,
      translation:  englishEdition.ayahs[i]?.text || '',
      audioUrl: `https://everyayah.com/data/AbdulSamad_64kbps_QuranExplorer.Com/${String(num).padStart(3, '0')}${String(ayah.numberInSurah).padStart(3, '0')}.mp3`,
    }));

    res.json({
      surahNumber:  arabicEdition.number,
      surahName:    arabicEdition.englishName,
      arabicName:   arabicEdition.name,
      nameTranslation: arabicEdition.englishNameTranslation,
      revelation:   arabicEdition.revelationType,
      versesCount:  arabicEdition.numberOfAyahs,
      verses,
    });
  } catch (err) {
    console.error('Surah fetch error:', err.message);
    res.status(500).json({ error: 'Failed to fetch Surah data.' });
  }
});

router.get('/', async (req, res) => {
  try {
    const { data } = await axios.get(`${ALQURAN_BASE}/surah`);
    const surahs = data.data.map((s) => ({
      number:          s.number,
      name:            s.name,
      englishName:     s.englishName,
      nameTranslation: s.englishNameTranslation,
      versesCount:     s.numberOfAyahs,
      revelation:      s.revelationType,
    }));
    res.json(surahs);
  } catch (err) {
    console.error('Surah list error:', err.message);
    res.status(500).json({ error: 'Failed to fetch Surah list.' });
  }
});

export default router;
