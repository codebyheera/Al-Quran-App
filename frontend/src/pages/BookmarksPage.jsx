/**
 * pages/BookmarksPage.jsx — Lists all saved bookmarks
 * Allows navigation to the bookmarked verse and deletion. Logged-in users'
 * bookmarks are synced across devices (see context/BookmarkContext.jsx).
 */

import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { IconBookmarkFilled, IconBookmarkOff, IconCloudCheck, IconCloudUp } from '@tabler/icons-react';
import { useBookmarks } from '../context/BookmarkContext';
import { useAuth } from '../context/AuthContext';
import { Helmet } from 'react-helmet-async';
import { pageSeo } from '../data/pageSeo';
import './BookmarksPage.css';

export default function BookmarksPage() {
  const { bookmarks, loading, removeBookmark, loadMissingTexts } = useBookmarks();
  const { user, configured, openLogin, status: authStatus } = useAuth();

  // Bookmarks made on another device arrive without their text, so fetch it.
  const missingText = bookmarks.some((b) => !b.arabicText && !b.translation);
  useEffect(() => {
    if (!loading && missingText) loadMissingTexts();
  }, [loading, missingText, loadMissingTexts]);

  // Header + sync banner render right away (also while loading), so the
  // page doesn't jump when the list arrives.
  return (
    <div className="bookmarks-page page-enter">
      <Helmet>
        <title>{pageSeo.bookmarks.title}</title>
        <meta name="description" content={pageSeo.bookmarks.description} />
        <link rel="canonical" href={`https://alquranhub.org${pageSeo.bookmarks.path}`} />
      </Helmet>

      <div className="container">
        {/* Header */}
        <div className="bp-header">
          <div>
            <h1>Bookmarks</h1>
            <p className="text-muted">
              {loading
                ? 'Loading your saved verses…'
                : bookmarks.length === 0
                  ? 'No bookmarks yet. Start reading and save verses!'
                  : `${bookmarks.length} saved verse${bookmarks.length !== 1 ? 's' : ''}`
              }
            </p>
          </div>
        </div>

        {/* Sync status / invite */}
        {authStatus === 'loading' ? null : user ? (
          <p className="bp-sync bp-sync-on">
            <IconCloudCheck size={17} stroke={1.9} aria-hidden="true" />
            Synced to your account and available on all your devices.
          </p>
        ) : configured && (
          <div className="bp-sync bp-sync-invite">
            <IconCloudUp size={20} stroke={1.8} aria-hidden="true" className="bp-sync-icon" />
            <span className="bp-sync-text">Login to keep your bookmarks safe and see them on every device.</span>
            <button type="button" className="btn btn-secondary bp-sync-btn" onClick={openLogin}>Login</button>
          </div>
        )}

        {loading && (
          <div className="loading-center bp-loading" role="status" aria-label="Loading bookmarks">
            <div className="spinner" />
          </div>
        )}

        {/* Empty state */}
        {!loading && bookmarks.length === 0 && (
          <div className="bp-empty">
            <span className="bp-empty-icon">🔖</span>
            <h3>No bookmarks yet</h3>
            <p>While reading a Surah or Juz, press the Bookmark button to save a verse.</p>
            <Link to="/surah" className="btn btn-primary mt-2">Browse Surahs</Link>
          </div>
        )}

        {/* Bookmark list */}
        <div className="bookmark-grid">
          {bookmarks.map((b) => {
            const label = b.surahName || `Surah ${b.surahNumber}`;
            const href = `/surah/${encodeURIComponent(b.surahName || b.surahNumber)}#verse-${b.verseNumber}`;
            const textPending = !b.arabicText && !b.translation;
            return (
              <div key={b._id} className="bookmark-card card">
                {/* Surah / verse reference */}
                <div className="flex-between mb-1">
                  <Link to={href} className="bm-ref">
                    <span className="badge badge-gold">{label} · Verse {b.verseNumber}</span>
                  </Link>
                  {/* Saved bookmark; on hover/focus it shows "bookmark off" to make
                      clear that clicking removes it. */}
                  <button
                    type="button"
                    className="btn btn-ghost bm-delete"
                    onClick={() => removeBookmark(b._id)}
                    title="Remove bookmark"
                    aria-label={`Remove bookmark: ${label} verse ${b.verseNumber}`}
                  >
                    <IconBookmarkFilled className="bm-icon-saved" size={18} aria-hidden="true" />
                    <IconBookmarkOff className="bm-icon-remove" size={18} stroke={1.8} aria-hidden="true" />
                  </button>
                </div>

                {/* Text still loading (bookmark made on another device) */}
                {textPending && (
                  <div className="bm-skeleton" aria-hidden="true">
                    <span /><span /><span />
                  </div>
                )}

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
                <Link to={href} className="btn btn-secondary bm-goto mt-2">
                  Read Surah →
                </Link>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
