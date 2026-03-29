/**
 * routes/surah.js — Surah data route (ESM)
 */

import express from 'express';
import axios from 'axios';
import { getSurahId } from '../data/surahMapping.js';
const router = express.Router();

const ALQURAN_BASE = 'https://api.alquran.cloud/v1';

// Helper to build audio URL based on reciter
function getAudioUrl(reciter, surahNum, ayahNumInSurah, globalAyahNum) {
  if (reciter === 'alafasy') {
    return `https://cdn.islamic.network/quran/audio/128/ar.alafasy/${globalAyahNum}.mp3`;
  }
  // Default: Abdul Samad
  return `https://everyayah.com/data/AbdulSamad_64kbps_QuranExplorer.Com/${String(surahNum).padStart(3, '0')}${String(ayahNumInSurah).padStart(3, '0')}.mp3`;
}

router.get('/:surahIdentifier', async (req, res) => {
  const { surahIdentifier } = req.params;
  const num = getSurahId(surahIdentifier);
  const reciter = req.query.reciter || 'abdulsamad';

  if (!num || num < 1 || num > 114) {
    return res.status(400).json({ error: 'Invalid surah identifier. Use number (1-114) or English name.' });
  }

  try {
    const url = `${ALQURAN_BASE}/surah/${num}/editions/quran-uthmani,en.asad`;
    const quranComUrl = `https://api.quran.com/api/v4/verses/by_chapter/${num}?words=true&word_fields=text_uthmani&per_page=300`;

    const [alquranRes, quranComRes] = await Promise.all([
      axios.get(url),
      axios.get(quranComUrl)
    ]);

    const data = alquranRes.data;
    const arabicEdition  = data.data[0];
    const englishEdition = data.data[1];

    // Build word audio URL from surah/verse/position — avoids the off-by-one
    // bug in the Quran.com API where audio_url starts at _002 due to the ۞ symbol.
    function buildWordAudioUrl(surahNum, verseNum, wordPosition) {
      const s = String(surahNum).padStart(3, '0');
      const v = String(verseNum).padStart(3, '0');
      const w = String(wordPosition).padStart(3, '0');
      return `https://audio.qurancdn.com/wbw/${s}_${v}_${w}.mp3`;
    }

    // Create a map of verses from Quran.com API for fast lookup by verseKey
    const wordsMap = {};
    if (quranComRes.data && quranComRes.data.verses) {
      quranComRes.data.verses.forEach(v => {
        const verseNum = parseInt(v.verse_key.split(':')[1]);
        // Filter out non-words (end markers, sajdah signs etc.) then assign
        // a sequential 1-based position for reliable audio URL construction.
        let wordIndex = 0;
        wordsMap[verseNum] = v.words
          .filter(w => w.char_type_name === 'word')
          .map(w => {
            wordIndex++;
            return {
              id: w.id,
              position: wordIndex,
              char_type_name: w.char_type_name,
              text_uthmani: w.text_uthmani || w.text,
              text: w.text_uthmani || w.text,
              translation: w.translation,
              transliteration: w.transliteration,
              audioUrl: buildWordAudioUrl(num, verseNum, wordIndex)
            };
          });
      });
    }

    const verses = arabicEdition.ayahs.map((ayah, i) => ({
      number:       ayah.numberInSurah,
      globalNumber: ayah.number,
      arabic:       ayah.text,
      translation:  englishEdition.ayahs[i]?.text || '',
      audioUrl: getAudioUrl(reciter, num, ayah.numberInSurah, ayah.number),
      words: wordsMap[ayah.numberInSurah] || []
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
