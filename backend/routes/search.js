/**
 * routes/search.js — Verse search in the English translation (ESM)
 *
 * GET /api/search?q=<words>&limit=20&offset=0[&surah=<n>]
 *
 * Every meaningful word must appear in the verse (in any order); a word also
 * matches its longer forms ("forgive" → "forgiven", "forgiveness"; "mercy" →
 * "merciful"). Verses with the exact phrase rank first. Surah names, numbers
 * and ayah references are handled in the browser (frontend lib/searchEngine.js),
 * so this route only searches verse text.
 */

import express from 'express';
import { loadQuranData } from '../lib/quranData.js';
import { reportError } from '../lib/reportError.js';

const router = express.Router();

const MAX_QUERY = 100;
const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 50;

// Too common to narrow a search; ignored unless the query has nothing else.
const STOP_WORDS = new Set([
  'a', 'an', 'the', 'of', 'and', 'or', 'in', 'on', 'to', 'is', 'are', 'was', 'be', 'by', 'for',
  'with', 'that', 'this', 'it', 'as', 'at', 'from', 'his', 'her', 'their', 'who', 'which',
]);

let verses = null; // flat list with lowercased text, built once

async function getVerses() {
  if (verses) return verses;
  const data = await loadQuranData();
  verses = [];
  for (const surah of data) {
    for (const v of surah.verses) {
      const text = v.translation || '';
      verses.push({
        globalNumber: v.globalNumber,
        surahNumber: surah.surahNumber,
        surahName: surah.surahName,
        verseNumber: v.verseNumber,
        text,
        lower: text.toLowerCase(),
      });
    }
  }
  return verses;
}

getVerses().catch(() => {});

const escapeRegex = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

/** Shortest useful form of a word, so it also matches its longer forms. */
// "mercy" → "merc" (merciful), "believers" → "believer", "blessed" → "bless".
const STEM_RULES = [[/ies$/, 'i'], [/ness$/, ''], [/ing$/, ''], [/ed$/, ''], [/es$/, ''], [/s$/, ''], [/y$/, '']];

function stemWord(w) {
  if (w.length <= 4) return w;
  for (const [re, rep] of STEM_RULES) {
    if (re.test(w)) {
      const s = w.replace(re, rep);
      return s.length >= 4 ? s : w;
    }
  }
  return w;
}

/** Query → { phrase, terms: [{ word, stem, re }] } */
function parseQuery(q) {
  const phrase = q.toLowerCase().replace(/\s+/g, ' ').trim();
  const all = phrase.replace(/[^a-z0-9'\s-]/g, ' ').split(/\s+/).filter((w) => w.length >= 2);
  const content = all.filter((w) => !STOP_WORDS.has(w));
  const words = [...new Set(content.length ? content : all)];
  return {
    phrase,
    terms: words.map((word) => {
      const stem = stemWord(word);
      const exact = new RegExp(`\\b${escapeRegex(word)}\\b`, 'i');
      // Short words match whole words only ("me" must not match "mercy").
      const re = stem.length < 4 ? exact : new RegExp(`\\b${escapeRegex(stem)}`, 'i');
      return { word, stem, re, exact };
    }),
  };
}

router.get('/', async (req, res) => {
  const q = (req.query.q || '').toString().slice(0, MAX_QUERY).trim();
  if (!q) return res.status(400).json({ error: 'Query cannot be empty.' });

  const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || DEFAULT_LIMIT, 1), MAX_LIMIT);
  const offset = Math.max(parseInt(req.query.offset, 10) || 0, 0);
  const surahOnly = req.query.surah ? parseInt(req.query.surah, 10) : null;

  try {
    const all = await getVerses();
    const { phrase, terms } = parseQuery(q);
    if (!terms.length) return res.json({ total: 0, count: 0, offset, matches: [], terms: [] });

    const scored = [];
    for (const v of all) {
      if (surahOnly && v.surahNumber !== surahOnly) continue;
      if (!terms.every((t) => t.re.test(v.lower))) continue;
      let score = 0;
      if (terms.length > 1 && v.lower.includes(phrase)) score += 50;
      for (const t of terms) score += t.exact.test(v.lower) ? 10 : 5;
      scored.push({ v, score });
    }
    scored.sort((a, b) => b.score - a.score || a.v.globalNumber - b.v.globalNumber);

    const page = scored.slice(offset, offset + limit).map(({ v }) => ({
      globalNumber: v.globalNumber,
      surahNumber: v.surahNumber,
      surahName: v.surahName,
      verseNumber: v.verseNumber,
      text: v.text,
    }));

    res.json({
      total: scored.length,
      count: page.length,
      offset,
      matches: page,
      // Stems the frontend highlights, so "forgive" also marks "forgiveness".
      terms: terms.map((t) => t.stem),
    });
  } catch (err) {
    await reportError(err, { route: 'GET /api/search', extra: { q: req.query.q } });
    res.status(500).json({ error: 'Search temporarily unavailable.' });
  }
});

export default router;
