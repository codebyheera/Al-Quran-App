/**
 * pages/SurahView.jsx — Full Surah reader
 * Displays Arabic text, English translation, verse numbers,
 * audio player per verse, and bookmark button per verse.
 * Includes Previous/Next navigation.
 */

import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate, Link, useLocation } from "react-router-dom";
import api from "../lib/api";
import AudioPlayer from "../components/AudioPlayer";
import { useBookmarks } from "../context/BookmarkContext";
import AudioDropdown from "../components/AudioDropdown";
import { useAudio } from "../context/AudioContext";
import { useQari } from "../context/QariContext";
import { queuePrefetch } from "../lib/audioCache";
import { Helmet } from "react-helmet-async";
import Breadcrumb from "../components/Breadcrumb";
import SurahFaqSection from "../components/SurahFaqSection";
import { getSurahFaqs, getSurahFaqSchema } from "../data/surahFaqs";
import { getSurahSeo } from "../data/surahSeo";
import SurahIntro from "../components/SurahIntro";
import { getSurahContent } from "../data/surah-content";
import { useReadingTimer } from "../hooks/useReadingTimer";
import "./SurahView.css";

export default function SurahView() {
  useReadingTimer(); // counts active time on this page toward the daily reading streak
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [surah, setSurah] = useState(() => {
    const activeReciter = (typeof localStorage !== "undefined" && localStorage.getItem('selectedReciter')) || 'alafasy';
    const checkMatch = (data) => {
      const isIdMatch = String(data.surahNumber) === id || data.surahName.toLowerCase() === id.toLowerCase();
      const isReciterMatch = (data.preloadedReciter || 'alafasy') === activeReciter;
      return isIdMatch && isReciterMatch;
    };
    if (typeof window !== "undefined" && window.__PRELOADED_SURAH_DATA__) {
      const data = window.__PRELOADED_SURAH_DATA__;
      if (checkMatch(data)) return data;
    }
    if (typeof document !== "undefined") {
      const scriptEl = document.getElementById("preloaded-surah-data");
      if (scriptEl) {
        try {
          const data = JSON.parse(scriptEl.textContent);
          if (checkMatch(data)) return data;
        } catch (e) {
          console.error("Error parsing preloaded surah data", e);
        }
      }
    }
    return null;
  });
  const [loading, setLoading] = useState(!surah);
  const [error, setError] = useState(null);

  // We'll use the ID from the URL for the API call,
  // and use surah.surahNumber for numeric logic once loaded.
  const surahNum = surah?.surahNumber || parseInt(id) || null;

  const [fontSize, setFontSize] = useState(() => {
    return parseFloat(localStorage.getItem("arabicFontSize")) || 2.2;
  });

  const [translationFontSize, setTranslationFontSize] = useState(() => {
    return parseFloat(localStorage.getItem("translationFontSize")) || 1.0;
  });

  const [activeMenu, setActiveMenu] = useState(null);
  // Per-verse translation reveal (used when global showTranslation is off)
  const [revealedVerses, setRevealedVerses] = useState(new Set());
  // Track which word is currently being played for visual highlight
  const [activeWordId, setActiveWordId] = useState(null);

  const toggleVerseTranslation = (e, verseNumber) => {
    e.stopPropagation();
    setRevealedVerses((prev) => {
      const next = new Set(prev);
      if (next.has(verseNumber)) next.delete(verseNumber);
      else next.add(verseNumber);
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
  const { reciter } = useQari();

  const { addBookmark, removeBookmark, isBookmarked, bookmarks } =
    useBookmarks();
  const topRef = useRef(null);

  // Ref to track the previous ID to differentiate between ID change vs Reciter change
  const prevIdRef = useRef(id);

  // Track currently playing word audio to prevent overlaps
  const wordAudioRef = useRef(null);

  const isInitialMount = useRef(true);

  useEffect(() => {
    const isIdChange = prevIdRef.current !== id;
    prevIdRef.current = id;

    const activeReciter = reciter || 'alafasy';
    const isPreloadedMatch = surah && 
      (String(surah.surahNumber) === id || surah.surahName.toLowerCase() === id.toLowerCase()) &&
      (surah.preloadedReciter || 'alafasy') === activeReciter;

    if (isInitialMount.current) {
      isInitialMount.current = false;
      if (isPreloadedMatch) {
        // If we currently have matching preloaded data on initial mount, skip the API call.
        return;
      }
    }

    setLoading(true);
    setError(null);
    stop(); // Stop any playing audio when switching surah
    if (isIdChange) {
      topRef.current?.scrollIntoView({ behavior: "smooth" });
    }

    if (wordAudioRef.current && isIdChange) {
      wordAudioRef.current.pause();
      wordAudioRef.current = null;
    }

    const fetchWithRetry = async (url, retries = 3, delay = 1000) => {
      for (let i = 0; i < retries; i++) {
        try {
          return await api.get(url);
        } catch (err) {
          if (i === retries - 1) throw err;
          await new Promise((resolve) => setTimeout(resolve, delay * Math.pow(2, i)));
        }
      }
    };

    fetchWithRetry(`/api/surah/${id}?reciter=${reciter}`)
      .then(({ data }) => {
        setSurah(data);
        setLoading(false);
        if (isIdChange && !location.hash) {
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }

        // Update background playlist if currently playing
        if (!isIdChange && updatePlaylist) {
          const mappedVerses = data.verses.map((v) => ({
            ...v,
            surahNumber: data.surahNumber,
            surahName: data.surahName,
            audio: audioLanguage === 'en' ? v.englishAudioUrl : audioLanguage === 'ur' ? v.urduAudioUrl : v.audioUrl,
          }));
          updatePlaylist(mappedVerses);
        }
      })
      .catch((err) => {
        console.error("Failed to load Surah:", err);
        setError("Failed to load Surah.");
        setLoading(false);
      });
  }, [id, reciter, audioLanguage]);

  // Auto-scroll on initial load if hash is present
  useEffect(() => {
    if (!loading && surah && location.hash) {
      const id = location.hash.replace("#", "");
      setTimeout(() => {
        const el = document.getElementById(id);
        if (el) {
          el.scrollIntoView({ behavior: "smooth", block: "start" });
          // Add a temporary highlight effect
          el.classList.add("menu-open");
          setTimeout(() => el.classList.remove("menu-open"), 1500);
        }
      }, 150);
    }
  }, [loading, surah, location.hash]);

  // As soon as the Surah loads, quietly start downloading the first few
  // ayahs in the background — so by the time the user taps Play (either the
  // per-ayah button or the header "Play Surah" button), audio is already
  // cached and starts instantly instead of paying the CDN round-trip.
  useEffect(() => {
    if (!surah?.verses?.length) return;
    const lookahead = surah.verses.slice(0, 4).map((v) => {
      if (audioLanguage === "en") return v.englishAudioUrl || v.audioUrl;
      if (audioLanguage === "ur") return v.urduAudioUrl || v.audioUrl;
      return v.audioUrl;
    });
    queuePrefetch(lookahead);
  }, [surah, audioLanguage]);

  // Auto-scroll when currentVerse changes
  useEffect(() => {
    if (currentVerse && surah) {
      // Check if the playing verse belongs to this surah
      const isThisSurah = currentVerse.surahNumber === surahNum;
      if (isThisSurah) {
        const verseId = `verse-${currentVerse.number}`;
        const el = document.getElementById(verseId);
        if (el) {
          el.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      }
    }
  }, [currentVerse, surah, surahNum]);

  function handleFontChange(delta) {
    setFontSize((prev) => {
      const newSize = Math.min(Math.max(prev + delta, 1.4), 4.0);
      localStorage.setItem("arabicFontSize", newSize);
      return newSize;
    });
  }

  function handleTranslationFontChange(delta) {
    setTranslationFontSize((prev) => {
      const newSize = Math.min(Math.max(parseFloat((prev + delta).toFixed(1)), 0.8), 2.0);
      localStorage.setItem("translationFontSize", newSize);
      return newSize;
    });
  }

  function handlePlayAllToggle() {
    if (!surah || !surah.verses.length) return;

    // Check if we are already playing this surah's playlist
    const isCurrentSurahPlaying =
      currentVerse?.surahNumber === surahNum && !currentVerse.isHQ;

    if (isCurrentSurahPlaying) {
      togglePlay();
    } else {
      // Reuse the same playlist array already built for the per-ayah buttons
      // (mappedPlaylist below) instead of rebuilding it — keeps this button
      // exactly as cheap to click as an individual ayah's play button.
      playPlaylist(mappedPlaylist, 0);
    }
  }

  async function handleBookmark(verse) {
    const alreadyBookmarked = isBookmarked(surahNum, verse.number);
    if (alreadyBookmarked) {
      // Find the bookmark id and remove it
      const bm = bookmarks.find(
        (b) => b.surahNumber === surahNum && b.verseNumber === verse.number,
      );
      if (bm) {
        await removeBookmark(bm._id);
      }
    } else {
      await addBookmark({
        surahNumber: surahNum,
        surahName: surah.surahName,
        verseNumber: verse.number,
        arabicText: verse.arabic,
        translation: verse.translation,
      });
    }
  }

  const toggleEn = () => {
    setShowEn((prev) => {
      const newVal = !prev;
      localStorage.setItem("showEn", newVal);
      if (newVal) {
        setShowUr(false);
        localStorage.setItem("showUr", false);
      }
      return newVal;
    });
  };

  const toggleUr = () => {
    setShowUr((prev) => {
      const newVal = !prev;
      localStorage.setItem("showUr", newVal);
      if (newVal) {
        setShowEn(false);
        localStorage.setItem("showEn", false);
      }
      return newVal;
    });
  };

  if (loading)
    return (
      <div className="loading-center">
        <Helmet encodeSpecialCharacters={false}>
          <title>{`Surah ${id} – Al-Quran Hub`}</title>
          <meta name="description" content={`Read and listen to Surah ${id} of the Holy Quran online with Arabic text, English translation, and audio recitation on Al-Quran Hub.`} />
          <link rel="canonical" href={`https://alquranhub.org/surah/${id}`} />
        </Helmet>
        <div className="spinner" />
        <p>Loading Surah…</p>
      </div>
    );
  if (error)
    return (
      <div className="loading-center">
        <Helmet encodeSpecialCharacters={false}>
          <title>{`Surah ${id} – Al-Quran Hub`}</title>
          <meta name="description" content={`Read and listen to Surah ${id} of the Holy Quran online on Al-Quran Hub.`} />
          <link rel="canonical" href={`https://alquranhub.org/surah/${id}`} />
        </Helmet>
        <p style={{ color: "#e74c3c" }}>{error}</p>
      </div>
    );

  const verses = surah.verses;

  // Pre-calculate mapped playlist for AudioPlayer
  const mappedPlaylist = verses.map(v => ({
    ...v,
    surahNumber: surahNum,
    surahName: surah.surahName,
    audio: audioLanguage === 'en' ? v.englishAudioUrl : audioLanguage === 'ur' ? v.urduAudioUrl : v.audioUrl
  }));
  const faqItems = getSurahFaqs(surahNum);

  const surahSeoData = surah ? getSurahSeo(surahNum, surah) : null;
  const pageTitle = surahSeoData ? surahSeoData.title : "Al-Quran Hub";
  const pageDescription = surahSeoData
    ? surahSeoData.description
    : "Read and listen to the Holy Quran online.";

  const faqSchema = getSurahFaqSchema({
    surahNumber: surahNum,
    pageUrl: `https://alquranhub.org/surah/${id}`,
    pageTitle,
  });

  const surahContentData = getSurahContent(surah.surahName);

  return (
    <div
      className="surah-view page-enter"
      ref={topRef}
      style={{ "--arabic-font-size": `${fontSize}rem`, "--translation-font-size": `${translationFontSize}rem` }}
    >
      {surah && (() => {
        const cleanTitle = pageTitle.replace(/&amp;/g, '&');
        const cleanDescription = pageDescription.replace(/&amp;/g, '&');

        const articleSchema = {
          "@context": "https://schema.org",
          "@type": "Article",
          "headline": cleanTitle,
          "description": cleanDescription,
          "url": `https://alquranhub.org/surah/${id}`,
          "inLanguage": "ar",
          "mainEntityOfPage": `https://alquranhub.org/surah/${id}`,
          "articleSection": `Surah ${surahNum}`,
          "image": "https://alquranhub.org/og-image.png",
          "author": {
            "@type": "Organization",
            "name": "Al-Quran Hub",
            "url": "https://alquranhub.org"
          }
        };

        const webPageSchema = {
          "@context": "https://schema.org",
          "@type": "WebPage",
          "name": cleanTitle,
          "url": `https://alquranhub.org/surah/${id}`,
          "description": cleanDescription,
          "inLanguage": "ar"
        };

        return (
        <Helmet encodeSpecialCharacters={false}>
          <title>{cleanTitle}</title>
          <meta name="description" content={cleanDescription} />
          <link rel="canonical" href={`https://alquranhub.org/surah/${id}`} />
          <meta property="og:title" content={cleanTitle} />
          <meta property="og:description" content={cleanDescription} />
          <meta property="og:url" content={`https://alquranhub.org/surah/${id}`} />
          <meta property="og:type" content="article" />
          <script type="application/ld+json">
            {JSON.stringify(articleSchema)}
          </script>
          <script type="application/ld+json">
            {JSON.stringify(webPageSchema)}
          </script>
          {faqSchema && (
            <script type="application/ld+json">
              {JSON.stringify(faqSchema)}
            </script>
          )}
        </Helmet>
        );
      })()}
      <div className="container">
        {/* ── Breadcrumb Navigation ───────────────────────── */}
        <Breadcrumb crumbs={[
          { label: 'Home', href: '/' },
          { label: 'Surahs', href: '/surah' },
          { label: surah?.surahName || `Surah ${id}`, href: `/surah/${id}` },
        ]} />

        {/* ── Surah Header ────────────────────────────────── */}
        <div className="sv-header">
          <div className="sv-header-info">
            <div className="sv-title-row">
              <h1>{surah.surahName}</h1>
              <div className="sv-arabic-name arabic" lang="ar" dir="rtl">{surah.arabicName}</div>
            </div>
            <p className="sv-subtitle text-muted">
              {surah.nameTranslation} · {surah.revelation} · {surah.versesCount}{" "}
              verses
            </p>
          </div>
          <div className="sv-header-actions">
            <button
              className={`btn sv-play-btn ${isPlaying && currentVerse?.surahNumber === surahNum && !currentVerse.isHQ ? "btn-secondary" : "btn-primary"}`}
              onClick={handlePlayAllToggle}
            >
              {isPlaying &&
              currentVerse?.surahNumber === surahNum &&
              !currentVerse.isHQ
                ? "⏸ Pause"
                : "▶ Play"}
            </button>
          </div>
        </div>

        {/* ── Bismillah (except surah 1 & 9) ────────────── */}
        {surahNum !== 1 && surahNum !== 9 && (
          <div className="bismillah arabic" lang="ar" dir="rtl">
            بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
          </div>
        )}

        {/* ── Controls (Font Sizing) ─────────────────── */}
        <div className="sv-controls">
          <div className="sv-font-controls">
            <div className="sv-font-size-row" style={{ flexWrap: 'wrap', justifyContent: 'center', gap: '0.8rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span className="sv-font-label text-muted">Arabic:</span>
                <div className="sv-font-btns">
                  <button
                    className="btn btn-ghost"
                    onClick={() => handleFontChange(-0.2)}
                    disabled={fontSize <= 1.4}
                  >
                    -
                  </button>
                  <span className="sv-font-val text-primary">
                    {fontSize.toFixed(1)}
                  </span>
                  <button
                    className="btn btn-ghost"
                    onClick={() => handleFontChange(0.2)}
                    disabled={fontSize >= 4.0}
                  >
                    +
                  </button>
                </div>
              </div>
              <div className="sv-font-divider" style={{ height: '18px', opacity: 0.3, margin: '0' }}></div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span className="sv-font-label text-muted">Trans:</span>
                <div className="sv-font-btns">
                  <button
                    className="btn btn-ghost"
                    onClick={() => handleTranslationFontChange(-0.1)}
                    disabled={translationFontSize <= 0.8}
                  >
                    -
                  </button>
                  <span className="sv-font-val text-primary">
                    {translationFontSize.toFixed(1)}
                  </span>
                  <button
                    className="btn btn-ghost"
                    onClick={() => handleTranslationFontChange(0.1)}
                    disabled={translationFontSize >= 2.0}
                  >
                    +
                  </button>
                </div>
              </div>
            </div>
            <div className="sv-lang-row" style={{ flexWrap: 'wrap' }}>
              <AudioDropdown />
              <div className="sv-font-divider" style={{ height: '18px', opacity: 0.3, margin: '0 0.2rem' }}></div>
              <button
                className="btn btn-ghost sv-en-btn"
                onClick={toggleEn}
                title={showEn ? "Hide English" : "Show English"}
              >
                EN:{" "}
                <span className={showEn ? "text-primary" : "text-muted"}>
                  {showEn ? "On" : "Off"}
                </span>
              </button>
              <button
                className="btn btn-ghost sv-ur-btn"
                onClick={toggleUr}
                title={showUr ? "Hide Urdu" : "Show Urdu"}
              >
                UR:{" "}
                <span className={showUr ? "text-primary" : "text-muted"}>
                  {showUr ? "On" : "Off"}
                </span>
              </button>
            </div>
          </div>
        </div>

        {/* ── Intro (above) + FAQ (below) around the verse list ── */}
        <SurahIntro
          intro={surahContentData?.intro}
          faqs={surahContentData?.faqs}
          surahName={surah.surahName}
          pageUrl={`https://alquranhub.org/surah/${id}`}
        >
        {/* ── Verse list ──────────────────────────────────── */}
        <div className="verse-list">
          {verses.map((verse, index) => {
            const bookmarked = isBookmarked(surahNum, verse.number);
            const verseAudio = audioLanguage === 'en' ? verse.englishAudioUrl : audioLanguage === 'ur' ? verse.urduAudioUrl : verse.audioUrl;
            const isPlayingVerse = currentVerse?.audio === verseAudio;
            const isMenuOpen = activeMenu === verse.number;

            return (
              <div
                key={verse.number}
                className={`verse-card ${isPlayingVerse ? "active-playing" : ""} ${isMenuOpen ? "menu-open" : ""}`}
                id={`verse-${verse.number}`}
                onClick={() => {
                  // Close menu if clicking outside
                  if (isMenuOpen) setActiveMenu(null);
                }}
              >
                <div className="verse-top-actions">
                  <button
                    className="verse-menu-btn"
                    onClick={(e) => toggleMenu(e, verse.number)}
                  >
                    <svg
                      viewBox="0 0 24 24"
                      width="20"
                      height="20"
                      stroke="currentColor"
                      strokeWidth="2"
                      fill="none"
                      strokeLinecap="round"
                    >
                      <circle cx="12" cy="12" r="1.5"></circle>
                      <circle cx="12" cy="5" r="1.5"></circle>
                      <circle cx="12" cy="19" r="1.5"></circle>
                    </svg>
                  </button>
                  {/* Translate toggle — mobile only, visible when both translations are off */}
                  {(!showEn && !showUr) && (
                    <button
                      className={`verse-translate-btn ${revealedVerses.has(verse.number) ? "active" : ""}`}
                      onClick={(e) => toggleVerseTranslation(e, verse.number)}
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
                  <div className="arabic verse-arabic" lang="ar" dir="rtl">
                    {verse.words && verse.words.length > 0
                      ? verse.words.map((word) => {
                          // Play individual audio for this word
                          const playWordAudio = (e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            if (word.audioUrl) {
                              // Stop any currently playing word audio
                              if (wordAudioRef.current) {
                                wordAudioRef.current.pause();
                                wordAudioRef.current.currentTime = 0;
                              }
                              setActiveWordId(word.id);
                              const audio = new Audio(word.audioUrl);
                              wordAudioRef.current = audio;
                              audio
                                .play()
                                .catch((err) =>
                                  console.error("Word audio failed:", err),
                                );
                              audio.onended = () => setActiveWordId(null);
                            }
                          };

                          return (
                            <span
                              key={word.id || word.position}
                              className={`quran-word${activeWordId === word.id ? " quran-word--active" : ""}`}
                              onClick={playWordAudio}
                              title={word.translation?.text || ""}
                              style={{
                                cursor: word.audioUrl ? "pointer" : "text",
                              }}
                            >
                              {word.text_uthmani || word.text}
                            </span>
                          );
                        })
                      : // Fallback if words aren't loaded or available
                        verse.arabic}
                  </div>

                  {/* Translations — shown if global toggle is on, OR this verse is individually revealed */}
                  {(showEn || showUr || revealedVerses.has(verse.number)) && (
                    <div className="translations-container" style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '16px' }}>
                      {(showEn || revealedVerses.has(verse.number)) && verse.translation && (
                        <p className="translation verse-translation" lang="en" style={{ margin: 0, color: 'var(--accent-gold)', fontSize: 'var(--translation-font-size, 1rem)', lineHeight: '1.8' }}>
                          {verse.translation}
                        </p>
                      )}
                      {(showUr || revealedVerses.has(verse.number)) && verse.urduTranslation && (
                        <p className="translation verse-translation-ur" lang="ur" dir="rtl" style={{ margin: 0, fontFamily: '"Gulzar", serif', fontStyle: 'normal', textAlign: 'right', fontSize: `calc(var(--translation-font-size, 1rem) * 1.6)`, lineHeight: '2.8', color: 'var(--accent-gold)' }}>
                          {verse.urduTranslation}
                        </p>
                      )}
                    </div>
                  )}

                  {/* Footer section with controls */}
                  <div
                    className="verse-card-footer"
                    onClickCapture={handleFeatureClick}
                  >
                    <div
                      className="verse-card-logo"
                      style={{
                        display: "none",
                        color: "var(--accent-gold)",
                        fontWeight: "bold",
                        fontSize: "0.9rem",
                        alignItems: "center",
                        gap: "4px",
                      }}
                    >
                      <span style={{ fontSize: "1.1rem" }}>☪</span> QApp
                    </div>
                    <AudioPlayer
                      verse={mappedPlaylist[index]}
                      fullPlaylist={mappedPlaylist}
                      index={index}
                    />
                    <button
                      className={`btn btn-ghost bookmark-btn ${bookmarked ? "bookmarked" : ""}`}
                      onClick={() => handleBookmark(verse)}
                      title={
                        bookmarked ? "Remove bookmark" : "Bookmark this verse"
                      }
                    >
                      {bookmarked ? "🔖 Bookmarked" : "🔖 Bookmark"}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        </SurahIntro>

        {/* ── Prev / Next navigation ──────────────────────── */}
        {faqItems.length > 0 && (
          <SurahFaqSection
            title="Frequently Asked Questions"
            surahName={surah.surahName}
            items={faqItems}
          />
        )}
        <div className="sv-nav">
          <button
            className="btn btn-secondary"
            onClick={() => navigate(`/surah/${surah.prevSurahSlug}`)}
            disabled={surah.surahNumber <= 1}
          >
            ← Previous Surah
          </button>
          <Link to="/surah" className="btn btn-ghost">
            All Surahs
          </Link>
          <button
            className="btn btn-secondary"
            onClick={() => navigate(`/surah/${surah.nextSurahSlug}`)}
            disabled={surah.surahNumber >= 114}
          >
            Next Surah →
          </button>
        </div>
      </div>
    </div>
  );
}
