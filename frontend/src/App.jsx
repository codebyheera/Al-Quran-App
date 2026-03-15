/**
 * App.jsx — Root component with React Router configuration
 */

import { Routes, Route } from 'react-router-dom';
import Navbar        from './components/Navbar';
import Footer        from './components/Footer';
import Home          from './pages/Home';
import SurahList     from './pages/SurahList';
import JuzList       from './pages/JuzList';
import SurahView     from './pages/SurahView';
import JuzView       from './pages/JuzView';
import BookmarksPage from './pages/BookmarksPage';
import SearchPage    from './pages/SearchPage';
import BottomPlayer  from './components/BottomPlayer';
import { useAudio }   from './context/AudioContext';

export default function App() {
  const { currentVerse } = useAudio();

  return (
    <div className={`app-root ${currentVerse ? 'has-player' : ''}`}>
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
        </Routes>
      </main>

      {/* Persistent bottom audio player */}
      <Footer />
      <BottomPlayer />
    </div>
  );
}
