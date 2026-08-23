/**
 * routes/chat.js — POST /api/chat
 *
 * Answers as "Noor", the site's AI assistant — see the system prompts below
 * for the identity rule. Site-grounded, retrieving relevant context from:
 *   - Supabase: surah_content (intro + FAQs) and blogs
 *   - The site's own Quran English-translation dataset (lib/quranData.js —
 *     the same Sahih International data every Surah page reads from)
 *   - Al-Quran Cloud (api.alquran.cloud) as a live fallback, only for the
 *     one specific verse a user asks about if it's somehow missing from
 *     the local dataset — the same authentic source this site is built on
 *
 * The model is instructed to answer only from this context, and to cite
 * Surah:Ayah + translation source whenever it quotes a verse — never to
 * invent Quranic text, Ayah numbers, or Hadith that aren't in the context.
 *
 * If NOTHING relevant is found on the site at all, a separate, clearly
 * labeled fallback asks Groq's web-search-capable model (groq/compound-mini)
 * for a general answer with cited sources — kept as its own isolated path
 * so it can never contaminate the strict Quran-verse grounding above, and
 * the response is tagged `source: "web"` so the frontend can flag it as
 * unverified live-search output rather than the site's own vetted content.
 *
 * Rate limiting is applied where this router is mounted in server.js
 * (matches the audio-proxy route's pattern of a route-specific limiter).
 */

import express from 'express';
import axios from 'axios';
import { supabase } from '../lib/supabase.js';
import { getChatCompletion } from '../lib/groqClient.js';
import { loadQuranData } from '../lib/quranData.js';
import { getSitePages, PRAYER_CITY_SLUGS } from '../lib/sitePages.js';
import { getSurahId, getSurahSlug } from '../data/surahMapping.js';

const router = express.Router();

const MAX_CONTEXT_SNIPPETS = 5;
const MAX_VERSE_MATCHES = 3;
const MAX_HISTORY_TURNS = 3;
const MAX_MESSAGE_LENGTH = 1000;

const LOCAL_VERSE_SOURCE = 'Al-Quran Hub verse database (Sahih International translation)';
const LIVE_VERSE_SOURCE = 'Fetched live from Al-Quran Cloud (api.alquran.cloud), Sahih International translation';

// Web-search-capable Groq model — used ONLY as a fallback when nothing
// relevant exists on-site. Its citations are not independently verified
// the way the site's own Quran/FAQ data is, so replies via this path are
// tagged `source: "web"` for the frontend to flag as unverified.
const WEB_SEARCH_MODEL = process.env.GROQ_WEB_SEARCH_MODEL || 'groq/compound-mini';

// Hand-written descriptions of the site's own non-Quran features. Without
// this, a question like "how do Prayer Times work here" has nothing to
// match in surah_content/blogs, so the model would either decline or hand
// it to the web-search fallback — which knows nothing about *this site's*
// implementation. Always included in context (like site facts) so these
// answer correctly and locally, with source: "site".
const SITE_FEATURES_TEXT =
  'Prayer Times: Al Quran Hub has a Prayer Times feature (menu item "Prayer Times", page alquranhub.org/prayer-times) showing daily Fajr, Dhuhr, Asr, Maghrib, and Isha prayer times for your city, calculated automatically and updated daily, plus the Qibla direction.\n' +
  'Tasbih Counter: Al Quran Hub has a digital Tasbih Counter (menu item "Tasbih", page alquranhub.org/tasbih) for counting dhikr (remembrance of Allah) — tap to count, set a target, and reset anytime, right in the browser.\n' +
  'Bookmarks: While reading a Surah you can bookmark any verse, then find all your saved verses later under "Bookmarks".\n' +
  'Blog: Al Quran Hub has a Blog section with articles on Quranic topics, found under "Blog".';

// A handful of the site's own feature pages, matched by keyword — used to
// attach a real, code-generated link (never LLM-generated) to answers
// about how to use a specific part of the site.
const FEATURE_LINKS = [
  { keywords: ['prayer time', 'prayer times', 'salah time', 'namaz time'], label: 'Open Prayer Times', url: '/prayer-times' },
  { keywords: ['tasbih', 'dhikr counter', 'zikr counter'], label: 'Open Tasbih Counter', url: '/tasbih' },
  { keywords: ['bookmark'], label: 'Open Bookmarks', url: '/bookmarks' },
  { keywords: ['blog'], label: 'Open Blog', url: '/blog' },
];

function extractFeatureLink(message) {
  const text = String(message || '').toLowerCase();

  // "Prayer times in Lahore" → the specific city page, not the generic one.
  if (/prayer\s*times?|salah\s*time|namaz\s*time/.test(text)) {
    const city = PRAYER_CITY_SLUGS.find((slug) => text.includes(slug));
    if (city) {
      const displayCity = city.charAt(0).toUpperCase() + city.slice(1);
      return { label: `Prayer Times in ${displayCity}`, url: `/prayer-times/${city}` };
    }
  }

  for (const feature of FEATURE_LINKS) {
    if (feature.keywords.some((k) => text.includes(k))) {
      return { label: feature.label, url: feature.url };
    }
  }
  return null;
}

// Simple greetings ("salam", "hello", "hi") get a warm, deterministic reply
// — no LLM call needed — that introduces Noor and nudges toward reading the
// Quran, with a link to the site's own Surah list.
const GREETING_RE =
  /^\s*(as-?salamu\s*['’]?alaikum|assalam\s*o?\s*alaikum|salam(un)?|salaam|hi|hello|hey|good\s*(morning|evening|afternoon|day))\s*[!.,؟]*\s*$/i;

function isGreeting(message) {
  return GREETING_RE.test(String(message || ''));
}

// Generic words that appear in nearly every row and are useless for
// narrowing an ILIKE/substring search — stripped out before searching.
// Deliberately broad: a leftover common word (e.g. "many") can coincidentally
// substring-match unrelated content and wrongly count as a real site match,
// which would block the web-search fallback from ever triggering.
const STOPWORDS = new Set([
  'what', 'whats', "what's", 'does', 'do', 'did', 'is', 'are', 'was', 'were', 'the', 'a', 'an', 'of', 'on',
  'about', 'tell', 'me', 'how', 'why', 'when', 'where', 'which', 'who', 'whom', 'can', 'you', 'your',
  'please', 'say', 'says', 'said', 'this', 'that', 'these', 'those', 'with', 'for', 'to', 'and', 'or', 'but',
  'it', 'its', "it's", 'i', 'my', 'we', 'our', 'in', 'quran', 'surah', 'ayah', 'ayat', 'verse', 'chapter', 'holy',
  'many', 'much', 'some', 'any', 'all', 'other', 'also', 'just', 'like', 'get', 'got', 'one', 'two', 'three',
  'before', 'after', 'first', 'last', 'name', 'names', 'called', 'call', 'mean', 'means', 'meaning', 'kind',
  'kinds', 'type', 'types', 'number', 'numbers', 'want', 'need', 'know', 'find', 'give', 'read', 'there',
  'here', 'from', 'into', 'over', 'more', 'most', 'have', 'has', 'had', 'will', 'would', 'could', 'should',
]);

// ── Helpers ──────────────────────────────────────────────────────────────

// Frontend may pass a numeric id or the canonical name slug — normalize to
// the canonical slug (e.g. "At-Tawba") so it always matches surah_content.
function normalizeSurahSlug(rawSlug) {
  if (!rawSlug || typeof rawSlug !== 'string') return null;
  const id = getSurahId(rawSlug);
  if (!id) return null;
  return getSurahSlug(id);
}

function truncate(text, max) {
  const str = String(text || '');
  return str.length > max ? `${str.slice(0, max)}…` : str;
}

function stripHtml(html) {
  return String(html || '')
    .replace(/<[^>]*>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, ' ')
    .trim();
}

// Pulls out the meaningful search terms from a full-sentence question —
// e.g. "What does the Quran say about patience?" → ["patience"].
function extractKeywords(message) {
  const words = String(message || '')
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter((w) => w.length > 3 && !STOPWORDS.has(w));
  return [...new Set(words)].slice(0, 6);
}

// Recognizes an explicit verse reference like "9:60" or "9.60", or
// "verse 60" / "ayah 60" when a Surah is already in view (currentSurahNum).
function extractVerseReference(message, currentSurahNum) {
  const text = String(message || '');

  const refMatch = text.match(/\b(\d{1,3})\s*[:.]\s*(\d{1,3})\b/);
  if (refMatch) {
    const surah = parseInt(refMatch[1], 10);
    const ayah = parseInt(refMatch[2], 10);
    if (surah >= 1 && surah <= 114 && ayah >= 1) return { surah, ayah };
  }

  const wordMatch = text.match(/\b(?:ayah|ayat|verse)\s*(?:number\s*|no\.?\s*)?(\d{1,3})\b/i);
  if (wordMatch && currentSurahNum) {
    return { surah: currentSurahNum, ayah: parseInt(wordMatch[1], 10) };
  }

  return null;
}

// Small, cheap, always-included facts about the site itself — lets the
// assistant answer meta-questions like "how many blog posts do you have"
// accurately instead of declining, without needing keyword search to find
// them. The Surah/Juz/Ayah counts are fixed constants of the Quran (the
// same numbers shown in the site's own sidebar); only the blog count needs
// a live query.
async function getSiteFacts() {
  const { count, error } = await supabase
    .from('blogs')
    .select('*', { count: 'exact', head: true })
    .eq('is_published', true);

  return {
    surahCount: 114,
    juzCount: 30,
    ayahCount: 6236,
    blogCount: error ? null : count,
  };
}

// Real, current list of the site's own pages (the same list that builds
// /sitemap.xml — see lib/sitePages.js), turned into a compact text block so
// the assistant can accurately mention or point to real site URLs (e.g. a
// specific city's Prayer Times page, or a blog post by name) instead of
// guessing or relying only on the hand-written FEATURE_LINKS below.
async function getKnownSitePagesText() {
  try {
    const pages = await getSitePages();
    return pages.map((p) => `${p.label} — ${p.path}`).join('\n');
  } catch (err) {
    console.error('[chat] Failed to load site pages:', err.message);
    return '';
  }
}

async function fetchCurrentSurah(slug) {
  if (!slug) return null;
  const { data, error } = await supabase
    .from('surah_content')
    .select('surah_slug, intro, faqs')
    .eq('surah_slug', slug)
    .maybeSingle();
  if (error || !data) return null;
  return data;
}

// ILIKE works fine on the `intro` text column via PostgREST.
async function searchSurahIntros(keywords, excludeSlug) {
  if (!keywords.length) return [];
  const orFilter = keywords.slice(0, 3).map((k) => `intro.ilike.%${k}%`).join(',');
  const { data, error } = await supabase
    .from('surah_content')
    .select('surah_slug, intro')
    .or(orFilter)
    .limit(MAX_CONTEXT_SNIPPETS);

  if (error || !data) return [];
  return data.filter((row) => row.surah_slug !== excludeSlug);
}

// `faqs` is jsonb — PostgREST can't ILIKE inside a jsonb column directly,
// so pull the (small — 114 rows max) table and match in memory instead.
async function searchSurahFaqs(keywords, excludeSlug) {
  if (!keywords.length) return [];
  const { data, error } = await supabase
    .from('surah_content')
    .select('surah_slug, faqs');

  if (error || !data) return [];

  const needles = keywords.map((k) => k.toLowerCase());
  const matches = [];

  for (const row of data) {
    if (row.surah_slug === excludeSlug) continue;
    const hits = (Array.isArray(row.faqs) ? row.faqs : []).filter((f) =>
      needles.some(
        (n) => f?.question?.toLowerCase?.().includes(n) || f?.answer?.toLowerCase?.().includes(n),
      ),
    );
    if (hits.length) matches.push({ surah_slug: row.surah_slug, faqs: hits });
    if (matches.length >= MAX_CONTEXT_SNIPPETS) break;
  }

  return matches;
}

async function searchBlogs(keywords) {
  if (!keywords.length) return [];
  const cols = ['title', 'excerpt', 'content'];
  const orFilter = keywords
    .slice(0, 2)
    .flatMap((k) => cols.map((c) => `${c}.ilike.%${k}%`))
    .join(',');

  const { data, error } = await supabase
    .from('blogs')
    .select('slug, title, excerpt, content')
    .eq('is_published', true)
    .or(orFilter)
    .limit(MAX_CONTEXT_SNIPPETS);

  if (error || !data) return [];
  return data;
}

// Thematic verse search against the site's own English-translation dataset
// (the "site mein English translation available hai" content) — lets a
// question like "what does the Quran say about patience" surface actual,
// quotable, citable ayahs instead of only Surah intros/FAQs/blogs.
async function searchVerseTranslations(keywords, limit = MAX_VERSE_MATCHES) {
  if (!keywords.length) return [];
  const data = await loadQuranData().catch(() => []);
  const needles = keywords.map((k) => k.toLowerCase());
  const matches = [];

  for (const surah of data) {
    for (const verse of surah.verses) {
      const text = (verse.translation || '').toLowerCase();
      if (needles.some((n) => text.includes(n))) {
        matches.push({
          surahNumber: surah.surahNumber,
          surahName: surah.surahName,
          verseNumber: verse.verseNumber,
          translation: verse.translation,
        });
        if (matches.length >= limit) return matches;
      }
    }
  }
  return matches;
}

// Resolves one specific Surah:Ayah reference. Tries the local dataset
// first (fast, no network dependency); if it's somehow missing, falls back
// to a live fetch from Al-Quran Cloud — the same authentic source this
// site's own Quran pages are built from — so the reply always cites where
// the translation came from.
async function getVerseByRef(surahNum, ayahNum) {
  try {
    const data = await loadQuranData();
    const surah = data.find((s) => s.surahNumber === surahNum);
    const verse = surah?.verses?.find((v) => v.verseNumber === ayahNum);
    if (surah && verse) {
      return {
        surahNumber: surahNum,
        surahName: surah.surahName,
        verseNumber: ayahNum,
        translation: verse.translation,
        source: LOCAL_VERSE_SOURCE,
      };
    }
  } catch (err) {
    console.error('[chat] Local verse lookup failed:', err.message);
  }

  try {
    const { data } = await axios.get(
      `https://api.alquran.cloud/v1/ayah/${surahNum}:${ayahNum}/en.sahih`,
      { timeout: 8000 },
    );
    const ayah = data?.data;
    if (!ayah) return null;
    return {
      surahNumber: surahNum,
      surahName: ayah.surah?.englishName || `Surah ${surahNum}`,
      verseNumber: ayahNum,
      translation: ayah.text,
      source: LIVE_VERSE_SOURCE,
    };
  } catch (err) {
    console.error('[chat] Live verse fetch failed:', err.message);
    return null;
  }
}

// Fallback for when the site itself has nothing relevant: asks a
// web-search-capable Groq model for a cited general answer. Deliberately
// isolated from the strict site-context prompt/messages above — this path
// is allowed to search live, but is still told never to issue rulings and
// to always cite its sources, and its output is always labeled as
// unverified live-search content by the caller (source: "web").
async function answerFromWeb(message, history, knownPagesText) {
  const systemPrompt = `You are Noor, the AI assistant for Al Quran Hub (alquranhub.org), a Quran reading website. This question wasn't covered by the site's own content, so you may search the web.

Rules:
0. If asked who you are or your name, say you're Noor, the Al Quran Hub assistant — otherwise there's no need to mention your name.
1. Prefer well-known, mainstream Islamic reference sites (e.g. islamqa.info, sunnah.com, quran.com, yaqeeninstitute.org) and always end your answer with a "Source:" line naming what you used.
2. If you can't find a reliable answer, say so honestly instead of guessing.
3. Never issue a personal fatwa or religious ruling (halal/haram, valid/invalid, obligatory/forbidden) on any matter, and never state a specific Hadith citation (book/number) unless you are certain of it — for contested or ruling-type questions, tell the user to consult a qualified scholar.
4. Do NOT quote Quranic Arabic text or reproduce verse-by-verse translations yourself, even if you find them on the web — this site has its own verified Quran text for that.
5. If the user wants to read a Surah, Juz/Para, or any Quran text, never link or point them to another site or app (no quran.com, no other Quran readers) — only tell them to use Al Quran Hub's (alquranhub.org) own Surah/Juz reader. Your citation sources (islamqa.info, sunnah.com, etc.) are only for general knowledge answers, never for "where to read the Quran".
6. If mentioning a page on this site itself, only use a path from the "Known site pages" list below — never invent one.
7. Keep a warm, respectful, humble tone — write like you're talking to the person, not writing a report.
8. Keep it concise — a few sentences — unless more detail is asked for.
9. Write in plain, natural sentences only — no markdown at all (no **, no #, no bullet points with * or -, no headings). If you're listing a few things, just write them into a normal sentence instead of a list.

Known site pages (alquranhub.org) — paths are relative to the site:
${knownPagesText || '(unavailable)'}`;

  const messages = [
    { role: 'system', content: systemPrompt },
    ...history,
    { role: 'user', content: message },
  ];

  return getChatCompletion(messages, { model: WEB_SEARCH_MODEL, temperature: 0.3, maxTokens: 500 });
}

// Most Surah names carry an Arabic definite-article prefix (Al-, An-, Ar-,
// As-, Ash-, At-, Adh-, Adz-, Az-) that people very commonly drop in casual
// speech — "Surah Mulk" instead of "Surah Al-Mulk". getSurahId only matches
// the full canonical name, so retry with each prefix before giving up.
const SURAH_NAME_PREFIXES = ['al-', 'an-', 'ar-', 'as-', 'ash-', 'at-', 'adh-', 'adz-', 'az-'];

function resolveSurahIdLoosely(candidate) {
  const direct = getSurahId(candidate);
  if (direct) return direct;

  for (const prefix of SURAH_NAME_PREFIXES) {
    const id = getSurahId(prefix + candidate);
    if (id) return id;
  }
  return null;
}

// Detects "read/open Surah <name>" style requests so the reply can carry a
// real, code-generated link to that Surah's page on this site — never an
// LLM-generated URL, which could easily be wrong.
function extractMentionedSurahSlug(message, excludeSlug) {
  const match = String(message || '').match(/\bsurah\s+([a-z][a-z'\-]*(?:\s+[a-z][a-z'\-]*){0,3})/i);
  if (!match) return null;

  const candidate = match[1]
    .replace(/\b(please|now|today|for me|to me|surah)\b.*$/i, '')
    .trim();
  if (!candidate) return null;

  const id = resolveSurahIdLoosely(candidate);
  if (!id) return null;

  const slug = getSurahSlug(id);
  if (!slug || slug === excludeSlug) return null;
  return slug;
}

// Same idea for Juz (Para) — "Juz 5" or "Para 5" — → /juz/5.
function extractMentionedJuzNumber(message) {
  const match = String(message || '').match(/\b(?:juz|para)\s*(?:number\s*|no\.?\s*)?(\d{1,2})\b/i);
  if (!match) return null;
  const num = parseInt(match[1], 10);
  return num >= 1 && num <= 30 ? num : null;
}

const READ_INTENT_RE = /\b(read|open|show(?:\s+me)?|take\s+me\s+to|go\s+to|navigate\s+to|find)\b/i;

// A stricter check on top of extractMentionedSurahSlug/extractMentionedJuzNumber:
// only true "take me there" phrasing (read/open/show/go to/find), not an
// incidental mention like "what is Surah Yaseen about". Requests matching
// this are answered deterministically with a link — never handed to an
// LLM — because a user asking to "read" a Surah or Juz must never risk
// getting AI-reproduced (and possibly wrong) Quranic text, or a link to
// some other site, instead of this site's own real, verified reader.
function extractReadIntentLink(message, excludeSurahSlug) {
  const text = String(message || '');
  if (!READ_INTENT_RE.test(text)) return null;

  const surahSlug = extractMentionedSurahSlug(text, excludeSurahSlug);
  if (surahSlug) {
    const displayName = surahSlug.replace(/-/g, ' ');
    return {
      reply: `You can read the full text of Surah ${displayName} — with Arabic script, translation, and audio recitation — right here on Al-Quran Hub.`,
      link: { label: `Read Surah ${displayName}`, url: `/surah/${surahSlug}` },
    };
  }

  const juzNumber = extractMentionedJuzNumber(text);
  if (juzNumber) {
    return {
      reply: `You can read the full text of Juz ${juzNumber} — with Arabic script, translation, and audio recitation — right here on Al-Quran Hub.`,
      link: { label: `Read Juz ${juzNumber}`, url: `/juz/${juzNumber}` },
    };
  }

  return null;
}

// When a question is answered using a specific Surah's content (its intro,
// FAQs, or a matched verse), attach a link to that Surah's page so the
// reply always has a real "read more on this site" destination — this is
// what makes something like "What is Zakat" (answered from At-Tawba's FAQ)
// or "Find a Surah about patience" (answered from a matched verse) surface
// a Read button, not just Surah-name mentions.
function pickContextSurahLink({ currentSurah, searchedSurahs, searchedFaqs, searchedVerses, excludeSlug }) {
  const slug =
    (currentSurah && currentSurah.surah_slug) ||
    searchedSurahs[0]?.surah_slug ||
    searchedFaqs[0]?.surah_slug ||
    (searchedVerses[0] && getSurahSlug(searchedVerses[0].surahNumber));

  if (!slug || slug === excludeSlug) return null;

  const displayName = slug.replace(/-/g, ' ');
  return { label: `Read Surah ${displayName}`, url: `/surah/${slug}` };
}

function buildContextBlock({
  siteFacts,
  knownPagesText,
  verseRef,
  currentSurah,
  searchedSurahs,
  searchedFaqs,
  searchedVerses,
  blogs,
}) {
  const sections = [];

  if (siteFacts) {
    sections.push(
      `## Site facts (Al-Quran Hub)\n` +
        `Total Surahs: ${siteFacts.surahCount}\n` +
        `Total Juz (Para): ${siteFacts.juzCount}\n` +
        `Total Ayahs (verses) in the Quran: ${siteFacts.ayahCount}\n` +
        (siteFacts.blogCount !== null ? `Total published blog posts on the site: ${siteFacts.blogCount}` : ''),
    );
  }

  if (knownPagesText) {
    sections.push(
      `## Known site pages (alquranhub.org) — paths are relative to the site\n${knownPagesText}`,
    );
  }

  sections.push(`## Site features (Al-Quran Hub)\n${SITE_FEATURES_TEXT}`);

  if (verseRef) {
    sections.push(
      `## Verse — ${verseRef.surahName} ${verseRef.surahNumber}:${verseRef.verseNumber}\n` +
        `Translation: "${verseRef.translation}"\n` +
        `Source: ${verseRef.source}`,
    );
  }

  if (currentSurah) {
    const faqLines = (Array.isArray(currentSurah.faqs) ? currentSurah.faqs : [])
      .map((f) => `Q: ${f.question}\nA: ${f.answer}`)
      .join('\n');
    sections.push(
      `## Current Surah: ${currentSurah.surah_slug}\n` +
        `Intro: ${truncate(currentSurah.intro, 1200)}\n` +
        (faqLines ? `FAQs:\n${faqLines}` : ''),
    );
  }

  for (const s of searchedSurahs) {
    sections.push(`## Surah: ${s.surah_slug}\nIntro: ${truncate(s.intro, 600)}`);
  }

  for (const s of searchedFaqs) {
    const faqLines = s.faqs.map((f) => `Q: ${f.question}\nA: ${f.answer}`).join('\n');
    sections.push(`## Surah ${s.surah_slug} FAQs\n${faqLines}`);
  }

  if (searchedVerses.length) {
    const lines = searchedVerses
      .map((v) => `${v.surahName} ${v.surahNumber}:${v.verseNumber} — "${v.translation}"`)
      .join('\n');
    sections.push(`## Related verses (${LOCAL_VERSE_SOURCE})\n${lines}`);
  }

  for (const b of blogs) {
    const body = b.excerpt || stripHtml(b.content);
    sections.push(`## Blog: ${b.title}\n${truncate(body, 600)}`);
  }

  return sections.join('\n\n---\n\n');
}

const NOT_FOUND_PREFIX = 'NOT_FOUND:';

function buildSystemPrompt(contextBlock) {
  return `You are Noor, the AI assistant on Al Quran Hub (alquranhub.org), a free website for reading and listening to the Holy Quran.

Follow these rules strictly:
0. If asked who you are or your name (e.g. "who are you", "what's your name"), introduce yourself as Noor, the Al Quran Hub assistant, in one short friendly sentence — answer this directly, it's an exception to rule 1 below and never needs the NOT_FOUND token. Otherwise there's no need to mention your name.
1. For anything else, answer ONLY using the "Context" section below. Do not draw on outside knowledge about Islam, the Quran, Hadith, or Tafsir beyond what is written there.
2. If the Context does not actually answer the question — even if it mentions a related word — begin your reply with the exact token "${NOT_FOUND_PREFIX}" (nothing before it), followed by an honest message saying so and suggesting the user consult a qualified Islamic scholar or a trusted Tafsir (e.g. Ibn Kathir, Tafsir al-Jalalayn). Only skip this token if the Context genuinely answers the question, even partially.
3. You may quote a Quranic verse translation only if it appears explicitly, word for word, in the Context. Whenever you quote one, always cite it by Surah name and Ayah number (e.g. "At-Tawba 9:60") and name the translation/source given next to it in the Context (e.g. "Sahih International translation"). Never state a translation, Ayah number, or Hadith that isn't explicitly present in the Context — do not invent or recall one from memory.
4. If a Context item is marked as fetched live from an external source, say so in your answer (e.g. "fetched live from Al-Quran Cloud") so the user knows it wasn't from the site's own database.
5. Never issue a personal fatwa or religious ruling (halal/haram, valid/invalid, obligatory/forbidden) on any matter — always defer such questions to a qualified scholar.
6. Keep a warm, respectful, humble tone appropriate for an Islamic platform — write like you're talking to the person, not writing a report.
7. Keep responses concise — a few sentences — unless the user explicitly asks for more detail.
8. Write in plain, natural sentences only — no markdown at all (no **, no #, no bullet points with * or -, no headings). If you're listing a few things (e.g. the categories in a verse), just write them into a normal sentence instead of a list.

Context for this conversation:
${contextBlock || '(No relevant content was found on the site for this question.)'}`;
}

// ── Route ────────────────────────────────────────────────────────────────

router.post('/', async (req, res) => {
  try {
    const { message, currentSurahSlug, history } = req.body || {};

    if (!message || typeof message !== 'string' || !message.trim()) {
      return res.status(400).json({ error: 'A message is required.' });
    }
    if (message.length > MAX_MESSAGE_LENGTH) {
      return res.status(400).json({ error: `Message is too long (max ${MAX_MESSAGE_LENGTH} characters).` });
    }

    const normalizedSlug = normalizeSurahSlug(currentSurahSlug);

    // A bare greeting ("salam", "hello") gets a warm, deterministic
    // introduction — no LLM call — that nudges toward reading the Quran
    // with a real link, rather than the assistant trying to "answer" a
    // greeting from Quran/blog context (where it would find nothing).
    if (isGreeting(message)) {
      return res.json({
        reply:
          "Wa alaikum assalam! I'm Noor, your assistant here on Al-Quran Hub. Whenever you're ready, you can start reading the Quran right here on the site — just pick a Surah below.",
        source: 'site',
        link: { label: 'Browse Surahs', url: '/surah' },
      });
    }

    // "Read/open Surah X" or "Juz N" is answered deterministically with a
    // link to the site's own reader — no LLM call at all — so it's fast,
    // free, and never at risk of the AI reproducing (and possibly
    // mis-quoting) Quran text, or linking to some other site, instead of
    // pointing to this site's own real, verified reader.
    const readIntent = extractReadIntentLink(message, normalizedSlug);
    if (readIntent) {
      return res.json({ reply: readIntent.reply, source: 'site', link: readIntent.link });
    }

    const currentSurahNum = normalizedSlug ? getSurahId(normalizedSlug) : null;
    const keywords = extractKeywords(message);
    const verseReference = extractVerseReference(message, currentSurahNum);

    // If nothing relevant is found, each of these simply resolves to an
    // empty array/null — buildContextBlock then passes an empty context
    // through rather than the route guessing at what to include.
    const [siteFacts, knownPagesText, currentSurah, searchedSurahs, searchedFaqs, blogs, verseRef, searchedVerses] =
      await Promise.all([
        getSiteFacts(),
        getKnownSitePagesText(),
        fetchCurrentSurah(normalizedSlug),
        searchSurahIntros(keywords, normalizedSlug),
        searchSurahFaqs(keywords, normalizedSlug),
        searchBlogs(keywords),
        verseReference ? getVerseByRef(verseReference.surah, verseReference.ayah) : Promise.resolve(null),
        // Skip the broad thematic verse scan once one exact verse is resolved.
        verseReference ? Promise.resolve([]) : searchVerseTranslations(keywords),
      ]);

    const contextBlock = buildContextBlock({
      siteFacts,
      knownPagesText,
      verseRef,
      currentSurah,
      searchedSurahs,
      searchedFaqs,
      searchedVerses,
      blogs,
    });
    const systemPrompt = buildSystemPrompt(contextBlock);

    const safeHistory = Array.isArray(history)
      ? history
          .filter(
            (h) => h && (h.role === 'user' || h.role === 'assistant') && typeof h.content === 'string',
          )
          .slice(-MAX_HISTORY_TURNS)
          .map((h) => ({ role: h.role, content: h.content.slice(0, MAX_MESSAGE_LENGTH) }))
      : [];

    const messages = [
      { role: 'system', content: systemPrompt },
      ...safeHistory,
      { role: 'user', content: message.trim() },
    ];

    // Always try the strict, site-only answer first — it's the safest path
    // (grounded only in vetted content) and cheapest to confirm. Gating this
    // on "did any keyword match anything" was tried first and turned out too
    // loose: a stray word (e.g. "sunnah") in an unrelated blog excerpt would
    // count as "site has context" and block the web fallback from ever
    // running, even though that snippet didn't actually answer the question.
    // The model itself is in a much better position to judge that — it's
    // told to prefix its reply with NOT_FOUND_PREFIX when the Context it was
    // given doesn't truly answer the question, which we then use to decide
    // whether to escalate to a live web search.
    let reply = await getChatCompletion(messages);
    let source = 'site';

    if (reply && reply.trim().startsWith(NOT_FOUND_PREFIX)) {
      const siteDeclineReply = reply.trim().slice(NOT_FOUND_PREFIX.length).trim();
      try {
        const webReply = await answerFromWeb(message.trim(), safeHistory, knownPagesText);
        if (webReply) {
          reply = webReply;
          source = 'web';
        } else {
          reply = siteDeclineReply;
        }
      } catch (err) {
        console.error('[chat] Web fallback failed:', err.message);
        reply = siteDeclineReply;
      }
    }

    if (!reply) {
      return res.status(502).json({ error: 'The assistant is temporarily unavailable. Please try again shortly.' });
    }

    // Attach a real site link whenever we reasonably can, in priority order:
    // 1) an explicit "Surah X" / "Juz N" mention in the message (most
    //    specific — the user named a exact place to go),
    // 2) a site feature the question was actually about (Prayer Times,
    //    Tasbih Counter, …) — checked before the context-derived link below,
    //    since e.g. "how do Prayer Times work" can otherwise match a
    //    Quran verse that merely contains the word "prayer",
    // 3) whichever Surah's content the answer was actually grounded in
    //    (its intro, FAQs, or a matched verse), so a thematic question like
    //    "What is Zakat" or "Find a Surah about patience" still gets a
    //    "read more" link even without naming a Surah.
    const mentionedSlug = extractMentionedSurahSlug(message, normalizedSlug);
    const mentionedJuz = mentionedSlug ? null : extractMentionedJuzNumber(message);
    const link =
      (mentionedSlug && { label: `Read Surah ${mentionedSlug.replace(/-/g, ' ')}`, url: `/surah/${mentionedSlug}` }) ||
      (mentionedJuz && { label: `Read Juz ${mentionedJuz}`, url: `/juz/${mentionedJuz}` }) ||
      extractFeatureLink(message) ||
      pickContextSurahLink({ currentSurah, searchedSurahs, searchedFaqs, searchedVerses, excludeSlug: normalizedSlug }) ||
      undefined;

    res.json({ reply, source, ...(link && { link }) });
  } catch (err) {
    console.error('[chat] Error:', err.message);
    res.status(500).json({ error: 'Something went wrong. Please try again shortly.' });
  }
});

export default router;
