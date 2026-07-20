import React, { createContext, useContext, useState, useRef, useEffect } from 'react';

const AudioContext = createContext();

export const useAudio = () => useContext(AudioContext);

export const AudioProvider = ({ children }) => {
  const [currentVerse, setCurrentVerse] = useState(null);
  const [playlist, setPlaylist] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(-1);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isMinimized, setIsMinimized] = useState(false); // Initialized false to prevent synchronous reflow, updated in useEffect
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

  // Safe client-side initialization to prevent forced reflows
  useEffect(() => {
    if (typeof window !== 'undefined') {
      setIsMinimized(window.innerWidth <= 768);
    }
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
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
      animationFrameId = requestAnimationFrame(tick);
    };
    const handlePause = () => {
      setIsPlaying(false);
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
    };
    const handleEnded = () => {
      if (animationFrameId) cancelAnimationFrame(animationFrameId);

      // Handle Combine mode logic
      if (audioLanguage === 'combine' && currentVerse) {
        if (combineStep === 0) {
          // Finished Arabic, check if English should play
          if (showEn && currentVerse.englishAudioUrl) {
            setCombineStep(1);
            audio.src = currentVerse.englishAudioUrl;
            audio.play().catch(console.error);
            return;
          }
          // If no English, fall through to check Urdu
          if (showUr && currentVerse.urduAudioUrl) {
            setCombineStep(2);
            audio.src = currentVerse.urduAudioUrl;
            audio.play().catch(console.error);
            return;
          }
        } else if (combineStep === 1) {
          // Finished English, check if Urdu should play
          if (showUr && currentVerse.urduAudioUrl) {
            setCombineStep(2);
            audio.src = currentVerse.urduAudioUrl;
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

  // Handle Playback Language Changes
  useEffect(() => {
    if (currentVerse) {
      setCombineStep(0); // Reset combine step if user changes language mid-playback
      const newSrc = getAudioForLanguage(currentVerse, audioLanguage);
      if (audioRef.current.src !== newSrc) {
        const wasPlaying = !audioRef.current.paused;
        audioRef.current.src = newSrc;
        // Optionally reset currentTime to 0 on language change
        audioRef.current.currentTime = 0;
        if (wasPlaying) {
          audioRef.current.play().catch(console.error);
        }
      }
    }
  }, [audioLanguage, currentVerse]);

  const playVerse = (verse) => {
    setPlaylist([]);
    setCurrentIndex(-1);
    setCurrentVerse(verse);
    setIsMinimized(window.innerWidth <= 768);
    setRepeatCount(0);
    setCombineStep(0);
    audioRef.current.src = getAudioForLanguage(verse, audioLanguage);
    audioRef.current.play().catch(console.error);
  };

  const playPlaylist = (verses, startIdx = 0) => {
    setPlaylist(verses);
    setCurrentIndex(startIdx);
    setCurrentVerse(verses[startIdx]);
    setIsMinimized(window.innerWidth <= 768);
    setRepeatCount(0);
    setCombineStep(0);
    audioRef.current.src = getAudioForLanguage(verses[startIdx], audioLanguage);
    audioRef.current.play().catch(console.error);
  };

  const updatePlaylist = (newPlaylist) => {
    setPlaylist(newPlaylist);
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

  const skipNext = () => {
    if (playlist.length > 0 && currentIndex < playlist.length - 1) {
      const nextIdx = currentIndex + 1;
      const nextVerse = playlist[nextIdx];
      setCurrentIndex(nextIdx);
      setCurrentVerse(nextVerse);
      setRepeatCount(0);
      setCombineStep(0);
      audioRef.current.src = getAudioForLanguage(nextVerse, audioLanguage);
      audioRef.current.play().catch(console.error);
    }
  };

  const skipPrev = () => {
    if (playlist.length > 0 && currentIndex > 0) {
      const prevIdx = currentIndex - 1;
      const prevVerse = playlist[prevIdx];
      setCurrentIndex(prevIdx);
      setCurrentVerse(prevVerse);
      setRepeatCount(0);
      setCombineStep(0);
      audioRef.current.src = getAudioForLanguage(prevVerse, audioLanguage);
      audioRef.current.play().catch(console.error);
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
      setShowUr
    }}>
      {children}
    </AudioContext.Provider>
  );
};
