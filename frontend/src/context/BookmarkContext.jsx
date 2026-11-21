/**
 * context/BookmarkContext.jsx — Bookmark state management
 *
 * Two storage modes, chosen automatically:
 *   • Logged out → /api/bookmarks (backend), keyed by an anonymous per-device
 *     id in localStorage — exactly as before login existed.
 *   • Logged in  → Supabase `user_bookmarks` (RLS: own rows only), synced on
 *     every device. Only the ayah reference ("2:255") is stored in the cloud;
 *     the Arabic + translation text is kept in a local cache and, when
 *     missing (bookmark made on another device), fetched from /api/surah.
 *
 * On login, this device's anonymous bookmarks are copied into the account
 * and then removed from the anonymous table.
 *
 * Bookmark shape used by the app:
 *   { _id, postId, surahNumber, verseNumber, surahName, arabicText, translation, createdAt }
 */

import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import api from '../lib/api';
import { useAuth } from './AuthContext';
import { getSupabase } from '../lib/supabaseClient';
import { getSurah } from '../data/surahIndex';

const BookmarkContext = createContext({
  bookmarks: [],
  loading: false,
  addBookmark: async () => ({ success: false }),
  removeBookmark: async () => {},
  isBookmarked: () => false,
  fetchBookmarks: async () => {},
  loadMissingTexts: async () => {},
  toast: null,
  showToast: () => {},
});

const TEXT_CACHE_KEY = 'alqh-bm-text';      // { postId: { a: arabic, t: translation } }
const TEXT_CACHE_MAX = 400;
const MIGRATED_AT_KEY = 'alqh-bm-migrated-at'; // newest anonymous bookmark already copied
const REFRESH_MIN_GAP_MS = 30000;

function getUserId() {
  // Keep reading the old key so existing users' sessions are preserved
  let id = null;
  try { id = localStorage.getItem('quran-client-id'); } catch { /* blocked */ }
  if (!id) {
    if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
      id = crypto.randomUUID();
    } else {
      id = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        var r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
      });
    }
    try { localStorage.setItem('quran-client-id', id); } catch { /* blocked */ }
  }
  return id;
}

// ── Local text cache (so cloud rows can stay tiny) ────────────────────────────

function readTextCache() {
  try { return JSON.parse(localStorage.getItem(TEXT_CACHE_KEY)) || {}; } catch { return {}; }
}

function writeTextCache(cache) {
  try {
    const keys = Object.keys(cache);
    if (keys.length > TEXT_CACHE_MAX) keys.slice(0, keys.length - TEXT_CACHE_MAX).forEach((k) => delete cache[k]);
    localStorage.setItem(TEXT_CACHE_KEY, JSON.stringify(cache));
  } catch { /* quota — texts will be fetched again when needed */ }
}

function cacheTexts(entries) {
  const cache = readTextCache();
  let changed = false;
  for (const { postId, arabicText, translation } of entries) {
    if (!postId || (!arabicText && !translation)) continue;
    delete cache[postId]; // re-insert → most recent last
    cache[postId] = { a: arabicText || '', t: translation || '' };
    changed = true;
  }
  if (changed) writeTextCache(cache);
}

export function BookmarkProvider({ children }) {
  const { user, status: authStatus } = useAuth();
  const uid = user?.id ?? null;
  const mode = authStatus === 'loading' ? null : (uid ? 'cloud' : 'anon');

  const [bookmarks, setBookmarks] = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [toast,     setToast]     = useState(null);
  const userId = useRef(null);
  if (userId.current === null && typeof window !== 'undefined') userId.current = getUserId();

  // Latest values, for handlers that run after an await
  const bookmarksRef = useRef(bookmarks);
  bookmarksRef.current = bookmarks;
  const modeRef = useRef(mode);
  modeRef.current = mode;
  const uidRef = useRef(uid);
  uidRef.current = uid;

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
  const lastFetchRef = useRef(0);
  const textLoadsRef = useRef(new Map()); // surahNumber → in-flight promise

  /**
   * Show a message for 3 s. A new message restarts the timer, so an older
   * message's timer can't cut it short.
   */
  const showToast = useCallback((message) => {
    setToast(message);
    clearTimeout(toastTimerRef.current);
    toastTimerRef.current = setTimeout(() => setToast(null), 3000);
  }, []);

  /** Server list → state, keeping taps made while it was loading. */
  const mergeServerList = useCallback((server) => {
    setBookmarks((prev) => {
      const pending = pendingRef.current;
      const kept = server.filter((b) => pending.get(b.postId) !== 'remove');
      const serverIds = new Set(kept.map((b) => b.postId));
      const localAdds = prev.filter((b) => pending.get(b.postId) === 'add' && !serverIds.has(b.postId));
      return [...localAdds, ...kept];
    });
  }, []);

  // ── Loading ────────────────────────────────────────────────────────────────

  async function fetchAnon() {
    const { data } = await api.get(`/api/bookmarks?userId=${userId.current}`);
    return data.map((row) => normaliseAnon(row));
  }

  async function fetchCloud() {
    const supabase = await getSupabase();
    const { data, error } = await supabase
      .from('user_bookmarks')
      .select('post_id, created_at')
      .order('created_at', { ascending: false });
    if (error) throw error;
    const cache = readTextCache();
    return data.map((row) => normaliseCloud(row, cache));
  }

  /**
   * Copies this device's anonymous bookmarks into the account (once per
   * bookmark), then clears them from the anonymous table.
   */
  async function migrateAnonToCloud(uidNow) {
    let anon;
    try {
      anon = await fetchAnon();
    } catch {
      return; // backend unreachable — try again next login
    }
    let migratedAt = '';
    try { migratedAt = localStorage.getItem(MIGRATED_AT_KEY) || ''; } catch { /* blocked */ }
    const fresh = anon.filter((b) => b.postId && /^\d{1,3}:\d{1,3}$/.test(b.postId) && (b.createdAt || '') > migratedAt);
    if (!anon.length) return;

    cacheTexts(anon);
    if (fresh.length) {
      const supabase = await getSupabase();
      const { error } = await supabase
        .from('user_bookmarks')
        .upsert(
          fresh.map((b) => ({ owner: uidNow, post_id: b.postId, created_at: b.createdAt || new Date().toISOString() })),
          { onConflict: 'owner,post_id', ignoreDuplicates: true },
        );
      if (error) {
        console.error('Bookmark migration failed:', error.message);
        return; // keep the anonymous copies; retried on next login
      }
    }
    const newest = anon.reduce((max, b) => ((b.createdAt || '') > max ? b.createdAt : max), migratedAt);
    try { localStorage.setItem(MIGRATED_AT_KEY, newest); } catch { /* blocked */ }
    // Free the heavy anonymous rows (best effort — older backends lack this).
    api.post('/api/bookmarks/clear', { userId: userId.current }).catch(() => {});
  }

  const fetchBookmarks = useCallback(async () => {
    const currentMode = modeRef.current;
    if (!currentMode) return;
    lastFetchRef.current = Date.now();
    try {
      const list = currentMode === 'cloud' ? await fetchCloud() : await fetchAnon();
      if (modeRef.current !== currentMode) return; // logged in/out meanwhile
      mergeServerList(list);
    } catch (err) {
      console.error('Failed to load bookmarks:', err.message);
    } finally {
      if (modeRef.current === currentMode) setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mergeServerList]);

  // (Re)load whenever the mode or account changes.
  useEffect(() => {
    if (!mode) return undefined;
    let cancelled = false;
    setLoading(true);
    setBookmarks([]);
    pendingRef.current.clear();
    (async () => {
      if (mode === 'cloud') await migrateAnonToCloud(uid);
      if (!cancelled) await fetchBookmarks();
    })();
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, uid]);

  // Logged in: pick up bookmarks added/removed on other devices when the tab
  // comes back into view.
  useEffect(() => {
    if (mode !== 'cloud') return undefined;
    const onVisible = () => {
      if (document.visibilityState === 'visible' && Date.now() - lastFetchRef.current > REFRESH_MIN_GAP_MS) {
        fetchBookmarks();
      }
    };
    document.addEventListener('visibilitychange', onVisible);
    window.addEventListener('online', onVisible);
    return () => {
      document.removeEventListener('visibilitychange', onVisible);
      window.removeEventListener('online', onVisible);
    };
  }, [mode, fetchBookmarks]);

  /**
   * Fills in Arabic/translation for bookmarks that don't have it yet (made on
   * another device), one Surah request per Surah. Used by the Bookmarks page.
   */
  const loadMissingTexts = useCallback(async () => {
    const missing = bookmarksRef.current.filter((b) => !b.arabicText && !b.translation && b.surahNumber);
    const surahNums = [...new Set(missing.map((b) => b.surahNumber))];
    await Promise.all(surahNums.map((num) => {
      if (!textLoadsRef.current.has(num)) {
        const p = api.get(`/api/surah/${num}`)
          .then(({ data }) => {
            const wanted = new Set(missing.filter((b) => b.surahNumber === num).map((b) => b.verseNumber));
            const found = (data?.verses || [])
              .filter((v) => wanted.has(v.number))
              .map((v) => ({ postId: `${num}:${v.number}`, arabicText: v.arabic, translation: v.translation }));
            cacheTexts(found);
            const byId = new Map(found.map((f) => [f.postId, f]));
            setBookmarks((prev) => prev.map((b) => (byId.has(b.postId) ? { ...b, ...byId.get(b.postId) } : b)));
          })
          .catch((err) => console.error(`Failed to load text for Surah ${num}:`, err.message))
          .finally(() => textLoadsRef.current.delete(num));
        textLoadsRef.current.set(num, p);
      }
      return textLoadsRef.current.get(num);
    }));
  }, []);

  // ── Add / remove ─────────────────────────────────────────────────────────────

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

  async function saveRemote(postId, verse) {
    if (modeRef.current === 'cloud') {
      const supabase = await getSupabase();
      const { error } = await supabase
        .from('user_bookmarks')
        .insert({ owner: uidRef.current, post_id: postId });
      if (error && error.code !== '23505') throw error; // 23505 = already saved
      return null;
    }
    const { data } = await api.post('/api/bookmarks', {
      userId: userId.current,
      postId,
      surahName:   verse.surahName,
      arabicText:  verse.arabicText,
      translation: verse.translation,
    });
    return normaliseAnon(data, verse);
  }

  async function deleteRemote(postId) {
    if (modeRef.current === 'cloud') {
      const supabase = await getSupabase();
      const { error } = await supabase
        .from('user_bookmarks')
        .delete()
        .eq('owner', uidRef.current)
        .eq('post_id', postId);
      if (error) throw error;
      return;
    }
    await api.delete('/api/bookmarks', { data: { userId: userId.current, postId } });
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
      _id:         postId,
      postId,
      surahNumber: verse.surahNumber,
      verseNumber: verse.verseNumber,
      surahName:   verse.surahName || getSurah(verse.surahNumber)?.englishName || null,
      arabicText:  verse.arabicText || null,
      translation: verse.translation || null,
      createdAt:   new Date().toISOString(),
    };
    setBookmarks((prev) => [optimistic, ...prev.filter((b) => b.postId !== postId)]);
    cacheTexts([optimistic]);
    showToast('Bookmark added successfully');
    const version = bumpVersion(postId);
    pendingRef.current.set(postId, 'add');

    // 2. Quietly on the server
    enqueue(postId, async () => {
      try {
        const saved = await saveRemote(postId, verse);
        // Swap in the real database row (it has the real id)
        if (saved) setBookmarks((prev) => prev.map((b) => (b.postId === postId ? saved : b)));
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
        await deleteRemote(postId);
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
      loadMissingTexts,
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
 * Normalise a raw anonymous-table row into the shape the rest of the app uses.
 * Display metadata (surah_name, arabic_text, translation) is read from the
 * DB row first, then falls back to the `extra` object passed from addBookmark.
 */
function normaliseAnon(row, extra = {}) {
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

/** A `user_bookmarks` row (reference only) + cached text, if any. */
function normaliseCloud(row, cache) {
  const [surahNumber, verseNumber] = row.post_id.split(':').map(Number);
  const text = cache[row.post_id];
  return {
    _id:         row.post_id,
    postId:      row.post_id,
    surahNumber,
    verseNumber,
    surahName:   getSurah(surahNumber)?.englishName || `Surah ${surahNumber}`,
    arabicText:  text?.a || null,
    translation: text?.t || null,
    createdAt:   row.created_at,
  };
}
