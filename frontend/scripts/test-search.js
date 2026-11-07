/**
 * scripts/test-search.js — Checks src/lib/searchEngine.js against real-world queries.
 *
 * Usage (from frontend/):  npm run test:search
 * Each case: [query, expected top result]. Expected is a Surah number, or
 * 'a2:255' (ayah), 'j30' (juz). Add a case whenever a search goes wrong.
 */

import { searchQuran } from '../src/lib/searchEngine.js';

const CASES = [
  // Plain names, with "surah" / "al-" / extra words
  ['yaseen', 36], ['surah yaseen', 36], ['Surah Yaseen Sharif', 36], ['yasin', 36], ['ya-sin', 36],
  ['yaaseen', 36], ['surah yasin ki tilawat', 36], ['yaseen full with urdu translation', 36],
  ['al fatiha', 1], ['alfatiha', 1], ['surah fatihah', 1], ['fatiha', 1], ['al-hamd', 1],
  ['baqarah', 2], ['surah al baqarah', 2], ['bakra', 2], ['baqra', 2], ['albaqara', 2], ['cow', 2],
  ['al imran', 3], ['ale imran', 3], ['nisa', 4], ['maidah', 5], ['anam', 6], ['araf', 7], ['anfal', 8],
  ['tauba', 9], ['taubah', 9], ['yunus', 10], ['hood', 11], ['yousuf', 12], ['surah yusuf', 12],
  ['rad', 13], ['ibrahim', 14], ['hijr', 15], ['nahl', 16], ['bani israil', 17], ['isra', 17],
  ['kahf', 18], ['surah kahaf', 18], ['al kahf', 18], ['kehf', 18], ['maryam', 19], ['mariam', 19],
  ['taha', 20], ['anbiya', 21], ['hajj', 22], ['muminoon', 23], ['noor', 24], ['furqan', 25],
  ['shuara', 26], ['naml', 27], ['qasas', 28], ['ankabut', 29], ['rum', 30], ['luqman', 31],
  ['sajda', 32], ['ahzab', 33], ['saba', 34], ['fatir', 35], ['saffat', 37], ['saad', 38],
  ['zumar', 39], ['ghafir', 40], ['momin', 40], ['fussilat', 41], ['shura', 42], ['zukhruf', 43],
  ['dukhan', 44], ['jathiya', 45], ['ahqaf', 46], ['muhammad', 47], ['fath', 48], ['hujurat', 49],
  ['qaf', 50], ['zariyat', 51], ['dhariyat', 51], ['tur', 52], ['najm', 53], ['qamar', 54],
  ['rahman', 55], ['surah rehman', 55], ['ar rahman', 55], ['arrahman', 55], ['surat ar-rahmaan', 55],
  ['waqiah', 56], ['surah waqia', 56], ['waqiya', 56], ['hadid', 57], ['mujadila', 58], ['hashr', 59],
  ['mumtahina', 60], ['saff', 61], ['jumma', 62], ['juma', 62], ['munafiqun', 63], ['taghabun', 64],
  ['talaq', 65], ['tahreem', 66], ['mulk', 67], ['surah mulk', 67], ['al mulk', 67], ['tabarak', 67],
  ['qalam', 68], ['haqqah', 69], ['maarij', 70], ['nooh', 71], ['nuh', 71], ['jinn', 72],
  ['muzammil', 73], ['surah muzzammil', 73], ['mudassir', 74], ['muddaththir', 74], ['qiyamah', 75],
  ['dahr', 76], ['insan', 76], ['mursalat', 77], ['naba', 78], ['naziat', 79], ['abasa', 80],
  ['takweer', 81], ['infitar', 82], ['mutaffifin', 83], ['inshiqaq', 84], ['burooj', 85], ['tariq', 86],
  ['aala', 87], ['ghashiya', 88], ['fajr', 89], ['balad', 90], ['shams', 91], ['lail', 92],
  ['duha', 93], ['zuha', 93], ['alam nashrah', 94], ['inshirah', 94], ['teen', 95], ['alaq', 96],
  ['iqra', 96], ['qadr', 97], ['bayyinah', 98], ['zilzal', 99], ['zalzala', 99], ['adiyat', 100],
  ['qariah', 101], ['takasur', 102], ['takathur', 102], ['asr', 103], ['wal asr', 103], ['humazah', 104],
  ['feel', 105], ['quraish', 106], ['maun', 107], ['kausar', 108], ['kawthar', 108], ['kafiroon', 109],
  ['nasr', 110], ['lahab', 111], ['tabbat', 111], ['masad', 111], ['ikhlas', 112], ['qul huwallah', 112],
  ['falaq', 113], ['naas', 114], ['surah nas', 114],

  // Typos
  ['yaseeen', 36], ['yseen', 36], ['bakarah', 2], ['mulq', 67], ['rehmaan', 55], ['waqya', 56],
  ['kahaff', 18], ['ikhlass', 112], ['muzamil', 73], ['fatiah', 1], ['maryum', 19], ['luqmaan', 31],
  ['surah yaeen', 36], ['qadar', 97], ['takwir', 81], ['jummah', 62], ['dukaan', 44],

  // Numbers, references, juz
  ['36', 36], ['surah 36', 36], ['114', 114], ['2:255', 'a2:255'], ['2 255', 'a2:255'],
  ['surah 2 ayat 255', 'a2:255'], ['baqarah 255', 'a2:255'], ['yaseen ayat 5', 'a36:5'],
  ['ayatul kursi', 'a2:255'], ['ayat ul kursi', 'a2:255'], ['ayatal kursi', 'a2:255'],
  ['juz 30', 'j30'], ['para 30', 'j30'], ['30 para', 'j30'], ['amma para', 'j30'], ['sipara 1', 'j1'],
  ['tabarak para', 'j29'],

  // Arabic / Urdu
  ['يس', 36], ['یٰسین', 36], ['سورة الملك', 67], ['الرحمن', 55], ['سورہ رحمٰن', 55], ['الكهف', 18],
];

let failed = 0;
for (const [q, expected] of CASES) {
  const { items } = searchQuran(q);
  const top = items[0];
  const got = !top ? 'none'
    : top.type === 'surah' ? top.surah.number
      : top.type === 'ayah' ? `a${top.surah.number}:${top.ayah}`
        : `j${top.juz}`;
  if (got !== expected) {
    failed++;
    const list = items.slice(0, 3).map((i) => `${i.type === 'surah' ? i.surah.number : i.key}(${i.score},${i.matchType})`).join(' ');
    console.log(`✗ "${q}" → expected ${expected}, got ${got}   [${list}]`);
  }
}

// Queries that must NOT open anything directly (should fall back to verse search).
const NOT_DIRECT = ['mercy', 'paradise', 'forgive me', 'patience', 'allah', 'light', 'night', 'man', 'cow', 'dawn', 'hell', 'prayer', 'moses'];
for (const q of NOT_DIRECT) {
  const { best } = searchQuran(q);
  if (best) {
    failed++;
    console.log(`✗ "${q}" should not have a certain match, got ${best.key}`);
  }
}

console.log(failed ? `\n${failed} failing case(s)` : `✅ All ${CASES.length + NOT_DIRECT.length} search cases pass`);
process.exit(failed ? 1 : 0);
