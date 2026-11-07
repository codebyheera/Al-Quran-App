/**
 * components/VerseToolbar.jsx — Top bar of every verse card, all screen sizes.
 *
 *   Desktop/tablet:  [① Al-Faatiha · 1:1]   [Translation] [▶ Play] 🔖 ⧉ ↗ ⋯
 *   Phones:          [① 1:1]                [文] [▶] 🔖 ⋯   (Copy/Share live in ⋯)
 *
 * The ⋯ button opens the Ayah options sheet/dialog (VerseActions).
 * Used by SurahView and JuzView.
 */

import {
  IconPlayerPlayFilled, IconPlayerPauseFilled, IconBookmark, IconBookmarkFilled,
  IconCopy, IconShare, IconDots, IconLanguage,
} from '@tabler/icons-react';
import { useAudio } from '../context/AudioContext';
import { useBookmarks } from '../context/BookmarkContext';
import { copyVerse, shareVerse } from '../lib/verseShare';
import './VerseToolbar.css';

/**
 * @param {object}   props.verse      Mapped verse (surahNumber, surahName, number, audio, …)
 * @param {Array}    props.playlist   Page playlist
 * @param {number}   props.index      Index of this verse in the playlist
 * @param {boolean}  props.bookmarked
 * @param {Function} props.onBookmark
 * @param {Function} props.onMore     Opens the Ayah options dialog
 * @param {{shown: boolean, onToggle: Function}|null} [props.translationToggle]
 *        Per-ayah "show translation" switch, passed only when both global
 *        translations are off.
 */
export default function VerseToolbar({ verse, playlist, index, bookmarked, onBookmark, onMore, translationToggle }) {
  const { currentVerse, isPlaying, togglePlay, playPlaylist, showEn, showUr } = useAudio();
  const { showToast } = useBookmarks();
  if (!verse) return null;

  const isCurrent = currentVerse?.surahNumber === verse.surahNumber && currentVerse?.number === verse.number;
  const isPlayingThis = isCurrent && isPlaying;

  function handlePlay() {
    if (isCurrent) togglePlay();
    else if (playlist && index >= 0) playPlaylist(playlist, index);
  }

  async function handleCopy() {
    const ok = await copyVerse(verse, { showEn, showUr });
    showToast(ok ? 'Ayah copied' : 'Could not copy');
  }

  async function handleShare() {
    const result = await shareVerse(verse);
    if (result === 'copied') showToast('Link copied');
    else if (result === 'failed') showToast('Could not share');
  }

  const playLabel = isPlayingThis ? 'Pause' : isCurrent ? 'Resume' : 'Play';

  return (
    <div className="vt-bar">
      <div className="vt-ref">
        <span className="vt-num" aria-hidden="true">{verse.number}</span>
        <span className="vt-ref-text">
          <span className="vt-ref-name">{verse.surahName} <span className="vt-dot">·</span> </span>
          {verse.surahNumber}:{verse.number}
        </span>
      </div>

      <div className="vt-actions">
        {translationToggle && (
          <button
            type="button"
            className={`vt-translate${translationToggle.shown ? ' is-on' : ''}`}
            onClick={translationToggle.onToggle}
            aria-pressed={translationToggle.shown}
            aria-label={translationToggle.shown ? 'Hide translation' : 'Show translation'}
          >
            <IconLanguage size={15} stroke={1.8} />
            <span className="vt-label">Translation</span>
          </button>
        )}

        <button
          type="button"
          className={`vt-play${isPlayingThis ? ' is-playing' : ''}`}
          onClick={handlePlay}
          disabled={!verse.audio && !isCurrent}
          aria-label={`${playLabel} ayah ${verse.number}`}
        >
          {isPlayingThis ? (
            <>
              <span className="vt-eq" aria-hidden="true"><span /><span /><span /></span>
              <IconPlayerPauseFilled size={14} />
            </>
          ) : (
            <IconPlayerPlayFilled size={14} />
          )}
          <span className="vt-label">{playLabel}</span>
        </button>

        <button
          type="button"
          className={`vt-icon${bookmarked ? ' is-on' : ''}`}
          onClick={() => onBookmark(verse)}
          aria-label={bookmarked ? 'Remove bookmark' : 'Bookmark this ayah'}
          aria-pressed={bookmarked}
          data-tip={bookmarked ? 'Remove bookmark' : 'Bookmark'}
        >
          {bookmarked ? <IconBookmarkFilled size={17} /> : <IconBookmark size={17} stroke={1.8} />}
        </button>
        <button type="button" className="vt-icon vt-wide-only" onClick={handleCopy} aria-label="Copy ayah" data-tip="Copy">
          <IconCopy size={17} stroke={1.8} />
        </button>
        <button type="button" className="vt-icon vt-wide-only" onClick={handleShare} aria-label="Share ayah" data-tip="Share">
          <IconShare size={17} stroke={1.8} />
        </button>
        <button
          type="button"
          className="vt-icon"
          onClick={onMore}
          aria-label={`More options for ayah ${verse.number}`}
          aria-haspopup="dialog"
          data-tip="More"
        >
          <IconDots size={17} stroke={2} />
        </button>
      </div>
    </div>
  );
}
