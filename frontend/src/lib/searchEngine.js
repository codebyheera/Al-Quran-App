/**
 * lib/searchEngine.js
 * Smart search engine for Quran surahs:
 *  - Exact / starts-with / contains matching
 *  - Alias map (alternate spellings, translations, common mistakes)
 *  - Fuzzy matching via Levenshtein distance (typo tolerance)
 *  - Ranked results with matchType label
 */

/* ── Levenshtein distance (no external deps) ─────────────────── */
function levenshtein(a, b) {
  const m = a.length;
  const n = b.length;
  const dp = [];
  for (let i = 0; i <= m; i++) {
    dp[i] = [i];
    for (let j = 1; j <= n; j++) dp[i][j] = 0;
  }
  for (let j = 0; j <= n; j++) dp[0][j] = j;
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      dp[i][j] =
        a[i - 1] === b[j - 1]
          ? dp[i - 1][j - 1]
          : 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]);
    }
  }
  return dp[m][n];
}

/* ── Normalize query: strip "surah", arabic prefixes, lowercase ─ */
export function normalizeQuery(q) {
  return q
    .toLowerCase()
    .replace(/^surah\s+/i, '')
    .replace(/^(al|an|ar|az|as|at|ad|ash|ath)-\s*/i, '')
    .trim();
}

/* ── Alias map: common alternate spellings → surah number ──────── */
const ALIASES = {
  // 1 - Al-Faatiha
  fatiha: 1, fatihah: 1, fatia: 1, opening: 1,
  // 2 - Al-Baqarah
  bakara: 2, baqra: 2, baqara: 2, bakarah: 2, cow: 2,
  // 3 - Aal-i-Imraan
  imran: 3, imraan: 3,
  // 4 - An-Nisa
  nisa: 4, nisaa: 4, women: 4,
  // 5 - Al-Maidah
  maidah: 5, maida: 5, maeda: 5, table: 5,
  // 6 - Al-Anam
  anam: 6, anaam: 6, cattle: 6,
  // 7 - Al-Araf
  araf: 7, araaf: 7,
  // 8 - Al-Anfal
  anfal: 8, spoils: 8,
  // 9 - At-Tawbah
  tawba: 9, tawbah: 9, tauba: 9, repentance: 9,
  // 10 - Yunus
  yunus: 10, younus: 10, jonah: 10, younis: 10,
  // 11 - Hud
  hood: 11,
  // 12 - Yusuf
  yusuf: 12, yousuf: 12, joseph: 12,
  // 13 - Ar-Ra'd
  rad: 13, thunder: 13,
  // 14 - Ibrahim
  ibrahim: 14, ibraheem: 14, abraham: 14,
  // 16 - An-Nahl
  nahl: 16, bee: 16, bees: 16,
  // 17 - Al-Isra
  isra: 17, israa: 17,
  // 18 - Al-Kahf
  kahf: 18, cave: 18,
  // 19 - Maryam
  mariam: 19, maryem: 19, mary: 19,
  // 20 - Taha
  taha: 20,
  // 21 - Al-Anbiya
  anbiya: 21, anbiyaa: 21, prophets: 21,
  // 22 - Al-Hajj
  haj: 22, pilgrimage: 22,
  // 23 - Al-Muminun
  muminun: 23, mominoon: 23, believers: 23,
  // 24 - An-Nur
  noor: 24, nur: 24, light: 24,
  // 25 - Al-Furqan
  furqan: 25, criterion: 25,
  // 26 - Ash-Shu'ara
  shuara: 26, poets: 26,
  // 27 - An-Naml
  naml: 27, ants: 27, ant: 27,
  // 28 - Al-Qasas
  qasas: 28, stories: 28,
  // 29 - Al-Ankabut
  ankabut: 29, spider: 29,
  // 30 - Ar-Rum
  rum: 30, rome: 30, romans: 30,
  // 31 - Luqman
  luqman: 31, lukman: 31,
  // 32 - As-Sajda
  sajda: 32, sajdah: 32, prostration: 32,
  // 33 - Al-Ahzab
  ahzab: 33, confederates: 33,
  // 34 - Saba
  sheba: 34,
  // 35 - Fatir
  fatir: 35, originator: 35,
  // 36 - Ya-Seen
  yaseen: 36, yasin: 36, yaaseen: 36,
  // 39 - Az-Zumar
  zumar: 39, groups: 39,
  // 40 - Ghafir
  ghafir: 40,
  // 42 - Ash-Shura
  shura: 42, consultation: 42,
  // 44 - Ad-Dukhan
  dukhan: 44, smoke: 44,
  // 47 - Muhammad
  muhammed: 47,
  // 48 - Al-Fath
  fath: 48, victory: 48,
  // 49 - Al-Hujurat
  hujurat: 49,
  // 51 - Adh-Dhariyat
  dhariyat: 51, zariyat: 51,
  // 52 - At-Tur
  tur: 52,
  // 53 - An-Najm
  najm: 53, star: 53,
  // 54 - Al-Qamar
  qamar: 54, moon: 54,
  // 55 - Ar-Rahman
  rahman: 55, rehman: 55, merciful: 55,
  // 56 - Al-Waqia
  waqia: 56, waqiah: 56, wakia: 56, event: 56,
  // 57 - Al-Hadid
  hadid: 57, iron: 57,
  // 62 - Al-Jumua
  jumua: 62, juma: 62, friday: 62,
  // 63 - Al-Munafiqun
  munafiqun: 63, munafiqoon: 63, hypocrites: 63,
  // 65 - At-Talaq
  talaq: 65, divorce: 65,
  // 67 - Al-Mulk
  mulk: 67, kingdom: 67, dominion: 67,
  // 68 - Al-Qalam
  qalam: 68, pen: 68,
  // 71 - Nuh
  nuh: 71, noah: 71, nooh: 71,
  // 72 - Al-Jinn
  jinn: 72, jin: 72,
  // 73 - Al-Muzzammil
  muzzammil: 73, muzammil: 73,
  // 75 - Al-Qiyama
  qiyama: 75, qiyamah: 75, resurrection: 75,
  // 76 - Al-Insan
  insan: 76, dahr: 76, human: 76,
  // 78 - An-Naba
  naba: 78, nabaa: 78, news: 78,
  // 85 - Al-Buruj
  buruj: 85,
  // 86 - At-Tariq
  tariq: 86,
  // 88 - Al-Ghashiya
  ghashiya: 88, ghashiyah: 88,
  // 89 - Al-Fajr
  fajr: 89, dawn: 89,
  // 90 - Al-Balad
  balad: 90, city: 90,
  // 91 - Ash-Shams
  shams: 91, sun: 91,
  // 92 - Al-Layl
  layl: 92,
  // 93 - Ad-Duha
  duha: 93,
  // 94 - Ash-Sharh
  sharh: 94, inshirah: 94,
  // 95 - At-Tin
  tin: 95, fig: 95,
  // 96 - Al-Alaq
  alaq: 96, iqra: 96, clot: 96,
  // 97 - Al-Qadr
  qadr: 97, power: 97,
  // 99 - Az-Zalzala
  zalzala: 99, zalzalah: 99, earthquake: 99,
  // 101 - Al-Qaria
  qaria: 101, qariah: 101,
  // 103 - Al-Asr
  asr: 103, time: 103,
  // 105 - Al-Fil
  fil: 105, elephant: 105,
  // 106 - Quraysh
  quraysh: 106, quraish: 106,
  // 108 - Al-Kawthar
  kawthar: 108, kausar: 108, kauther: 108, kawther: 108,
  // 109 - Al-Kafirun
  kafirun: 109, kafiroon: 109,
  // 110 - An-Nasr
  nasr: 110, help: 110,
  // 111 - Al-Masad
  masad: 111, lahab: 111,
  // 112 - Al-Ikhlas
  ikhlas: 112, sincerity: 112,
  // 113 - Al-Falaq
  falaq: 113, daybreak: 113,
  // 114 - An-Nas
  nas: 114, mankind: 114,
};

/* ── Main smart search function ─────────────────────────────── */
/**
 * @param {string} query   — raw user input
 * @param {Array}  surahs  — full surah list from API
 * @returns {{ results: Array, didYouMean: object|null }}
 */
export function smartSearch(query, surahs) {
  if (!query.trim() || surahs.length === 0) {
    return { results: [], didYouMean: null };
  }

  const raw = query.trim();
  const norm = normalizeQuery(raw);
  const normLower = norm.toLowerCase();

  const scored = [];

  for (const s of surahs) {
    const engLower = s.englishName.toLowerCase();
    const engNorm = normalizeQuery(s.englishName);
    const engNormLower = engNorm.toLowerCase();
    const numStr = String(s.number);

    let score = 0;
    let matchType = null;

    // 1. Exact number
    if (numStr === normLower) {
      score = 100; matchType = 'number';
    }
    // 2. Exact name (normalized)
    else if (engNormLower === normLower || engLower === normLower) {
      score = 90; matchType = 'exact';
    }
    // 3. Starts with
    else if (engNormLower.startsWith(normLower) || engLower.startsWith(normLower)) {
      score = 80; matchType = 'exact';
    }
    // 4. Alias match
    else if (ALIASES[normLower] === s.number) {
      score = 75; matchType = 'alias';
    }
    // 5. Contains
    else if (engLower.includes(normLower)) {
      score = 65; matchType = 'exact';
    }
    // 6. Arabic text
    else if (s.name && s.name.includes(raw)) {
      score = 65; matchType = 'exact';
    }
    // 7. Number starts with (e.g. "1" → 1,10-19)
    else if (normLower.length <= 3 && numStr.startsWith(normLower)) {
      score = 55; matchType = 'number';
    }
    else {
      // 8. Fuzzy on surah name
      const threshold = normLower.length <= 3 ? 1 : normLower.length <= 6 ? 2 : 3;
      const distName = levenshtein(normLower, engNormLower);
      if (distName <= threshold) {
        score = Math.max(20, 50 - distName * 10);
        matchType = 'fuzzy';
      }

      // 9. Fuzzy on alias keys for this surah
      if (!matchType) {
        for (const [alias, surahNum] of Object.entries(ALIASES)) {
          if (surahNum !== s.number) continue;
          const aliasThreshold = normLower.length <= 4 ? 1 : 2;
          const distAlias = levenshtein(normLower, alias);
          if (distAlias <= aliasThreshold) {
            score = Math.max(15, 45 - distAlias * 10);
            matchType = 'fuzzy';
            break;
          }
        }
      }
    }

    if (score > 0 && matchType) {
      scored.push({ ...s, score, matchType });
    }
  }

  // Sort by score desc, then surah number for ties
  scored.sort((a, b) => b.score - a.score || a.number - b.number);

  const results = scored.slice(0, 7);

  // "Did you mean?" — only when no exact/alias/number results
  const hasGoodMatch = results.some(r =>
    r.matchType === 'exact' || r.matchType === 'alias' || r.matchType === 'number'
  );
  const didYouMean = !hasGoodMatch && results.length > 0 ? results[0] : null;

  return { results, didYouMean };
}
