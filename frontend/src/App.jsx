/**
 * App.jsx — Root component with React Router configuration
 */

import React, { Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import ScrollToTop   from './components/ScrollToTop';
import Navbar        from './components/Navbar';
import Footer        from './components/Footer';
import BottomPlayer  from './components/BottomPlayer';
import { useAudio }   from './context/AudioContext';
import { useBookmarks } from './context/BookmarkContext';

// Lazy load pages for code splitting
const Home          = React.lazy(() => import('./pages/Home'));
const SurahList     = React.lazy(() => import('./pages/SurahList'));
const JuzList       = React.lazy(() => import('./pages/JuzList'));
const SurahView     = React.lazy(() => import('./pages/SurahView'));
const JuzView       = React.lazy(() => import('./pages/JuzView'));
const BookmarksPage = React.lazy(() => import('./pages/BookmarksPage'));
const SearchPage    = React.lazy(() => import('./pages/SearchPage'));
const SupportPage   = React.lazy(() => import('./pages/SupportPage'));
const NotFound      = React.lazy(() => import('./pages/NotFound'));

export default function App() {
  const { currentVerse } = useAudio();
  const { toast } = useBookmarks();

  return (
    <div className={`app-root ${currentVerse ? 'has-player' : ''}`}>
      <ScrollToTop />
      {/* Persistent top navigation */}
      <Navbar />

      <main>
        <Suspense fallback={<div className="loading-center"><div className="spinner"></div><p>Loading...</p></div>}>
          <Routes>
            <Route path="/"            element={<Home />} />
            <Route path="/surah"       element={<SurahList />} />
            <Route path="/surah/:id"   element={<SurahView />} />
            <Route path="/juz"         element={<JuzList />} />
            <Route path="/juz/:id"     element={<JuzView />} />
            <Route path="/bookmarks"   element={<BookmarksPage />} />
            <Route path="/search"      element={<SearchPage />} />
            <Route path="/support"     element={<SupportPage />} />
            <Route path="*"            element={<NotFound />} />
          </Routes>
        </Suspense>
      </main>

      {/* Global toast notification */}
      {toast && <div className="toast">{toast}</div>}

      {/* Persistent bottom audio player */}
      <Footer />
      <BottomPlayer />
    </div>
  );
}
