/**
 * lib/upstream.js — Resilient upstream fetching + caching for the Quran data routes (ESM)
 *
 * /api/surah/:id and /api/juz/:id build their responses from Al-Quran Cloud and
 * Quran.com. They used to call both on every request, so any slow or failing
 * upstream call (or upstream rate limiting) became a 500. Quran text never
 * changes, so:
 *   - getJson()        retries with a per-attempt timeout
 *   - cachedBuild()    keeps built responses in memory (LRU) and, if a rebuild
 *                      fails, keeps serving the last good copy instead of erroring
 *   - setPublicCache() lets Vercel's CDN cache successful responses, so most
 *                      requests never reach this function or the upstream APIs
 */

import axios from 'axios';

export async function getJson(url, { retries = 3, timeout = 8000, delay = 500 } = {}) {
  for (let i = 0; i < retries; i++) {
    try {
      const { data } = await axios.get(url, { timeout });
      return data;
    } catch (err) {
      if (i === retries - 1) throw err;
      const backoff = delay * Math.pow(2, i);
      console.warn(`[API Retry] Request to ${url} failed (Attempt ${i + 1}/${retries}). Retrying in ${backoff}ms... Error: ${err.message}`);
      await new Promise((resolve) => setTimeout(resolve, backoff));
    }
  }
}

const MAX_ENTRIES = 40;                 // a full Surah/Juz response is ~1–3 MB
const TTL_MS = 24 * 60 * 60 * 1000;     // complete responses
const PARTIAL_TTL_MS = 5 * 60 * 1000;   // e.g. built without word-by-word data
const store = new Map();                // key → { data, complete, expiresAt } (Map order = LRU)
const inFlight = new Map();             // key → Promise, so concurrent misses share one build

/**
 * `build()` returns { data, complete }. `complete: false` means it succeeded
 * without some optional upstream (word-by-word data) — served, but cached briefly.
 * Resolves to { data, complete }.
 */
export async function cachedBuild(key, build) {
  const hit = store.get(key);
  if (hit && hit.expiresAt > Date.now()) {
    store.delete(key);
    store.set(key, hit);
    return hit;
  }
  if (inFlight.has(key)) return inFlight.get(key);

  const promise = (async () => {
    try {
      const { data, complete } = await build();
      const entry = { data, complete, expiresAt: Date.now() + (complete ? TTL_MS : PARTIAL_TTL_MS) };
      // A partial rebuild must not replace a complete copy we already had.
      if (complete || !hit?.complete) {
        store.delete(key);
        store.set(key, entry);
        while (store.size > MAX_ENTRIES) store.delete(store.keys().next().value);
      }
      return complete || !hit?.complete ? entry : hit;
    } catch (err) {
      if (hit) {
        console.warn(`[upstream] Rebuild of ${key} failed (${err.message}) — serving stale copy.`);
        return hit;
      }
      throw err;
    } finally {
      inFlight.delete(key);
    }
  })();
  inFlight.set(key, promise);
  return promise;
}

/**
 * Lets browsers and Vercel's CDN cache a successful response. The data is public
 * and identical for every caller, so it's sent with `Access-Control-Allow-Origin: *`:
 * the CDN serves one cached copy to every origin, and a copy first cached for a
 * request without an Origin header (crawler, curl) must not lack the CORS header
 * the site needs.
 */
export function setPublicCache(res) {
  res.set('Access-Control-Allow-Origin', '*');
  res.set('Cache-Control', 'public, max-age=3600, s-maxage=86400, stale-while-revalidate=604800');
}
