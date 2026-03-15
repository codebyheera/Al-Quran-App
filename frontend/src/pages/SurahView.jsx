/**
 * pages/SurahView.jsx — Full Surah reader
 * Displays Arabic text, English translation, verse numbers,
 * audio player per verse, and bookmark button per verse.
 * Includes Previous/Next navigation.
 */

import { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import AudioPlayer from '../components/AudioPlayer';
import { useBookmarks } from '../context/BookmarkContext';
import { useAudio } from '../context/AudioContext';
import { useQari } from '../context/QariContext';
import './SurahView.css';

export default function SurahView() {
  const { id } = useParams();
  const surahNum = parseInt(id);
  const navigate = useNavigate();

  const [surah,   setSurah]   = useState(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(null);
  const [filter,  setFilter]  = useState('');
  const [toastMsg, setToastMsg] = useState('');
  const [fontSize, setFontSize] = useState(() => {
    return parseFloat(localStorage.getItem('arabicFontSize')) || 2.2;
  });

  const [showTranslation, setShowTranslation] = useState(() => {
    return localStorage.getItem('showTranslation') !== 'false';
  });

  const { currentVerse, isPlaying, playPlaylist, togglePlay, stop } = useAudio();
  const { reciter } = useQari();

  const { addBookmark, removeBookmark, isBookmarked, bookmarks } = useBookmarks();
  const topRef = useRef(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    setFilter('');
    stop(); // Stop any playing audio when switching reciter or surah
    topRef.current?.scrollIntoView({ behavior: 'smooth' });
    axios.get(`/api/surah/${surahNum}?reciter=${reciter}`)
      .then(({ data }) => { setSurah(data); setLoading(false); })
      .catch(() => { setError('Failed to load Surah.'); setLoading(false); });
  }, [surahNum, reciter]);

  // Auto-scroll when currentVerse changes
  useEffect(() => {
    if (currentVerse && surah) {
      // Check if the playing verse belongs to this surah
      const isThisSurah = currentVerse.surahNumber === surahNum;
      if (isThisSurah) {
        const verseId = `verse-${currentVerse.number}`;
        const el = document.getElementById(verseId);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }
    }
  }, [currentVerse, surah, surahNum]);

  // Show a toast notification for bookmark actions
  function showToast(msg) {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 2500);
  }

  function handleFontChange(delta) {
    setFontSize((prev) => {
      const newSize = Math.min(Math.max(prev + delta, 1.4), 4.0);
      localStorage.setItem('arabicFontSize', newSize);
      return newSize;
    });
  }

  function handlePlayAllToggle() {
    if (!surah || !surah.verses.length) return;
    
    // Check if we are already playing this surah's playlist
    const isCurrentSurahPlaying = currentVerse?.surahNumber === surahNum;

    if (isCurrentSurahPlaying) {
      togglePlay();
    } else {
      // Prepare verses for the global playlist
      const playlistVerses = surah.verses.map(v => ({
        ...v,
        surahNumber: surahNum,
        surahName: surah.surahName,
        audio: v.audioUrl // Map audioUrl to audio for the context
      }));
      playPlaylist(playlistVerses, 0);
    }
  }

  async function handleBookmark(verse) {
    const alreadyBookmarked = isBookmarked(surahNum, verse.number);
    if (alreadyBookmarked) {
      // Find the bookmark id and remove it
      const bm = bookmarks.find((b) => b.surahNumber === surahNum && b.verseNumber === verse.number);
      if (bm) { await removeBookmark(bm._id); showToast('Bookmark removed'); }
    } else {
      const result = await addBookmark({
        surahNumber: surahNum,
        surahName:   surah.surahName,
        verseNumber: verse.number,
        arabicText:  verse.arabic,
        translation: verse.translation,
      });
      showToast(result.success ? '🔖 Verse bookmarked!' : result.message || 'Error');
    }
  }

  const toggleTranslation = () => {
    setShowTranslation(prev => {
      const newVal = !prev;
      localStorage.setItem('showTranslation', newVal);
      return newVal;
    });
  };

  if (loading) return <div className="loading-center"><div className="spinner" /><p>Loading Surah…</p></div>;
  if (error)   return <div className="loading-center"><p style={{ color: '#e74c3c' }}>{error}</p></div>;

  // Client-side verse filter (search within surah)
  const verses = filter
    ? surah.verses.filter((v) =>
        v.arabic.includes(filter) || v.translation.toLowerCase().includes(filter.toLowerCase())
      )
    : surah.verses;

  return (
    <div 
      className="surah-view page-enter" 
      ref={topRef}
      style={{ '--arabic-font-size': `${fontSize}rem` }}
    >
      <div className="container">

        {/* ── Surah Header ────────────────────────────────── */}
        <div className="sv-header">
          <div>
            <h1>{surah.surahName}</h1>
            <p className="text-muted">{surah.nameTranslation} · {surah.revelation} · {surah.versesCount} verses</p>
          </div>
          <div className="sv-header-end">
            <div className="sv-arabic-name arabic">{surah.arabicName}</div>
            <button 
              className={`btn ${isPlaying && currentVerse?.surahNumber === surahNum ? 'btn-secondary' : 'btn-primary'} mt-2`}
              onClick={handlePlayAllToggle}
              style={{ width: '100%', justifyContent: 'center' }}
            >
              {isPlaying && currentVerse?.surahNumber === surahNum ? '⏸ Pause Surah' : '▶ Play Surah'}
            </button>
          </div>
        </div>

        {/* ── Bismillah (except surah 1 & 9) ────────────── */}
        {surahNum !== 9 && (
          <div className="bismillah arabic">
            بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
          </div>
        )}

        {/* ── Controls (Search & Font Sizing) ─────────────────── */}
        <div className="sv-controls" style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
          <div style={{ flex: '1', position: 'relative' }}>
            <input
              className="input sv-search"
              type="text"
              placeholder="Search within this Surah…"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
            />
            {filter && <span className="text-muted" style={{ position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%)', fontSize: '0.85rem' }}>{verses.length} match(es)</span>}
          </div>
          
          <div className="font-controls flex-center gap-1" style={{ background: 'var(--bg-secondary)', padding: '0.2rem 0.5rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)' }}>
            <span className="text-muted" style={{ fontSize: '0.85rem', marginRight: '0.5rem' }}>Arabic Size:</span>
            <button className="btn btn-ghost" style={{ padding: '0.2rem 0.6rem' }} onClick={() => handleFontChange(-0.2)} disabled={fontSize <= 1.4}>A-</button>
            <span className="text-primary" style={{ minWidth: '2ch', textAlign: 'center', fontSize: '0.9rem' }}>{fontSize.toFixed(1)}</span>
            <button className="btn btn-ghost" style={{ padding: '0.2rem 0.6rem' }} onClick={() => handleFontChange(0.2)} disabled={fontSize >= 4.0}>A+</button>
            <div style={{ width: '1px', height: '20px', background: 'var(--border)', margin: '0 0.5rem' }}></div>
            <button
              className="btn btn-ghost"
              style={{ padding: '0.2rem 0.6rem', fontSize: '0.85rem' }}
              onClick={toggleTranslation}
              title={showTranslation ? "Hide English Translation" : "Show English Translation"}
            >
              EN: <span className={showTranslation ? "text-primary" : "text-muted"}>{showTranslation ? 'On' : 'Off'}</span>
            </button>
          </div>
        </div>

        {/* ── Verse list ──────────────────────────────────── */}
        <div className="verse-list">
          {verses.map((verse, index) => {
            const bookmarked = isBookmarked(surahNum, verse.number);
            const isPlaying = currentVerse?.audio === verse.audioUrl;
            
            return (
              <div 
                key={verse.number} 
                className={`verse-card ${isPlaying ? 'active-playing' : ''}`} 
                id={`verse-${verse.number}`}
              >
                {/* Header section with Ayah number */}
                <div className="verse-card-side">
                  <div className="verse-badge">{verse.number}</div>
                </div>

                <div className="verse-card-main">
                  {/* Arabic text */}
                  <p className="arabic verse-arabic">{verse.arabic}</p>

                  {/* English translation */}
                  {showTranslation && (
                    <p className="translation verse-translation">{verse.translation}</p>
                  )}

                  {/* Footer section with controls */}
                  <div className="verse-card-footer">
                    <AudioPlayer
                      verse={{
                        ...verse,
                        surahNumber: surahNum,
                        surahName: surah.surahName,
                        audio: verse.audioUrl
                      }}
                    />
                    <button
                      className={`btn btn-ghost bookmark-btn ${bookmarked ? 'bookmarked' : ''}`}
                      onClick={() => handleBookmark(verse)}
                      title={bookmarked ? 'Remove bookmark' : 'Bookmark this verse'}
                    >
                      {bookmarked ? '🔖 Bookmarked' : '🔖 Bookmark'}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {verses.length === 0 && filter && (
          <p className="text-center text-muted mt-3">No verses matched "{filter}".</p>
        )}

        {/* ── Prev / Next navigation ──────────────────────── */}
        <div className="sv-nav">
          <button
            className="btn btn-secondary"
            onClick={() => navigate(`/surah/${surahNum - 1}`)}
            disabled={surahNum <= 1}
          >
            ← Previous Surah
          </button>
          <Link to="/surah" className="btn btn-ghost">All Surahs</Link>
          <button
            className="btn btn-secondary"
            onClick={() => navigate(`/surah/${surahNum + 1}`)}
            disabled={surahNum >= 114}
          >
            Next Surah →
          </button>
        </div>
      </div>

      {/* Toast notification */}
      {toastMsg && <div className="toast">{toastMsg}</div>}
    </div>
  );
}
