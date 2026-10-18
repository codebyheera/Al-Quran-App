/**
 * routes/surah.js — Surah data route (ESM)
 */

import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { getSurahId, getSurahSlug } from '../data/surahMapping.js';
import { reportError } from '../lib/reportError.js';
import { getJson, cachedBuild, setPublicCache } from '../lib/upstream.js';
import { readLocalSurah } from '../lib/localQuran.js';
const router = express.Router();

const ALQURAN_BASE = 'https://api.alquran.cloud/v1';

// The 114-Surah index never changes, so it's served from a local copy rather
// than fetched from Al-Quran Cloud on every request (one upstream hiccup used
// to make this endpoint 500).
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SURAH_LIST = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'data', 'surah-list.json'), 'utf8'));

const RECITER_MAPPING = {
  'abdulsamad': 'ar.abdulsamad',
  'sudais': 'ar.abdurrahmaansudais',
  'ghamidi': 'ar.saadalghamidi',
  'alafasy': 'ar.alafasy',
  'yasser': 'ar.yasseraldossari'
};

function buildEveryAyahUrl(reciter, surahNum, ayahNum) {
  const RECITER_PATH = {
    'abdulsamad': 'AbdulSamad_64kbps_QuranExplorer.Com',
    'sudais': 'Abdurrahmaan_As-Sudais_64kbps',
    'ghamidi': 'Ghamadi_40kbps',
    'alafasy': 'Mishary_Rashid_Alafasy_128kbps',
    'yasser': 'Yasser_Ad-Dussary_128kbps'
  };
  const path = RECITER_PATH[reciter] || RECITER_PATH['abdulsamad'];
  const s = String(surahNum).padStart(3, '0');
  const a = String(ayahNum).padStart(3, '0');
  return `https://www.everyayah.com/data/${path}/${s}${a}.mp3`;
}

// Build word audio URL from surah/verse/position — avoids the off-by-one
// bug in the Quran.com API where audio_url starts at _002 due to the ۞ symbol.
function buildWordAudioUrl(surahNum, verseNum, wordPosition) {
  const s = String(surahNum).padStart(3, '0');
  const v = String(verseNum).padStart(3, '0');
  const w = String(wordPosition).padStart(3, '0');
  return `https://audio.qurancdn.com/wbw/${s}_${v}_${w}.mp3`;
}

function buildSurahAudioUrl(reciter, num) {
  const n = String(num).padStart(3, '0');
  const hqMapping = {
    'ghamidi': `https://server7.mp3quran.net/s_gmd/${n}.mp3`,
    'sudais': `https://server11.mp3quran.net/sds/${n}.mp3`,
    'abdulsamad': `https://server7.mp3quran.net/basit/${n}.mp3`,
    'alafasy': `https://server8.mp3quran.net/afs/${n}.mp3`,
    'yasser': `https://server11.mp3quran.net/yasser/${n}.mp3`
  };
  return hqMapping[reciter] || null;
}

// From backend/data/surahs (see lib/localQuran.js) — no upstream calls. The
// stored ayah audio is Alafasy's (cdn.islamic.network); every other reciter
// uses everyayah.com, exactly as buildSurah() below does.
function buildLocalSurah(num, internalReciter) {
  const surah = readLocalSurah(num);
  if (!surah) return null;
  return {
    complete: true,
    data: {
      ...surah,
      surahAudioUrl: buildSurahAudioUrl(internalReciter, num),
      verses: surah.verses.map((v) => ({
        ...v,
        audioUrl: internalReciter === 'alafasy' ? v.audioUrl : buildEveryAyahUrl(internalReciter, num, v.number),
      })),
    },
  };
}

// Live build from Al-Quran Cloud + Quran.com — only used if a local file is missing.
async function buildSurah(num, internalReciter) {
  const isGhamidi = internalReciter === 'ghamidi';
  const reciterIdentifier = isGhamidi ? null : (RECITER_MAPPING[internalReciter] || RECITER_MAPPING['abdulsamad']);

  const editions = isGhamidi
    ? 'quran-uthmani,en.sahih,ur.jalandhry,en.walk,ur.khan'
    : `quran-uthmani,en.sahih,ur.jalandhry,${reciterIdentifier},en.walk,ur.khan`;
  const url = `${ALQURAN_BASE}/surah/${num}/editions/${editions}`;
  const quranComUrl = `https://api.quran.com/api/v4/verses/by_chapter/${num}?words=true&word_fields=text_uthmani&per_page=300`;

  // Word-by-word data is an enhancement (the page falls back to the plain
  // Arabic text), so a Quran.com failure must not fail the whole Surah.
  const [data, quranCom] = await Promise.all([
    getJson(url),
    getJson(quranComUrl).catch((err) => {
      console.warn(`[surah] Word-by-word data unavailable for Surah ${num}: ${err.message}`);
      return null;
    }),
  ]);

  const arabicEdition  = data.data[0];
  const englishEdition = data.data[1];
  const urduEdition    = data.data[2];
  const audioEdition   = isGhamidi ? null : data.data[3];
  const enAudioEdition = isGhamidi ? data.data[3] : data.data[4];
  const urAudioEdition = isGhamidi ? data.data[4] : data.data[5];

  // Create a map of verses from Quran.com API for fast lookup by verseKey
  const wordsMap = {};
  if (quranCom && quranCom.verses) {
    quranCom.verses.forEach(v => {
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

  const verses = arabicEdition.ayahs.map((arabicAyah, i) => {
    let arabicText = arabicAyah.text;

    // Remove Bismillah prefix from Ayah 1 of all surahs except Surah 1 (Al-Fatiha)
    if (num !== 1 && arabicAyah.numberInSurah === 1) {
      arabicText = arabicText.replace('بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ ', '');
      // Also catch variations just in case
      arabicText = arabicText.replace('بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ ', '');
      // Sometimes there's a variation with different unicode:
      arabicText = arabicText.replace('بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ ', '');
    }

    return {
      number: arabicAyah.numberInSurah,
      globalNumber: arabicAyah.number,
      arabic: arabicText,
      translation: englishEdition?.ayahs[i]?.text || '',
      urduTranslation: urduEdition?.ayahs[i]?.text || '',
      // everyayah.com is far more reliable for these reciters than the
      // alquran.cloud-sourced cdn.islamic.network URLs — Abdul Samad's audio
      // there is only available at 64kbps, a cold/lightly-cached path that
      // was intermittently failing (unlike the heavily-cached 128kbps paths
      // other reciters like Alafasy use on that same CDN).
      audioUrl: (isGhamidi || internalReciter === 'sudais' || internalReciter === 'yasser' || internalReciter === 'abdulsamad')
        ? buildEveryAyahUrl(internalReciter, num, arabicAyah.numberInSurah)
        : (audioEdition?.ayahs[i]?.audio || ''),
      englishAudioUrl: enAudioEdition?.ayahs[i]?.audio || '',
      urduAudioUrl: urAudioEdition?.ayahs[i]?.audio || '',
      words: wordsMap[arabicAyah.numberInSurah] || [],
      juz: arabicAyah.juz,
      page: arabicAyah.page,
      sajda: arabicAyah.sajda || false
    };
  });

  return {
    complete: !!quranCom,
    data: {
      surahNumber:  arabicEdition.number,
      surahName:    arabicEdition.englishName,
      arabicName:   arabicEdition.name,
      nameTranslation: arabicEdition.englishNameTranslation,
      revelation:   arabicEdition.revelationType,
      versesCount:  arabicEdition.numberOfAyahs,
      prevSurahSlug: num > 1 ? getSurahSlug(num - 1) : null,
      nextSurahSlug: num < 114 ? getSurahSlug(num + 1) : null,
      surahAudioUrl: buildSurahAudioUrl(internalReciter, num),
      verses,
    },
  };
}

router.get('/:surahIdentifier', async (req, res) => {
  const { surahIdentifier } = req.params;
  const num = getSurahId(surahIdentifier);
  // Unknown reciters get the default — also keeps the cache keys bounded.
  const internalReciter = RECITER_MAPPING[req.query.reciter] ? req.query.reciter : 'abdulsamad';

  if (!num || num < 1 || num > 114) {
    return res.status(400).json({ error: 'Invalid surah identifier. Use number (1-114) or English name.' });
  }

  try {
    const { data, complete } = await cachedBuild(
      `surah:${num}:${internalReciter}`,
      async () => buildLocalSurah(num, internalReciter) || buildSurah(num, internalReciter),
    );
    if (complete) setPublicCache(res);
    res.json(data);
  } catch (err) {
    await reportError(err, { route: 'GET /api/surah/:surahIdentifier', extra: { surahIdentifier: req.params.surahIdentifier } });
    res.status(500).json({ error: 'Failed to fetch Surah data.' });
  }
});

router.get('/', (req, res) => {
  setPublicCache(res);
  res.json(SURAH_LIST);
});

export default router;
