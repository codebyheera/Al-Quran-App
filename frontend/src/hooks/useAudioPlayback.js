/**
 * hooks/useAudioPlayback.js — Hybrid cache-first / stream-first audio loading.
 *
 * Given an audioUrl, resolves a playable <audio> src:
 *  - Cached: object URL from the cached blob, fully offline, no network.
 *  - Not cached: the original URL directly (native progressive streaming
 *    starts immediately), while a background fetch stores it in Cache
 *    Storage for next time.
 *
 * Attach the returned `audioRef` to an <audio> element. Object URLs are
 * revoked automatically when the track changes or the component unmounts.
 */

import { useEffect, useRef, useState } from 'react';
import { loadPlayableSrc } from '../lib/audioCache';

export default function useAudioPlayback(audioUrl) {
  const audioRef = useRef(null);
  const objectUrlRef = useRef(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const [isOffline, setIsOffline] = useState(false);

  useEffect(() => {
    let cancelled = false;

    if (objectUrlRef.current) {
      URL.revokeObjectURL(objectUrlRef.current);
      objectUrlRef.current = null;
    }
    setIsDownloading(false);
    setIsOffline(false);

    if (!audioUrl || !audioRef.current) return;

    (async () => {
      const { src, fromCache, backgroundPromise } = await loadPlayableSrc(audioUrl);
      if (cancelled) return;

      if (fromCache) {
        objectUrlRef.current = src;
        if (audioRef.current) audioRef.current.src = src;
        setIsOffline(true);
        return;
      }

      // Cache miss — stream the original URL right away, no waiting.
      if (audioRef.current) audioRef.current.src = src;
      setIsDownloading(true);

      const cached = await backgroundPromise;
      if (cancelled) return;
      setIsDownloading(false);
      if (cached) setIsOffline(true);
    })();

    return () => {
      cancelled = true;
    };
  }, [audioUrl]);

  // Revoke on unmount
  useEffect(() => {
    return () => {
      if (objectUrlRef.current) {
        URL.revokeObjectURL(objectUrlRef.current);
        objectUrlRef.current = null;
      }
    };
  }, []);

  return { audioRef, isDownloading, isOffline };
}
