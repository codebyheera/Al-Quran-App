/**
 * lib/audioSource.js — Urdu translation audio source resolution with fallback.
 *
 * Primary: Supabase Storage (a self-hosted mirror of the Al Quran Cloud
 * ur.khan Urdu audio, seeded via backend/scripts/upload-urdu-audio.js).
 * Fallback: the Al Quran Cloud ur.khan URL, which the backend already
 * forwards as-is on verse.urduAudioUrl (see backend/routes/surah.js,
 * backend/routes/juz.js).
 *
 * TODO: Remove Al Quran Cloud fallback after 2026-10-05 once Supabase Urdu
 * audio is confirmed 100% complete and reliable. The actual try-primary/
 * fall-back-on-error wiring lives in context/AudioContext.jsx.
 */

const SUPABASE_URL =
  (typeof import.meta !== 'undefined' && import.meta.env?.VITE_SUPABASE_URL) ||
  'https://hjuaeuelhwnjomagnmtx.supabase.co';
const SUPABASE_URDU_BUCKET = 'quran-audio-urdu';

/** Builds the Supabase Storage public URL for a given ayah's Urdu audio. */
export function getSupabaseUrduAudioUrl(surahNumber, ayahNumber) {
  if (!surahNumber || !ayahNumber) return '';
  const s = String(surahNumber).padStart(3, '0');
  const a = String(ayahNumber).padStart(3, '0');
  return `${SUPABASE_URL}/storage/v1/object/public/${SUPABASE_URDU_BUCKET}/${s}_${a}.mp3`;
}

/**
 * Resolves Urdu translation audio for a verse as { primary, fallback }.
 * `primary` (Supabase) is what callers should try to play first; `fallback`
 * (Al Quran Cloud) should only be used if playing `primary` actually fails.
 * If the verse doesn't carry enough info to build a Supabase URL, `primary`
 * degrades to the Al Quran Cloud URL directly and `fallback` is empty —
 * there's nothing left to fall back to.
 */
export function getAudioUrlWithFallback(verse) {
  if (!verse) return { primary: '', fallback: '' };
  const primary = getSupabaseUrduAudioUrl(verse.surahNumber, verse.number);
  const fallback = verse.urduAudioUrl || '';
  if (!primary) return { primary: fallback, fallback: '' };
  return { primary, fallback };
}
