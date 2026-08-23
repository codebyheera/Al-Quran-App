/**
 * hooks/useIsCached.js — Live "is this audio downloaded?" flag.
 *
 * Checks Cache Storage existence for a URL without fetching it, and updates
 * automatically when a background download for that URL completes elsewhere
 * (e.g. via useAudioPlayback). Used to render offline/download-status icons
 * across lists of Surahs/Ayahs.
 */

import { useEffect, useState } from 'react';
import { isCached, onAudioCacheUpdated } from '../lib/audioCache';

export default function useIsCached(audioUrl) {
  const [cached, setCached] = useState(false);

  useEffect(() => {
    let cancelled = false;

    if (!audioUrl) {
      setCached(false);
      return;
    }

    isCached(audioUrl).then((result) => {
      if (!cancelled) setCached(result);
    });

    const unsubscribe = onAudioCacheUpdated((updatedUrl) => {
      if (updatedUrl === audioUrl) setCached(true);
    });

    return () => {
      cancelled = true;
      unsubscribe();
    };
  }, [audioUrl]);

  return cached;
}
