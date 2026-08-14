import { useEffect, useRef } from 'react';
import { recordReadingSeconds } from '../lib/streakUtils';

const SAVE_INTERVAL_SECONDS = 8;

/**
 * Mount this on a Quran reading page (SurahView, JuzView) to count it
 * toward the daily reading streak. Ticks once per second but only counts
 * while the tab is actually visible (Page Visibility API) — switching
 * tabs or minimizing pauses the count, coming back resumes it.
 *
 * Saves to localStorage every SAVE_INTERVAL_SECONDS so progress survives a
 * refresh, and flushes any partial chunk immediately when the tab hides or
 * the page unmounts/navigates away so no reading time is lost.
 */
export function useReadingTimer() {
  const pendingRef = useRef(0);

  useEffect(() => {
    function flush() {
      if (pendingRef.current > 0) {
        recordReadingSeconds(pendingRef.current);
        pendingRef.current = 0;
      }
    }

    const intervalId = setInterval(() => {
      if (document.visibilityState !== 'visible') return;
      pendingRef.current += 1;
      if (pendingRef.current >= SAVE_INTERVAL_SECONDS) flush();
    }, 1000);

    function handleVisibilityChange() {
      if (document.visibilityState !== 'visible') flush();
    }

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('beforeunload', flush);

    return () => {
      clearInterval(intervalId);
      flush();
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('beforeunload', flush);
    };
  }, []);
}
