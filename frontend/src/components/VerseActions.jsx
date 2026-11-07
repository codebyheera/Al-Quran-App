/**
 * components/VerseActions.jsx — "Ayah options" for one verse.
 *
 * Opened from the ⋮ button on a verse card (phones) or the "More" button in
 * the card footer (desktop). A bottom sheet on phones, a centered dialog on
 * desktop. Used by both SurahView and JuzView.
 *
 * Actions: play from this ayah, bookmark, copy, share, mark as last read.
 * Closes on: ✕, tapping outside, Esc, swiping the sheet down, or the
 * phone's back gesture. It never closes by itself.
 */

import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import {
  IconX, IconPlayerPlayFilled, IconPlayerPauseFilled, IconBookmark,
  IconBookmarkFilled, IconCopy, IconShare, IconEye,
} from '@tabler/icons-react';
import { useAudio } from '../context/AudioContext';
import { useBookmarks } from '../context/BookmarkContext';
import { saveLastReading } from '../lib/readingProgress';
import { copyVerse, shareVerse, verseReference } from '../lib/verseShare';
import './VerseActions.css';

const CLOSE_MS = 200; // matches the exit animation in VerseActions.css

/**
 * @param {object|null} props.verse      Mapped verse (surahNumber, surahName, number, arabic, translation, urduTranslation)
 * @param {Array}       props.playlist   The page's full playlist (for "Play from this ayah")
 * @param {number}      props.index      This verse's index in the playlist
 * @param {boolean}     props.bookmarked
 * @param {Function}    props.onBookmark Toggles the bookmark (page already has this logic)
 * @param {Function}    props.onClose
 */
export default function VerseActions({ verse, playlist, index, bookmarked, onBookmark, onClose }) {
  const { currentVerse, isPlaying, togglePlay, playPlaylist, showEn, showUr } = useAudio();
  const { showToast } = useBookmarks();
  const [closing, setClosing] = useState(false);
  const [dragY, setDragY] = useState(0);
  const panelRef = useRef(null);
  const returnFocusRef = useRef(null);
  const closeTimerRef = useRef(null);
  const pushedRef = useRef(false);
  const dragRef = useRef(null);
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  const open = Boolean(verse);

  // Opening: remember focus, lock page scroll, add a history entry so the
  // phone's back gesture closes the sheet instead of leaving the page.
  useEffect(() => {
    if (!open) return undefined;
    setClosing(false);
    setDragY(0);
    returnFocusRef.current = document.activeElement;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    panelRef.current?.focus({ preventScroll: true });

    // Keep the router's own state (idx/key) so it treats this as no move.
    window.history.pushState({ ...window.history.state, verseSheet: true }, '');
    pushedRef.current = true;
    const onPop = () => {
      pushedRef.current = false;
      finishClose();
    };
    window.addEventListener('popstate', onPop);

    return () => {
      window.removeEventListener('popstate', onPop);
      document.body.style.overflow = prevOverflow;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  useEffect(() => () => window.clearTimeout(closeTimerRef.current), []);

  function finishClose() {
    setClosing(true);
    window.clearTimeout(closeTimerRef.current);
    closeTimerRef.current = window.setTimeout(() => {
      setClosing(false);
      onCloseRef.current();
      returnFocusRef.current?.focus?.({ preventScroll: true });
    }, CLOSE_MS);
  }

  // Close from the UI: drop our history entry first (that fires popstate,
  // which runs finishClose).
  function close() {
    if (closing) return;
    if (pushedRef.current && window.history.state?.verseSheet) {
      pushedRef.current = false;
      window.history.back();
    } else {
      finishClose();
    }
  }

  function handleKeyDown(e) {
    if (e.key === 'Escape') {
      e.stopPropagation();
      close();
      return;
    }
    if (e.key !== 'Tab') return;
    const items = [...panelRef.current.querySelectorAll('button:not([disabled])')];
    if (!items.length) return;
    const first = items[0];
    const last = items[items.length - 1];
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  }

  // Swipe down on the sheet's top area to close (phones).
  function onTouchStart(e) {
    dragRef.current = { y: e.touches[0].clientY };
  }
  function onTouchMove(e) {
    if (!dragRef.current) return;
    setDragY(Math.max(0, e.touches[0].clientY - dragRef.current.y));
  }
  function onTouchEnd() {
    if (!dragRef.current) return;
    dragRef.current = null;
    if (dragY > 80) close();
    else setDragY(0);
  }

  if (!open || typeof document === 'undefined') return null;

  const isCurrent = currentVerse?.surahNumber === verse.surahNumber && currentVerse?.number === verse.number;
  const isPlayingThis = isCurrent && isPlaying;
  const reference = verseReference(verse);

  function handlePlay() {
    if (isCurrent) togglePlay();
    else if (playlist && index >= 0) playPlaylist(playlist, index);
    close();
  }

  function handleBookmark() {
    onBookmark(verse);
    close();
  }

  async function handleCopy() {
    const ok = await copyVerse(verse, { showEn, showUr });
    close();
    showToast(ok ? 'Ayah copied' : 'Could not copy');
  }

  async function handleShare() {
    const result = await shareVerse(verse);
    if (result === 'cancelled') return; // keep the sheet open
    close();
    if (result === 'copied') showToast('Link copied');
    else if (result === 'failed') showToast('Could not share');
  }

  function handleLastRead() {
    saveLastReading({
      surahNumber: verse.surahNumber,
      surahName: verse.surahName,
      ayahNumber: verse.number,
      url: `/surah/${verse.surahNumber}#verse-${verse.number}`,
    }, { force: true });
    close();
    showToast(`Saved: continue from ${reference}`);
  }

  const actions = [
    {
      key: 'play',
      icon: isPlayingThis ? <IconPlayerPauseFilled size={18} /> : <IconPlayerPlayFilled size={18} />,
      label: isPlayingThis ? 'Pause recitation' : isCurrent ? 'Resume recitation' : 'Play from this ayah',
      onClick: handlePlay,
      disabled: !verse.audio && !isCurrent,
    },
    {
      key: 'bookmark',
      icon: bookmarked ? <IconBookmarkFilled size={18} /> : <IconBookmark size={18} stroke={1.8} />,
      label: bookmarked ? 'Remove bookmark' : 'Bookmark',
      onClick: handleBookmark,
      active: bookmarked,
    },
    { key: 'copy', icon: <IconCopy size={18} stroke={1.8} />, label: 'Copy ayah', hint: 'Arabic, translation & reference', onClick: handleCopy },
    { key: 'share', icon: <IconShare size={18} stroke={1.8} />, label: 'Share', hint: 'Send a link to this ayah', onClick: handleShare },
    { key: 'last', icon: <IconEye size={18} stroke={1.8} />, label: 'Mark as last read', hint: 'Continue Reading starts here', onClick: handleLastRead },
  ];

  return createPortal(
    <div className={`va-root${closing ? ' is-closing' : ''}`}>
      <div className="va-overlay" onClick={close} aria-hidden="true" />
      <div
        ref={panelRef}
        className="va-panel"
        role="dialog"
        aria-modal="true"
        aria-labelledby="va-title"
        tabIndex={-1}
        onKeyDown={handleKeyDown}
        style={dragY ? { transform: `translateY(${dragY}px)`, transition: 'none' } : undefined}
      >
        <div
          className="va-head"
          onTouchStart={onTouchStart}
          onTouchMove={onTouchMove}
          onTouchEnd={onTouchEnd}
        >
          <span className="va-handle" aria-hidden="true" />
          <div className="va-head-row">
            <div className="va-head-text">
              <span className="va-badge" aria-hidden="true">{verse.number}</span>
              <div>
                <h2 id="va-title" className="va-title">{verse.surahName}</h2>
                <span className="va-sub">Ayah {verse.number}</span>
              </div>
            </div>
            <button type="button" className="va-close" onClick={close} aria-label="Close ayah options">
              <IconX size={20} stroke={2} />
            </button>
          </div>
        </div>

        <div className="va-list">
          {actions.map((a) => (
            <button
              key={a.key}
              type="button"
              className={`va-item${a.active ? ' is-active' : ''}`}
              onClick={a.onClick}
              disabled={a.disabled}
            >
              <span className="va-icon" aria-hidden="true">{a.icon}</span>
              <span className="va-text">
                <span className="va-label">{a.label}</span>
                {a.hint && <span className="va-hint">{a.hint}</span>}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>,
    document.body,
  );
}
