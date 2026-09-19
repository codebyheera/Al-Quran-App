/**
 * routes/prayerTimes.js
 *
 * Backend proxy for Aladhan API with 24-hour in-memory cache.
 *
 * Endpoints:
 *   GET /api/prayer-times/city/:slug          — today's timings + hijri date
 *   GET /api/prayer-times/city/:slug/calendar — full month calendar (lazy)
 *   GET /api/prayer-times/hijri-date          — today's Hijri date (region-aware)
 *
 * Cache key: `${slug}_${YYYY-MM-DD}` (both endpoints).
 * TTL: 24 hours (data changes once daily, per-day key auto-expires midnight).
 *
 * Hijri date note:
 * The browser's built-in `Intl` islamic-umalqura calendar is a pure
 * mathematical calculation and can drift from the date actually announced
 * by regional moon-sighting committees (which is what apps like Muslim Pro
 * / Islam360 show). There is no public "Muslim Pro API" to pull from, and
 * Aladhan's own `calendarMethod`/`adjustment` query params turned out to be
 * silently ignored by their live API (verified: HJCoSA, UAQ, and
 * adjustment=-2 all returned the identical, unshifted day). So instead we
 * correct for the drift ourselves: query Aladhan's gToH endpoint for the
 * Hijri date of (today + HIJRI_ADJUSTMENT) Gregorian days, which reliably
 * shifts the returned Hijri day/month/year (handling month/year rollovers
 * for free, unlike naive day-number arithmetic). `HIJRI_ADJUSTMENT` is a
 * whole-day offset, tuned against what Muslim Pro/Islam360 show; moon
 * sighting drift can change by about a day at the start of a new Hijri
 * month, so this may need occasional re-tuning via the env var (no
 * redeploy needed for a value change, just process restart).
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

// Whole-day offset applied to the Hijri date, to correct for Aladhan's
// calculated date running ahead of what regional moon-sighting committees
// (and apps like Muslim Pro / Islam360) actually announce. Confirmed via
// live testing on 2026-09-19: Aladhan returned "8 Rabīʿ al-thānī" while
// Muslim Pro / Islam360 showed "6", so the default here is -2. Override with
// the HIJRI_ADJUSTMENT env var if the drift changes at the next new moon.
const HIJRI_ADJUSTMENT = Number.isFinite(parseInt(process.env.HIJRI_ADJUSTMENT, 10))
  ? parseInt(process.env.HIJRI_ADJUSTMENT, 10)
  : -2;

// Returns the Gregorian date `offsetDays` away from today, formatted as
// Aladhan's expected DD-MM-YYYY. Shifting the Gregorian date before asking
// Aladhan for its Hijri equivalent (rather than adding/subtracting the Hijri
// day number by hand) gets month/year rollovers correct for free.
function shiftedGregorianDDMMYYYY(offsetDays) {
  const d = new Date();
  d.setUTCDate(d.getUTCDate() + offsetDays);
  const dd = String(d.getUTCDate()).padStart(2, '0');
  const mm = String(d.getUTCMonth() + 1).padStart(2, '0');
  const yyyy = d.getUTCFullYear();
  return `${dd}-${mm}-${yyyy}`;
}

// Fetches today's (adjustment-corrected) Hijri date object from Aladhan's
// gToH endpoint, in the same shape as the `hijri` object embedded in the
// timings/calendar responses. Cached per-day since it's identical for every
// city.
async function fetchCorrectedHijri() {
  const cacheKey = `hijri_${today()}`;
  const cached = getCached(cacheKey);
  if (cached) return cached;

  const shiftedDate = shiftedGregorianDDMMYYYY(HIJRI_ADJUSTMENT);
  const url = `https://api.aladhan.com/v1/gToH/${shiftedDate}`;

  const resp = await fetch(url);
  if (!resp.ok) throw new Error(`Aladhan gToH responded ${resp.status}`);

  const json = await resp.json();
  const hijri = json.data?.hijri;
  if (!hijri) throw new Error('Malformed Aladhan gToH response');

  setCache(cacheKey, hijri);
  return hijri;
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
    // Prayer timings must stay tied to today's real Gregorian date — do not
    // shift this call. The Hijri date shown alongside it is corrected
    // separately below.
    const url =
      `https://api.aladhan.com/v1/timings?latitude=${city.lat}&longitude=${city.lng}` +
      `&method=${METHOD}&school=${SCHOOL}&tune=0,0,0,0,0,0,0,0,0`;

    const resp = await fetch(url);
    if (!resp.ok) throw new Error(`Aladhan responded ${resp.status}`);

    const json = await resp.json();
    const { timings, date } = json.data;

    if (HIJRI_ADJUSTMENT !== 0) {
      try {
        date.hijri = await fetchCorrectedHijri();
      } catch (hijriErr) {
        console.error(`[prayer-times] ${slug} hijri correction:`, hijriErr.message);
        // Fall through with Aladhan's uncorrected hijri date rather than failing the request.
      }
    }

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

// ── GET /api/prayer-times/hijri-date ────────────────────────────────────────
// Region-aware Hijri (Islamic) date. See the HIJRI_ADJUSTMENT / gToH note at
// the top of this file for why this shifts the queried Gregorian date rather
// than trusting Aladhan's (non-functional) calendarMethod/adjustment params.
router.get('/hijri-date', async (req, res) => {
  try {
    const hijri = await fetchCorrectedHijri();
    const payload = {
      day: hijri.day,
      month: hijri.month?.en,
      monthNumber: hijri.month?.number,
      year: hijri.year,
      weekday: hijri.weekday?.en,
      formatted: `${hijri.day} ${hijri.month?.en} ${hijri.year}`,
    };
    return res.json(payload);
  } catch (err) {
    console.error('[prayer-times/hijri-date]', err.message);
    return res.status(502).json({ error: 'Failed to fetch Hijri date' });
  }
});

export default router;
