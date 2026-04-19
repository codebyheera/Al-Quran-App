/**
 * App.jsx — Root component with React Router configuration
 */

import { Routes, Route } from 'react-router-dom';
import ScrollToTop   from './components/ScrollToTop';
import Navbar        from './components/Navbar';
import Footer        from './components/Footer';
import Home          from './pages/Home';
import SurahList     from './pages/SurahList';
import JuzList       from './pages/JuzList';
import SurahView     from './pages/SurahView';
import JuzView       from './pages/JuzView';
import BookmarksPage from './pages/BookmarksPage';
import SearchPage    from './pages/SearchPage';
import SupportPage   from './pages/SupportPage';
import NotFound      from './pages/NotFound';
import BottomPlayer  from './components/BottomPlayer';
import { useAudio }   from './context/AudioContext';
import { useBookmarks } from './context/BookmarkContext';

export default function App() {
  const { currentVerse } = useAudio();
  const { toast } = useBookmarks();

  return (
    <div className={`app-root ${currentVerse ? 'has-player' : ''}`}>
      <ScrollToTop />
      {/* Persistent top navigation */}
      <Navbar />

      <main>
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
      </main>

      {/* Global toast notification */}
      {toast && <div className="toast">{toast}</div>}

      {/* Persistent bottom audio player */}
      <Footer />
      <BottomPlayer />
    </div>
  );
}
