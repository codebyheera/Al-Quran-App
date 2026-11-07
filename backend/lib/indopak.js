/**
 * lib/indopak.js — IndoPak (Nastaleeq) Quran text from Quran.com (ESM)
 *
 * Used with the "AlQuran IndoPak by QuranWBW" font, under QuranWBW's
 * permission. The text must be shown exactly as received: no stripping
 * (not even the Bismillah), no merging, no edits.
 *
 * Quran.com's public v4 API only has this text per verse, so the per-word
 * text comes from Quran.com's own API (`text_indopak_nastaleeq`, the current
 * IndoPak text; `text_indopak` is the deprecated pre-2021 one).
 *
 * The ayah-end token carries Private Use characters that the font draws as
 * the ayah number, with the Ruku (ع) and Sajda signs where they belong, so it
 * is kept as `indopakEnd` and rendered unchanged after the last word.
 */

import { getJson } from './upstream.js';

const QDC_BASE = 'https://api.qurancdn.com/api/qdc';

/**
 * Fetch Surah `num` and return { [verseNumber]: { words: Map(id → text), tokens } }
 * where `tokens` is every token of the verse, in order: { id, text }.
 */
export async function fetchIndopakChapter(num) {
  const url = `${QDC_BASE}/verses/by_chapter/${num}?words=true&word_fields=text_indopak_nastaleeq&per_page=300`;
  const json = await getJson(url);
  const out = {};
  for (const v of json.verses || []) {
    const verseNum = parseInt(v.verse_key.split(':')[1], 10);
    const tokens = (v.words || []).map((w) => ({ id: w.id, text: w.text_indopak_nastaleeq }));
    out[verseNum] = { tokens };
  }
  return out;
}

/**
 * Add IndoPak text to one verse in place: `text_indopak` on each word
 * (matched by Quran.com word id) and `indopakEnd` for the ayah-end token.
 *
 * Returns null on success, or a string describing why the verse could not be
 * matched exactly — in that case the verse is left without IndoPak text and
 * the page shows Uthmani for it, so text is never shown out of order.
 */
export function applyIndopakToVerse(verse, chapterData) {
  const entry = chapterData?.[verse.number];
  for (const w of verse.words || []) delete w.text_indopak;
  delete verse.indopakEnd;
  if (!entry) return 'verse missing from Quran.com response';

  const words = verse.words || [];
  if (!words.length) return 'verse has no word-by-word data';
  const tokens = entry.tokens;
  if (tokens.some((t) => typeof t.text !== 'string' || !t.text)) return 'empty IndoPak token';

  // Our words are Quran.com's "word" tokens in order; everything left after
  // the last one must be the ayah-end token. Anything else (extra tokens in
  // between, missing ids) means the two texts don't line up.
  const lastWordIdx = tokens.findIndex((t) => t.id === words[words.length - 1].id);
  if (lastWordIdx === -1) return 'last word id not found';
  const wordTokens = tokens.slice(0, lastWordIdx + 1);
  const rest = tokens.slice(lastWordIdx + 1);
  if (wordTokens.length !== words.length) return `token count ${wordTokens.length} ≠ word count ${words.length}`;
  if (wordTokens.some((t, i) => t.id !== words[i].id)) return 'word ids out of order';
  if (rest.length !== 1) return `expected 1 ayah-end token, got ${rest.length}`;

  words.forEach((w, i) => { w.text_indopak = wordTokens[i].text; });
  verse.indopakEnd = rest[0].text;
  return null;
}
