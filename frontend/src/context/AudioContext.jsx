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
  const [isMinimized, setIsMinimized] = useState(false);
  const [repeatMode, setRepeatMode] = useState(0); // 0=off, 1=once, 2=twice, 3=infinite
  const [repeatCount, setRepeatCount] = useState(0);

  const audioRef = useRef(new Audio());

  useEffect(() => {
    const audio = audioRef.current;

    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);
    const handleEnded = () => {
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
      setProgress(audio.currentTime);
      setDuration(audio.duration || 0);
    };

    audio.addEventListener('play', handlePlay);
    audio.addEventListener('pause', handlePause);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('timeupdate', handleTimeUpdate);

    return () => {
      audio.removeEventListener('play', handlePlay);
      audio.removeEventListener('pause', handlePause);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('timeupdate', handleTimeUpdate);
    };
  }, [playlist, currentIndex, repeatMode, repeatCount]);

  const playVerse = (verse) => {
    setPlaylist([]);
    setCurrentIndex(-1);
    setCurrentVerse(verse);
    setIsMinimized(false);
    setRepeatCount(0);
    audioRef.current.src = verse.audio;
    audioRef.current.play().catch(console.error);
  };

  const playPlaylist = (verses, startIdx = 0) => {
    setPlaylist(verses);
    setCurrentIndex(startIdx);
    setCurrentVerse(verses[startIdx]);
    setIsMinimized(true);
    setRepeatCount(0);
    audioRef.current.src = verses[startIdx].audio;
    audioRef.current.play().catch(console.error);
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
      audioRef.current.src = nextVerse.audio;
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
      audioRef.current.src = prevVerse.audio;
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
      playVerse,
      playPlaylist,
      togglePlay,
      stop,
      skipNext,
      skipPrev,
      seek
    }}>
      {children}
    </AudioContext.Provider>
  );
};
