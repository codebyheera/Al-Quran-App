/**
 * routes/juz.js — Juz data route (ESM)
 */

import express from 'express';
import { reportError } from '../lib/reportError.js';
import { getJson, cachedBuild, setPublicCache } from '../lib/upstream.js';
import { readLocalSurah } from '../lib/localQuran.js';
const router = express.Router();

const ALQURAN_BASE = 'https://api.alquran.cloud/v1';

// First verse of each Juz (1–30).
const JUZ_START = [
  { surah: 1,  verse: 1  }, { surah: 2,  verse: 142 }, { surah: 2,  verse: 253 },
  { surah: 3,  verse: 93 }, { surah: 4,  verse: 24  }, { surah: 4,  verse: 148 },
  { surah: 5,  verse: 82 }, { surah: 6,  verse: 111 }, { surah: 7,  verse: 88  },
  { surah: 8,  verse: 41 }, { surah: 9,  verse: 93  }, { surah: 11, verse: 6   },
  { surah: 12, verse: 53 }, { surah: 15, verse: 1   }, { surah: 17, verse: 1   },
  { surah: 18, verse: 75 }, { surah: 21, verse: 1   }, { surah: 23, verse: 1   },
  { surah: 25, verse: 21 }, { surah: 27, verse: 56  }, { surah: 29, verse: 46  },
  { surah: 33, verse: 31 }, { surah: 36, verse: 28  }, { surah: 39, verse: 32  },
  { surah: 41, verse: 47 }, { surah: 46, verse: 1   }, { surah: 51, verse: 31  },
  { surah: 58, verse: 1  }, { surah: 67, verse: 1   }, { surah: 78, verse: 1   },
];

// Helper to build audio URL based on reciter
const RECITER_PATH = {
  'sudais': 'Abdurrahmaan_As-Sudais_64kbps',
  'ghamidi': 'Ghamadi_40kbps',
  'yasser': 'Yasser_Ad-Dussary_128kbps'
};

const RECITER_IDENTIFIER = {
  'abdulsamad': 'ar.abdulsamad',
  'alafasy': 'ar.alafasy'
};

function getAudioUrl(reciter, surahNum, ayahNumInSurah, globalAyahNum) {
  if (RECITER_PATH[reciter]) {
    const path = RECITER_PATH[reciter];
    const s = String(surahNum).padStart(3, '0');
    const a = String(ayahNumInSurah).padStart(3, '0');
    return `https://www.everyayah.com/data/${path}/${s}${a}.mp3`;
  }
  
  const id = RECITER_IDENTIFIER[reciter] || 'ar.abdulsamad';
  return `https://cdn.islamic.network/quran/audio/128/${id}/${globalAyahNum}.mp3`;
}

// From backend/data/surahs (see lib/localQuran.js) — no upstream calls. Every
// stored verse carries its Juz number, so this collects them from the Surahs
// the Juz spans.
function buildLocalJuz(num, reciter) {
  const firstSurah = JUZ_START[num - 1].surah;
  const lastSurah = num < 30 ? JUZ_START[num].surah : 114;
  const verses = [];
  for (let s = firstSurah; s <= lastSurah; s++) {
    const surah = readLocalSurah(s);
    if (!surah) return null;
    for (const v of surah.verses) {
      if (v.juz !== num) continue;
      verses.push({
        number:          v.number,
        globalNumber:    v.globalNumber,
        surahNumber:     surah.surahNumber,
        surahName:       surah.surahName,
        arabicSurahName: surah.arabicName,
        arabic:          v.arabic,
        translation:     v.translation,
        urduTranslation: v.urduTranslation,
        audioUrl:        getAudioUrl(reciter, surah.surahNumber, v.number, v.globalNumber),
        englishAudioUrl: v.englishAudioUrl,
        urduAudioUrl:    v.urduAudioUrl,
        words:           v.words,
        juz:             v.juz,
        page:            v.page,
        sajda:           v.sajda
      });
    }
  }
  return {
    complete: true,
    data: {
      juzNumber: num,
      totalVerses: verses.length,
      verses,
    },
  };
}

// Live build from Al-Quran Cloud + Quran.com — only used if a local file is missing.
async function buildJuz(num, reciter) {
  const quranComUrl = `https://api.quran.com/api/v4/verses/by_juz/${num}?words=true&word_fields=text_uthmani&per_page=600`;

  // Word-by-word data is an enhancement (the page falls back to the plain
  // Arabic text), so a Quran.com failure must not fail the whole Juz.
  const [arabicRes, englishRes, urduRes, quranComRes, enAudioRes, urAudioRes] = await Promise.all([
    getJson(`${ALQURAN_BASE}/juz/${num}/quran-uthmani`),
    getJson(`${ALQURAN_BASE}/juz/${num}/en.sahih`),
    getJson(`${ALQURAN_BASE}/juz/${num}/ur.jalandhry`),
    getJson(quranComUrl).catch((err) => {
      console.warn(`[juz] Word-by-word data unavailable for Juz ${num}: ${err.message}`);
      return null;
    }),
    getJson(`${ALQURAN_BASE}/juz/${num}/en.walk`),
    getJson(`${ALQURAN_BASE}/juz/${num}/ur.khan`)
  ]);

  const arabicAyahs  = arabicRes.data.ayahs;
  const englishAyahs = englishRes.data.ayahs;
  const urduAyahs    = urduRes.data.ayahs;
  const enAudioAyahs = enAudioRes.data.ayahs;
  const urAudioAyahs = urAudioRes.data.ayahs;

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
  if (quranComRes && quranComRes.verses) {
    quranComRes.verses.forEach(v => {
      const [surahPart, versePart] = v.verse_key.split(':');
      const sNum = parseInt(surahPart);
      const vNum = parseInt(versePart);
      let wordIndex = 0;
      wordsMap[v.verse_key] = v.words
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
            audioUrl: buildWordAudioUrl(sNum, vNum, wordIndex)
          };
        });
    });
  }

  const verses = arabicAyahs.map((a, i) => {
    let arabicText = a.text;
    
    if (a.surah.number !== 1 && a.numberInSurah === 1) {
      arabicText = arabicText.replace('بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ ', '');
      arabicText = arabicText.replace('بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ ', '');
      arabicText = arabicText.replace('بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ ', '');
    }

    const verseKey = `${a.surah.number}:${a.numberInSurah}`;
    return {
      number:          a.numberInSurah,
      globalNumber:    a.number,
      surahNumber:     a.surah.number,
      surahName:       a.surah.englishName,
      arabicSurahName: a.surah.name,
      arabic:          arabicText,
      translation:     englishAyahs[i]?.text || '',
      urduTranslation: urduAyahs[i]?.text || '',
      audioUrl:        getAudioUrl(reciter, a.surah.number, a.numberInSurah, a.number),
      englishAudioUrl: enAudioAyahs[i]?.audio || '',
      urduAudioUrl:    urAudioAyahs[i]?.audio || '',
      words:           wordsMap[verseKey] || [],
      juz:             a.juz,
      page:            a.page,
      sajda:           a.sajda || false
    };
  });

  return {
    complete: !!quranComRes,
    data: {
      juzNumber: num,
      totalVerses: verses.length,
      verses,
    },
  };
}

router.get('/:juzNumber', async (req, res) => {
  const { juzNumber } = req.params;
  const num = parseInt(juzNumber);
  // Unknown reciters already got the default audio; normalizing also keeps the cache keys bounded.
  const reciter = (RECITER_PATH[req.query.reciter] || RECITER_IDENTIFIER[req.query.reciter]) ? req.query.reciter : 'abdulsamad';

  if (isNaN(num) || num < 1 || num > 30) {
    return res.status(400).json({ error: 'Invalid juz number. Must be 1–30.' });
  }

  try {
    const { data, complete } = await cachedBuild(
      `juz:${num}:${reciter}`,
      async () => buildLocalJuz(num, reciter) || buildJuz(num, reciter),
    );
    if (complete) setPublicCache(res);
    res.json(data);
  } catch (err) {
    await reportError(err, { route: 'GET /api/juz/:juzNumber', extra: { juzNumber: req.params.juzNumber } });
    res.status(500).json({ error: 'Failed to fetch Juz data.' });
  }
});

router.get('/', async (req, res) => {
  try {
    const juzMeta = Array.from({ length: 30 }, (_, i) => ({ juzNumber: i + 1 }));
    const result = juzMeta.map((j, i) => ({
      juzNumber:    j.juzNumber,
      startSurah:   JUZ_START[i].surah,
      startVerse:   JUZ_START[i].verse,
    }));

    res.json(result);
  } catch (err) {
    await reportError(err, { route: 'GET /api/juz' });
    res.status(500).json({ error: 'Failed to build Juz list.' });
  }
});

export default router;
