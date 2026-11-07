/**
 * lib/searchEngine.js — Smart Quran search (runs in the browser, no API).
 *
 * Understands what people actually type:
 *   - Surah names in any common spelling, with or without "Surah", "Al-",
 *     "Sharif", "ki tilawat"…  ("surah yaseen sharif", "Yasin", "surat rehman")
 *   - Typos (fuzzy matching on a sound-alike key: "baqra", "mulq", "kahaf")
 *   - Other names and meanings ("tabarak" → Al-Mulk, "cow" → Al-Baqara)
 *   - Arabic / Urdu names ("یٰسین", "سورة الملك")
 *   - Surah numbers ("36", "surah 36")
 *   - Ayah references ("2:255", "baqarah 255", "yaseen ayat 5", "ayatul kursi")
 *   - Juz / Para ("juz 30", "para 30", "amma para")
 *
 * searchQuran(query) → { items, best, didYouMean }
 *   items       ranked results: { type: 'surah' | 'ayah' | 'juz', url, score, ... }
 *   best        the top item when the match is certain (Enter can open it directly)
 *   didYouMean  the top surah when only a typo-level match was found
 */

import { SURAHS, getSurah } from '../data/surahIndex.js';

/* ── Text normalization ──────────────────────────────────────── */

// Words that don't help find a Surah ("surah yaseen sharif ki tilawat").
const STOP_WORDS = new Set([
  'surah', 'sura', 'surat', 'surahs', 'soorah', 'soora', 'sorah', 'sorat', 'surha', 'suraah', 'surae', 'suraa',
  'sharif', 'shareef', 'sharief', 'pak', 'mubarak', 'ki', 'ka', 'ke', 'e', 'ul', 'tilawat', 'tilawa',
  'recitation', 'recite', 'read', 'reading', 'online', 'full', 'complete', 'with', 'in', 'and', 'urdu',
  'english', 'arabic', 'translation', 'tarjuma', 'tarjama', 'tafseer', 'tafsir', 'mp3', 'audio', 'listen',
  'the', 'of', 'chapter', 'quran', 'quraan', 'koran', 'holy', 'al', 'el', 'pdf', 'text', 'download',
]);

// Arabic definite article written as its own word or joined with a hyphen.
const ARTICLE_RE = /^(al|el|an|ar|as|at|ad|az|ash|ath|adh|aal)$/;
// The same article joined to the name ("alfatiha", "arrahman").
const JOINED_ARTICLE_RE = /^(al|an|ar|as|at|ad|az|ash|adh)(?=[a-z]{3,})/;

/** Lowercase Latin words, accents and apostrophes removed. */
function latinWords(text) {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
    .replace(/['’‘`ʿʾ]/g, '')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()
    .split(' ')
    .filter(Boolean);
}

/**
 * Sound-alike key, so different spellings of one name meet:
 * Yaseen / Yasin / Yaaseen → "yasin", Rehman / Rahmaan → "rahman",
 * Kawthar / Kausar → "kawsar", Muddaththir / Mudassir → "mudasir".
 */
function soundKey(word) {
  let w = word
    .replace(/ph/g, 'f')
    .replace(/kh/g, 'k')
    .replace(/gh/g, 'g')
    .replace(/q/g, 'k')
    .replace(/c/g, 'k')
    .replace(/x/g, 'ks')
    .replace(/v/g, 'w')
    .replace(/dh|zh/g, 'z')
    .replace(/th/g, 's')
    .replace(/sw/g, 's')
    .replace(/ee/g, 'i')
    .replace(/oo|ou/g, 'u')
    .replace(/o/g, 'u')
    .replace(/ai|ei|ay/g, 'ay')
    .replace(/au|aw/g, 'aw')
    .replace(/iy/g, 'y')
    .replace(/e/g, 'a');
  w = w.replace(/(.)\1+/g, '$1');      // doubled letters
  w = w.replace(/([aiu])h$/, '$1');     // final h: "fatihah" → "fatiha"
  return w;
}

/** Arabic / Urdu text → bare letters, so Arabic and Urdu spellings meet. */
function arabicKey(text) {
  return text
    .replace(/[ً-ٰٟۖ-ۭـ]/g, '') // harakat, Quranic marks, tatweel
    .replace(/[أإآٱ]/g, 'ا')
    .replace(/[يىئ]/g, 'ی')
    .replace(/[ةهۃ]/g, 'ہ')
    .replace(/ك/g, 'ک')
    .replace(/ؤ/g, 'و')
    .replace(/[^؀-ۿ]/g, '')
    .replace(/^(سورۃ|سورہ|سورت|سوره|سور)/, '')
    .replace(/^ال/, '');
}

const ARABIC_RE = /[؀-ۿ]/;

/* ── Fuzzy distance (Damerau–Levenshtein, optimal string alignment) ── */
function editDistance(a, b, max) {
  if (Math.abs(a.length - b.length) > max) return max + 1;
  const m = a.length;
  const n = b.length;
  let prev2 = null;
  let prev = Array.from({ length: n + 1 }, (_, j) => j);
  for (let i = 1; i <= m; i++) {
    const cur = [i];
    let rowMin = i;
    for (let j = 1; j <= n; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      let v = Math.min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + cost);
      if (prev2 && i > 1 && j > 1 && a[i - 1] === b[j - 2] && a[i - 2] === b[j - 1]) {
        v = Math.min(v, prev2[j - 2] + 1);
      }
      cur[j] = v;
      if (v < rowMin) rowMin = v;
    }
    if (rowMin > max) return max + 1;
    prev2 = prev;
    prev = cur;
  }
  return prev[n];
}

/** How many typos to allow for a key of this length. */
function typoLimit(len) {
  if (len <= 3) return 0;
  if (len <= 5) return 1;
  if (len <= 9) return 2;
  return 3;
}

/* ── Surah keys (built once) ─────────────────────────────────── */

function nameKeys(text) {
  const words = latinWords(text).filter((w) => !ARTICLE_RE.test(w));
  const key = soundKey(words.join(''));
  return key ? [key] : [];
}

/** Spelling as typed (only doubled letters collapsed) — a second chance for
 *  typos that the sound-alike key happens to push further apart. */
function plainKey(words) {
  return words.filter((w) => !ARTICLE_RE.test(w)).join('').replace(/(.)\1+/g, '$1');
}

// Everyday words that sound like a Surah name ("allah" ≈ Al-A'laa) — these
// are verse searches, never Surah lookups.
const NOT_SURAH_WORDS = new Set(['allah', 'alah', 'allaah', 'god', 'lord', 'rab', 'rabb']);

const SURAH_KEYS = SURAHS.map((s) => {
  const names = new Set(nameKeys(s.englishName));
  const aliases = new Set();
  for (const a of s.aliases) for (const k of nameKeys(a)) if (!names.has(k)) aliases.add(k);
  const meanings = new Set();
  for (const m of [s.nameTranslation, ...s.meanings]) {
    for (const k of nameKeys(m)) if (!names.has(k) && !aliases.has(k)) meanings.add(k);
  }
  return {
    surah: s,
    names: [...names],
    aliases: [...aliases],
    meanings: [...meanings],
    plain: [...new Set([s.englishName, ...s.aliases].map((x) => plainKey(latinWords(x))).filter(Boolean))],
    arabic: [...new Set([arabicKey(s.name), arabicKey(s.urduName)].filter(Boolean))],
  };
});

/* ── Special phrases ─────────────────────────────────────────── */

const SPECIAL_AYAHS = [
  { keys: ['ayatulkursi', 'ayatalkursi', 'ayatkursi', 'kursi', 'throneverse', 'versofthethrone', 'ayatulkursy'], surah: 2, ayah: 255, label: 'Ayat al-Kursi' },
  { keys: ['amanarrasul', 'amanarasul', 'last2ayatbaqarah', 'lasttwoayatbaqarah', 'lasttwoversesbaqarah'], surah: 2, ayah: 285, label: 'Last two Ayahs of Al-Baqara' },
].map((x) => ({ ...x, keys: x.keys.map(soundKey) }));

// Para (Juz) names as commonly used in South Asia.
const PARA_NAMES = [
  'alif lam meem', 'sayaqool', 'tilkar rusul', 'lan tanalu', 'wal mohsanat', 'la yuhibbullah',
  'wa iza samiu', 'wa lau annana', 'qalal malao', 'wa alamu', 'yatazeroon', 'wa ma min dabbah',
  'wa ma ubrioo', 'rubama', 'subhanallazi', 'qal alam', 'iqtaraba', 'qad aflaha', 'wa qalallazina',
  'amman khalaq', 'utlu ma oohi', 'wa manyaqnut', 'wa mali', 'faman azlam', 'elahe yuruddo',
  'ha meem', 'qala fama khatbukum', 'qad sami allah', 'tabarakallazi', 'amma yatasaaloon',
].map((n) => soundKey(latinWords(n).join('')));
const PARA_SHORT = Object.fromEntries(
  [['amma', 30], ['tabarak', 29], ['tabarakallazi', 29], ['qadsami', 28], ['alif lam meem', 1]]
    .map(([n, j]) => [soundKey(latinWords(n).join('')), j]),
);

const JUZ_WORDS = new Set(['juz', 'juzz', 'jus', 'para', 'parah', 'paara', 'paarah', 'sipara', 'siparah', 'sipaara', 'part']);
const AYAH_WORDS = new Set(['ayat', 'ayah', 'aayat', 'aayah', 'ayt', 'ayet', 'aya', 'verse', 'verses', 'v', 'no', 'number']);

/* ── Scoring one surah against the query ─────────────────────── */

/**
 * Best match of a query key against one surah.
 * Returns { score, matchType } or null.
 */
function scoreSurah(entry, qKeys, qWordKeys, qArabic, qPlain) {
  let best = null;
  const take = (score, matchType) => {
    if (!best || score > best.score) best = { score, matchType };
  };

  for (const q of qKeys) {
    if (!q) continue;
    for (const [list, exact, prefix] of [[entry.names, 95, 82], [entry.aliases, 90, 72]]) {
      for (const t of list) {
        if (t === q) take(exact, list === entry.names ? 'exact' : 'alias');
        else if (q.length >= (list === entry.names ? 2 : 4) && t.startsWith(q)) take(prefix - Math.min(10, t.length - q.length), 'prefix');
        else if (q.length >= 4 && t.includes(q)) take(60, 'contains');
        else {
          const max = typoLimit(Math.min(q.length, t.length));
          if (max > 0) {
            const d = editDistance(q, t, max);
            if (d <= max) take((list === entry.names ? 62 : 56) - d * 10, 'fuzzy');
          }
        }
      }
    }
    // English meanings ("cow", "light"): listed, but below the certain-match
    // score, because they are also everyday words people search verses for.
    for (const t of entry.meanings) {
      if (t === q) take(70, 'meaning');
      else if (q.length >= 4 && t.startsWith(q)) take(55, 'meaning');
    }
  }

  if (qPlain.length >= 4) {
    for (const t of entry.plain) {
      const max = typoLimit(Math.min(qPlain.length, t.length));
      const d = max > 0 ? editDistance(qPlain, t, max) : max + 1;
      if (d <= max) take(56 - d * 10, 'fuzzy');
    }
  }

  // One word of a longer query matches ("yaseen beautiful recitation").
  if (qWordKeys.length > 1) {
    for (const w of qWordKeys) {
      if (w.length < 3) continue;
      for (const t of [...entry.names, ...entry.aliases]) {
        if (t === w) take(70, 'word');
        else {
          const max = typoLimit(Math.min(w.length, t.length));
          if (max > 0 && editDistance(w, t, max) <= max) take(45, 'fuzzy');
        }
      }
    }
  }

  if (qArabic) {
    for (const t of entry.arabic) {
      if (t === qArabic) take(95, 'exact');
      else if (qArabic.length >= 2 && t.startsWith(qArabic)) take(80, 'prefix');
      else if (qArabic.length >= 3 && t.includes(qArabic)) take(62, 'contains');
      else if (qArabic.length >= 3 && editDistance(qArabic, t, 1) <= 1) take(55, 'fuzzy');
    }
  }
  return best;
}

/** Rank surahs for Latin/Arabic name text. */
function rankSurahs(words, rawArabic) {
  const kept = words.filter((w) => !STOP_WORDS.has(w));
  const nameWords = kept.filter((w, i) => !(ARTICLE_RE.test(w) && i < kept.length - 1));
  const joined = soundKey(nameWords.join(''));
  const qKeys = [joined];
  const stripped = joined.replace(JOINED_ARTICLE_RE, '');
  if (stripped !== joined) qKeys.push(stripped);
  const qWordKeys = nameWords.map(soundKey);
  const qArabic = rawArabic ? arabicKey(rawArabic) : '';
  const qPlain = plainKey(nameWords);
  if (!joined && !qArabic) return [];
  if (!qArabic && nameWords.every((w) => NOT_SURAH_WORDS.has(w))) return [];

  const out = [];
  for (const entry of SURAH_KEYS) {
    const m = scoreSurah(entry, qKeys, qWordKeys, qArabic, qPlain);
    if (m && m.score >= 40) out.push({ surah: entry.surah, ...m });
  }
  out.sort((a, b) => b.score - a.score || a.surah.number - b.surah.number);
  return out;
}

/* ── Result builders ─────────────────────────────────────────── */

const surahItem = (s, score, matchType) => ({
  type: 'surah', key: `s${s.number}`, url: `/surah/${s.englishName}`, surah: s, score, matchType,
});

const ayahItem = (s, ayah, score, label) => ({
  type: 'ayah', key: `a${s.number}:${ayah}`, url: `/surah/${s.englishName}#verse-${ayah}`,
  surah: s, ayah, score, matchType: 'reference', label,
});

const juzItem = (juz, score) => ({
  type: 'juz', key: `j${juz}`, url: `/juz/${juz}`, juz, score, matchType: 'juz',
});

function validAyah(surahNum, ayah) {
  const s = getSurah(surahNum);
  return s && ayah >= 1 && ayah <= s.versesCount ? s : null;
}

/* ── Main entry ──────────────────────────────────────────────── */

/**
 * @param {string} query raw user input
 * @param {{ limit?: number }} [options]
 * @returns {{ items: Array, best: object|null, didYouMean: object|null }}
 */
export function searchQuran(query, { limit = 8 } = {}) {
  const empty = { items: [], best: null, didYouMean: null };
  const raw = (query || '').trim();
  if (!raw) return empty;

  const items = [];
  const rawArabic = ARABIC_RE.test(raw) ? raw : '';
  const words = latinWords(raw);
  const nums = words.filter((w) => /^\d+$/.test(w)).map(Number);
  const textWords = words.filter((w) => !/^\d+$/.test(w));
  const meaningful = textWords.filter((w) => !STOP_WORDS.has(w) && !AYAH_WORDS.has(w) && !JUZ_WORDS.has(w));

  // 1. Juz / Para: "juz 30", "para 30", "30 para", "amma para"
  if (textWords.some((w) => JUZ_WORDS.has(w))) {
    if (nums.length && nums[0] >= 1 && nums[0] <= 30) items.push(juzItem(nums[0], 100));
    const key = soundKey(meaningful.join(''));
    if (key) {
      const short = PARA_SHORT[key];
      if (short) items.push(juzItem(short, 96));
      PARA_NAMES.forEach((p, i) => {
        if (p === key) items.push(juzItem(i + 1, 96));
        else if (key.length >= 4 && editDistance(key, p, typoLimit(p.length)) <= typoLimit(p.length)) items.push(juzItem(i + 1, 70));
      });
    }
  }

  // 2. Ayah reference by numbers: "2:255", "2 255", "surah 2 ayat 255"
  const refMatch = raw.match(/^\D*?(\d{1,3})\s*[:.\-/\s]\s*(?:\D{0,8}?)(\d{1,3})\s*$/);
  if (refMatch && meaningful.length === 0) {
    const s = validAyah(+refMatch[1], +refMatch[2]);
    if (s) items.push(ayahItem(s, +refMatch[2], 100));
  }

  // 3. Special named ayahs: "ayatul kursi"
  const phraseKey = soundKey(words.filter((w) => !STOP_WORDS.has(w)).join(''));
  for (const sp of SPECIAL_AYAHS) {
    const hit = sp.keys.some((k) => k === phraseKey || (phraseKey.length >= 6 && editDistance(phraseKey, k, 2) <= 2));
    if (hit) items.push(ayahItem(getSurah(sp.surah), sp.ayah, 98, sp.label));
  }

  // 4. Surah number alone: "36", "surah 36"
  if (nums.length === 1 && meaningful.length === 0 && !items.some((i) => i.type === 'juz')) {
    const s = getSurah(nums[0]);
    if (s) items.push(surahItem(s, 100, 'number'));
  }

  // 5. Surah names (Latin and Arabic/Urdu)
  const nameWords = textWords.filter((w) => !AYAH_WORDS.has(w) && !JUZ_WORDS.has(w));
  const ranked = (meaningful.length || rawArabic) ? rankSurahs(nameWords, rawArabic) : [];

  // 6. Name + ayah number: "baqarah 255", "yaseen ayat 5"
  if (nums.length === 1 && ranked.length && ranked[0].score >= 56) {
    for (const r of ranked.slice(0, 3)) {
      if (r.score < ranked[0].score - 10) break;
      if (validAyah(r.surah.number, nums[0])) items.push(ayahItem(r.surah, nums[0], r.score + 4));
    }
  }

  for (const r of ranked) items.push(surahItem(r.surah, r.score, r.matchType));

  // Keep the best entry per result, highest score first.
  const seen = new Map();
  for (const it of items) {
    const prev = seen.get(it.key);
    if (!prev || it.score > prev.score) seen.set(it.key, it);
  }
  const sorted = [...seen.values()].sort((a, b) => b.score - a.score);
  const result = sorted.slice(0, limit);

  const top = result[0] || null;
  const second = result[1];
  const certain = top && top.score >= 85 && (!second || second.score < top.score);
  const best = certain ? top : null;
  const didYouMean = top && top.type === 'surah' && top.matchType === 'fuzzy' ? top : null;

  return { items: result, best, didYouMean };
}
