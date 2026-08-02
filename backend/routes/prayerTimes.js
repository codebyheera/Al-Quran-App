/**
 * routes/prayerTimes.js
 *
 * Backend proxy for Aladhan API with 24-hour in-memory cache.
 *
 * Endpoints:
 *   GET /api/prayer-times/city/:slug          — today's timings + hijri date
 *   GET /api/prayer-times/city/:slug/calendar — full month calendar (lazy)
 *
 * Cache key: `${slug}_${YYYY-MM-DD}` (both endpoints).
 * TTL: 24 hours (data changes once daily, per-day key auto-expires midnight).
 */

import express from 'express';

const router = express.Router();

// ── In-memory cache ──────────────────────────────────────────────────────────
const cache = new Map(); // key → { data, expiresAt }
const TTL_MS = 24 * 60 * 60 * 1000; // 24 hours

function getCached(key) {
  const entry = cache.get(key);
  if (!entry) return null;
  if (Date.now() > entry.expiresAt) {
    cache.delete(key);
    return null;
  }
  return entry.data;
}

function setCache(key, data) {
  cache.set(key, { data, expiresAt: Date.now() + TTL_MS });
}

// ── City coords (duplicated here so backend has no frontend dep) ─────────────
const CITIES = {
  lahore:      { lat: 31.5497, lng: 74.3436 },
  karachi:     { lat: 24.8607, lng: 67.0011 },
  islamabad:   { lat: 33.6844, lng: 73.0479 },
  faisalabad:  { lat: 31.4504, lng: 73.1350 },
  rawalpindi:  { lat: 33.5651, lng: 73.0169 },
  multan:      { lat: 30.1575, lng: 71.5249 },
  peshawar:    { lat: 34.0151, lng: 71.5249 },
  gujranwala:  { lat: 32.1877, lng: 74.1945 },
  sialkot:     { lat: 32.4945, lng: 74.5229 },
  quetta:      { lat: 30.1798, lng: 66.9750 },
};

// Hanafi method — University of Islamic Sciences, Karachi
const METHOD = 1;
const SCHOOL = 1; // Hanafi Asr calculation

// ── Helper: today's date string ──────────────────────────────────────────────
function today() {
  return new Date().toISOString().slice(0, 10); // YYYY-MM-DD
}

// ── GET /api/prayer-times/city/:slug ────────────────────────────────────────
router.get('/city/:slug', async (req, res) => {
  const slug = req.params.slug.toLowerCase();
  const city = CITIES[slug];
  if (!city) return res.status(404).json({ error: 'City not found' });

  const cacheKey = `timings_${slug}_${today()}`;
  const cached = getCached(cacheKey);
  if (cached) return res.json({ ...cached, cached: true });

  try {
    const url =
      `https://api.aladhan.com/v1/timings?latitude=${city.lat}&longitude=${city.lng}` +
      `&method=${METHOD}&school=${SCHOOL}&tune=0,0,0,0,0,0,0,0,0`;

    const resp = await fetch(url);
    if (!resp.ok) throw new Error(`Aladhan responded ${resp.status}`);

    const json = await resp.json();
    const { timings, date } = json.data;

    const payload = { timings, date, slug, cached: false };
    setCache(cacheKey, { timings, date, slug });
    return res.json(payload);
  } catch (err) {
    console.error(`[prayer-times] ${slug}:`, err.message);
    return res.status(502).json({ error: 'Failed to fetch prayer times' });
  }
});

// ── GET /api/prayer-times/city/:slug/calendar ────────────────────────────────
router.get('/city/:slug/calendar', async (req, res) => {
  const slug = req.params.slug.toLowerCase();
  const city = CITIES[slug];
  if (!city) return res.status(404).json({ error: 'City not found' });

  const now   = new Date();
  const year  = now.getFullYear();
  const month = now.getMonth() + 1; // 1-indexed

  const cacheKey = `calendar_${slug}_${year}_${month}`;
  const cached = getCached(cacheKey);
  if (cached) return res.json({ ...cached, cached: true });

  try {
    const url =
      `https://api.aladhan.com/v1/calendar/${year}/${month}` +
      `?latitude=${city.lat}&longitude=${city.lng}&method=${METHOD}&school=${SCHOOL}`;

    const resp = await fetch(url);
    if (!resp.ok) throw new Error(`Aladhan responded ${resp.status}`);

    const json = await resp.json();
    const calendar = json.data; // array of day objects

    const payload = { calendar, year, month, slug, cached: false };
    setCache(cacheKey, { calendar, year, month, slug });
    return res.json(payload);
  } catch (err) {
    console.error(`[prayer-times/calendar] ${slug}:`, err.message);
    return res.status(502).json({ error: 'Failed to fetch calendar' });
  }
});

export default router;
