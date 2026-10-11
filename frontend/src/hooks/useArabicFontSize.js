/**
 * hooks/useArabicFontSize.js — Shared Arabic text size preference.
 *
 * Persisted in localStorage ('arabicFontSize', rem). Every instance stays in
 * sync via a window event, so changing the size from the header Settings
 * drawer updates an open Surah/Juz page immediately.
 */

import { useCallback, useEffect, useState } from 'react';

const STORAGE_KEY = 'arabicFontSize';
const CHANGE_EVENT = 'arabic-font-size-change';

export const ARABIC_FONT_MIN = 1.4;
export const ARABIC_FONT_MAX = 4.0;
export const ARABIC_FONT_STEP = 0.2;
export const ARABIC_FONT_DEFAULT = 2.2;

function readSize() {
  try {
    return parseFloat(localStorage.getItem(STORAGE_KEY)) || ARABIC_FONT_DEFAULT;
  } catch {
    return ARABIC_FONT_DEFAULT;
  }
}

export default function useArabicFontSize() {
  const [size, setSize] = useState(readSize);

  useEffect(() => {
    const sync = () => setSize(readSize());
    const onStorage = (e) => { if (e.key === STORAGE_KEY) sync(); };
    window.addEventListener(CHANGE_EVENT, sync);
    window.addEventListener('storage', onStorage);
    return () => {
      window.removeEventListener(CHANGE_EVENT, sync);
      window.removeEventListener('storage', onStorage);
    };
  }, []);

  const updateSize = useCallback((next) => {
    const clamped = Math.min(Math.max(parseFloat(next.toFixed(1)), ARABIC_FONT_MIN), ARABIC_FONT_MAX);
    try { localStorage.setItem(STORAGE_KEY, clamped); } catch {}
    setSize(clamped);
    window.dispatchEvent(new Event(CHANGE_EVENT));
  }, []);

  return [size, updateSize];
}
