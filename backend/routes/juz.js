/**
 * routes/juz.js — Juz data route (ESM)
 */

import express from 'express';
import axios from 'axios';
const router = express.Router();

const ALQURAN_BASE = 'https://api.alquran.cloud/v1';

router.get('/:juzNumber', async (req, res) => {
  const { juzNumber } = req.params;
  const num = parseInt(juzNumber);

  if (isNaN(num) || num < 1 || num > 30) {
    return res.status(400).json({ error: 'Invalid juz number. Must be 1–30.' });
  }

  try {
    const [arabicRes, englishRes] = await Promise.all([
      axios.get(`${ALQURAN_BASE}/juz/${num}/quran-uthmani`),
      axios.get(`${ALQURAN_BASE}/juz/${num}/en.asad`),
    ]);

    const arabicAyahs  = arabicRes.data.data.ayahs;
    const englishAyahs = englishRes.data.data.ayahs;

    const verses = arabicAyahs.map((ayah, i) => ({
      number:         ayah.numberInSurah,
      globalNumber:   ayah.number,
      surahNumber:    ayah.surah.number,
      surahName:      ayah.surah.englishName,
      arabicSurahName: ayah.surah.name,
      arabic:         ayah.text,
      translation:    englishAyahs[i]?.text || '',
      audioUrl: `https://everyayah.com/data/AbdulSamad_64kbps_QuranExplorer.Com/${String(ayah.surah.number).padStart(3, '0')}${String(ayah.numberInSurah).padStart(3, '0')}.mp3`,
    }));

    res.json({
      juzNumber: num,
      totalVerses: verses.length,
      verses,
    });
  } catch (err) {
    console.error('Juz fetch error:', err.message);
    res.status(500).json({ error: 'Failed to fetch Juz data.' });
  }
});

router.get('/', async (req, res) => {
  try {
    const juzMeta = Array.from({ length: 30 }, (_, i) => ({ juzNumber: i + 1 }));
    const JUZ_START = [
      { surah: 1,  verse: 1  }, { surah: 2,  verse: 142 }, { surah: 2,  verse: 253 },
      { surah: 3,  verse: 93 }, { surah: 4,  verse: 24  }, { surah: 4,  verse: 148 },
      { surah: 5,  verse: 82 }, { surah: 6,  verse: 111 }, { surah: 7,  verse: 88  },
      { surah: 8,  verse: 41 }, { surah: 9,  verse: 94  }, { surah: 11, verse: 6   },
      { surah: 12, verse: 53 }, { surah: 15, verse: 1   }, { surah: 17, verse: 1   },
      { surah: 18, verse: 75 }, { surah: 21, verse: 1   }, { surah: 23, verse: 1   },
      { surah: 25, verse: 21 }, { surah: 27, verse: 56  }, { surah: 29, verse: 46  },
      { surah: 33, verse: 31 }, { surah: 36, verse: 28  }, { surah: 39, verse: 32  },
      { surah: 41, verse: 47 }, { surah: 46, verse: 1   }, { surah: 51, verse: 31  },
      { surah: 58, verse: 1  }, { surah: 67, verse: 1   }, { surah: 78, verse: 1   },
    ];

    const result = juzMeta.map((j, i) => ({
      juzNumber:    j.juzNumber,
      startSurah:   JUZ_START[i].surah,
      startVerse:   JUZ_START[i].verse,
    }));

    res.json(result);
  } catch (err) {
    res.status(500).json({ error: 'Failed to build Juz list.' });
  }
});

export default router;
