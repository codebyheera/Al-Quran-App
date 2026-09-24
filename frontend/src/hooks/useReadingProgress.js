import { useEffect, useRef } from 'react';
import { saveLastReading } from '../lib/readingProgress';

/**
 * Mount on a Quran reading page (SurahView, JuzView) to power the homepage
 * "Continue Reading" card. Watches each rendered ayah with an
 * IntersectionObserver and keeps track of whichever one is currently most
 * visible near the top of the viewport; that position is persisted to
 * localStorage periodically and whenever the user leaves the page, so it
 * survives a refresh and shows up next time they visit the homepage.
 *
 * @param {Array<{ elementId: string, surahNumber: number, surahName: string, ayahNumber: number, url: string }>} items
 */
export function useReadingProgress(items) {
  const currentRef = useRef(null);
  const itemsRef = useRef(items);
  itemsRef.current = items;

  useEffect(() => {
    if (!items || items.length === 0) return;

    const byElementId = new Map(items.map((item) => [item.elementId, item]));

    const observer = new IntersectionObserver(
      (entries) => {
        // Among the ayahs currently on screen, track the one nearest the
        // top — that's "where the user is" while scrolling/reading.
        let best = null;
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          const item = byElementId.get(entry.target.id);
          if (!item) continue;
          if (!best || entry.boundingClientRect.top < best.top) {
            best = { top: entry.boundingClientRect.top, item };
          }
        }
        if (best) currentRef.current = best.item;
      },
      { threshold: 0.1, rootMargin: '-15% 0px -70% 0px' },
    );

    const elements = items
      .map((item) => document.getElementById(item.elementId))
      .filter(Boolean);
    elements.forEach((el) => observer.observe(el));

    function flush() {
      if (currentRef.current) {
        saveLastReading({
          surahNumber: currentRef.current.surahNumber,
          surahName: currentRef.current.surahName,
          ayahNumber: currentRef.current.ayahNumber,
          url: currentRef.current.url,
        });
      }
    }

    function handleVisibilityChange() {
      if (document.visibilityState !== 'visible') flush();
    }

    // Periodic save so progress survives a refresh without waiting for the
    // user to navigate away.
    const intervalId = setInterval(flush, 8000);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('beforeunload', flush);

    return () => {
      observer.disconnect();
      clearInterval(intervalId);
      flush(); // save on unmount, i.e. when the user leaves the reader page
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('beforeunload', flush);
    };
  }, [items]);
}
