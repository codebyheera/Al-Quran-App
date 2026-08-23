/**
 * routes/audioProxy.js — Streams ayah recitation audio through our own origin.
 *
 * The recitation CDNs don't send CORS headers. <audio src> playback works
 * fine without CORS, but the frontend's Cache Storage fetch() (used to save
 * audio for offline replay) is blocked by the browser without it. This route
 * fetches the audio server-side (no CORS restriction between servers) and
 * streams it back from our own origin, which the frontend already has CORS
 * access to — the fetched bytes are then cached under the *original* CDN URL
 * as the cache key, so lookups by that URL still work everywhere else.
 */

import express from 'express';
import axios from 'axios';

const router = express.Router();

// Only ever proxy known, trusted Quran audio hosts — never an arbitrary URL,
// so this can't be turned into an open proxy.
const ALLOWED_HOSTS = new Set([
  'cdn.islamic.network',
  'audio.qurancdn.com',
  'everyayah.com',
  'www.everyayah.com',
]);

function isAllowedAudioUrl(rawUrl) {
  try {
    const parsed = new URL(rawUrl);
    return parsed.protocol === 'https:' && ALLOWED_HOSTS.has(parsed.hostname);
  } catch {
    return false;
  }
}

async function fetchUpstream(url, attempt = 1) {
  try {
    return await axios.get(url, {
      responseType: 'stream',
      timeout: 15000,
      // Some CDNs reject requests with no browser-like User-Agent.
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; AlQuranHub-AudioProxy/1.0)' },
    });
  } catch (err) {
    if (attempt < 2) {
      // A brief pause before retrying — an instant retry is pointless if the
      // first failure was the CDN rate-limiting a burst of requests.
      await new Promise((resolve) => setTimeout(resolve, 400));
      return fetchUpstream(url, attempt + 1);
    }
    throw err;
  }
}

router.get('/', async (req, res) => {
  const { url } = req.query;

  if (!url || !isAllowedAudioUrl(url)) {
    return res.status(400).json({ message: 'Invalid or disallowed audio URL' });
  }

  try {
    const upstream = await fetchUpstream(url);

    res.setHeader('Content-Type', upstream.headers['content-type'] || 'audio/mpeg');
    if (upstream.headers['content-length']) {
      res.setHeader('Content-Length', upstream.headers['content-length']);
    }
    // Recitation files never change once published — safe to cache hard.
    res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');

    // Headers are already sent once piping starts — a mid-stream failure
    // can only end the response, not report a fresh status.
    upstream.data.on('error', (streamErr) => {
      console.error('Audio proxy stream error for', url, streamErr.message);
      res.destroy();
    });
    req.on('close', () => upstream.data.destroy());

    upstream.data.pipe(res);
  } catch (err) {
    console.error('Audio proxy failed for', url, err.message);
    res.status(502).json({ message: 'Failed to fetch audio from source' });
  }
});

export default router;
