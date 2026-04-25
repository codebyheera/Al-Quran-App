
import { lazy, Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import ScrollToTop from './components/ScrollToTop';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import BottomPlayer from './components/BottomPlayer';
import { useAudio } from './context/AudioContext';
import { useBookmarks } from './context/BookmarkContext';

// ── Lazy load all pages ──────────────────────────────────────────────────────
const Home = lazy(() => import('./pages/Home'));
const SurahList = lazy(() => import('./pages/SurahList'));
const JuzList = lazy(() => import('./pages/JuzList'));
const SurahView = lazy(() => import('./pages/SurahView'));
const JuzView = lazy(() => import('./pages/JuzView'));
const BookmarksPage = lazy(() => import('./pages/BookmarksPage'));
const SearchPage = lazy(() => import('./pages/SearchPage'));
const SupportPage = lazy(() => import('./pages/SupportPage'));
const NotFound = lazy(() => import('./pages/NotFound'));

// ── Lightweight loader ───────────────────────────────────────────────────────
const PageLoader = () => (
  <div style={{
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100vh',
    background: '#0b1622',
    color: '#C9A84C',
    fontSize: '1.2rem',
  }}>
    Loading...
  </div>
);

export default function App() {
  const { currentVerse } = useAudio();
  const { toast } = useBookmarks();

  return (
    <div className={`app-root ${currentVerse ? 'has-player' : ''}`}>
      <ScrollToTop />
      {/* Persistent top navigation */}
      <Navbar />

      <main>
        {/* Suspense wraps only the routes — Navbar/Footer load instantly */}
        <Suspense fallback={<PageLoader />}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/surah" element={<SurahList />} />
            <Route path="/surah/:id" element={<SurahView />} />
            <Route path="/juz" element={<JuzList />} />
            <Route path="/juz/:id" element={<JuzView />} />
            <Route path="/bookmarks" element={<BookmarksPage />} />
            <Route path="/search" element={<SearchPage />} />
            <Route path="/support" element={<SupportPage />} />
            <Route path="*" element={<NotFound />} />
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