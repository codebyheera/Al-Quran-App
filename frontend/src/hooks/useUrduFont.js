/**
 * hooks/useUrduFont.js — Urdu translation font preference.
 *
 * Persisted in localStorage ('urduFont'). Applied through <html data-urdu-font>,
 * which drives the --font-urdu / --urdu-scale / --urdu-line-height CSS
 * variables in global.css, so switching font needs no React re-render.
 * index.html applies a saved choice before first paint (keep the list there
 * in sync with URDU_FONTS below).
 *
 * Speed (Core Web Vitals): Gulzar, the default, loads exactly as before.
 * Another font's stylesheet is added only once a visitor picks it, and the
 * browser downloads its files only on pages that actually show Urdu text
 * (font-display: swap, so text is never invisible while it loads).
 *
 * All fonts are free (SIL Open Font License) via Google Fonts.
 */

import { useCallback, useEffect, useState } from 'react';

const STORAGE_KEY = 'urduFont';
const CHANGE_EVENT = 'urdu-font-change';

export const URDU_FONTS = [
  { id: 'gulzar',        name: 'Gulzar',             style: 'Nastaliq · default',      css: null },
  { id: 'noto-nastaliq', name: 'Noto Nastaliq Urdu', style: 'Nastaliq · traditional',  css: 'https://fonts.googleapis.com/css2?family=Noto+Nastaliq+Urdu&display=swap' },
  { id: 'naskh',         name: 'Noto Naskh',         style: 'Naskh · easy to read',    css: 'https://fonts.googleapis.com/css2?family=Noto+Naskh+Arabic&display=swap' },
  { id: 'lateef',        name: 'Lateef',             style: 'Naskh · soft & clear',    css: 'https://fonts.googleapis.com/css2?family=Lateef&display=swap' },
];
export const URDU_FONT_DEFAULT = 'gulzar';

function readFont() {
  try {
    const id = localStorage.getItem(STORAGE_KEY);
    return URDU_FONTS.some((f) => f.id === id) ? id : URDU_FONT_DEFAULT;
  } catch {
    return URDU_FONT_DEFAULT;
  }
}

/** Adds the font's Google Fonts stylesheet once (no-op for the default). */
export function loadUrduFont(id) {
  const font = URDU_FONTS.find((f) => f.id === id);
  if (!font?.css || typeof document === 'undefined') return;
  const linkId = `urdu-font-${id}`;
  if (document.getElementById(linkId)) return;
  const link = document.createElement('link');
  link.id = linkId;
  link.rel = 'stylesheet';
  link.href = font.css;
  document.head.appendChild(link);
}

function apply(id) {
  document.documentElement.setAttribute('data-urdu-font', id);
  loadUrduFont(id);
}

export default function useUrduFont() {
  const [font, setFont] = useState(readFont);

  useEffect(() => {
    const sync = () => {
      const id = readFont();
      apply(id);
      setFont(id);
    };
    const onStorage = (e) => { if (e.key === STORAGE_KEY) sync(); };
    window.addEventListener(CHANGE_EVENT, sync);
    window.addEventListener('storage', onStorage);
    return () => {
      window.removeEventListener(CHANGE_EVENT, sync);
      window.removeEventListener('storage', onStorage);
    };
  }, []);

  const updateFont = useCallback((id) => {
    if (!URDU_FONTS.some((f) => f.id === id)) return;
    try { localStorage.setItem(STORAGE_KEY, id); } catch {}
    apply(id);
    setFont(id);
    window.dispatchEvent(new Event(CHANGE_EVENT));
  }, []);

  return [font, updateFont];
}
