/**
 * components/GoToVerse.jsx — "Go to verse" box for a Surah page.
 *
 * Type a verse number and press Enter (or →): the page scrolls to
 * #verse-<n>, the verse glows briefly, and the URL gets #verse-<n> so the
 * link can be shared. An out-of-range number shows the site-wide toast
 * (same as bookmark messages) and outlines the box until it is edited.
 */

import { useRef, useState } from 'react';
import { IconArrowRight } from '@tabler/icons-react';
import { useBookmarks } from '../context/BookmarkContext';
import { scrollToVerse } from '../lib/scrollToVerse';
import './GoToVerse.css';

const GLOW_MS = 2200;

export default function GoToVerse({ total, surahName }) {
  const { showToast } = useBookmarks();
  const [value, setValue] = useState('');
  const [invalid, setInvalid] = useState(false);
  const inputRef = useRef(null);

  function jump(e) {
    e.preventDefault();
    const n = parseInt(value, 10);
    if (!value.trim()) {
      inputRef.current?.focus();
      return;
    }
    if (!Number.isInteger(n) || n < 1 || n > total) {
      setInvalid(true);
      showToast(`${surahName} has ${total} verses. Enter a number from 1 to ${total}.`);
      return;
    }
    const el = document.getElementById(`verse-${n}`);
    if (!el) return;
    setInvalid(false);
    // Close the phone keyboard first so the scroll lands in the right place.
    inputRef.current?.blur();
    scrollToVerse(el);
    // Shareable URL, without triggering the router's own hash handling.
    window.history.replaceState(window.history.state, '', `#verse-${n}`);
    el.classList.remove('verse-card--jump');
    void el.offsetWidth; // restart the glow if the same verse is picked again
    el.classList.add('verse-card--jump');
    window.setTimeout(() => el.classList.remove('verse-card--jump'), GLOW_MS);
  }

  return (
    <form className="goto-verse" onSubmit={jump} role="search" aria-label="Go to verse">
      <label className="goto-verse-label text-muted" htmlFor="goto-verse-input">Verse</label>
      <div className={`goto-verse-box${invalid ? ' has-error' : ''}`}>
        <input
          ref={inputRef}
          id="goto-verse-input"
          className="goto-verse-input"
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          autoComplete="off"
          placeholder={`1–${total}`}
          value={value}
          onChange={(e) => { setValue(e.target.value.replace(/\D/g, '').slice(0, 3)); setInvalid(false); }}
          aria-invalid={invalid}
        />
        <button type="submit" className="goto-verse-btn" aria-label="Go to verse">
          <IconArrowRight size={16} stroke={2.2} />
        </button>
      </div>
    </form>
  );
}
