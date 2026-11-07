/**
 * components/BottomPlayer.jsx — Recitation player (bottom of every page).
 *
 * One compact bar on every screen size:
 *   [reciter · Surah · "Ayah 12 of 286"]  [⏮ ▶ ⏭ + ayah time]  [Options ⌄ ✕]
 * with a thin line on top showing progress through the Surah/Juz playlist.
 * Tapping the track info scrolls to the playing ayah.
 *
 * Every setting lives in one labelled "Options" panel (popover on desktop,
 * bottom sheet on phones): recitation language, speed, repeat, reciter.
 * Chevron shrinks the player to a draggable pill; ✕ stops recitation.
 * All playback logic stays in context/AudioContext.jsx.
 */

import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  IconPlayerPlayFilled, IconPlayerPauseFilled, IconPlayerSkipBackFilled,
  IconPlayerSkipForwardFilled, IconAdjustmentsHorizontal, IconChevronDown,
  IconX, IconMusic, IconAlertCircle,
} from '@tabler/icons-react';
import { useAudio } from '../context/AudioContext';
import { useQari } from '../context/QariContext';
import { getSurah } from '../data/surahIndex';
import { scrollToVerse } from '../lib/scrollToVerse';
import './BottomPlayer.css';

const LANGUAGES = [
  { id: 'ar', name: 'Arabic' },
  { id: 'en', name: 'English' },
  { id: 'ur', name: 'Urdu' },
  { id: 'combine', name: 'Arabic + translation' },
];
const SPEEDS = [0.5, 0.75, 1, 1.25, 1.5, 2];
// How many times each ayah plays (context repeatMode = extra plays; 3 = loop).
const REPEATS = [
  { id: 0, name: '1×' },
  { id: 1, name: '2×' },
  { id: 2, name: '3×' },
  { id: 3, name: '∞' },
];
const REPEAT_HINT = [
  'Each ayah plays once, then the next one.',
  'Each ayah plays 2 times, then the next one.',
  'Each ayah plays 3 times, then the next one.',
  'The current ayah repeats until you press Next.',
];

function formatTime(t) {
  if (!t || !Number.isFinite(t)) return '0:00';
  const m = Math.floor(t / 60);
  const s = Math.floor(t % 60);
  return `${m}:${String(s).padStart(2, '0')}`;
}

/**
 * Phones only: hide the player while the user scrolls down (more room to
 * read), bring it back as soon as they scroll up, near the top, or at the
 * end of the page. Scrolls the app makes by itself (Go to ayah, auto-follow)
 * are ignored, so only the user's own touch / wheel / key scrolling counts.
 */
function useHideOnScroll(enabled) {
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    if (!enabled) { setHidden(false); return undefined; }
    const mq = window.matchMedia('(max-width: 768px)');
    let lastY = window.scrollY;
    let down = 0;
    let up = 0;
    let lastInput = 0;
    let frame = 0;

    const markInput = () => { lastInput = Date.now(); };
    const update = () => {
      frame = 0;
      const y = window.scrollY;
      const dy = y - lastY;
      lastY = y;
      if (!mq.matches) { setHidden(false); return; }

      const nearTop = y < 80;
      const nearEnd = window.innerHeight + y >= document.documentElement.scrollHeight - 48;
      if (nearTop || nearEnd) { down = 0; up = 0; setHidden(false); return; }
      // Momentum keeps scrolling a moment after the finger lifts.
      if (Date.now() - lastInput > 1200) return;

      if (dy > 0) {
        down += dy; up = 0;
        if (down > 24) setHidden(true);
      } else if (dy < 0) {
        up -= dy; down = 0;
        if (up > 12) setHidden(false);
      }
    };
    const onScroll = () => { if (!frame) frame = requestAnimationFrame(update); };

    const opts = { passive: true };
    window.addEventListener('scroll', onScroll, opts);
    window.addEventListener('touchstart', markInput, opts);
    window.addEventListener('touchmove', markInput, opts);
    window.addEventListener('wheel', markInput, opts);
    window.addEventListener('keydown', markInput);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('touchstart', markInput);
      window.removeEventListener('touchmove', markInput);
      window.removeEventListener('wheel', markInput);
      window.removeEventListener('keydown', markInput);
    };
  }, [enabled]);

  return hidden;
}

/** Reciter photo with a music-note fallback while it loads or if it fails. */
function ReciterArt({ reciter, className }) {
  const [loaded, setLoaded] = useState(false);
  const [failed, setFailed] = useState(false);
  useEffect(() => { setLoaded(false); setFailed(false); }, [reciter?.image]);
  return (
    <span className={`pl-art ${className || ''}`} aria-hidden="true">
      {reciter?.image && !failed && (
        <img
          src={reciter.image}
          alt=""
          style={{ opacity: loaded ? 1 : 0 }}
          onLoad={() => setLoaded(true)}
          onError={() => setFailed(true)}
        />
      )}
      {(!loaded || failed) && <IconMusic size={18} stroke={1.8} />}
    </span>
  );
}

/** Ayah progress bar with a draggable thumb. */
function Scrubber({ progress, duration, seek, id }) {
  const [dragValue, setDragValue] = useState(null);
  const value = dragValue ?? progress;
  const pct = duration ? Math.min(100, (value / duration) * 100) : 0;
  return (
    <div className="pl-scrub">
      <span className="pl-time">{formatTime(value)}</span>
      <input
        id={id}
        type="range"
        className="pl-range"
        min="0"
        max={duration || 0}
        step="0.1"
        value={value}
        style={{ '--fill': `${pct}%` }}
        aria-label="Seek within this ayah"
        aria-valuetext={`${formatTime(value)} of ${formatTime(duration)}`}
        onChange={(e) => { const v = parseFloat(e.target.value); setDragValue(v); seek(v); }}
        onPointerUp={() => setDragValue(null)}
        onKeyUp={() => setDragValue(null)}
        onBlur={() => setDragValue(null)}
      />
      <span className="pl-time">{formatTime(duration)}</span>
    </div>
  );
}

export default function BottomPlayer() {
  const {
    currentVerse, isPlaying, playlist, currentIndex, progress, duration,
    togglePlay, stop, skipNext, skipPrev, seek, isMinimized, setIsMinimized,
    repeatMode, setRepeat, playbackSpeed, setSpeed, audioLanguage, setAudioLanguage,
    audioError, retryAudio,
  } = useAudio();
  const { reciter, reciters, changeReciter, selectedReciter } = useQari();
  const navigate = useNavigate();
  const [optionsOpen, setOptionsOpen] = useState(false);
  const [optionsClosing, setOptionsClosing] = useState(false);
  const [optionsScrolled, setOptionsScrolled] = useState(false);
  const optionsRef = useRef(null);
  const optionsBtnRef = useRef(null);
  const closeTimerRef = useRef(null);

  // Close with the exit animation, then unmount (matches CSS: 200ms).
  function closeOptions() {
    if (!optionsOpen || optionsClosing) return;
    setOptionsClosing(true);
    closeTimerRef.current = window.setTimeout(() => {
      setOptionsOpen(false);
      setOptionsClosing(false);
      setOptionsScrolled(false);
    }, 200);
  }
  useEffect(() => () => window.clearTimeout(closeTimerRef.current), []);

  // Options panel: close on Esc or a click outside it.
  useEffect(() => {
    if (!optionsOpen) return undefined;
    const onKey = (e) => {
      if (e.key === 'Escape') { closeOptions(); optionsBtnRef.current?.focus(); }
    };
    const onDown = (e) => {
      if (optionsRef.current?.contains(e.target) || optionsBtnRef.current?.contains(e.target)) return;
      closeOptions();
    };
    document.addEventListener('keydown', onKey);
    document.addEventListener('mousedown', onDown);
    document.addEventListener('touchstart', onDown, { passive: true });
    optionsRef.current?.focus();
    return () => {
      document.removeEventListener('keydown', onKey);
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('touchstart', onDown);
    };
  }, [optionsOpen, optionsClosing]);

  useEffect(() => { if (!currentVerse || isMinimized) setOptionsOpen(false); }, [currentVerse, isMinimized]);

  // Never hide while the Options sheet is open or the audio has an error.
  const scrollHidden = useHideOnScroll(Boolean(currentVerse) && !isMinimized && !optionsOpen && !audioError);

  if (!currentVerse) return null;

  const surahInfo = getSurah(currentVerse.surahNumber);
  const surahName = currentVerse.surahName || surahInfo?.englishName || 'Surah';
  const ayahLabel = surahInfo
    ? `Ayah ${currentVerse.number} of ${surahInfo.versesCount}`
    : `Ayah ${currentVerse.number}`;
  const hasList = playlist.length > 0 && currentIndex >= 0;
  const listPct = hasList ? ((currentIndex + (duration ? progress / duration : 0)) / playlist.length) * 100 : 0;
  const canPrev = hasList && currentIndex > 0;
  const canNext = hasList && currentIndex < playlist.length - 1;

  // Scroll to the playing ayah on this page (Surah: verse-<n>, Juz:
  // verse-<surah>:<n>); otherwise open it on its Surah page.
  function goToAyah() {
    const el = document.getElementById(`verse-${currentVerse.surahNumber}:${currentVerse.number}`)
      || document.getElementById(`verse-${currentVerse.number}`);
    if (el) scrollToVerse(el);
    else if (surahInfo) navigate(`/surah/${surahInfo.englishName}#verse-${currentVerse.number}`);
  }

  const playLabel = isPlaying ? 'Pause' : 'Play';
  const PlayIcon = isPlaying ? IconPlayerPauseFilled : IconPlayerPlayFilled;

  /* ── Minimized: draggable pill ── */
  if (isMinimized) {
    return <MiniPill
      surahName={surahName}
      ayah={currentVerse.number}
      reciter={selectedReciter}
      isPlaying={isPlaying}
      togglePlay={togglePlay}
      skipPrev={skipPrev}
      skipNext={skipNext}
      canPrev={canPrev}
      canNext={canNext}
      expand={() => setIsMinimized(false)}
    />;
  }

  return (
    <div
      className={`pl-root${optionsOpen ? ' is-options-open' : ''}${isPlaying ? ' is-playing' : ''}${scrollHidden ? ' is-scroll-hidden' : ''}`}
      role="region"
      aria-label="Recitation player"
    >
      {/* Progress through the whole Surah / Juz */}
      {hasList && (
        <div
          className="pl-list-progress"
          role="progressbar"
          aria-label="Progress through this recitation"
          aria-valuemin={0}
          aria-valuemax={playlist.length}
          aria-valuenow={currentIndex + 1}
          aria-valuetext={`Ayah ${currentIndex + 1} of ${playlist.length} in this recitation`}
        >
          <span style={{ width: `${listPct}%` }} />
        </div>
      )}

      <div className="pl-bar">
        {/* Track info → scroll to the ayah */}
        <button type="button" className="pl-track" onClick={goToAyah} title="Go to this ayah">
          <ReciterArt reciter={selectedReciter} />
          <span className="pl-track-text">
            <span className="pl-title">{surahName} <span className="pl-dot">·</span> <span className="pl-ayah">{ayahLabel}</span></span>
            <span className="pl-sub pl-sub--reciter">{selectedReciter?.name}</span>
            <span className="pl-sub pl-sub--ayah">{ayahLabel}</span>
          </span>
        </button>

        {/* Transport + ayah time */}
        <div className="pl-center">
          <div className="pl-transport">
            <button type="button" className="pl-icon-btn" onClick={skipPrev} disabled={!canPrev} aria-label="Previous ayah" title="Previous ayah">
              <IconPlayerSkipBackFilled size={18} />
            </button>
            <button type="button" className="pl-play" onClick={togglePlay} aria-label={playLabel} title={playLabel}>
              <PlayIcon size={22} />
            </button>
            <button type="button" className="pl-icon-btn" onClick={skipNext} disabled={!canNext} aria-label="Next ayah" title="Next ayah">
              <IconPlayerSkipForwardFilled size={18} />
            </button>
          </div>
          <div className="pl-desktop-only">
            <Scrubber progress={progress} duration={duration} seek={seek} id="pl-seek" />
          </div>
        </div>

        {/* Options, minimize, close */}
        <div className="pl-actions">
          <button
            ref={optionsBtnRef}
            type="button"
            className={`pl-options-btn${optionsOpen ? ' is-open' : ''}`}
            onClick={() => (optionsOpen ? closeOptions() : setOptionsOpen(true))}
            aria-expanded={optionsOpen && !optionsClosing}
            aria-controls="pl-options"
            title="Player options"
          >
            <IconAdjustmentsHorizontal size={18} stroke={1.8} />
            <span className="pl-options-label">Options</span>
            {(repeatMode > 0 || playbackSpeed !== 1) && <span className="pl-options-dot" aria-hidden="true" />}
          </button>
          <button type="button" className="pl-icon-btn" onClick={() => setIsMinimized(true)} aria-label="Minimize player" title="Minimize">
            <IconChevronDown size={18} stroke={2} />
          </button>
          <button type="button" className="pl-icon-btn" onClick={stop} aria-label="Stop and close player" title="Close">
            <IconX size={18} stroke={2} />
          </button>
        </div>
      </div>

      {audioError && (
        <button type="button" className="pl-error" onClick={retryAudio}>
          <IconAlertCircle size={16} stroke={2} /> Couldn’t load this ayah’s audio. Tap to retry.
        </button>
      )}

      {/* Options: popover on desktop, bottom sheet on phones */}
      {optionsOpen && <div className={`pl-sheet-overlay${optionsClosing ? ' is-closing' : ''}`} aria-hidden="true" />}
      {optionsOpen && (
        <div
          ref={optionsRef}
          id="pl-options"
          className={`pl-options${optionsClosing ? ' is-closing' : ''}`}
          role="dialog"
          aria-label="Player options"
          tabIndex={-1}
        >
          <div className={`pl-options-head${optionsScrolled ? ' is-scrolled' : ''}`}>
            <span className="pl-options-title">Player options</span>
            <button type="button" className="pl-icon-btn" onClick={closeOptions} aria-label="Close options">
              <IconX size={18} stroke={2} />
            </button>
          </div>

          {/* Only this part scrolls; the header stays put */}
          <div className="pl-options-body" onScroll={(e) => setOptionsScrolled(e.currentTarget.scrollTop > 4)}>

          {/* Phones: ayah time lives here (the bar has no room for it) */}
          <div className="pl-group pl-mobile-only">
            <span className="pl-group-title">{surahName} · {ayahLabel}</span>
            <Scrubber progress={progress} duration={duration} seek={seek} id="pl-seek-sheet" />
          </div>

          <div className="pl-group" role="radiogroup" aria-labelledby="pl-lang-title">
            <span className="pl-group-title" id="pl-lang-title">Recitation language</span>
            <div className="pl-chips pl-chips--2">
              {LANGUAGES.map((l) => (
                <button key={l.id} type="button" role="radio" aria-checked={audioLanguage === l.id}
                  className={`pl-chip${audioLanguage === l.id ? ' active' : ''}`}
                  onClick={() => setAudioLanguage(l.id)}>
                  {l.name}
                </button>
              ))}
            </div>
          </div>

          <div className="pl-group" role="radiogroup" aria-labelledby="pl-speed-title">
            <span className="pl-group-title" id="pl-speed-title">Speed</span>
            <div className="pl-chips pl-chips--6">
              {SPEEDS.map((s) => (
                <button key={s} type="button" role="radio" aria-checked={playbackSpeed === s}
                  className={`pl-chip${playbackSpeed === s ? ' active' : ''}`}
                  onClick={() => setSpeed(s)}>
                  {s}×
                </button>
              ))}
            </div>
          </div>

          <div className="pl-group" role="radiogroup" aria-labelledby="pl-repeat-title">
            <span className="pl-group-title" id="pl-repeat-title">Play each ayah</span>
            <div className="pl-chips pl-chips--4">
              {REPEATS.map((r) => (
                <button key={r.id} type="button" role="radio" aria-checked={repeatMode === r.id}
                  className={`pl-chip${repeatMode === r.id ? ' active' : ''}`}
                  onClick={() => setRepeat(r.id)}>
                  {r.name}
                </button>
              ))}
            </div>
            <span className="pl-hint">{REPEAT_HINT[repeatMode]}</span>
          </div>

          <div className="pl-group" role="radiogroup" aria-labelledby="pl-reciter-title">
            <span className="pl-group-title" id="pl-reciter-title">Reciter</span>
            <div className="pl-reciters">
              {reciters.map((r) => (
                <button key={r.id} type="button" role="radio" aria-checked={reciter === r.id}
                  className={`pl-reciter${reciter === r.id ? ' active' : ''}`}
                  onClick={() => changeReciter(r.id)}>
                  <span className="pl-radio" aria-hidden="true" />
                  {r.name}
                </button>
              ))}
            </div>
            <span className="pl-hint">The new reciter starts from the next ayah.</span>
          </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ── Minimized pill (draggable) ─────────────────────────────── */
function MiniPill({ surahName, ayah, reciter, isPlaying, togglePlay, skipPrev, skipNext, canPrev, canNext, expand }) {
  const [pos, setPos] = useState(null);
  const drag = useRef({ active: false, moved: false, dx: 0, dy: 0 });
  const pillRef = useRef(null);

  function onPointerDown(e) {
    if (e.target.closest('button')) return;
    const r = pillRef.current.getBoundingClientRect();
    drag.current = { active: true, moved: false, dx: e.clientX - r.left, dy: e.clientY - r.top };
    pillRef.current.setPointerCapture?.(e.pointerId);
  }
  function onPointerMove(e) {
    if (!drag.current.active) return;
    const r = pillRef.current.getBoundingClientRect();
    const x = Math.max(8, Math.min(e.clientX - drag.current.dx, window.innerWidth - r.width - 8));
    const y = Math.max(8, Math.min(e.clientY - drag.current.dy, window.innerHeight - r.height - 8));
    if (!drag.current.moved && pos && Math.abs(x - pos.x) + Math.abs(y - pos.y) < 4) return;
    drag.current.moved = true;
    setPos({ x, y });
  }
  function onPointerUp() {
    if (!drag.current.active) return; // pointer started on a button
    const wasDrag = drag.current.moved;
    drag.current.active = false;
    if (!wasDrag) expand();
  }

  const PlayIcon = isPlaying ? IconPlayerPauseFilled : IconPlayerPlayFilled;
  return (
    <div
      ref={pillRef}
      className="pl-pill"
      style={pos ? { left: pos.x, top: pos.y, right: 'auto', bottom: 'auto' } : undefined}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      role="region"
      aria-label="Recitation player (minimized)"
    >
      <ReciterArt reciter={reciter} />
      <button type="button" className="pl-pill-text" onClick={expand} aria-label="Expand player">
        <span className="pl-pill-surah">{surahName}</span>
        <span className="pl-pill-ayah">Ayah {ayah}</span>
      </button>
      <div className="pl-pill-ctrls">
        <button type="button" className="pl-icon-btn pl-icon-btn--sm" onClick={skipPrev} disabled={!canPrev} aria-label="Previous ayah">
          <IconPlayerSkipBackFilled size={14} />
        </button>
        <button type="button" className="pl-play pl-play--sm" onClick={togglePlay} aria-label={isPlaying ? 'Pause' : 'Play'}>
          <PlayIcon size={14} />
        </button>
        <button type="button" className="pl-icon-btn pl-icon-btn--sm" onClick={skipNext} disabled={!canNext} aria-label="Next ayah">
          <IconPlayerSkipForwardFilled size={14} />
        </button>
      </div>
    </div>
  );
}
