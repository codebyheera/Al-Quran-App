/**
 * hooks/useQuranScript.js — Shared Quran script preference (Uthmani | IndoPak).
 *
 * Persisted in localStorage ('quranScript'). Every instance stays in sync via
 * a window event, so switching from the header Settings drawer updates an
 * open Surah/Juz page immediately. Also mirrored on <html data-quran-script>,
 * which index.html sets before first paint (keep the key in sync there).
 *
 * IndoPak uses the "AlQuran IndoPak by QuranWBW" font, which may only be used
 * for Quran text with its matching IndoPak text, unmodified (QuranWBW's
 * permission). Use the `arabic--indopak` class on ayah text only — never on
 * Surah names, the Bismillah header, duas or UI.
 */

import { useCallback, useEffect, useState } from 'react';

const STORAGE_KEY = 'quranScript';
const CHANGE_EVENT = 'quran-script-change';

export const QURAN_SCRIPTS = [
  { id: 'uthmani', name: 'Uthmani' },
  { id: 'indopak', name: 'IndoPak' },
];
// New visitors start with IndoPak (keep in sync with the script in index.html).
export const QURAN_SCRIPT_DEFAULT = 'indopak';

function readScript() {
  try {
    const s = localStorage.getItem(STORAGE_KEY);
    return QURAN_SCRIPTS.some((x) => x.id === s) ? s : QURAN_SCRIPT_DEFAULT;
  } catch {
    return QURAN_SCRIPT_DEFAULT;
  }
}

/**
 * True when a verse has IndoPak text for every word plus its ayah-end marker.
 * Otherwise the verse is shown in Uthmani, so IndoPak text is never partial.
 */
export function verseHasIndopak(verse) {
  return !!verse?.indopakEnd && !!verse.words?.length && verse.words.every((w) => w.text_indopak);
}

export default function useQuranScript() {
  const [script, setScript] = useState(readScript);

  useEffect(() => {
    const sync = () => {
      const s = readScript();
      document.documentElement.setAttribute('data-quran-script', s);
      setScript(s);
    };
    const onStorage = (e) => { if (e.key === STORAGE_KEY) sync(); };
    window.addEventListener(CHANGE_EVENT, sync);
    window.addEventListener('storage', onStorage);
    return () => {
      window.removeEventListener(CHANGE_EVENT, sync);
      window.removeEventListener('storage', onStorage);
    };
  }, []);

  const updateScript = useCallback((next) => {
    if (!QURAN_SCRIPTS.some((x) => x.id === next)) return;
    try { localStorage.setItem(STORAGE_KEY, next); } catch {}
    document.documentElement.setAttribute('data-quran-script', next);
    setScript(next);
    window.dispatchEvent(new Event(CHANGE_EVENT));
  }, []);

  return [script, updateScript];
}
