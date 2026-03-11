import React from 'react';
import { useAudio } from '../context/AudioContext';
import './BottomPlayer.css';

export default function BottomPlayer() {
  const { 
    currentVerse, 
    isPlaying, 
    progress, 
    duration, 
    togglePlay, 
    stop, 
    skipNext, 
    skipPrev, 
    seek 
  } = useAudio();

  if (!currentVerse) return null;

  const handleProgressBarChange = (e) => {
    seek(parseFloat(e.target.value));
  };

  const formatTime = (time) => {
    if (!time) return "0:00";
    const mins = Math.floor(time / 60);
    const secs = Math.floor(time % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="bottom-player glass">
      <div className="container bottom-player-inner">
        
        {/* Info Section */}
        <div className="player-info">
          <div className="player-verse-info">
            <span className="player-surah">{currentVerse.surahName || 'Surah'}</span>
            <span className="player-divider">•</span>
            <span className="player-verse-num">Ayah {currentVerse.number}</span>
          </div>
          <div className="player-arabic-preview arabic">{currentVerse.arabic}</div>
        </div>

        {/* Controls Section */}
        <div className="player-main-controls">
          <div className="player-buttons">
            <button className="player-btn prev" onClick={skipPrev} title="Previous Ayah">
              <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor"><path d="M6 6h2v12H6zm3.5 6L19 18V6z"/></svg>
            </button>
            <button className="player-btn play-pause" onClick={togglePlay} title={isPlaying ? "Pause" : "Play"}>
              {isPlaying ? (
                <svg viewBox="0 0 24 24" width="32" height="32" fill="currentColor"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>
              ) : (
                <svg viewBox="0 0 24 24" width="32" height="32" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>
              )}
            </button>
            <button className="player-btn next" onClick={skipNext} title="Next Ayah">
              <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor"><path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z"/></svg>
            </button>
          </div>
          
          <div className="player-slider-container">
            <span className="time-display">{formatTime(progress)}</span>
            <input 
              type="range" 
              className="player-slider" 
              min="0" 
              max={duration || 0} 
              step="0.1"
              value={progress}
              onChange={handleProgressBarChange}
            />
            <span className="time-display">{formatTime(duration)}</span>
          </div>
        </div>

        {/* Close button */}
        <div className="player-actions">
           <button className="player-btn stop" onClick={stop} title="Stop & Close">
             <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/></svg>
           </button>
        </div>

      </div>
    </div>
  );
}
