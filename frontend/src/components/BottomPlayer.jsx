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
    toggleRepeat
  } = useAudio();
  
  // Draggable State - initialize to null, we'll set it in useEffect to bottom-right
  const [position, setPosition] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const dragStartPos = useRef({ x: 0, y: 0 });
  const hasMovedWhileDragging = useRef(false);

  // Initialize position to bottom-right
  useEffect(() => {
    if (!position) {
      const initialBottom = window.innerHeight - 80; // 60px icon + ~20px offset
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
    
    // Store where we clicked relative to the icon's top-left
    dragStartPos.current = { x: clientX - position.x, y: clientY - position.y };
  };

  const handleDrag = (e) => {
    if (!isDragging || !position) return;
    const clientX = e.type.includes('touch') ? e.touches[0].clientX : e.clientX;
    const clientY = e.type.includes('touch') ? e.touches[0].clientY : e.clientY;
    
    let newX = clientX - dragStartPos.current.x;
    let newY = clientY - dragStartPos.current.y;
    
    // Clamping to viewport
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

  // Add/remove event listeners for global drag move/end
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
          title="Drag to move, Click to expand"
        >
          {isPlaying ? (
            <svg viewBox="0 0 24 24" width="28" height="28" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14H9V8h2v8zm4 0h-2V8h2v8z"/></svg>
          ) : (
            <svg viewBox="0 0 24 24" width="28" height="28" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 14.5v-9l6 4.5-6 4.5z"/></svg>
          )}
        </div>
      ) : (
        /* Full Sleek Bottom Player */
        <div className="bottom-player glass">
          <div className="container bottom-player-inner">
            
            {/* Info Section */}
            <div className="player-info">
              <div className="player-verse-info">
                <span className="player-surah">{currentVerse.surahName || 'Surah'}</span>
                <span className="player-divider">•</span>
                <span className="player-verse-num" style={{whiteSpace: 'nowrap'}}>Ayah {currentVerse.number}</span>
              </div>
            </div>

            {/* Controls Section */}
            <div className="player-main-controls">
              <div className="player-buttons">
                <button 
                  className={`player-btn repeat ${repeatMode > 0 ? 'active' : ''}`} 
                  onClick={toggleRepeat} 
                  title={repeatMode === 0 ? "Repeat: Off" : repeatMode === 1 ? "Repeat: 1x" : repeatMode === 2 ? "Repeat: 2x" : "Repeat: Infinite"}
                >
                  {repeatMode === 1 && <span className="repeat-badge">1</span>}
                  {repeatMode === 2 && <span className="repeat-badge">2</span>}
                  {repeatMode === 3 && <span className="repeat-badge" style={{fontSize: '0.9rem', marginTop: '-1px'}}>∞</span>}
                  <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><path d="M7 7h10v3l4-4-4-4v3H5v6h2V7zm10 10H7v-3l-4 4 4 4v-3h12v-6h-2v4z"/></svg>
                </button>
                <button className="player-btn prev" onClick={skipPrev} title="Previous Ayah">
                  <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><path d="M6 6h2v12H6zm3.5 6L19 18V6z"/></svg>
                </button>
                <button className="player-btn play-pause" onClick={togglePlay} title={isPlaying ? "Pause" : "Play"}>
                  {isPlaying ? (
                    <svg viewBox="0 0 24 24" width="28" height="28" fill="currentColor"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>
                  ) : (
                    <svg viewBox="0 0 24 24" width="28" height="28" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>
                  )}
                </button>
                <button className="player-btn next" onClick={skipNext} title="Next Ayah">
                  <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z"/></svg>
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

            {/* Actions Section */}
            <div className="player-actions">
               <button className="player-btn minimize" onClick={() => setIsMinimized(true)} title="Minimize Player">
                 <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor"><path d="M7.41 8.59L12 13.17l4.59-4.58L18 10l-6 6-6-6 1.41-1.41z"/></svg>
               </button>
               <button className="player-btn stop" onClick={stop} title="Stop & Close">
                 <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/></svg>
               </button>
            </div>

          </div>
        </div>
      )}
    </>
  );
}
