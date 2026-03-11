/**
 * pages/BookmarksPage.jsx — Lists all saved bookmarks
 * Allows navigation to the bookmarked verse and deletion
 */

import { Link } from 'react-router-dom';
import { useBookmarks } from '../context/BookmarkContext';
import './BookmarksPage.css';

export default function BookmarksPage() {
  const { bookmarks, loading, removeBookmark } = useBookmarks();

  if (loading) return <div className="loading-center"><div className="spinner" /><p>Loading bookmarks…</p></div>;

  return (
    <div className="bookmarks-page page-enter">
      <div className="container">
        {/* Header */}
        <div className="bp-header">
          <div>
            <h1>Bookmarks</h1>
            <p className="text-muted">
              {bookmarks.length === 0
                ? 'No bookmarks yet — start reading and save verses!'
                : `${bookmarks.length} saved verse${bookmarks.length !== 1 ? 's' : ''}`
              }
            </p>
          </div>
        </div>

        {/* Empty state */}
        {bookmarks.length === 0 && (
          <div className="bp-empty">
            <span className="bp-empty-icon">🔖</span>
            <h3>No bookmarks yet</h3>
            <p>While reading a Surah or Juz, press the Bookmark button to save a verse.</p>
            <Link to="/surah" className="btn btn-primary mt-2">Browse Surahs</Link>
          </div>
        )}

        {/* Bookmark list */}
        <div className="bookmark-grid">
          {bookmarks.map((b) => (
            <div key={b._id} className="bookmark-card card">
              {/* Surah / verse reference */}
              <div className="flex-between mb-1">
                <Link to={`/surah/${b.surahNumber}#verse-${b.verseNumber}`} className="bm-ref">
                  <span className="badge badge-gold">{b.surahName || `Surah ${b.surahNumber}`} — Verse {b.verseNumber}</span>
                </Link>
                <button
                  className="btn btn-ghost bm-delete"
                  onClick={() => removeBookmark(b._id)}
                  title="Remove bookmark"
                >
                  🗑
                </button>
              </div>

              {/* Arabic snippet */}
              {b.arabicText && (
                <p className="arabic bm-arabic">{b.arabicText}</p>
              )}

              {/* Translation snippet */}
              {b.translation && (
                <p className="translation bm-translation">
                  {b.translation.slice(0, 160)}{b.translation.length > 160 ? '…' : ''}
                </p>
              )}

              {/* Date saved */}
              <p className="bm-date text-muted">
                Saved {new Date(b.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
              </p>

              {/* Go-to link */}
              <Link to={`/surah/${b.surahNumber}`} className="btn btn-secondary bm-goto mt-2">
                Read Surah →
              </Link>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
