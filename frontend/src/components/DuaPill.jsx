/**
 * components/DuaPill.jsx — Floating dua button.
 *
 * A small round dua icon that always stays on screen. Tapping it opens a
 * card with the current dua (Arabic + meaning + optional personal note +
 * link to the ayah); closing the card leaves the icon in place. Visitors can
 * drag the icon anywhere — its position is remembered in localStorage.
 * A soft pulse shows until the visitor has opened the current dua once.
 * Once per day the card opens by itself 2s after arrival and closes itself
 * after 30s if the visitor doesn't interact; manual opening always works.
 * An active entry in DUA_REQUESTS (date range) replaces the pinned dua.
 * Visitors whose translation language is Urdu get the Urdu text.
 * Frontend-only — prompts come from data/duaPrompts.js, nothing is sent.
 */

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { IconPray, IconX, IconArrowRight } from '@tabler/icons-react';
import DUA_PROMPTS, { PINNED_DUA_ID, DUA_REQUESTS } from '../data/duaPrompts';
import { useAudio } from '../context/AudioContext';
import './DuaPill.css';

const POS_KEY = 'duaFabPos';      // localStorage: {x, y} of the icon after a drag
const SEEN_KEY = 'duaFabSeenId';  // localStorage: id of the dua last opened
const DAY_KEY = 'duaFabDay';      // localStorage: date + id for the rotating dua
const AUTO_KEY = 'duaAutoDay';    // localStorage: date the card last opened by itself
const AUTO_OPEN_DELAY = 2000;     // ms after arriving before the daily auto-open
const FAB = 48;                  // icon size (px) — keep in sync with CSS
const EDGE = 12;                  // min gap from the viewport edge
const DRAG_THRESHOLD = 6;         // px of movement before a press becomes a drag

function today() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}
function lsGet(key) { try { return localStorage.getItem(key); } catch { return null; } }
function lsSet(key, v) { try { localStorage.setItem(key, v); } catch {} }

// Active dua request first, then the pinned dua, otherwise one rotating dua per day.
function pickPrompt() {
  const t = today();
  const req = DUA_REQUESTS.find((r) => r.from <= t && t <= r.until);
  if (req) return { special: true, eyebrow: 'Dua Request', ...req };
  const pinned = PINNED_DUA_ID && DUA_PROMPTS.find((p) => p.id === PINNED_DUA_ID);
  if (pinned) return pinned;
  const [day, id] = (lsGet(DAY_KEY) || '').split('|');
  if (day === today()) {
    const kept = DUA_PROMPTS.find((p) => p.id === id);
    if (kept) return kept;
  }
  const pool = DUA_PROMPTS.filter((p) => p.id !== id);
  const pick = pool[Math.floor(Math.random() * pool.length)];
  lsSet(DAY_KEY, `${today()}|${pick.id}`);
  return pick;
}

// Wrap the first occurrence of `word` in <strong> (e.g. a name in the dua).
function highlight(text, word) {
  if (!text || !word) return text;
  const i = text.indexOf(word);
  if (i < 0) return text;
  return (
    <>
      {text.slice(0, i)}
      <strong>{word}</strong>
      {text.slice(i + word.length)}
    </>
  );
}

function clampPos({ x, y }) {
  const maxX = window.innerWidth - FAB - EDGE;
  const maxY = window.innerHeight - FAB - EDGE;
  return {
    x: Math.min(Math.max(EDGE, x), Math.max(EDGE, maxX)),
    y: Math.min(Math.max(EDGE, y), Math.max(EDGE, maxY)),
  };
}

function loadPos() {
  try {
    const p = JSON.parse(lsGet(POS_KEY));
    if (p && Number.isFinite(p.x) && Number.isFinite(p.y)) return clampPos(p);
  } catch {}
  return null; // default spot comes from CSS (bottom-right)
}

export default function DuaPill() {
  const [prompt] = useState(pickPrompt);
  const [pos, setPos] = useState(loadPos);
  const [open, setOpen] = useState(false);
  const [leaving, setLeaving] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [cardStyle, setCardStyle] = useState(null);
  const [seen, setSeen] = useState(() => lsGet(SEEN_KEY) === prompt?.id);
  // true only while an auto-opened card is counting down to close itself
  const [autoClose, setAutoClose] = useState(false);
  const { showUr } = useAudio();
  const ur = showUr && !!prompt?.meaningUr;

  const fabRef = useRef(null);
  const cardRef = useRef(null);
  const drag = useRef(null); // { startX, startY, originX, originY, moved }
  const autoTimer = useRef(null); // pending daily auto-open

  // Keep the icon on screen when the window is resized / rotated.
  useEffect(() => {
    const onResize = () => setPos((p) => (p ? clampPos(p) : p));
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  // Place the card next to the icon: above it when the icon is in the lower
  // half of the screen, below it otherwise; left edge clamped to the viewport.
  const placeCard = useCallback(() => {
    const fab = fabRef.current;
    const card = cardRef.current;
    if (!fab || !card) return;
    const r = fab.getBoundingClientRect();
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const w = card.offsetWidth;
    const h = card.offsetHeight;
    const left = Math.min(Math.max(EDGE, r.left + r.width / 2 - w / 2), vw - w - EDGE);
    const above = r.top + r.height / 2 > vh / 2;
    let top = above ? r.top - h - 10 : r.bottom + 10;
    top = Math.min(Math.max(EDGE, top), vh - h - EDGE);
    setCardStyle({ left, top, transformOrigin: above ? 'bottom center' : 'top center' });
  }, []);

  useLayoutEffect(() => {
    if (!open) return undefined;
    placeCard();
    window.addEventListener('resize', placeCard);
    return () => window.removeEventListener('resize', placeCard);
  }, [open, placeCard, pos, ur]);

  const close = useCallback(() => {
    setAutoClose(false);
    setLeaving(true);
    setTimeout(() => { setOpen(false); setLeaving(false); setCardStyle(null); }, 200);
  }, []);

  const openCard = useCallback(() => {
    setOpen(true);
    setSeen(true);
    if (prompt) lsSet(SEEN_KEY, prompt.id);
  }, [prompt]);

  // Open by itself once per day, 2s after the visitor arrives. It then closes
  // itself after 30s (timer bar in CSS) unless the visitor interacts with it.
  useEffect(() => {
    if (!prompt || lsGet(AUTO_KEY) === today()) return undefined;
    autoTimer.current = setTimeout(() => {
      autoTimer.current = null;
      lsSet(AUTO_KEY, today());
      openCard();
      setAutoClose(true);
    }, AUTO_OPEN_DELAY);
    return () => clearTimeout(autoTimer.current);
  }, [prompt, openCard]);

  // Visitor opened/closed it themselves before the auto-open fired: skip
  // today's auto-open, and never auto-close a card they opened.
  function toggleByHand() {
    if (autoTimer.current) {
      clearTimeout(autoTimer.current);
      autoTimer.current = null;
      lsSet(AUTO_KEY, today());
    }
    if (open) close();
    else openCard();
  }

  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => { if (e.key === 'Escape') close(); };
    const onDown = (e) => {
      if (cardRef.current?.contains(e.target) || fabRef.current?.contains(e.target)) return;
      close();
    };
    document.addEventListener('keydown', onKey);
    document.addEventListener('pointerdown', onDown);
    return () => {
      document.removeEventListener('keydown', onKey);
      document.removeEventListener('pointerdown', onDown);
    };
  }, [open, close]);

  // ── Drag (pointer events cover mouse, touch and pen) ──────────────
  function onPointerDown(e) {
    if (e.button !== 0) return;
    const r = fabRef.current.getBoundingClientRect();
    drag.current = { startX: e.clientX, startY: e.clientY, originX: r.left, originY: r.top, moved: false };
    fabRef.current.setPointerCapture(e.pointerId);
  }

  function onPointerMove(e) {
    const d = drag.current;
    if (!d) return;
    const dx = e.clientX - d.startX;
    const dy = e.clientY - d.startY;
    if (!d.moved && Math.hypot(dx, dy) < DRAG_THRESHOLD) return;
    if (!d.moved) { d.moved = true; setDragging(true); }
    setPos(clampPos({ x: d.originX + dx, y: d.originY + dy }));
  }

  function onPointerUp(e) {
    const d = drag.current;
    drag.current = null;
    if (fabRef.current?.hasPointerCapture(e.pointerId)) fabRef.current.releasePointerCapture(e.pointerId);
    if (!d) return;
    if (d.moved) {
      setDragging(false);
      setPos((p) => { if (p) lsSet(POS_KEY, JSON.stringify(p)); return p; });
    } else {
      toggleByHand();
    }
  }

  function onKeyDown(e) {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      toggleByHand();
    }
  }

  if (!prompt) return null;
  const note = ur ? prompt.noteUr : prompt.note;

  // 30s countdown bar on an auto-opened card; its CSS animation pauses on
  // hover/focus and closes the card when it finishes.
  const timer = autoClose && !leaving && (
    <span className="dua-pill-timer" aria-hidden="true" onAnimationEnd={close} />
  );

  return (
    <>
      <button
        ref={fabRef}
        type="button"
        className={`dua-fab ${pos ? 'is-placed' : ''} ${dragging ? 'is-dragging' : ''} ${!seen ? 'is-new' : ''} ${open ? 'is-open' : ''}`}
        style={pos ? { left: pos.x, top: pos.y } : undefined}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={() => { drag.current = null; setDragging(false); }}
        onKeyDown={onKeyDown}
        aria-label={ur ? 'دعا' : 'Dua of the day'}
        aria-expanded={open}
        aria-controls="dua-pill-card"
        title={ur ? 'دعا — کھولنے کے لیے ٹیپ کریں، ہٹانے کے لیے گھسیٹیں' : 'Dua — tap to open, drag to move'}
      >
        <IconPray size={22} stroke={1.7} aria-hidden="true" />
      </button>

      {open && (
        <div
          ref={cardRef}
          id="dua-pill-card"
          className={`dua-pill ${leaving ? 'is-leaving' : ''} ${ur ? 'is-ur' : ''}`}
          style={cardStyle || { visibility: 'hidden' }}
          role="dialog"
          aria-labelledby="dua-pill-title"
          onPointerDown={() => setAutoClose(false)}
        >
          {prompt.special ? (
            <div className="dua-pill-card dua-special">
              <button type="button" className="dua-pill-x dua-special-x" onClick={close} aria-label="Close">
                <IconX size={15} stroke={2} />
              </button>

              <span className="dua-special-icon" aria-hidden="true"><IconPray size={22} stroke={1.6} /></span>
              <p className="dua-special-eyebrow">{prompt.eyebrow || 'Special Request'}</p>
              <h2 className="dua-special-title" id="dua-pill-title">{prompt.title}</h2>

              <div className="dua-special-divider" aria-hidden="true"><span>۞</span></div>

              <p className="dua-special-text">{highlight(prompt.note, prompt.highlight)}</p>

              <button type="button" className="dua-special-ameen" onClick={close}>
                Ameen
              </button>
              {timer}
            </div>
          ) : (
          <div className="dua-pill-card">
            <div className="dua-pill-head">
              <span className="dua-pill-icon" aria-hidden="true"><IconPray size={16} stroke={1.8} /></span>
              <p className="dua-pill-title" id="dua-pill-title" lang={ur ? 'ur' : 'en'} dir={ur ? 'rtl' : 'ltr'}>
                {ur ? prompt.titleUr : prompt.title}
              </p>
              <button type="button" className="dua-pill-x" onClick={close} aria-label={ur ? 'بند کریں' : 'Close'}>
                <IconX size={15} stroke={2} />
              </button>
            </div>

            {prompt.arabic && (
              <p className="dua-pill-arabic" lang="ar" dir="rtl">{prompt.arabic}</p>
            )}
            {prompt.meaning && (
              <p className="dua-pill-meaning" lang={ur ? 'ur' : 'en'} dir={ur ? 'rtl' : 'ltr'}>
                {ur ? prompt.meaningUr : prompt.meaning}
              </p>
            )}

            {note && (
              <div className={`dua-pill-note ${prompt.arabic ? '' : 'is-solo'}`}>
                <span className="dua-pill-note-orn" aria-hidden="true">۞</span>
                <p lang={ur ? 'ur' : 'en'} dir={ur ? 'rtl' : 'ltr'}>{note}</p>
              </div>
            )}

            <div className={`dua-pill-foot ${prompt.surah ? '' : 'is-solo'}`}>
              {prompt.surah && (
                <Link
                  to={`/surah/${prompt.surah}#verse-${prompt.ayah}`}
                  className="dua-pill-link"
                  onClick={close}
                >
                  <span dir={ur ? 'rtl' : 'ltr'}>{ur ? prompt.surahNameUr : prompt.surahName}</span>
                  <span dir="ltr">{prompt.surah}:{prompt.ayah}</span>
                  <IconArrowRight size={13} stroke={2} aria-hidden="true" />
                </Link>
              )}
              <button type="button" className="dua-pill-ameen" onClick={close}>
                {ur ? 'آمین' : 'Ameen'}
              </button>
            </div>
            {timer}
          </div>
          )}
        </div>
      )}
    </>
  );
}
