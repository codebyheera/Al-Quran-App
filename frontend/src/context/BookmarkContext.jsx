/**
 * context/BookmarkContext.jsx — Bookmark state management
 * Interacts with /api/bookmarks backend. Uses a persistent clientId
 * stored in localStorage to identify anonymous sessions.
 */

import { createContext, useContext, useEffect, useState } from 'react';
import api from '../lib/api';

const BookmarkContext = createContext();

// Generate or retrieve a UUID-style client ID for anonymous bookmarks
function getClientId() {
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
  const clientId = getClientId();

  // Load bookmarks on mount
  useEffect(() => {
    fetchBookmarks();
  }, []);

  /**
   * Fetch all bookmarks for this client session
   */
  async function fetchBookmarks() {
    try {
      const { data } = await api.get(`/api/bookmarks?clientId=${clientId}`);
      
      // Seed 4 random bookmarks for brand new users
      if (data.length === 0 && !localStorage.getItem('quran-bookmarks-seeded')) {
        localStorage.setItem('quran-bookmarks-seeded', 'true');
        
        // Fetch 4 random verses in parallel
        const seedPromises = Array.from({ length: 4 }).map(async () => {
          const randomNum = Math.floor(Math.random() * 6236) + 1;
          const res = await fetch(`https://api.alquran.cloud/v1/ayah/${randomNum}/editions/quran-uthmani,en.asad`);
          const verseData = await res.json();
          if (verseData && verseData.data) {
            const arabicData = verseData.data[0];
            const englishData = verseData.data[1];
            return api.post('/api/bookmarks', {
              clientId,
              surahNumber: arabicData.surah.number,
              surahName: arabicData.surah.englishName,
              verseNumber: arabicData.numberInSurah,
              arabicText: arabicData.text,
              translation: englishData.text,
            });
          }
        });
        
        await Promise.allSettled(seedPromises);
        
        // Re-fetch bookmarks after seeding completes
        const { data: seededData } = await api.get(`/api/bookmarks?clientId=${clientId}`);
        setBookmarks(seededData);
      } else {
        setBookmarks(data);
      }
    } catch (err) {
      console.error('Failed to load bookmarks:', err.message);
    } finally {
      setLoading(false);
    }
  }

  /**
   * Add a bookmark for a specific verse
   */
  async function addBookmark(verse) {
    try {
      const { data } = await api.post('/api/bookmarks', { ...verse, clientId });
      setBookmarks((prev) => [data, ...prev]);
      return { success: true };
    } catch (err) {
      if (err.response?.status === 409) return { success: false, message: 'Already bookmarked' };
      return { success: false, message: 'Failed to bookmark' };
    }
  }

  /**
   * Remove a bookmark by its MongoDB _id
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
    return bookmarks.some(
      (b) => b.surahNumber === surahNumber && b.verseNumber === verseNumber
    );
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
