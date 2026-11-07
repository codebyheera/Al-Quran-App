/**
 * context/BookmarkContext.jsx — Bookmark state management
 * Interacts with /api/bookmarks backend. Uses a persistent userId
 * stored in localStorage to identify anonymous sessions.
 *
 * Backend schema: { user_id, post_id, created_at }
 * post_id format:  "<surahNumber>:<verseNumber>"  e.g. "2:255"
 */

import { createContext, useContext, useEffect, useRef, useState } from 'react';
import api from '../lib/api';

const BookmarkContext = createContext();

function getUserId() {
  // Keep reading the old key so existing users' sessions are preserved
  let id = localStorage.getItem('quran-client-id');
  if (!id) {
    if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
      id = crypto.randomUUID();
    } else {
      id = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        var r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
      });
    }
    localStorage.setItem('quran-client-id', id);
  }
  return id;
}

export function BookmarkProvider({ children }) {
  const [bookmarks, setBookmarks] = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [toast,     setToast]     = useState(null);
  const userId = getUserId();

  // Load bookmarks on mount
  useEffect(() => {
    fetchBookmarks();
  }, []);

  // Latest bookmark list, for handlers that run after an await
  const bookmarksRef = useRef(bookmarks);
  bookmarksRef.current = bookmarks;

  // Per-ayah bookkeeping for instant (optimistic) saves:
  //   queues:  postId → promise chain, so add/remove requests for the same
  //            ayah reach the server in the order the user tapped
  //   pending: postId → the user's latest choice ('add' | 'remove') while a
  //            request is in flight; also lets a slow initial load keep it
  //   version: postId → bumped on every tap; a failed request only rolls
  //            back if the user hasn't tapped again since
  const queuesRef = useRef(new Map());
  const pendingRef = useRef(new Map());
  const versionRef = useRef(new Map());
  const toastTimerRef = useRef(null);

  /**
   * Show a message for 3 s. A new message restarts the timer, so an older
   * message's timer can't cut it short.
   */
  function showToast(message) {
    setToast(message);
    clearTimeout(toastTimerRef.current);
    toastTimerRef.current = setTimeout(() => setToast(null), 3000);
  }

  /**
   * Fetch all bookmarks for this user session
   */
  async function fetchBookmarks() {
    try {
      const { data } = await api.get(`/api/bookmarks?userId=${userId}`);
      // Normalise raw DB rows → shape the rest of the app already uses.
      // Taps made while this was loading win over the server's older list.
      setBookmarks((prev) => {
        const pending = pendingRef.current;
        const server = data.map((row) => normalise(row)).filter((b) => pending.get(b.postId) !== 'remove');
        const serverIds = new Set(server.map((b) => b.postId));
        const localAdds = prev.filter((b) => pending.get(b.postId) === 'add' && !serverIds.has(b.postId));
        return [...localAdds, ...server];
      });
    } catch (err) {
      console.error('Failed to load bookmarks:', err.message);
    } finally {
      setLoading(false);
    }
  }

  /** Runs `task` after any earlier request for the same ayah has finished. */
  function enqueue(postId, task) {
    const prev = queuesRef.current.get(postId) || Promise.resolve();
    const next = prev.catch(() => {}).then(task);
    queuesRef.current.set(postId, next);
    next.finally(() => {
      if (queuesRef.current.get(postId) === next) queuesRef.current.delete(postId);
    });
    return next;
  }

  function bumpVersion(postId) {
    const v = (versionRef.current.get(postId) || 0) + 1;
    versionRef.current.set(postId, v);
    return v;
  }

  /**
   * Add a bookmark for a specific verse. Shows as saved immediately; the
   * server save runs in the background and is undone if it fails.
   * @param {Object} verse  – must have surahNumber, verseNumber, surahName,
   *                          arabicText, translation
   */
  async function addBookmark(verse) {
    const postId = makePostId(verse.surahNumber, verse.verseNumber);
    if (bookmarksRef.current.some((b) => b.postId === postId)) {
      return { success: true };
    }

    // 1. Instantly on screen
    const optimistic = {
      _id:         `local-${postId}`,
      postId,
      surahNumber: verse.surahNumber,
      verseNumber: verse.verseNumber,
      surahName:   verse.surahName || null,
      arabicText:  verse.arabicText || null,
      translation: verse.translation || null,
      createdAt:   new Date().toISOString(),
    };
    setBookmarks((prev) => [optimistic, ...prev.filter((b) => b.postId !== postId)]);
    showToast('Bookmark added successfully');
    const version = bumpVersion(postId);
    pendingRef.current.set(postId, 'add');

    // 2. Quietly on the server
    enqueue(postId, async () => {
      try {
        const { data } = await api.post('/api/bookmarks', {
          userId,
          postId,
          surahName:   verse.surahName,
          arabicText:  verse.arabicText,
          translation: verse.translation,
        });
        // Swap in the real database row (it has the real id)
        setBookmarks((prev) => prev.map((b) => (b.postId === postId ? normalise(data, verse) : b)));
      } catch (err) {
        // Already saved on the server — that's what the user wanted.
        if (err.response?.status === 409) return;
        console.error('Failed to save bookmark:', err.message);
        if (versionRef.current.get(postId) === version) {
          setBookmarks((prev) => prev.filter((b) => b.postId !== postId));
          showToast("Couldn't save bookmark. Please try again.");
        }
      } finally {
        if (versionRef.current.get(postId) === version) pendingRef.current.delete(postId);
      }
    });

    return { success: true };
  }

  /**
   * Remove a bookmark (by its id from the bookmark list). Disappears
   * immediately; the server delete runs in the background (by user + ayah,
   * so it works even before the save was confirmed) and is undone if it fails.
   */
  async function removeBookmark(id) {
    const removed = bookmarksRef.current.find((b) => b._id === id);
    if (!removed) return;
    const { postId } = removed;

    // 1. Instantly on screen
    setBookmarks((prev) => prev.filter((b) => b.postId !== postId));
    showToast('Bookmark removed successfully');
    const version = bumpVersion(postId);
    pendingRef.current.set(postId, 'remove');

    // 2. Quietly on the server
    enqueue(postId, async () => {
      try {
        await api.delete('/api/bookmarks', { data: { userId, postId } });
      } catch (err) {
        // Nothing to delete on the server — already gone, which is the goal.
        if (err.response?.status === 404) return;
        console.error('Failed to remove bookmark:', err.message);
        if (versionRef.current.get(postId) === version) {
          setBookmarks((prev) => (prev.some((b) => b.postId === postId) ? prev : [removed, ...prev]));
          showToast("Couldn't remove bookmark. Please try again.");
        }
      } finally {
        if (versionRef.current.get(postId) === version) pendingRef.current.delete(postId);
      }
    });
  }

  /**
   * Check if a specific verse is already bookmarked
   */
  function isBookmarked(surahNumber, verseNumber) {
    const target = makePostId(surahNumber, verseNumber);
    return bookmarks.some((b) => b.postId === target);
  }

  return (
    <BookmarkContext.Provider value={{
      bookmarks,
      loading,
      addBookmark,
      removeBookmark,
      isBookmarked,
      fetchBookmarks,
      toast,
      showToast
    }}>
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
