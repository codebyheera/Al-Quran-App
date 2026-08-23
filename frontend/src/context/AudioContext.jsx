import React, { createContext, useContext, useState, useRef, useEffect } from 'react';
import { clearAudioCache, queuePrefetch, resetPrefetchQueue, loadPlayableSrc } from '../lib/audioCache';

const AudioContext = createContext();

export const useAudio = () => useContext(AudioContext);

export const AudioProvider = ({ children }) => {
  const [currentVerse, setCurrentVerse] = useState(null);
  const [playlist, setPlaylist] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(-1);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isMinimized, setIsMinimized] = useState(window.innerWidth <= 768);
  const [repeatMode, setRepeatMode] = useState(0); // 0=off, 1=once, 2=twice, 3=infinite
  const [repeatCount, setRepeatCount] = useState(0);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [audioLanguage, setAudioLanguage] = useState('ar'); // 'ar', 'en', 'ur', 'combine'
  const [combineStep, setCombineStep] = useState(0); // 0=ar, 1=en, 2=ur

  const [showEn, setShowEn] = useState(() => {
    const val = localStorage.getItem("showEn");
    if (val !== null) return val === "true";
    return localStorage.getItem("showTranslation") === "true"; // fallback
  });

  const [showUr, setShowUr] = useState(() => {
    return localStorage.getItem("showUr") === "true";
  });

  // Persist toggles to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem("showEn", showEn);
  }, [showEn]);

  useEffect(() => {
    localStorage.setItem("showUr", showUr);
  }, [showUr]);

  const audioRef = useRef(new Audio());
  const currentObjectUrlRef = useRef(null);
  // Tracks which logical URL we've already retried once after a load error,
  // so a genuinely broken track can't retry forever, but a transient network
  // hiccup (CDN rate-limit, brief connectivity blip) gets one automatic
  // second chance instead of the player just silently doing nothing.
  const errorRetryUrlRef = useRef(null);
  // The "real" (CDN) URL currently loaded, independent of what audioRef's
  // actual .src is — that can be a blob: object URL when playing from cache,
  // which must never be compared directly against a freshly-computed CDN URL
  // (they'd never match, causing a false "track changed" reload mid-playback).
  const currentLogicalUrlRef = useRef(null);
  // Bumped on every applyTrackSrc call so a slower, older call can detect it
  // was superseded by a newer one and avoid clobbering the newer track's
  // src/state once its own (now-stale) cache lookup finally resolves.
  const trackLoadTokenRef = useRef(0);
  const [isTrackDownloading, setIsTrackDownloading] = useState(false);
  const [isTrackOffline, setIsTrackOffline] = useState(false);

  // Hybrid cache-first / stream-first src resolution for the shared <audio> element.
  // Cache hit: play from an object URL (fully offline). Cache miss: stream the
  // original URL immediately, and cache it in the background for next time.
  const applyTrackSrc = async (url) => {
    const token = ++trackLoadTokenRef.current;
    currentLogicalUrlRef.current = url || null;

    if (currentObjectUrlRef.current) {
      URL.revokeObjectURL(currentObjectUrlRef.current);
      currentObjectUrlRef.current = null;
    }
    setIsTrackDownloading(false);
    setIsTrackOffline(false);

    if (!url) return;

    const { src, fromCache, backgroundPromise } = await loadPlayableSrc(url);
    if (trackLoadTokenRef.current !== token) return; // superseded by a newer call

    if (fromCache) {
      currentObjectUrlRef.current = src;
      audioRef.current.src = src;
      setIsTrackOffline(true);
      return;
    }

    audioRef.current.src = src;
    setIsTrackDownloading(true);
    backgroundPromise?.then((success) => {
      if (trackLoadTokenRef.current !== token) return;
      setIsTrackDownloading(false);
      if (success) setIsTrackOffline(true);
    });
  };

  // Revoke the last object URL when the player unmounts
  useEffect(() => {
    return () => {
      if (currentObjectUrlRef.current) {
        URL.revokeObjectURL(currentObjectUrlRef.current);
        currentObjectUrlRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    const audio = audioRef.current;
    let animationFrameId;

    const tick = () => {
      if (!audio.paused) {
        setProgress(audio.currentTime);
        setDuration(audio.duration || 0);
        animationFrameId = requestAnimationFrame(tick);
      }
    };

    const handlePlay = () => {
      setIsPlaying(true);
      errorRetryUrlRef.current = null; // this track is loading fine now
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
      animationFrameId = requestAnimationFrame(tick);
    };
    const handlePause = () => {
      setIsPlaying(false);
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
    };
    // The underlying resource failed to load (dropped connection, CDN
    // briefly rate-limiting, etc.) — give it exactly one automatic retry
    // before giving up on this track so a transient blip doesn't leave
    // the player just sitting there looking broken.
    const handleError = () => {
      const failedUrl = currentLogicalUrlRef.current;
      if (!failedUrl) return;

      if (errorRetryUrlRef.current === failedUrl) {
        // Already retried this exact track and it failed again — move on.
        errorRetryUrlRef.current = null;
        if (playlist.length > 0 && currentIndex < playlist.length - 1) {
          skipNext();
        } else {
          setIsPlaying(false);
        }
        return;
      }

      errorRetryUrlRef.current = failedUrl;
      setTimeout(async () => {
        if (currentLogicalUrlRef.current !== failedUrl) return; // user moved on already
        await applyTrackSrc(failedUrl);
        audio.play().catch(console.error);
      }, 1200);
    };
    const handleEnded = async () => {
      if (animationFrameId) cancelAnimationFrame(animationFrameId);

      // Handle Combine mode logic
      if (audioLanguage === 'combine' && currentVerse) {
        if (combineStep === 0) {
          // Finished Arabic, check if English should play
          if (showEn && currentVerse.englishAudioUrl) {
            setCombineStep(1);
            await applyTrackSrc(currentVerse.englishAudioUrl);
            audio.play().catch(console.error);
            return;
          }
          // If no English, fall through to check Urdu
          if (showUr && currentVerse.urduAudioUrl) {
            setCombineStep(2);
            await applyTrackSrc(currentVerse.urduAudioUrl);
            audio.play().catch(console.error);
            return;
          }
        } else if (combineStep === 1) {
          // Finished English, check if Urdu should play
          if (showUr && currentVerse.urduAudioUrl) {
            setCombineStep(2);
            await applyTrackSrc(currentVerse.urduAudioUrl);
            audio.play().catch(console.error);
            return;
          }
        }
      }

      // If we reach here, the full verse sequence (ar/en/ur) is complete.
      setCombineStep(0); // reset for next verse

      if (repeatMode === 3) {
        audio.currentTime = 0;
        audio.play().catch(console.error);
      } else if (repeatMode === 1 && repeatCount < 1) {
        setRepeatCount((prev) => prev + 1);
        audio.currentTime = 0;
        audio.play().catch(console.error);
      } else if (repeatMode === 2 && repeatCount < 2) {
        setRepeatCount((prev) => prev + 1);
        audio.currentTime = 0;
        audio.play().catch(console.error);
      } else {
        setRepeatCount(0); // reset count
        if (playlist.length > 0 && currentIndex < playlist.length - 1) {
          skipNext();
        } else {
          setIsPlaying(false);
        }
      }
    };
    const handleTimeUpdate = () => {
      // Still listen to timeupdate for manual seeking while paused
      if (audio.paused) {
        setProgress(audio.currentTime);
        setDuration(audio.duration || 0);
      }
    };

    audio.addEventListener('play', handlePlay);
    audio.addEventListener('pause', handlePause);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('error', handleError);

    // If audio is already playing when this effect re-runs, kickstart the tick
    if (!audio.paused) {
      animationFrameId = requestAnimationFrame(tick);
    }

    return () => {
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
      audio.removeEventListener('play', handlePlay);
      audio.removeEventListener('pause', handlePause);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('error', handleError);
    };
  }, [playlist, currentIndex, repeatMode, repeatCount, currentVerse, combineStep, audioLanguage, showEn, showUr]);

  // Handle Playback Speed Ref Changes
  useEffect(() => {
    audioRef.current.playbackRate = playbackSpeed;
  }, [playbackSpeed, currentVerse]);


  const getAudioForLanguage = (verse, lang) => {
    if (!verse) return '';
    if (lang === 'combine') return verse.audioUrl || verse.audio; // combine always starts with Arabic
    if (lang === 'en') return verse.englishAudioUrl || verse.audio;
    if (lang === 'ur') return verse.urduAudioUrl || verse.audio;
    return verse.audioUrl || verse.audio;
  };

  // Look ahead in the playlist and quietly download upcoming ayahs so the
  // rest of the Surah plays back-to-back with no per-ayah network wait.
  const prefetchUpcoming = (verses, fromIndex, lang) => {
    const upcoming = verses.slice(fromIndex + 1);
    if (!upcoming.length) return;
    const urls = upcoming.map((v) => getAudioForLanguage(v, lang));
    if (lang === 'combine') {
      if (showEn) urls.push(...upcoming.map((v) => v.englishAudioUrl).filter(Boolean));
      if (showUr) urls.push(...upcoming.map((v) => v.urduAudioUrl).filter(Boolean));
    }
    queuePrefetch(urls);
  };

  // Handle Playback Language Changes
  useEffect(() => {
    if (currentVerse) {
      setCombineStep(0); // Reset combine step if user changes language mid-playback
      const newSrc = getAudioForLanguage(currentVerse, audioLanguage);
      if (currentLogicalUrlRef.current !== newSrc) {
        const wasPlaying = !audioRef.current.paused;
        (async () => {
          await applyTrackSrc(newSrc);
          // Optionally reset currentTime to 0 on language change
          audioRef.current.currentTime = 0;
          if (wasPlaying) {
            audioRef.current.play().catch(console.error);
          }
        })();
      }
    }
  }, [audioLanguage, currentVerse]);

  const playVerse = async (verse) => {
    setPlaylist([]);
    setCurrentIndex(-1);
    setCurrentVerse(verse);
    setIsMinimized(window.innerWidth <= 768);
    setRepeatCount(0);
    setCombineStep(0);
    await applyTrackSrc(getAudioForLanguage(verse, audioLanguage));
    audioRef.current.play().catch(console.error);
  };

  const playPlaylist = async (verses, startIdx = 0) => {
    setPlaylist(verses);
    setCurrentIndex(startIdx);
    setCurrentVerse(verses[startIdx]);
    setIsMinimized(window.innerWidth <= 768);
    setRepeatCount(0);
    setCombineStep(0);
    await applyTrackSrc(getAudioForLanguage(verses[startIdx], audioLanguage));
    audioRef.current.play().catch(console.error);
    resetPrefetchQueue();
    prefetchUpcoming(verses, startIdx, audioLanguage);
  };

  const updatePlaylist = (newPlaylist) => {
    setPlaylist(newPlaylist);
    if (currentIndex >= 0) {
      prefetchUpcoming(newPlaylist, currentIndex, audioLanguage);
    }
  };

  const togglePlay = () => {
    if (audioRef.current.paused) {
      audioRef.current.play().catch(console.error);
    } else {
      audioRef.current.pause();
    }
  };

  const stop = () => {
    audioRef.current.pause();
    audioRef.current.currentTime = 0;
    setCurrentVerse(null);
    setPlaylist([]);
    setCurrentIndex(-1);
    setRepeatCount(0);
  };

  const skipNext = async () => {
    if (playlist.length > 0 && currentIndex < playlist.length - 1) {
      const nextIdx = currentIndex + 1;
      const nextVerse = playlist[nextIdx];
      setCurrentIndex(nextIdx);
      setCurrentVerse(nextVerse);
      setRepeatCount(0);
      setCombineStep(0);
      await applyTrackSrc(getAudioForLanguage(nextVerse, audioLanguage));
      audioRef.current.play().catch(console.error);
      prefetchUpcoming(playlist, nextIdx, audioLanguage);
    }
  };

  const skipPrev = async () => {
    if (playlist.length > 0 && currentIndex > 0) {
      const prevIdx = currentIndex - 1;
      const prevVerse = playlist[prevIdx];
      setCurrentIndex(prevIdx);
      setCurrentVerse(prevVerse);
      setRepeatCount(0);
      setCombineStep(0);
      await applyTrackSrc(getAudioForLanguage(prevVerse, audioLanguage));
      audioRef.current.play().catch(console.error);
      prefetchUpcoming(playlist, prevIdx, audioLanguage);
    }
  };

  const seek = (time) => {
    audioRef.current.currentTime = time;
    setProgress(time);
  };

  const toggleRepeat = () => {
    setRepeatMode((prev) => (prev + 1) % 4);
    setRepeatCount(0);
  };

  const skipForward = () => {
    const newTime = Math.min(audioRef.current.duration, audioRef.current.currentTime + 10);
    audioRef.current.currentTime = newTime;
    setProgress(newTime);
  };

  const skipBackward = () => {
    const newTime = Math.max(0, audioRef.current.currentTime - 10);
    audioRef.current.currentTime = newTime;
    setProgress(newTime);
  };

  const toggleSpeed = () => {
    const speeds = [0.5, 0.75, 1, 1.25, 1.5, 2];
    const currentIdx = speeds.indexOf(playbackSpeed);
    const nextIdx = (currentIdx + 1) % speeds.length;
    setPlaybackSpeed(speeds[nextIdx]);
  };

  // Wipes all downloaded/offline-cached audio (for a settings/storage-management screen)
  const clearDownloadedAudio = async () => {
    const success = await clearAudioCache();
    if (success) setIsTrackOffline(false);
    return success;
  };

  return (
    <AudioContext.Provider value={{
      currentVerse,
      isPlaying,
      playlist,
      currentIndex,
      progress,
      duration,
      isMinimized,
      repeatMode,
      setIsMinimized,
      toggleRepeat,
      toggleSpeed,
      skipForward,
      skipBackward,
      playVerse,
      playPlaylist,
      updatePlaylist,
      togglePlay,
      stop,
      skipNext,
      skipPrev,
      seek,
      playbackSpeed,
      audioLanguage,
      setAudioLanguage,
      showEn,
      setShowEn,
      showUr,
      setShowUr,
      isTrackDownloading,
      isTrackOffline,
      clearDownloadedAudio
    }}>
      {children}
    </AudioContext.Provider>
  );
};
