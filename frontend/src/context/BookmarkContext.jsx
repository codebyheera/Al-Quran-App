/**
 * context/BookmarkContext.jsx — Bookmark state management
 * Interacts with /api/bookmarks backend. Uses a persistent userId
 * stored in localStorage to identify anonymous sessions.
 *
 * Backend schema: { user_id, post_id, created_at }
 * post_id format:  "<surahNumber>:<verseNumber>"  e.g. "2:255"
 */

import { createContext, useContext, useEffect, useState } from 'react';
import api from '../lib/api';

const BookmarkContext = createContext();

// Generate or retrieve a UUID-style user ID for anonymous bookmarks
function getUserId() {
  // Keep reading the old key so existing users' sessions are preserved
  let id = localStorage.getItem('quran-client-id');
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem('quran-client-id', id);
  }
  return id;
}

export function BookmarkProvider({ children }) {
  const [bookmarks, setBookmarks] = useState([]);
  const [loading,   setLoading]   = useState(true);
  const userId = getUserId();

  // Load bookmarks on mount
  useEffect(() => {
    fetchBookmarks();
  }, []);

  /**
   * Fetch all bookmarks for this user session
   */
  async function fetchBookmarks() {
    try {
      const { data } = await api.get(`/api/bookmarks?userId=${userId}`);
      // Normalise raw DB rows → shape the rest of the app already uses
      setBookmarks(data.map(normalise));
    } catch (err) {
      console.error('Failed to load bookmarks:', err.message);
    } finally {
      setLoading(false);
    }
  }

  /**
   * Add a bookmark for a specific verse
   * @param {Object} verse  – must have surahNumber, verseNumber, surahName,
   *                          arabicText, translation
   */
  async function addBookmark(verse) {
    try {
      const postId = makePostId(verse.surahNumber, verse.verseNumber);
      const { data } = await api.post('/api/bookmarks', {
        userId,
        postId,
        // ship extra fields as JSON metadata stored in the `meta` column
        // (if your table has it); otherwise they are ignored by the server
        // but we keep them in local state for rendering.
        surahName:   verse.surahName,
        arabicText:  verse.arabicText,
        translation: verse.translation,
      });
      setBookmarks((prev) => [normalise(data, verse), ...prev]);
      return { success: true };
    } catch (err) {
      if (err.response?.status === 409) return { success: false, message: 'Already bookmarked' };
      const backendError = err.response?.data?.error;
      if (backendError) return { success: false, message: backendError };
      return { success: false, message: 'Failed to bookmark' };
    }
  }

  /**
   * Remove a bookmark by its database UUID (id field from Supabase)
   */
  async function removeBookmark(id) {
    try {
      await api.delete(`/api/bookmarks/${id}`);
      setBookmarks((prev) => prev.filter((b) => b._id !== id));
    } catch (err) {
      console.error('Failed to remove bookmark:', err.message);
    }
  }

  /**
   * Check if a specific verse is already bookmarked
   */
  function isBookmarked(surahNumber, verseNumber) {
    const target = makePostId(surahNumber, verseNumber);
    return bookmarks.some((b) => b.postId === target);
  }

  return (
    <BookmarkContext.Provider value={{ bookmarks, loading, addBookmark, removeBookmark, isBookmarked, fetchBookmarks }}>
      {children}
    </BookmarkContext.Provider>
  );
}

export function useBookmarks() {
  return useContext(BookmarkContext);
}

// ── Helpers ───────────────────────────────────────────────────────────────────

/** Build a composite post_id from surah + verse numbers */
function makePostId(surahNumber, verseNumber) {
  return `${surahNumber}:${verseNumber}`;
}

/**
 * Normalise a raw Supabase row into the shape the rest of the app uses.
 * Display metadata (surah_name, arabic_text, translation) is read from the
 * DB row first, then falls back to the `extra` object passed from addBookmark.
 */
function normalise(row, extra = {}) {
  const [surahNumber, verseNumber] = (row.post_id || '').split(':').map(Number);
  return {
    _id:         row.id,                                        // UUID from Supabase
    postId:      row.post_id,                                   // "surahNum:verseNum"
    surahNumber: surahNumber          || extra.surahNumber  || null,
    verseNumber: verseNumber          || extra.verseNumber  || null,
    surahName:   row.surah_name       || extra.surahName    || null,
    arabicText:  row.arabic_text      || extra.arabicText   || null,
    translation: row.translation      || extra.translation  || null,
    createdAt:   row.created_at,
  };
}
