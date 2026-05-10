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
import { useAudio } from "../context/AudioContext";
import { useQari } from "../context/QariContext";
import { Helmet } from "react-helmet-async";
import "./SurahView.css";

export default function SurahView() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [surah, setSurah] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // We'll use the ID from the URL for the API call,
  // and use surah.surahNumber for numeric logic once loaded.
  const surahNum = surah?.surahNumber || parseInt(id) || null;

  const [fontSize, setFontSize] = useState(() => {
    return parseFloat(localStorage.getItem("arabicFontSize")) || 2.2;
  });

  const [showTranslation, setShowTranslation] = useState(() => {
    return localStorage.getItem("showTranslation") === "true";
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
  } = useAudio();
  const { reciter } = useQari();

  const { addBookmark, removeBookmark, isBookmarked, bookmarks } =
    useBookmarks();
  const topRef = useRef(null);

  // Ref to track the previous ID to differentiate between ID change vs Reciter change
  const prevIdRef = useRef(id);

  // Track currently playing word audio to prevent overlaps
  const wordAudioRef = useRef(null);

  useEffect(() => {
    const isIdChange = prevIdRef.current !== id;
    prevIdRef.current = id;

    if (isIdChange || !surah) {
      setLoading(true);
      setError(null);
      stop(); // Stop any playing audio when switching surah
      topRef.current?.scrollIntoView({ behavior: "smooth" });
    }

    if (wordAudioRef.current && isIdChange) {
      wordAudioRef.current.pause();
      wordAudioRef.current = null;
    }

    api
      .get(`/api/surah/${id}?reciter=${reciter}`)
      .then(({ data }) => {
        setSurah(data);
        setLoading(false);

        // Update background playlist if currently playing
        if (!isIdChange && updatePlaylist) {
          const mappedVerses = data.verses.map((v) => ({
            ...v,
            surahNumber: data.surahNumber,
            surahName: data.surahName,
            audio: v.audioUrl,
          }));
          updatePlaylist(mappedVerses);
        }
      })
      .catch(() => {
        setError("Failed to load Surah.");
        setLoading(false);
      });
  }, [id, reciter]);

  // Auto-scroll on initial load if hash is present
  useEffect(() => {
    if (!loading && surah && location.hash) {
      const id = location.hash.replace("#", "");
      setTimeout(() => {
        const el = document.getElementById(id);
        if (el) {
          el.scrollIntoView({ behavior: "smooth", block: "center" });
          // Add a temporary highlight effect
          el.classList.add("menu-open");
          setTimeout(() => el.classList.remove("menu-open"), 1500);
        }
      }, 150);
    }
  }, [loading, surah, location.hash]);

  // Auto-scroll when currentVerse changes
  useEffect(() => {
    if (currentVerse && surah) {
      // Check if the playing verse belongs to this surah
      const isThisSurah = currentVerse.surahNumber === surahNum;
      if (isThisSurah) {
        const verseId = `verse-${currentVerse.number}`;
        const el = document.getElementById(verseId);
        if (el) {
          el.scrollIntoView({ behavior: "smooth", block: "center" });
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

  function handlePlayAllToggle() {
    if (!surah || !surah.verses.length) return;

    // Check if we are already playing this surah's playlist
    const isCurrentSurahPlaying =
      currentVerse?.surahNumber === surahNum && !currentVerse.isHQ;

    if (isCurrentSurahPlaying) {
      togglePlay();
    } else {
      // Prepare verses for the global playlist
      const playlistVerses = surah.verses.map((v) => ({
        ...v,
        surahNumber: surahNum,
        surahName: surah.surahName,
        audio: v.audioUrl, // Map audioUrl to audio for the context
      }));
      playPlaylist(playlistVerses, 0);
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

  const toggleTranslation = () => {
    setShowTranslation((prev) => {
      const newVal = !prev;
      localStorage.setItem("showTranslation", newVal);
      return newVal;
    });
  };

  if (loading)
    return (
      <div className="loading-center">
        <div className="spinner" />
        <p>Loading Surah…</p>
      </div>
    );
  if (error)
    return (
      <div className="loading-center">
        <p style={{ color: "#e74c3c" }}>{error}</p>
      </div>
    );

  const verses = surah.verses;

  // Pre-calculate mapped playlist for AudioPlayer
  const mappedPlaylist = verses.map((v) => ({
    ...v,
    surahNumber: surahNum,
    surahName: surah.surahName,
    audio: v.audioUrl,
  }));

  return (
    <div
      className="surah-view page-enter"
      ref={topRef}
      style={{ "--arabic-font-size": `${fontSize}rem` }}
    >
      {surah && (
        <Helmet>
          <title>
            {surahNum === 1
              ? "Surah Fatiha (Al-Fatiha) | Read & Listen Free — Al-Quran Hub"
              : surahNum === 2
                ? "Surah Baqra (Al-Baqarah) | Read & Listen Full Online Free — Al-Quran Hub"
                : surahNum === 3
                  ? "Surah Al-Imran | Read & Listen Online Free — Al-Quran Hub"
                  : surahNum === 4
                    ? "Surah An-Nisa | Read & Listen Online Free — Al-Quran Hub"
                    : surahNum === 5
                      ? "Surah Al-Maidah | Read & Listen Online Free — Al-Quran Hub"
                      : surahNum === 6
                        ? "Surah Al-Anam | Read & Listen Online Free — Al-Quran Hub"
                        : surahNum === 7
                          ? "Surah Al-Araf | Read & Listen Online Free — Al-Quran Hub"
                          : surahNum === 8
                            ? "Surah Al-Anfal | Read & Listen Online Free — Al-Quran Hub"
                            : surahNum === 9
                              ? "Surah Tawbah | Read & Listen Online Free — Al-Quran Hub"
                              : surahNum === 10
                                ? "Surah Younus | Read & Listen Online Free — Al-Quran Hub"
                                : surahNum === 36
                                ? "Surah Yaseen - Read Complete Yaseen with Translation"
                                : surahNum === 18
                                  ? "Surah Al-Kahf - Read & Listen with English Translation"
                                  : surahNum === 22
                                    ? "Surah Al-Hajj - Read Online with English Translation"
                                    : `Surah ${surah.surahName} (${surah.nameTranslation}) - ${surah.arabicName} - Read Online`}
          </title>
          <meta
            name="description"
            content={
              surahNum === 1
                ? "Surah Al-Fatiha (The Opening) — Chapter 1 of the Holy Quran. Read in Arabic, listen to beautiful recitation, and explore English translation. Free on Al-Quran Hub."
                : surahNum === 2
                  ? "Read and listen to Surah Al-Baqarah (The Cow) — Chapter 2 of the Holy Quran. Includes Ayatul Kursi, Arabic text, English translation. Free recitation on Al-Quran Hub."
                  : surahNum === 3
                    ? "Read and listen to Surah Al-Imran (Family of Imran) — Chapter 3 of the Holy Quran. 200 verses with Arabic text, English translation. Free recitation on Al-Quran Hub."
                    : surahNum === 4
                      ? "Read and listen to Surah An-Nisa (The Women) — Chapter 4 of the Holy Quran. 176 verses covering women's rights, inheritance & family laws. Arabic, English — Free on Al-Quran Hub."
                      : surahNum === 5
                        ? "Read and listen to Surah Al-Maidah (The Table Spread) — Chapter 5 of the Holy Quran. 120 verses on halal food, justice & Islamic law. Arabic & English — Free on Al-Quran Hub."
                        : surahNum === 6
                          ? "Read and listen to Surah Al-Anam (The Cattle) — Chapter 6 of the Holy Quran. 165 verses on Tawheed & faith. Arabic & English — Free on Al-Quran Hub."
                          : surahNum === 7
                            ? "Read and listen to Surah Al-Araf (The Heights) — Chapter 7 of the Holy Quran. 206 verses on Adam, Day of Judgment. Arabic & English — Free on Al-Quran Hub."
                            : surahNum === 8
                              ? "Read and listen to Surah Al-Anfal (The Spoils of War) — Chapter 8 of the Holy Quran. 75 verses on Battle of Badr, faith & unity. Arabic & English — Free on Al-Quran Hub."
                              : surahNum === 9
                                ? "Read and listen to Surah Tawbah (The Repentance) — Chapter 9 of the Holy Quran. 129 verses. Arabic & English — Free on Al-Quran Hub."
                                : surahNum === 10
                                  ? "Read and listen to Surah Younus (Jonah) — Chapter 10 of the Holy Quran. 109 verses on faith, patience & repentance. Arabic & English — Free on Al-Quran Hub."
                                  : surahNum === 36
                                  ? "Read complete Surah Yaseen (Ya-Sin) in Arabic with English translation. Listen to full Yaseen Surah with 7 Qari recitations including Mishary. Free on Al-Quran Hub."
                                  : surahNum === 18
                                    ? "Read complete Surah Al-Kahf in Arabic with English translation. Listen with 7 Qari recitations including Mishary. First & last 10 verses. Free on Al-Quran Hub."
                                    : surahNum === 22
                                      ? "Read complete Surah Al-Hajj in Arabic with English translation. Listen with 7 Qari recitations including Mishary. Free on Al-Quran Hub."
                                      : `Read and listen to Surah ${surah.surahName} (${surah.nameTranslation}). Contains ${surah.versesCount} verses. Revealed in ${surah.revelation}. Arabic text, translation and audio available.`
            }
          />
          <link rel="canonical" href={`https://alquranhub.org/surah/${id}`} />
        </Helmet>
      )}
      <div className="container">
        {/* ── Surah Header ────────────────────────────────── */}
        <div className="sv-header">
          <div className="sv-header-info">
            <div className="sv-title-row">
              <h1>{surah.surahName}</h1>
              <div className="sv-arabic-name arabic">{surah.arabicName}</div>
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
        {surahNum !== 9 && (
          <div className="bismillah arabic">
            بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
          </div>
        )}

        {/* ── Controls (Font Sizing) ─────────────────── */}
        <div className="sv-controls">
          <div className="sv-font-controls">
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
            <div className="sv-font-divider"></div>
            <button
              className="btn btn-ghost sv-en-btn"
              onClick={toggleTranslation}
              title={showTranslation ? "Hide English" : "Show English"}
            >
              EN:{" "}
              <span className={showTranslation ? "text-primary" : "text-muted"}>
                {showTranslation ? "On" : "Off"}
              </span>
            </button>
          </div>
        </div>

        {/* ── Verse list ──────────────────────────────────── */}
        <div className="verse-list">
          {verses.map((verse, index) => {
            const bookmarked = isBookmarked(surahNum, verse.number);
            const isPlaying = currentVerse?.audio === verse.audioUrl;
            const isMenuOpen = activeMenu === verse.number;

            return (
              <div
                key={verse.number}
                className={`verse-card ${isPlaying ? "active-playing" : ""} ${isMenuOpen ? "menu-open" : ""}`}
                id={`verse-${verse.number}`}
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
                  {/* Translate toggle — mobile only, visible when EN is off */}
                  {!showTranslation && (
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
                  <div className="arabic verse-arabic" dir="rtl">
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

                  {/* English translation — shown if global toggle is on, OR this verse is individually revealed */}
                  {(showTranslation || revealedVerses.has(verse.number)) && (
                    <p className="translation verse-translation">
                      {verse.translation}
                    </p>
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

        {/* ── Prev / Next navigation ──────────────────────── */}
        <div className="sv-nav">
          <button
            className="btn btn-secondary"
            onClick={() => navigate(`/surah/${surah.surahNumber - 1}`)}
            disabled={surah.surahNumber <= 1}
          >
            ← Previous Surah
          </button>
          <Link to="/surah" className="btn btn-ghost">
            All Surahs
          </Link>
          <button
            className="btn btn-secondary"
            onClick={() => navigate(`/surah/${surah.surahNumber + 1}`)}
            disabled={surah.surahNumber >= 114}
          >
            Next Surah →
          </button>
        </div>
      </div>
    </div>
  );
}
