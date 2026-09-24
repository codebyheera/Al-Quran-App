/**
 * lib/readingProgress.js — "Continue Reading" position tracking
 *
 * localStorage-only, no backend/login involved (mirrors the pattern used by
 * streakUtils.js for the daily reading streak). Single source of truth for
 * `alquranhub_last_reading` — UI/hooks should call getLastReading() /
 * saveLastReading() rather than touching localStorage directly.
 */

const STORAGE_KEY = 'alquranhub_last_reading';

function isValidShape(data) {
  return (
    data && typeof data === 'object' &&
    typeof data.surahNumber === 'number' &&
    typeof data.ayahNumber === 'number' &&
    typeof data.url === 'string'
  );
}

/** Returns the saved last-reading position, or null if none/corrupted. */
export function getLastReading() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return isValidShape(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

/**
 * Saves the current reading position, unless it would be a regression —
 * i.e. the same Surah at an earlier Ayah than what's already saved (the
 * user scrolled back up to re-read something they'd already passed).
 * Moving to a different Surah always updates, since that's a deliberate
 * navigation to a new spot.
 */
export function saveLastReading({ surahNumber, surahName, ayahNumber, url }) {
  if (!surahNumber || !ayahNumber || !url) return;

  const existing = getLastReading();
  if (existing && existing.surahNumber === surahNumber && ayahNumber < existing.ayahNumber) {
    return;
  }

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      surahNumber,
      surahName: surahName || existing?.surahName || '',
      ayahNumber,
      url,
      timestamp: Date.now(),
    }));
  } catch {
    // localStorage unavailable (private mode / quota) — fail silently.
  }
}
