/**
 * pages/JuzView.jsx — Full Juz reader
 * Similar to SurahView but groups verses by Surah within the Juz
 */

import { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import AudioPlayer from '../components/AudioPlayer';
import { useBookmarks } from '../context/BookmarkContext';
import { useAudio } from '../context/AudioContext';
import './JuzView.css';

export default function JuzView() {
  const { id } = useParams();
  const juzNum = parseInt(id);
  const navigate = useNavigate();

  const [juz,     setJuz]     = useState(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(null);
  const [filter,  setFilter]  = useState('');
  const [toastMsg, setToastMsg] = useState('');
  const [fontSize, setFontSize] = useState(() => {
    return parseFloat(localStorage.getItem('arabicFontSize')) || 2.2;
  });

  const { currentVerse, isPlaying, playPlaylist, togglePlay } = useAudio();
  const { addBookmark, removeBookmark, isBookmarked, bookmarks } = useBookmarks();
  const topRef = useRef(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    setFilter('');
    topRef.current?.scrollIntoView({ behavior: 'smooth' });
    axios.get(`/api/juz/${juzNum}`)
      .then(({ data }) => { setJuz(data); setLoading(false); })
      .catch(() => { setError('Failed to load Juz.'); setLoading(false); });
  }, [juzNum]);

  // Auto-scroll when currentVerse changes
  useEffect(() => {
    if (currentVerse && juz) {
      // Check if the playing verse belongs to this juz
      const belongsToThisJuz = juz.verses.some(v => v.surahNumber === currentVerse.surahNumber && v.number === currentVerse.number);
      if (belongsToThisJuz) {
        const verseId = `verse-${currentVerse.surahNumber}-${currentVerse.number}`;
        const el = document.getElementById(verseId);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }
    }
  }, [currentVerse, juz]);

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
    if (!juz || !juz.verses.length) return;
    
    // Simplification: Check if playing this juz already
    const isThisJuzPlaying = juz.verses.some(v => v.surahNumber === currentVerse?.surahNumber && v.number === currentVerse?.number);

    if (isThisJuzPlaying) {
      togglePlay();
    } else {
      const playlistVerses = juz.verses.map(v => ({
        ...v,
        audio: v.audioUrl
      }));
      playPlaylist(playlistVerses, 0);
    }
  }

  async function handleBookmark(verse) {
    const alreadyBookmarked = isBookmarked(verse.surahNumber, verse.number);
    if (alreadyBookmarked) {
      const bm = bookmarks.find((b) => b.surahNumber === verse.surahNumber && b.verseNumber === verse.number);
      if (bm) { await removeBookmark(bm._id); showToast('Bookmark removed'); }
    } else {
      const result = await addBookmark({
        surahNumber: verse.surahNumber,
        surahName:   verse.surahName,
        verseNumber: verse.number,
        arabicText:  verse.arabic,
        translation: verse.translation,
      });
      showToast(result.success ? '🔖 Verse bookmarked!' : result.message || 'Error');
    }
  }

  if (loading) return <div className="loading-center"><div className="spinner" /><p>Loading Juz…</p></div>;
  if (error)   return <div className="loading-center"><p style={{ color: '#e74c3c' }}>{error}</p></div>;

  // Client-side filter
  const verses = filter
    ? juz.verses.filter((v) =>
        v.translation.toLowerCase().includes(filter.toLowerCase()) || v.arabic.includes(filter)
      )
    : juz.verses;

  // Group verses by surah for nicer rendering
  const groups = [];
  let current = null;
  for (const v of verses) {
    if (!current || current.surahNumber !== v.surahNumber) {
      current = { surahNumber: v.surahNumber, surahName: v.surahName, arabicName: v.arabicSurahName, verses: [] };
      groups.push(current);
    }
    current.verses.push(v);
  }

  return (
    <div 
      className="juz-view page-enter" 
      ref={topRef}
      style={{ '--arabic-font-size': `${fontSize}rem` }}
    >
      <div className="container">
        {/* Header */}
        <div className="jv-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h1>Juz {juzNum}</h1>
            <p className="text-muted">{juz.totalVerses} verses</p>
          </div>
          <button 
            className={`btn ${isPlaying && juz?.verses.some(v => v.surahNumber === currentVerse?.surahNumber && v.number === currentVerse?.number) ? 'btn-secondary' : 'btn-primary'}`}
            onClick={handlePlayAllToggle}
            style={{ padding: '0.6rem 1.5rem' }}
          >
            {isPlaying && juz?.verses.some(v => v.surahNumber === currentVerse?.surahNumber && v.number === currentVerse?.number) ? '⏸ Pause Juz' : '▶ Play Juz'}
          </button>
        </div>

        {/* Controls (Search & Font Sizing) */}
        <div className="jv-controls" style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
          <div style={{ flex: '1', position: 'relative' }}>
            <input
              className="input jv-search"
              type="text"
              placeholder="Search within this Juz…"
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
          </div>
        </div>

        {/* Surah groups */}
        {groups.map((group) => (
          <div key={group.surahNumber} className="juz-surah-group">
            <div className="juz-surah-header">
              <Link to={`/surah/${group.surahNumber}`} className="juz-surah-link">
                {group.surahNumber}. {group.surahName}
              </Link>
              <span className="arabic" style={{ fontSize: '1.2rem', color: 'var(--accent-gold)', opacity: 0.8 }}>
                {group.arabicName}
              </span>
            </div>

            {group.verses.map((verse) => {
              const bookmarked = isBookmarked(verse.surahNumber, verse.number);
              
              // We need the global index of this verse in the full 'juz.verses' array to check if it's playing
              // Since 'verses' is filtered, and 'group' is derived from 'verses', we can just find its index in the unfiltered juz.verses
              const isPlaying = currentVerse?.audio === verse.audioUrl;

              return (
                <div 
                  key={`${verse.surahNumber}-${verse.number}`} 
                  className={`verse-card jv-verse ${isPlaying ? 'active-playing' : ''}`}
                  id={`verse-${verse.surahNumber}-${verse.number}`}
                >
                  {/* Header section with Ayah number */}
                  <div className="verse-card-header">
                    <div className="verse-badge">{verse.number}</div>
                  </div>

                  {/* Arabic text */}
                  <p className="arabic verse-arabic">{verse.arabic}</p>

                  {/* English translation */}
                  <p className="translation verse-translation">{verse.translation}</p>

                  {/* Footer section with controls */}
                  <div className="verse-card-footer">
                    <AudioPlayer 
                      verse={{
                        ...verse,
                        audio: verse.audioUrl
                      }}
                    />
                    <button
                      className={`btn btn-ghost bookmark-btn ${bookmarked ? 'bookmarked' : ''}`}
                      onClick={() => handleBookmark(verse)}
                    >
                      {bookmarked ? '🔖 Bookmarked' : '🔖 Bookmark'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ))}

        {verses.length === 0 && filter && (
          <p className="text-center text-muted mt-3">No verses matched "{filter}".</p>
        )}

        {/* Prev/Next */}
        <div className="sv-nav">
          <button className="btn btn-secondary" onClick={() => navigate(`/juz/${juzNum - 1}`)} disabled={juzNum <= 1}>← Previous Juz</button>
          <Link to="/juz" className="btn btn-ghost">All Juz</Link>
          <button className="btn btn-secondary" onClick={() => navigate(`/juz/${juzNum + 1}`)} disabled={juzNum >= 30}>Next Juz →</button>
        </div>
      </div>

      {toastMsg && <div className="toast">{toastMsg}</div>}
    </div>
  );
}
