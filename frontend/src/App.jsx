
import { lazy, Suspense, useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import ScrollToTop from './components/ScrollToTop';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import { useAudio } from './context/AudioContext';
import { useBookmarks } from './context/BookmarkContext';
import { pageSeo } from './data/pageSeo';

// ── Lazy load heavy global components ────────────────────────────────────────
const BottomPlayer        = lazy(() => import('./components/BottomPlayer'));
const SupportPopup        = lazy(() => import('./components/SupportPopup'));
const NotificationBanner  = lazy(() => import('./components/NotificationBanner'));

// ── Home is eagerly loaded (critical first paint) ────────────────────────────
import Home from './pages/Home';

// ── Lazy load all other pages ─────────────────────────────────────────────────
const SurahList = lazy(() => import('./pages/SurahList'));
const JuzList = lazy(() => import('./pages/JuzList'));
const SurahView = lazy(() => import('./pages/SurahView'));
const JuzView = lazy(() => import('./pages/JuzView'));
const BookmarksPage  = lazy(() => import('./pages/BookmarksPage'));
const TasbihPage     = lazy(() => import('./pages/TasbihPage'));
const SearchPage = lazy(() => import('./pages/SearchPage'));
const SupportPage = lazy(() => import('./pages/SupportPage'));
const BlogArchive = lazy(() => import('./pages/BlogArchive'));
const BlogPost = lazy(() => import('./pages/BlogPost'));
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
      {/* Site-wide defaults — overridden per-page by each page's own <Helmet> */}
      <Helmet>
        <title>{pageSeo.home.title}</title>
        <meta name="description" content={pageSeo.home.description} />
        <meta name="keywords" content={pageSeo.home.keywords} />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={`https://alquranhub.org${pageSeo.home.path}`} />
        <meta property="og:title" content={pageSeo.home.title} />
        <meta property="og:description" content={pageSeo.home.description} />
      </Helmet>
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
            <Route path="/tasbih" element={<TasbihPage />} />
            <Route path="/search" element={<SearchPage />} />
            <Route path="/support" element={<SupportPage />} />
            <Route path="/blog" element={<BlogArchive />} />
            <Route path="/blog/:slug" element={<BlogPost />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </main>

      {/* Global toast notification */}
      {toast && <div className="toast">{toast}</div>}

      {/* Persistent bottom audio player */}
      <Footer />
      <Suspense fallback={null}>
        <BottomPlayer />
      </Suspense>

      {/* Global Support Popup */}
      <Suspense fallback={null}>
        <SupportPopup />
      </Suspense>

      {/* Push notification permission banner */}
      <Suspense fallback={null}>
        <NotificationBanner />
      </Suspense>
    </div>
  );
}