import React, { useState, useRef, useEffect } from 'react';
import { useAudio } from '../context/AudioContext';
import { useQari } from '../context/QariContext';
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
    playbackSpeed,
  } = useAudio();

  const { selectedReciter } = useQari();

  const [position, setPosition] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isScrubbing, setIsScrubbing] = useState(false);
  const [localProgress, setLocalProgress] = useState(0);
  const dragStartPos = useRef({ x: 0, y: 0 });
  const hasMovedWhileDragging = useRef(false);
  const autoMinimizeTimeoutRef = useRef(null);

  const resetAutoMinimizeTimer = () => {
    if (autoMinimizeTimeoutRef.current) {
      clearTimeout(autoMinimizeTimeoutRef.current);
    }
    // Only set timer if not minimized and on desktop (using a safe threshold)
    if (!isMinimized && window.innerWidth > 768) {
      autoMinimizeTimeoutRef.current = setTimeout(() => {
        setIsMinimized(true);
      }, 5000);
    }
  };

  useEffect(() => {
    resetAutoMinimizeTimer();
    return () => {
      if (autoMinimizeTimeoutRef.current) clearTimeout(autoMinimizeTimeoutRef.current);
    };
  }, [isMinimized, currentVerse, isPlaying]); // Reset when status changes

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
    const pillW = 220, padding = 10;
    newX = Math.max(padding, Math.min(newX, window.innerWidth - pillW - padding));
    newY = Math.max(padding, Math.min(newY, window.innerHeight - 56 - padding));
    if (Math.abs(newX - position.x) > 5 || Math.abs(newY - position.y) > 5) {
      hasMovedWhileDragging.current = true;
    }
    setPosition({ x: newX, y: newY });
  };

  const handleDragEnd = () => setIsDragging(false);

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

  const handleScrubStart = () => {
    setIsScrubbing(true);
    setLocalProgress(progress);
  };

  const handleScrubEnd = () => {
    setIsScrubbing(false);
  };

  const handleProgressChange = (e) => {
    const val = parseFloat(e.target.value);
    setLocalProgress(val);
    seek(val);
  };

  const formatTime = (time) => {
    if (!time) return '0:00';
    const mins = Math.floor(time / 60);
    const secs = Math.floor(time % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const displayProgress = isScrubbing ? localProgress : progress;
  const progressPct = duration ? (displayProgress / duration) * 100 : 0;

  return (
    <>
      {/* ── MINIMIZED PILL ── */}
      {isMinimized ? (
        <div
          className={`bp-mini-pill ${isDragging ? 'is-dragging' : ''}`}
          onMouseDown={handleDragStart}
          onTouchStart={handleDragStart}
          onClick={handleMinimizedClick}
          style={{
            left: position ? `${position.x}px` : 'auto',
            top: position ? `${position.y}px` : 'auto',
            bottom: position ? 'auto' : '1.5rem',
            right: position ? 'auto' : '1.5rem',
          }}
        >
          <div className="bp-mini-art">
            <img
              src={selectedReciter?.image}
              alt={selectedReciter?.name}
              className="bp-mini-img"
              onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }}
            />
            <div className="bp-mini-img-fallback" style={{ display: 'none' }}>
              <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
                <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z" />
              </svg>
            </div>
          </div>
          <div className="bp-mini-text">
            <span className="bp-mini-surah">{currentVerse.surahName || 'Surah'}</span>
            <span className="bp-mini-ayah">Ayah {currentVerse.number}</span>
          </div>
          <div className="bp-mini-ctrls" onClick={(e) => e.stopPropagation()}>
            <button className="bp-mini-btn" onClick={skipPrev} title="Previous">
              <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor"><path d="M6 6h2v12H6zm3.5 6L19 18V6z" /></svg>
            </button>
            <button className="bp-mini-play" onClick={togglePlay}>
              {isPlaying
                ? <svg viewBox="0 0 24 24" width="14" height="14" fill="white"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" /></svg>
                : <svg viewBox="0 0 24 24" width="14" height="14" fill="white"><path d="M8 5v14l11-7z" /></svg>
              }
            </button>
            <button className="bp-mini-btn" onClick={skipNext} title="Next">
              <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor"><path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z" /></svg>
            </button>
          </div>
        </div>
      ) : (
        <>
          {/* ── DESKTOP PLAYER ── */}
          <div
            className="bp-desktop"
            onMouseMove={resetAutoMinimizeTimer}
            onMouseEnter={resetAutoMinimizeTimer}
          >
            <div className="bp-desktop-inner">
              {/* Track info */}
              <div className="bp-track">
                <span className="bp-surah">{currentVerse.surahName || 'Surah'}</span>
                <span className="bp-ayah">Ayah {currentVerse.number}</span>
              </div>

              {/* Center: controls + progress */}
              <div className="bp-center">
                <div className="bp-controls">
                  <button
                    className={`bp-btn ${repeatMode > 0 ? 'active' : ''}`}
                    onClick={toggleRepeat}
                    title="Repeat"
                  >
                    <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
                      <path d="M7 7h10v3l4-4-4-4v3H5v6h2V7zm10 10H7v-3l-4 4 4 4v-3h12v-6h-2v4z" />
                    </svg>
                    {repeatMode > 0 && (
                      <span className="bp-badge">{repeatMode === 3 ? '∞' : repeatMode}</span>
                    )}
                  </button>

                  <button className="bp-btn" onClick={skipBackward} title="Back 10s">
                    <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
                      <path d="M12.5 8c-2.65 0-5.05 1-6.9 2.6L2 7v9h9l-3.62-3.62C8.77 13.22 10.54 12.5 12.5 12.5c3.54 0 6.55 2.31 7.6 5.5l2.37-.78C21.08 11.03 17.15 8 12.5 8z" />
                    </svg>
                  </button>

                  <button className="bp-btn" onClick={skipPrev} title="Previous">
                    <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
                      <path d="M6 6h2v12H6zm3.5 6L19 18V6z" />
                    </svg>
                  </button>

                  <button className="bp-play" onClick={togglePlay}>
                    {isPlaying
                      ? <svg viewBox="0 0 24 24" width="22" height="22" fill="white"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" /></svg>
                      : <svg viewBox="0 0 24 24" width="22" height="22" fill="white"><path d="M8 5v14l11-7z" /></svg>
                    }
                  </button>

                  <button className="bp-btn" onClick={skipNext} title="Next">
                    <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
                      <path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z" />
                    </svg>
                  </button>

                  <button className="bp-btn" onClick={skipForward} title="Forward 10s">
                    <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
                      <path d="M18.41 10.6C16.55 9 14.15 8 11.5 8c-4.65 0-8.58 3.03-9.96 7.22L3.92 16c1.05-3.19 4.05-5.5 7.58-5.5 1.95 0 3.73.72 5.12 1.88L13 16h9V7l-3.59 3.6z" />
                    </svg>
                  </button>
                </div>

                <div className="bp-progress">
                  <span className="bp-time">{formatTime(displayProgress)}</span>
                  <div className="bp-slider-track">
                    <div className="bp-slider-fill" style={{ width: `${progressPct}%` }} />
                    <input
                      type="range"
                      className="bp-slider"
                      min="0"
                      max={duration || 0}
                      step="0.1"
                      value={displayProgress}
                      onChange={handleProgressChange}
                      onMouseDown={handleScrubStart}
                      onMouseUp={handleScrubEnd}
                      onTouchStart={handleScrubStart}
                      onTouchEnd={handleScrubEnd}
                    />
                  </div>
                  <span className="bp-time">{formatTime(duration)}</span>
                </div>
              </div>

              {/* Right: speed + actions */}
              <div className="bp-actions">
                <button className="bp-speed" onClick={toggleSpeed}>{playbackSpeed}×</button>
                <button className="bp-btn" onClick={() => setIsMinimized(true)} title="Minimize">
                  <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
                    <path d="M7.41 8.59L12 13.17l4.59-4.58L18 10l-6 6-6-6 1.41-1.41z" />
                  </svg>
                </button>
                <button className="bp-btn" onClick={stop} title="Close">
                  <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
                    <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
                  </svg>
                </button>
              </div>
            </div>
          </div>

          {/* ── MOBILE PLAYER ── */}
          <div
            className={`bp-mobile ${isPlaying ? 'is-playing' : ''}`}
          >
            {/* Header row */}
            <div className="bp-mobile-header">
              <button className="bp-mobile-hbtn" onClick={() => setIsMinimized(true)} title="Minimize">
                <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M6 9l6 6 6-6" />
                </svg>
              </button>
              <span className="bp-now-playing">Now playing</span>
              <button className="bp-mobile-hbtn" onClick={stop} title="Close">
                <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
                  <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
                </svg>
              </button>
            </div>

            {/* Artwork */}
            <div className="bp-artwork-wrap">
              <div className={`bp-artwork-ring ${isPlaying ? 'spinning' : ''}`}>
                <div className="bp-artwork-inner">
                  <img
                    src={selectedReciter?.image}
                    alt={selectedReciter?.name}
                    className="bp-artwork-img"
                    onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }}
                  />
                  <div className="bp-artwork-fallback" style={{ display: 'none' }}>
                    <svg viewBox="0 0 24 24" width="48" height="48" fill="none">
                      <circle cx="12" cy="12" r="10" stroke="#7F77DD" strokeWidth="1" />
                      <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z" fill="#7F77DD" opacity=".6" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>

            {/* Track info */}
            <div className="bp-mobile-info">
              <div className="bp-mobile-surah">{currentVerse.surahName || 'Surah'}</div>
              <div className="bp-mobile-ayah">Ayah {currentVerse.number}</div>
            </div>

            {/* Progress */}
            <div className="bp-mobile-progress">
              <span className="bp-mobile-time">{formatTime(displayProgress)}</span>
              <div className="bp-slider-track">
                <div className="bp-slider-fill" style={{ width: `${progressPct}%` }} />
                <input
                  type="range"
                  className="bp-slider"
                  min="0"
                  max={duration || 0}
                  step="0.1"
                  value={displayProgress}
                  onChange={handleProgressChange}
                  onMouseDown={handleScrubStart}
                  onMouseUp={handleScrubEnd}
                  onTouchStart={handleScrubStart}
                  onTouchEnd={handleScrubEnd}
                />
              </div>
              <span className="bp-mobile-time bp-mobile-time-end">{formatTime(duration)}</span>
            </div>

            {/* Controls */}
            <div className="bp-mobile-controls">
              <button className={`bp-mobile-btn ${repeatMode > 0 ? 'active' : ''}`} onClick={toggleRepeat} title="Repeat">
                <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
                  <path d="M7 7h10v3l4-4-4-4v3H5v6h2V7zm10 10H7v-3l-4 4 4 4v-3h12v-6h-2v4z" />
                </svg>
                {repeatMode > 0 && <span className="bp-badge-dot" />}
              </button>

              <button className="bp-mobile-btn bp-skip-btn" onClick={skipBackward} title="Back 10s">
                <svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor">
                  <path d="M12.5 8c-2.65 0-5.05 1-6.9 2.6L2 7v9h9l-3.62-3.62C8.77 13.22 10.54 12.5 12.5 12.5c3.54 0 6.55 2.31 7.6 5.5l2.37-.78C21.08 11.03 17.15 8 12.5 8z" />
                </svg>
                <span className="bp-skip-label">10</span>
              </button>

              <button className="bp-mobile-btn" onClick={skipPrev} title="Previous">
                <svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor">
                  <path d="M6 6h2v12H6zm3.5 6L19 18V6z" />
                </svg>
              </button>

              <button className="bp-mobile-play" onClick={togglePlay}>
                {isPlaying
                  ? <svg viewBox="0 0 24 24" width="28" height="28" fill="white"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" /></svg>
                  : <svg viewBox="0 0 24 24" width="28" height="28" fill="white"><path d="M8 5v14l11-7z" /></svg>
                }
              </button>

              <button className="bp-mobile-btn" onClick={skipNext} title="Next">
                <svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor">
                  <path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z" />
                </svg>
              </button>

              <button className="bp-mobile-btn bp-skip-btn" onClick={skipForward} title="Forward 10s">
                <svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor">
                  <path d="M18.41 10.6C16.55 9 14.15 8 11.5 8c-4.65 0-8.58 3.03-9.96 7.22L3.92 16c1.05-3.19 4.05-5.5 7.58-5.5 1.95 0 3.73.72 5.12 1.88L13 16h9V7l-3.59 3.6z" />
                </svg>
                <span className="bp-skip-label">10</span>
              </button>

              <button className="bp-mobile-speed" onClick={toggleSpeed}>{playbackSpeed}×</button>
            </div>
          </div>
        </>
      )}
    </>
  );
}
