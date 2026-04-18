/**
 * pages/JuzView.jsx — Full Juz reader
 * Similar to SurahView but groups verses by Surah within the Juz
 */

import { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate, Link, useLocation } from 'react-router-dom';
import api from '../lib/api';
import AudioPlayer from '../components/AudioPlayer';
import { useBookmarks } from '../context/BookmarkContext';
import { useAudio } from '../context/AudioContext';
import { useQari } from '../context/QariContext';
import './JuzView.css';

export default function JuzView() {
  const { id } = useParams();
  const juzNum = parseInt(id);
  const navigate = useNavigate();
  const location = useLocation();

  const [juz, setJuz] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [fontSize, setFontSize] = useState(() => {
    return parseFloat(localStorage.getItem('arabicFontSize')) || 2.2;
  });

  const [showTranslation, setShowTranslation] = useState(() => {
    return localStorage.getItem('showTranslation') === 'true';
  });
  const [activeMenu, setActiveMenu] = useState(null);
  // Per-verse translation reveal (used when global showTranslation is off)
  const [revealedVerses, setRevealedVerses] = useState(new Set());
  // Track which word is currently being played for visual highlight
  const [activeWordId, setActiveWordId] = useState(null);

  const toggleVerseTranslation = (e, uid) => {
    e.stopPropagation();
    setRevealedVerses(prev => {
      const next = new Set(prev);
      if (next.has(uid)) next.delete(uid);
      else next.add(uid);
      return next;
    });
  };
  const menuTimeoutRef = useRef(null);

  const toggleMenu = (e, menuId) => {
    e.stopPropagation();
    if (activeMenu === menuId) {
      setActiveMenu(null);
      if (menuTimeoutRef.current) clearTimeout(menuTimeoutRef.current);
    } else {
      setActiveMenu(menuId);
      if (menuTimeoutRef.current) clearTimeout(menuTimeoutRef.current);
      menuTimeoutRef.current = setTimeout(() => {
        setActiveMenu(null);
      }, 2000);
    }
  };

  const handleFeatureClick = () => {
    setActiveMenu(null);
    if (menuTimeoutRef.current) clearTimeout(menuTimeoutRef.current);
  };

  const { currentVerse, isPlaying, playPlaylist, togglePlay, stop } = useAudio();
  const { reciter } = useQari();
  const { addBookmark, removeBookmark, isBookmarked, bookmarks } = useBookmarks();
  const topRef = useRef(null);

  // Track currently playing word audio to prevent overlaps
  const wordAudioRef = useRef(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    stop(); // Stop any playing audio when switching reciter or juz
    if (wordAudioRef.current) {
      wordAudioRef.current.pause();
      wordAudioRef.current = null;
    }
    topRef.current?.scrollIntoView({ behavior: 'smooth' });
    api.get(`/api/juz/${juzNum}?reciter=${reciter}`)
      .then(({ data }) => { setJuz(data); setLoading(false); })
      .catch(() => { setError('Failed to load Juz.'); setLoading(false); });
  }, [juzNum, reciter]);

  // Auto-scroll on initial load if hash is present
  useEffect(() => {
    if (!loading && juz && location.hash) {
      const id = location.hash.replace('#', '');
      setTimeout(() => {
        const el = document.getElementById(id);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'center' });
          el.classList.add('menu-open');
          setTimeout(() => el.classList.remove('menu-open'), 1500);
        }
      }, 150);
    }
  }, [loading, juz, location.hash]);

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
      if (bm) { await removeBookmark(bm._id); }
    } else {
      await addBookmark({
        surahNumber: verse.surahNumber,
        surahName: verse.surahName,
        verseNumber: verse.number,
        arabicText: verse.arabic,
        translation: verse.translation,
      });
    }
  }

  const toggleTranslation = () => {
    setShowTranslation(prev => {
      const newVal = !prev;
      localStorage.setItem('showTranslation', newVal);
      return newVal;
    });
  };

  if (loading) return <div className="loading-center"><div className="spinner" /><p>Loading Juz…</p></div>;
  if (error) return <div className="loading-center"><p style={{ color: '#e74c3c' }}>{error}</p></div>;

  const verses = juz.verses;

  // Pre-calculate mapped playlist for AudioPlayer
  const mappedPlaylist = verses.map(v => ({
    ...v,
    audio: v.audioUrl
  }));

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
        <div className="jv-header">
          <div className="jv-header-info">
            <div className="jv-title-row">
              <h1>Juz {juzNum}</h1>
            </div>
            <p className="jv-subtitle text-muted">{juz.totalVerses} verses</p>
          </div>
          <button
            className={`btn jv-play-btn ${isPlaying && juz?.verses.some(v => v.surahNumber === currentVerse?.surahNumber && v.number === currentVerse?.number) ? 'btn-secondary' : 'btn-primary'}`}
            onClick={handlePlayAllToggle}
          >
            {isPlaying && juz?.verses.some(v => v.surahNumber === currentVerse?.surahNumber && v.number === currentVerse?.number) ? '⏸ Pause' : '▶ Play'}
          </button>
        </div>

        {/* Controls (Font Sizing) */}
        <div className="jv-controls">
          <div className="jv-font-controls">
            <span className="jv-font-label text-muted">Arabic:</span>
            <div className="jv-font-btns">
              <button className="btn btn-ghost" onClick={() => handleFontChange(-0.2)} disabled={fontSize <= 1.4}>-</button>
              <span className="jv-font-val text-primary">{fontSize.toFixed(1)}</span>
              <button className="btn btn-ghost" onClick={() => handleFontChange(0.2)} disabled={fontSize >= 4.0}>+</button>
            </div>
            <div className="jv-font-divider"></div>
            <button
              className="btn btn-ghost jv-en-btn"
              onClick={toggleTranslation}
              title={showTranslation ? "Hide English" : "Show English"}
            >
              EN: <span className={showTranslation ? "text-primary" : "text-muted"}>{showTranslation ? 'On' : 'Off'}</span>
            </button>
          </div>
        </div>

        {/* Surah groups */}
        {groups.map((group) => (
          <div key={group.surahNumber} className="juz-surah-group">
            <div className="juz-surah-header">
              <Link to={`/surah/${group.surahName}`} className="juz-surah-link">
                {group.surahNumber}. {group.surahName}
              </Link>
              <span className="arabic" style={{ fontSize: '1.2rem', color: 'var(--accent-gold)', opacity: 0.8 }}>
                {group.arabicName}
              </span>
            </div>

            {group.verses.map((verse) => {
              const bookmarked = isBookmarked(verse.surahNumber, verse.number);

              // Find the index of this verse in the current filtered verses array
              const index = verses.indexOf(verse);
              const isPlaying = currentVerse?.audio === verse.audioUrl;
              const verseUid = `${verse.surahNumber}-${verse.number}`;
              const isMenuOpen = activeMenu === verseUid;

              return (
                <div
                  key={verseUid}
                  className={`verse-card jv-verse ${isPlaying ? 'active-playing' : ''} ${isMenuOpen ? 'menu-open' : ''}`}
                  id={`verse-${verseUid}`}
                >
                  <div className="verse-top-actions">
                    <button className="verse-menu-btn" onClick={(e) => toggleMenu(e, verseUid)}>
                      <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round">
                        <circle cx="12" cy="12" r="1.5"></circle>
                        <circle cx="12" cy="5" r="1.5"></circle>
                        <circle cx="12" cy="19" r="1.5"></circle>
                      </svg>
                    </button>
                    {/* Translate toggle — mobile only, visible when EN is off */}
                    {!showTranslation && (
                      <button
                        className={`verse-translate-btn ${revealedVerses.has(verseUid) ? 'active' : ''}`}
                        onClick={(e) => toggleVerseTranslation(e, verseUid)}
                        title="Show translation"
                      >
                        Translation
                      </button>
                    )}
                  </div>
                  {/* Header section with Ayah number */}
                  <div className="verse-card-side">
                    <div className="verse-badge">{verse.number}</div>
                  </div>

                  <div className="verse-card-main">
                    {/* Arabic text with Word-by-Word Audio */}
                    <div className="arabic verse-arabic" dir="rtl">
                      {verse.words && verse.words.length > 0 ? (
                        verse.words.map((word) => {
                          const playWordAudio = (e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            if (word.audioUrl) {
                              if (wordAudioRef.current) {
                                wordAudioRef.current.pause();
                                wordAudioRef.current.currentTime = 0;
                              }
                              setActiveWordId(word.id);
                              const audio = new Audio(word.audioUrl);
                              wordAudioRef.current = audio;
                              audio.play().catch(err => console.error('Word audio failed:', err));
                              audio.onended = () => setActiveWordId(null);
                            }
                          };

                          return (
                            <span
                              key={word.id || word.position}
                              className={`quran-word${activeWordId === word.id ? ' quran-word--active' : ''}`}
                              onClick={playWordAudio}
                              title={word.translation?.text || ''}
                              style={{ cursor: word.audioUrl ? 'pointer' : 'text' }}
                            >
                              {word.text_uthmani || word.text}
                            </span>
                          );
                        })
                      ) : (
                        verse.arabic
                      )}
                    </div>

                    {/* English translation — shown if global toggle is on, OR this verse is individually revealed */}
                    {(showTranslation || revealedVerses.has(verseUid)) && (
                      <p className="translation verse-translation">{verse.translation}</p>
                    )}

                    {/* Footer section with controls */}
                    <div className="verse-card-footer" onClickCapture={handleFeatureClick}>
                      <div className="verse-card-logo" style={{ display: 'none', color: 'var(--accent-gold)', fontWeight: 'bold', fontSize: '0.9rem', alignItems: 'center', gap: '4px' }}>
                        <span style={{ fontSize: '1.1rem' }}>☪</span> QApp
                      </div>
                      <AudioPlayer
                        verse={mappedPlaylist[index]}
                        fullPlaylist={mappedPlaylist}
                        index={index}
                      />
                      <button
                        className={`btn btn-ghost bookmark-btn ${bookmarked ? 'bookmarked' : ''}`}
                        onClick={() => handleBookmark(verse)}
                      >
                        {bookmarked ? '🔖 Bookmarked' : '🔖 Bookmark'}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ))}

        {/* Prev/Next */}
        <div className="sv-nav">
          <button className="btn btn-secondary" onClick={() => navigate(`/juz/${juzNum - 1}`)} disabled={juzNum <= 1}>← Previous Juz</button>
          <Link to="/juz" className="btn btn-ghost">All Juz</Link>
          <button className="btn btn-secondary" onClick={() => navigate(`/juz/${juzNum + 1}`)} disabled={juzNum >= 30}>Next Juz →</button>
        </div>
      </div>


    </div>
  );
}
