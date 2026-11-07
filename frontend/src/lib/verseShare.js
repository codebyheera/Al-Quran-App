/**
 * lib/verseShare.js — Copy / share one ayah.
 * Shared by the verse card's top bar (desktop) and the Ayah options sheet.
 */

import { getSurah } from '../data/surahIndex';

const SITE = 'https://alquranhub.org';

export function verseReference(verse) {
  return `${verse.surahName} ${verse.surahNumber}:${verse.number}`;
}

export function verseLink(verse) {
  const slug = getSurah(verse.surahNumber)?.englishName || verse.surahNumber;
  return `${SITE}/surah/${slug}#verse-${verse.number}`;
}

export async function copyText(text) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    // Older browsers / non-secure contexts
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.setAttribute('readonly', '');
    ta.style.position = 'fixed';
    ta.style.opacity = '0';
    document.body.appendChild(ta);
    ta.select();
    let ok = false;
    try { ok = document.execCommand('copy'); } catch { ok = false; }
    ta.remove();
    return ok;
  }
}

/**
 * Copies Arabic + the translations the reader has on (English when both are
 * off) + reference + link. Returns true on success.
 */
export function copyVerse(verse, { showEn, showUr }) {
  const parts = [(verse.arabic || '').replace(/﻿/g, '').trim()];
  if ((showEn || !showUr) && verse.translation) parts.push(verse.translation);
  if (showUr && verse.urduTranslation) parts.push(verse.urduTranslation);
  parts.push(`— ${verseReference(verse)}\n${verseLink(verse)}`);
  return copyText(parts.join('\n\n'));
}

/**
 * Opens the device share menu, or copies the link where sharing isn't
 * available. Resolves to 'shared' | 'copied' | 'cancelled' | 'failed'.
 */
export async function shareVerse(verse) {
  const url = verseLink(verse);
  const reference = verseReference(verse);
  if (navigator.share) {
    try {
      await navigator.share({ title: `${reference} — Al-Quran Hub`, text: verse.translation || reference, url });
      return 'shared';
    } catch (err) {
      if (err?.name === 'AbortError') return 'cancelled';
    }
  }
  return (await copyText(url)) ? 'copied' : 'failed';
}
