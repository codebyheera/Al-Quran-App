import React, { useState, useRef, useEffect } from 'react';
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
    seek,
    isMinimized,
    setIsMinimized,
    repeatMode,
    toggleRepeat,
    toggleSpeed,
    skipForward,
    skipBackward,
    playbackSpeed
  } = useAudio();
  
  // Draggable State
  const [position, setPosition] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const dragStartPos = useRef({ x: 0, y: 0 });
  const hasMovedWhileDragging = useRef(false);

  // Initialize position to bottom-right
  useEffect(() => {
    if (!position) {
      const initialBottom = window.innerHeight - 80;
      const initialRight = window.innerWidth - 80;
      setPosition({ x: initialRight, y: initialBottom });
    }
  }, []);

  const handleDragStart = (e) => {
    if (!position) return;
    setIsDragging(true);
    hasMovedWhileDragging.current = false;
    const clientX = e.type.includes('touch') ? e.touches[0].clientX : e.clientX;
    const clientY = e.type.includes('touch') ? e.touches[0].clientY : e.clientY;
    dragStartPos.current = { x: clientX - position.x, y: clientY - position.y };
  };

  const handleDrag = (e) => {
    if (!isDragging || !position) return;
    const clientX = e.type.includes('touch') ? e.touches[0].clientX : e.clientX;
    const clientY = e.type.includes('touch') ? e.touches[0].clientY : e.clientY;
    
    let newX = clientX - dragStartPos.current.x;
    let newY = clientY - dragStartPos.current.y;
    
    const iconSize = 60;
    const padding = 10;
    newX = Math.max(padding, Math.min(newX, window.innerWidth - iconSize - padding));
    newY = Math.max(padding, Math.min(newY, window.innerHeight - iconSize - padding));
    
    if (Math.abs(newX - position.x) > 5 || Math.abs(newY - position.y) > 5) {
      hasMovedWhileDragging.current = true;
    }
    
    setPosition({ x: newX, y: newY });
  };

  const handleDragEnd = () => {
    setIsDragging(false);
  };

  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleDrag);
      window.addEventListener('mouseup', handleDragEnd);
      window.addEventListener('touchmove', handleDrag, { passive: false });
      window.addEventListener('touchend', handleDragEnd);
    } else {
      window.removeEventListener('mousemove', handleDrag);
      window.removeEventListener('mouseup', handleDragEnd);
      window.removeEventListener('touchmove', handleDrag);
      window.removeEventListener('touchend', handleDragEnd);
    }
    return () => {
      window.removeEventListener('mousemove', handleDrag);
      window.removeEventListener('mouseup', handleDragEnd);
      window.removeEventListener('touchmove', handleDrag);
      window.removeEventListener('touchend', handleDragEnd);
    };
  }, [isDragging]);

  const handleMinimizedClick = (e) => {
    if (hasMovedWhileDragging.current) {
      e.preventDefault();
      e.stopPropagation();
      return;
    }
    setIsMinimized(false);
  };

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
    <>
      {/* Minimized Floating Button */}
      {isMinimized ? (
        <div 
          className={`minimized-player glass ${isDragging ? 'is-dragging' : ''}`} 
          onMouseDown={handleDragStart}
          onTouchStart={handleDragStart}
          onClick={handleMinimizedClick}
          style={{ 
            left: position ? `${position.x}px` : 'auto',
            top: position ? `${position.y}px` : 'auto',
            bottom: position ? 'auto' : '2rem',
            right: position ? 'auto' : '2rem',
            transform: 'none'
          }}
        >
          <div className="mini-play-icon">
            {isPlaying ? (
              <svg viewBox="0 0 24 24" width="28" height="28" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14H9V8h2v8zm4 0h-2V8h2v8z"/></svg>
            ) : (
              <svg viewBox="0 0 24 24" width="28" height="28" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 14.5v-9l6 4.5-6 4.5z"/></svg>
            )}
          </div>
        </div>
      ) : (
        <>
          {/* --- CLASSIC HORIZONTAL DESKTOP PLAYER --- */}
          <div className="bottom-player-desktop-classic desktop-only-flex">
            <div className="container bottom-player-inner">
              <div className="player-info">
                <div className="player-verse-info">
                  <span className="player-surah">{currentVerse.surahName || 'Surah'}</span>
                  <span className="player-divider">•</span>
                  <span className="player-verse-num">Ayah {currentVerse.number}</span>
                </div>
              </div>

              <div className="player-main-controls">
                <div className="player-buttons">
                  <button className={`player-btn repeat ${repeatMode > 0 ? 'active' : ''}`} onClick={toggleRepeat} title="Repeat Mode">
                    <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><path d="M7 7h10v3l4-4-4-4v3H5v6h2V7zm10 10H7v-3l-4 4 4 4v-3h12v-6h-2v4z"/></svg>
                    {repeatMode > 0 && <span className="repeat-badge">{repeatMode === 3 ? '∞' : repeatMode}</span>}
                  </button>
                  <button className="player-btn skip-10" onClick={skipBackward} title="Skip Back 10s">
                    <svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor"><path d="M12.5 8c-2.65 0-5.05 1-6.9 2.6L2 7v9h9l-3.62-3.62c1.39-1.16 3.16-1.88 5.12-1.88 3.54 0 6.55 2.31 7.6 5.5l2.37-.78C21.08 11.03 17.15 8 12.5 8z"/><path d="M10 12h2v4h-2z"/><path d="M8 12h1v4H8z"/></svg>
                  </button>
                  <button className="player-btn prev" onClick={skipPrev} title="Previous Ayah">
                    <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><path d="M6 6h2v12H6zm3.5 6L19 18V6z"/></svg>
                  </button>
                  <button className="player-btn play-pause primary-btn" onClick={togglePlay}>
                    {isPlaying ? (
                      <svg viewBox="0 0 24 24" width="28" height="28" fill="currentColor"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>
                    ) : (
                      <svg viewBox="0 0 24 24" width="28" height="28" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>
                    )}
                  </button>
                  <button className="player-btn next" onClick={skipNext} title="Next Ayah">
                    <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z"/></svg>
                  </button>
                  <button className="player-btn skip-10" onClick={skipForward} title="Skip Forward 10s">
                     <svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor"><path d="M18.41 10.6C16.55 9 14.15 8 11.5 8c-4.65 0-8.58 3.03-9.96 7.22L3.92 16c1.05-3.19 4.05-5.5 7.58-5.5 1.95 0 3.73.72 5.12 1.88L13 16h9V7l-3.59 3.6z"/><path d="M14 12h2v4h-2z"/><path d="M16 12h1v4h-1z"/></svg>
                  </button>
                </div>

                <div className="player-slider-container">
                  <span className="time-display">{formatTime(progress)}</span>
                  <input type="range" className="player-slider" min="0" max={duration || 0} step="0.1" value={progress} onChange={handleProgressBarChange} />
                  <span className="time-display">{formatTime(duration)}</span>
                </div>

                <button className="speed-pill-classic" onClick={toggleSpeed} title="Toggle Speed">
                  {playbackSpeed}x
                </button>
              </div>

              <div className="player-actions">
                <button className="player-btn minimize" onClick={() => setIsMinimized(true)} title="Minimize"><svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor"><path d="M7.41 8.59L12 13.17l4.59-4.58L18 10l-6 6-6-6 1.41-1.41z"/></svg></button>
                <button className="player-btn stop" onClick={stop} title="Stop"><svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/></svg></button>
              </div>
            </div>
          </div>

          {/* --- MODERN PREMIUM MOBILE PLAYER --- */}
          <div className="modern-player-wrapper mobile-only-flex">
            <div className="modern-player-header">
              <button className="modern-minimize-btn" onClick={() => setIsMinimized(true)}>
                <svg viewBox="0 0 24 24" width="20" height="20" fill="white">
                  <path d="M7.41 8.59L12 13.17l4.59-4.58L18 10l-6 6-6-6 1.41-1.41z" />
                </svg>
              </button>
              <button className="modern-close-btn" onClick={stop}>
                <svg viewBox="0 0 24 24" width="16" height="16" fill="white"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" /></svg>
              </button>
            </div>
            <div className="modern-player-arc">
              <button className="modern-play-btn" onClick={togglePlay}>
                {isPlaying ? (
                  <svg viewBox="0 0 24 24" width="32" height="32" fill="white"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>
                ) : (
                  <svg viewBox="0 0 24 24" width="32" height="32" fill="white"><path d="M8 5v14l11-7z"/></svg>
                )}
              </button>
            </div>
            <div className="modern-player-body">
              <div className="modern-controls-row">
                <div className="modern-ctrl-group">
                  <button className={`modern-btn repeat ${repeatMode > 0 ? 'active' : ''}`} onClick={toggleRepeat}>
                    <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><path d="M7 7h10v3l4-4-4-4v3H5v6h2V7zm10 10H7v-3l-4 4 4 4v-3h12v-6h-2v4z"/></svg>
                    {repeatMode > 0 && <span className="modern-badge">{repeatMode === 3 ? '∞' : repeatMode}</span>}
                  </button>
                  <button className="modern-btn skip-10" onClick={skipBackward}><svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor"><path d="M12.5 8c-2.65 0-5.05 1-6.9 2.6L2 7v9h9l-3.62-3.62c1.39-1.16 3.16-1.88 5.12-1.88 3.54 0 6.55 2.31 7.6 5.5l2.37-.78C21.08 11.03 17.15 8 12.5 8z"/><path d="M10 12h2v4h-2z"/><path d="M8 12h1v4H8z"/></svg></button>
                </div>
                <div className="modern-playback-group">
                  <button className="modern-btn prev" onClick={skipPrev}><svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor"><path d="M6 6h2v12H6zm3.5 6L19 18V6z"/></svg></button>
                  <div className="modern-arc-spacer"></div>
                  <button className="modern-btn next" onClick={skipNext}><svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor"><path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z"/></svg></button>
                </div>
                <div className="modern-ctrl-group">
                  <button className="modern-btn skip-10" onClick={skipForward}><svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor"><path d="M18.41 10.6C16.55 9 14.15 8 11.5 8c-4.65 0-8.58 3.03-9.96 7.22L3.92 16c1.05-3.19 4.05-5.5 7.58-5.5 1.95 0 3.73.72 5.12 1.88L13 16h9V7l-3.59 3.6z"/><path d="M14 12h2v4h-2z"/><path d="M16 12h1v4h-1z"/></svg></button>
                  <button className="modern-speed-pill" onClick={toggleSpeed}><span>{playbackSpeed}x</span></button>
                </div>
              </div>
              <div className="modern-progress-row">
                <span className="modern-time">{formatTime(progress)}</span>
                <div className="modern-slider-container">
                  <input type="range" className="modern-slider" min="0" max={duration || 0} step="0.1" value={progress} onChange={handleProgressBarChange} />
                </div>
                <span className="modern-time">{formatTime(duration)}</span>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
}
