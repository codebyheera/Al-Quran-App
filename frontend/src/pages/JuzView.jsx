/**
 * pages/JuzView.jsx — Full Juz reader
 * Similar to SurahView but groups verses by Surah within the Juz
 */

import { Fragment, useEffect, useState, useRef, useMemo } from 'react';
import { useParams, useNavigate, Link, useLocation } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import api from '../lib/api';
import { useBookmarks } from '../context/BookmarkContext';
import AudioDropdown from '../components/AudioDropdown';
import { useAudio } from '../context/AudioContext';
import { useQari } from '../context/QariContext';
import Breadcrumb from '../components/Breadcrumb';
import SurahIntro from '../components/SurahIntro';
import { getJuzContent } from '../data/juz-content';
import { getJuzSeo } from '../data/juzSeo';
import { useReadingTimer } from '../hooks/useReadingTimer';
import { useReadingProgress } from '../hooks/useReadingProgress';
import useArabicFontSize from '../hooks/useArabicFontSize';
import useQuranScript, { verseHasIndopak } from '../hooks/useQuranScript';
import { scrollToVerse } from '../lib/scrollToVerse';
import VerseActions from '../components/VerseActions';
import VerseToolbar from '../components/VerseToolbar';
import './JuzView.css';

export default function JuzView() {
  useReadingTimer(); // counts active time on this page toward the daily reading streak
  const { id } = useParams();
  const juzNum = parseInt(id);
  const navigate = useNavigate();
  const location = useLocation();

  const [juz, setJuz] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Powers the homepage "Continue Reading" card — tracks which ayah the
  // user is currently viewing and saves it as their last reading position.
  const readingProgressItems = useMemo(() => {
    if (!juz?.verses?.length) return [];
    return juz.verses.map((v) => ({
      elementId: `verse-${v.surahNumber}:${v.number}`,
      surahNumber: v.surahNumber,
      surahName: v.surahName,
      ayahNumber: v.number,
      url: `/surah/${v.surahNumber}#verse-${v.number}`,
    }));
  }, [juz]);
  useReadingProgress(readingProgressItems);

  const [fontSize, setArabicFontSize] = useArabicFontSize();
  const [quranScript] = useQuranScript();

  const [translationFontSize, setTranslationFontSize] = useState(() => {
    return parseFloat(localStorage.getItem('translationFontSize')) || 1.0;
  });

  // Index (in the playlist) of the verse whose "Ayah options" sheet is open
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
  const openMenu = (e, verseIndex) => {
    e.stopPropagation();
    setActiveMenu(verseIndex);
  };

  const {
    currentVerse,
    isPlaying,
    playPlaylist,
    updatePlaylist,
    togglePlay,
    stop,
    audioLanguage,
    setAudioLanguage,
    showEn,
    setShowEn,
    showUr,
    setShowUr
  } = useAudio();
  // Latest playing verse, readable inside async fetch callbacks
  const currentVerseRef = useRef(currentVerse);
  currentVerseRef.current = currentVerse;
  const { reciter } = useQari();
  const { addBookmark, removeBookmark, isBookmarked, bookmarks } = useBookmarks();
  const topRef = useRef(null);

  const prevJuzRef = useRef(juzNum);

  // Track currently playing word audio to prevent overlaps
  const wordAudioRef = useRef(null);

  useEffect(() => {
    const isJuzChange = prevJuzRef.current !== juzNum;
    prevJuzRef.current = juzNum;

    if (isJuzChange || !juz) {
      setLoading(true);
      setError(null);
      stop(); // Stop audio only on juz change
      topRef.current?.scrollIntoView({ behavior: 'smooth' });
    }

    if (wordAudioRef.current && isJuzChange) {
      wordAudioRef.current.pause();
      wordAudioRef.current = null;
    }
    
    // A reciter change on the same Juz refetches quietly (no loader, audio
    // keeps playing); only a new Juz shows the loader.
    const isReload = isJuzChange || !juz;
    api.get(`/api/juz/${juzNum}?reciter=${reciter}`)
      .then(({ data }) => {
        setJuz(data);
        setLoading(false);
        if (!isJuzChange) syncPlaylist(data, audioLanguage);
      })
      .catch(() => {
        if (isReload) setError('Failed to load Juz.');
        setLoading(false);
      });
  }, [juzNum, reciter]);

  // Recitation language: every verse already has its Arabic, English and Urdu
  // audio, so nothing is refetched — only the playing playlist is updated.
  const prevLangRef = useRef(audioLanguage);
  useEffect(() => {
    if (prevLangRef.current === audioLanguage) return;
    prevLangRef.current = audioLanguage;
    if (juz) syncPlaylist(juz, audioLanguage);
  }, [audioLanguage]);

  // Refresh the queued ayahs only while this Juz is the one playing.
  function syncPlaylist(data, lang) {
    const playing = currentVerseRef.current;
    if (!updatePlaylist || !playing) return;
    const inThisJuz = data.verses.some((v) => v.surahNumber === playing.surahNumber && v.number === playing.number);
    if (!inThisJuz) return;
    updatePlaylist(data.verses.map((v) => ({
      ...v,
      audio: lang === 'en' ? v.englishAudioUrl : lang === 'ur' ? v.urduAudioUrl : v.audioUrl,
    })));
  }

  // Auto-scroll on initial load if hash is present
  useEffect(() => {
    if (!loading && juz && location.hash) {
      const id = location.hash.replace('#', '');
      setTimeout(() => {
        const el = document.getElementById(id);
        if (el) {
          scrollToVerse(el);
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
        const verseId = `verse-${currentVerse.surahNumber}:${currentVerse.number}`;
        const el = document.getElementById(verseId);
        if (el) {
          scrollToVerse(el);
        }
      }
    }
  }, [currentVerse, juz]);



  function handleFontChange(delta) {
    setArabicFontSize(fontSize + delta);
  }

  function handleTranslationFontChange(delta) {
    setTranslationFontSize((prev) => {
      const newSize = Math.min(Math.max(parseFloat((prev + delta).toFixed(1)), 0.8), 2.0);
      localStorage.setItem('translationFontSize', newSize);
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
        audio: audioLanguage === 'en' ? v.englishAudioUrl : audioLanguage === 'ur' ? v.urduAudioUrl : v.audioUrl
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

  const toggleEn = () => setShowEn((prev) => !prev);
  const toggleUr = () => setShowUr((prev) => !prev);

  const juzSeoData = getJuzSeo(juzNum);

  if (loading) return (
    <div className="loading-center">
      <Helmet encodeSpecialCharacters={false}>
        <title>{juzSeoData.title}</title>
        <meta name="description" content={juzSeoData.description} />
        <link rel="canonical" href={`https://alquranhub.org/juz/${juzNum}`} />
      </Helmet>
      <div className="spinner" />
      <p>Loading Juz…</p>
    </div>
  );
  if (error) return (
    <div className="loading-center">
      <Helmet encodeSpecialCharacters={false}>
        <title>{juzSeoData.title}</title>
        <meta name="description" content={juzSeoData.description} />
        <link rel="canonical" href={`https://alquranhub.org/juz/${juzNum}`} />
      </Helmet>
      <p style={{ color: 'var(--error)' }}>{error}</p>
    </div>
  );

  const verses = juz.verses;

  // Pre-calculate mapped playlist for AudioPlayer
  const mappedPlaylist = verses.map(v => ({
    ...v,
    audio: audioLanguage === 'en' ? v.englishAudioUrl : audioLanguage === 'ur' ? v.urduAudioUrl : v.audioUrl
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

  const jvTitle = juzSeoData.title;
  const jvDescription = juzSeoData.description;
  const jvUrl = `https://alquranhub.org/juz/${juzNum}`;

  const webPageSchema = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "name": jvTitle,
    "url": jvUrl,
    "description": jvDescription,
    "inLanguage": "ar"
  };

  const itemListSchema = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "name": `Surahs in Juz ${juzNum}`,
    "itemListElement": groups.map((group, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "url": `https://alquranhub.org/surah/${group.surahName}`,
      "name": `Surah ${group.surahName}`
    }))
  };

  return (
    <div
      className="juz-view page-enter"
      ref={topRef}
      style={{ '--arabic-font-size': `${fontSize}rem`, '--translation-font-size': `${translationFontSize}rem` }}
    >
      <Helmet encodeSpecialCharacters={false}>
        <title>{jvTitle}</title>
        <meta name="description" content={jvDescription} />
        <link rel="canonical" href={jvUrl} />
        <meta property="og:title" content={jvTitle} />
        <meta property="og:description" content={jvDescription} />
        <meta property="og:url" content={jvUrl} />
        <meta property="og:type" content="website" />
        <script type="application/ld+json">
          {JSON.stringify(webPageSchema)}
        </script>
        <script type="application/ld+json">
          {JSON.stringify(itemListSchema)}
        </script>
      </Helmet>
      <div className="container">
        {/* ── Breadcrumb Navigation ───────────────────────── */}
        <Breadcrumb crumbs={[
          { label: 'Home', href: '/' },
          { label: 'Juz', href: '/juz' },
          { label: `Juz ${juzNum}`, href: `/juz/${juzNum}` },
        ]} />

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
            <div className="jv-font-size-row" style={{ flexWrap: 'wrap', justifyContent: 'center', gap: '0.8rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span className="jv-font-label text-muted">Arabic:</span>
                <div className="jv-font-btns">
                  <button className="btn btn-ghost" onClick={() => handleFontChange(-0.2)} disabled={fontSize <= 1.4}>-</button>
                  <span className="jv-font-val text-primary">{fontSize.toFixed(1)}</span>
                  <button className="btn btn-ghost" onClick={() => handleFontChange(0.2)} disabled={fontSize >= 4.0}>+</button>
                </div>
              </div>
              <div className="jv-font-divider"></div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span className="jv-font-label text-muted">Trans:</span>
                <div className="jv-font-btns">
                  <button className="btn btn-ghost" onClick={() => handleTranslationFontChange(-0.1)} disabled={translationFontSize <= 0.8}>-</button>
                  <span className="jv-font-val text-primary">{translationFontSize.toFixed(1)}</span>
                  <button className="btn btn-ghost" onClick={() => handleTranslationFontChange(0.1)} disabled={translationFontSize >= 2.0}>+</button>
                </div>
              </div>
            </div>
            <div className="jv-lang-row" style={{ flexWrap: 'wrap' }}>
              <AudioDropdown />
              <div className="jv-font-divider" style={{ height: '18px', opacity: 0.3, margin: '0 0.2rem' }}></div>
              <button
                className="btn btn-ghost jv-en-btn"
                onClick={toggleEn}
                title={showEn ? "Hide English" : "Show English"}
              >
                EN: <span className={showEn ? "text-primary" : "text-muted"}>{showEn ? 'On' : 'Off'}</span>
              </button>
              <button
                className="btn btn-ghost jv-ur-btn"
                onClick={toggleUr}
                title={showUr ? "Hide Urdu" : "Show Urdu"}
              >
                UR: <span className={showUr ? "text-primary" : "text-muted"}>{showUr ? 'On' : 'Off'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* ── Intro (above verses, unique editorial content for SEO) ── */}
        <SurahIntro
          intro={getJuzContent(juzNum)?.intro}
          faqs={getJuzContent(juzNum)?.faqs}
          surahName={`Juz ${juzNum}`}
          pageUrl={jvUrl}
        >

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

            {group.verses.map((verse, idx) => {
              const verseUid = `${verse.surahNumber}:${verse.number}`;
              const bookmarked = isBookmarked(verse.surahNumber, verse.number);
              // Matched by Surah + ayah, not audio URL, so it survives a language switch
              const isPlayingVerse = currentVerse?.surahNumber === verse.surahNumber && currentVerse?.number === verse.number;
              // IndoPak only when the whole verse has it; otherwise Uthmani.
              const showIndopak = quranScript === 'indopak' && verseHasIndopak(verse);

              // Find the index of this verse in the current filtered verses array
              const index = verses.indexOf(verse);

              return (
                <div
                  key={verseUid}
                  className={`verse-card jv-verse ${isPlayingVerse ? 'active-playing' : ''}`}
                  id={`verse-${verseUid}`}
                >

                  <div className="verse-card-main">
                    {/* Top bar: ayah number + Play, Bookmark, Copy, Share, More (responsive) */}
                    <VerseToolbar
                      verse={mappedPlaylist[index]}
                      playlist={mappedPlaylist}
                      index={index}
                      bookmarked={bookmarked}
                      onBookmark={handleBookmark}
                      onMore={(e) => openMenu(e, index)}
                      translationToggle={!showEn && !showUr ? {
                        shown: revealedVerses.has(verseUid),
                        onToggle: (e) => toggleVerseTranslation(e, verseUid),
                      } : null}
                    />
                    {/* Arabic text with Word-by-Word Audio */}
                    <div
                      className={`arabic verse-arabic${showIndopak ? ' arabic--indopak' : ''}`}
                      lang="ar"
                      dir="rtl"
                      data-script={showIndopak ? 'indopak' : quranScript === 'indopak' ? 'fallback' : 'uthmani'}
                    >
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

                          // The space keeps words separate in the text itself (search
                          // engines, copy-paste, screen readers); visually the flex
                          // gap does the spacing and this whitespace is not rendered.
                          return (
                            <Fragment key={word.id || word.position}>
                              <span
                                className={`quran-word${activeWordId === word.id ? ' quran-word--active' : ''}`}
                                onClick={playWordAudio}
                                title={word.translation?.text || ''}
                                style={{ cursor: word.audioUrl ? 'pointer' : 'text' }}
                              >
                                {showIndopak ? word.text_indopak : (word.text_uthmani || word.text)}
                              </span>{' '}
                            </Fragment>
                          );
                        })
                      ) : (
                        verse.arabic
                      )}
                      {/* IndoPak ayah-end marker: the font draws the ayah number
                          with its Ruku/Sajda signs. Shown exactly as received. */}
                      {showIndopak && (
                        <span className="quran-ayah-end">{verse.indopakEnd}</span>
                      )}
                    </div>

                    {/* Translations — shown if global toggle is on, OR this verse is individually revealed */}
                    {(showEn || showUr || revealedVerses.has(verseUid)) && (
                      <div className="translations-container" style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '16px' }}>
                        {(showEn || revealedVerses.has(verseUid)) && verse.translation && (
                          <p className="translation verse-translation" style={{ margin: 0, color: 'var(--accent-gold)', fontSize: 'var(--translation-font-size, 1rem)', lineHeight: '1.8' }}>
                            {verse.translation}
                          </p>
                        )}
                        {(showUr || revealedVerses.has(verseUid)) && verse.urduTranslation && (
                          <p className="translation verse-translation-ur" dir="rtl" style={{ margin: 0, fontFamily: 'var(--font-urdu)', fontStyle: 'normal', textAlign: 'right', fontSize: `calc(var(--translation-font-size, 1rem) * var(--urdu-scale, 1.6))`, lineHeight: 'var(--urdu-line-height, 2.8)', color: 'var(--accent-gold)' }}>
                            {verse.urduTranslation}
                          </p>
                        )}
                      </div>
                    )}

                  </div>
                </div>
              );
            })}
          </div>
        ))}

        </SurahIntro>

        {/* "Ayah options" — one sheet for the whole page */}
        <VerseActions
          verse={activeMenu != null ? mappedPlaylist[activeMenu] : null}
          playlist={mappedPlaylist}
          index={activeMenu ?? -1}
          bookmarked={activeMenu != null && isBookmarked(mappedPlaylist[activeMenu]?.surahNumber, mappedPlaylist[activeMenu]?.number)}
          onBookmark={handleBookmark}
          onClose={() => setActiveMenu(null)}
        />

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
