/**
 * components/DuaPill.jsx — Once-a-day "Make dua for…" popup.
 *
 * Shows one Qur'anic dua (Arabic + meaning + link to the ayah) a single
 * time per day, 20s after the visitor arrives. Timed through the shared
 * popup queue (lib/popupQueue.js) so it never overlaps another popup.
 * Visitors whose translation language is Urdu get the Urdu title/meaning. Frontend-only —
 * prompts come from data/duaPrompts.js, nothing is sent anywhere.
 *
 * Not shown on Surah/Juz reading pages, so recitation isn't interrupted.
 */

import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { IconPray, IconX, IconArrowRight } from '@tabler/icons-react';
import DUA_PROMPTS, { PINNED_DUA_ID } from '../data/duaPrompts';
import { usePopupTurn } from '../lib/popupQueue';
import { useAudio } from '../context/AudioContext';
import './DuaPill.css';

const SHOWN_KEY = 'duaPopupShownDate'; // localStorage: local date it last appeared
const LAST_KEY = 'duaPopupLastId';
const SHOW_AFTER_MS = 20 * 1000;       // first visit of the day: show after 20s     // localStorage: avoid repeating yesterday's dua
const READING_PAGE = /^\/(surah|juz)\/[^/]+/;

function today() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}
function lsGet(key) { try { return localStorage.getItem(key); } catch { return null; } }
function lsSet(key, v) { try { localStorage.setItem(key, v); } catch {} }

function pickPrompt() {
  const pinned = PINNED_DUA_ID && DUA_PROMPTS.find((p) => p.id === PINNED_DUA_ID);
  if (pinned) return pinned;
  const last = lsGet(LAST_KEY);
  const pool = DUA_PROMPTS.filter((p) => p.id !== last);
  return pool[Math.floor(Math.random() * pool.length)];
}

export default function DuaPill() {
  const { pathname } = useLocation();
  const onReadingPage = READING_PAGE.test(pathname);
  const [shownToday] = useState(() => lsGet(SHOWN_KEY) === today());
  const [prompt] = useState(pickPrompt);
  const [leaving, setLeaving] = useState(false);
  const { showUr } = useAudio();
  const ur = showUr && !!prompt?.meaningUr;

  const [visible, done] = usePopupTurn('dua', !shownToday && !onReadingPage, { afterMs: SHOW_AFTER_MS });

  // Count it as shown the moment it appears — once per day, even if the
  // visitor navigates away without closing it.
  useEffect(() => {
    if (!visible) return;
    lsSet(SHOWN_KEY, today());
    lsSet(LAST_KEY, prompt.id);
  }, [visible, prompt.id]);

  function close() {
    setLeaving(true);
    setTimeout(done, 220); // let the exit animation play
  }

  useEffect(() => {
    if (!visible) return undefined;
    const onKey = (e) => { if (e.key === 'Escape') close(); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [visible]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!visible || !prompt) return null;

  return (
    <aside
      className={`dua-pill ${leaving ? 'is-leaving' : ''} ${ur ? 'is-ur' : ''}`}
      role="dialog"
      aria-labelledby="dua-pill-title"
    >
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

        <p className="dua-pill-arabic" lang="ar" dir="rtl">{prompt.arabic}</p>
        <p className="dua-pill-meaning" lang={ur ? 'ur' : 'en'} dir={ur ? 'rtl' : 'ltr'}>
          {ur ? prompt.meaningUr : prompt.meaning}
        </p>

        <div className="dua-pill-foot">
          <Link
            to={`/surah/${prompt.surah}#verse-${prompt.ayah}`}
            className="dua-pill-link"
            onClick={close}
          >
            <span dir={ur ? 'rtl' : 'ltr'}>{ur ? prompt.surahNameUr : prompt.surahName}</span>
            <span dir="ltr">{prompt.surah}:{prompt.ayah}</span>
            <IconArrowRight size={13} stroke={2} aria-hidden="true" />
          </Link>
          <button type="button" className="dua-pill-ameen" onClick={close}>
            {ur ? 'آمین' : 'Ameen'}
          </button>
        </div>
      </div>
    </aside>
  );
}
