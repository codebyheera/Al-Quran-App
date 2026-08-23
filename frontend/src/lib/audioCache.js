/**
 * lib/audioCache.js — Cache Storage helpers for offline Quran audio.
 *
 * Uses the Cache Storage API directly from page context (no Service Worker
 * required), so this works in normal tabs on iOS Safari and Android Chrome.
 */

export const AUDIO_CACHE_NAME = 'quran-audio-cache-v1';

// The recitation CDNs don't send CORS headers, so a direct cross-origin
// fetch() (needed to read bytes into Cache Storage) is blocked by the
// browser — even though <audio src> playback never needed CORS in the first
// place. Route the *caching* fetch through our own backend, which fetches
// the CDN server-side (no CORS between servers) and streams it back from an
// origin the frontend already has CORS access to. Live playback still uses
// the direct CDN URL untouched — only background caching goes via proxy.
const API_BASE = (typeof import.meta !== 'undefined' && import.meta.env?.VITE_API_URL) || '';
function buildProxyUrl(audioUrl) {
  return `${API_BASE}/api/audio-proxy?url=${encodeURIComponent(audioUrl)}`;
}

const CACHE_UPDATED_EVENT = 'quran-audio-cache-updated';
const cacheEvents = typeof window !== 'undefined' ? new EventTarget() : null;

function notifyCacheUpdated(url) {
  cacheEvents?.dispatchEvent(new CustomEvent(CACHE_UPDATED_EVENT, { detail: { url } }));
}

/** Subscribe to cache-completed events. Returns an unsubscribe function. */
export function onAudioCacheUpdated(handler) {
  if (!cacheEvents) return () => {};
  const listener = (e) => handler(e.detail.url);
  cacheEvents.addEventListener(CACHE_UPDATED_EVENT, listener);
  return () => cacheEvents.removeEventListener(CACHE_UPDATED_EVENT, listener);
}

export function supportsAudioCache() {
  return typeof window !== 'undefined' && 'caches' in window;
}

// Some browser contexts (private/incognito windows in particular) can leave
// caches.open()/cache.match() hanging instead of resolving or rejecting.
// Never let that block playback — race every cache op against a timeout and
// fall through to the "not cached" outcome if it doesn't settle in time.
function withTimeout(promise, ms, timeoutValue) {
  return new Promise((resolve) => {
    let settled = false;
    const timer = setTimeout(() => {
      if (!settled) { settled = true; resolve(timeoutValue); }
    }, ms);
    promise.then(
      (value) => { if (!settled) { settled = true; clearTimeout(timer); resolve(value); } },
      () => { if (!settled) { settled = true; clearTimeout(timer); resolve(timeoutValue); } }
    );
  });
}

// Opening the cache is async (IndexedDB handshake); memoize the handle so
// every lookup/store doesn't pay that cost again on the hot path.
let cacheHandlePromise = null;
function getCacheHandle() {
  if (!cacheHandlePromise) cacheHandlePromise = caches.open(AUDIO_CACHE_NAME);
  return cacheHandlePromise;
}

/** Checks cache existence without fetching the body. */
export async function isCached(audioUrl) {
  if (!audioUrl || !supportsAudioCache()) return false;
  try {
    const cache = await withTimeout(getCacheHandle(), 1500, null);
    if (!cache) return false;
    const match = await withTimeout(cache.match(audioUrl), 1500, null);
    return !!match;
  } catch {
    return false;
  }
}

/** Returns the cached Blob for audioUrl, or null if not cached. */
export async function getCachedBlob(audioUrl) {
  if (!audioUrl || !supportsAudioCache()) return null;
  try {
    const cache = await withTimeout(getCacheHandle(), 1500, null);
    if (!cache) return null;
    const match = await withTimeout(cache.match(audioUrl), 1500, null);
    if (!match) return null;
    return await withTimeout(match.blob(), 1500, null);
  } catch {
    return null;
  }
}

// Defense in depth: if fetching ever fails at the network level (backend
// unreachable, fully offline, etc.) every URL will fail identically on a
// broken connection. Trip a circuit breaker on the first such failure
// instead of hammering the proxy with a doomed request per ayah, which was
// previously saturating connections badly enough to slow down the audio
// that was actually trying to play.
let cachingUnavailable = false;

/**
 * Fetches audioUrl (via our backend's audio proxy, so Cache Storage's
 * fetch() can actually read the bytes — the CDN itself sends no CORS
 * headers) and stores it in Cache Storage keyed by the *original* URL, so
 * cache.match(audioUrl) elsewhere in the app still finds it. Safe to call
 * without awaiting (fire-and-forget) — resolves true/false once done.
 */
export async function cacheAudioInBackground(audioUrl) {
  if (!audioUrl || !supportsAudioCache() || cachingUnavailable) return false;
  try {
    const cache = await withTimeout(getCacheHandle(), 1500, null);
    if (!cache) return false;
    const existing = await withTimeout(cache.match(audioUrl), 1500, null);
    if (existing) {
      notifyCacheUpdated(audioUrl);
      return true;
    }
    const response = await fetch(buildProxyUrl(audioUrl));
    if (!response.ok) return false;
    await cache.put(audioUrl, response.clone());
    notifyCacheUpdated(audioUrl);
    return true;
  } catch (err) {
    if (err instanceof TypeError && !cachingUnavailable) {
      // A TypeError from fetch() here means the network layer itself refused
      // the request — not a one-off, every future call will fail the exact
      // same way. Stop trying for this session so we don't keep competing
      // with the live-playing audio.
      cachingUnavailable = true;
      prefetchQueue = [];
      seenForPrefetch.clear();
      console.warn(
        'Offline audio caching disabled for this session: the audio CDN is not sending CORS headers, so fetch() cannot read it (native playback is unaffected).',
        err
      );
    }
    return false;
  }
}

// ── Look-ahead prefetching ──────────────────────────────────────────────
// While one ayah plays, quietly download the next ones in the playlist so
// advancing through a whole Surah never waits on the free API again.

const MAX_CONCURRENT_PREFETCH = 2;
let prefetchQueue = [];
let activePrefetches = 0;
const seenForPrefetch = new Set();
// URL -> in-flight cacheAudioInBackground() promise, so playback can piggy-back
// on a download that's already happening instead of firing a second, competing
// request for the exact same file (that collision is what causes a "why does
// clicking Play the second time feel slower" stutter on the very first ayah).
const inFlightPrefetch = new Map();

function pumpPrefetchQueue() {
  while (activePrefetches < MAX_CONCURRENT_PREFETCH && prefetchQueue.length > 0) {
    const url = prefetchQueue.shift();
    activePrefetches++;
    const promise = cacheAudioInBackground(url).finally(() => {
      activePrefetches--;
      inFlightPrefetch.delete(url);
      pumpPrefetchQueue();
    });
    inFlightPrefetch.set(url, promise);
  }
}

/** Queues URLs for low-priority background download (order = priority). */
export function queuePrefetch(urls = []) {
  if (!supportsAudioCache() || cachingUnavailable) return;
  for (const url of urls) {
    if (!url || seenForPrefetch.has(url)) continue;
    seenForPrefetch.add(url);
    prefetchQueue.push(url);
  }
  pumpPrefetchQueue();
}

/** Drops queued-but-not-yet-started prefetches (e.g. when switching Surah). */
export function resetPrefetchQueue() {
  prefetchQueue = [];
  seenForPrefetch.clear();
}

/** The in-flight prefetch promise for a URL, if one is currently downloading it. */
export function getInFlightPrefetch(audioUrl) {
  return inFlightPrefetch.get(audioUrl) || null;
}

/**
 * Resolves a playable src for audioUrl using the hybrid strategy, and never
 * starts a second network request for a URL that's already being fetched:
 *  1. Cached already → object URL from the blob (instant, fully offline).
 *  2. Another prefetch for this exact URL is in flight → wait briefly for it
 *     (bounded, so a slow connection never blocks playback for long); use the
 *     cached result if it lands in time.
 *  3. Otherwise stream the original URL immediately and cache it in the
 *     background for next time.
 */
export async function loadPlayableSrc(audioUrl, { prefetchWaitMs = 800 } = {}) {
  if (!audioUrl) return { src: '', fromCache: false, backgroundPromise: null };

  // Belt-and-braces: no matter what goes wrong inside cache resolution, this
  // must resolve quickly with a playable (live) src — a stuck Play button is
  // far worse than skipping the cache for one play.
  const liveFallback = { src: audioUrl, fromCache: false, backgroundPromise: null };
  return withTimeout(resolvePlayableSrc(audioUrl, prefetchWaitMs), 2000, liveFallback);
}

async function resolvePlayableSrc(audioUrl, prefetchWaitMs) {
  const cachedBlob = await getCachedBlob(audioUrl);
  if (cachedBlob) return { src: URL.createObjectURL(cachedBlob), fromCache: true, backgroundPromise: null };

  const inFlight = getInFlightPrefetch(audioUrl);
  if (inFlight) {
    await Promise.race([inFlight, new Promise((resolve) => setTimeout(resolve, prefetchWaitMs))]);
    const blob = await getCachedBlob(audioUrl);
    if (blob) return { src: URL.createObjectURL(blob), fromCache: true, backgroundPromise: null };
    // Prefetch is still running — stream live, track the same promise instead
    // of starting a second, competing fetch for this URL.
    return { src: audioUrl, fromCache: false, backgroundPromise: inFlight };
  }

  const backgroundPromise = cacheAudioInBackground(audioUrl);
  return { src: audioUrl, fromCache: false, backgroundPromise };
}

/** Deletes the entire downloaded-audio cache (settings/storage management). */
export async function clearAudioCache() {
  if (!supportsAudioCache()) return false;
  try {
    return await caches.delete(AUDIO_CACHE_NAME);
  } catch {
    return false;
  }
}
