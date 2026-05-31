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
import { Helmet } from "react-helmet-async";
import Breadcrumb from "../components/Breadcrumb";
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
            audio: audioLanguage === 'en' ? v.englishAudioUrl : audioLanguage === 'ur' ? v.urduAudioUrl : v.audioUrl,
          }));
          updatePlaylist(mappedVerses);
        }
      })
      .catch(() => {
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
      // Prepare verses for the global playlist
      const playlistVerses = surah.verses.map((v) => ({
        ...v,
        surahNumber: surahNum,
        surahName: surah.surahName,
        audio: audioLanguage === 'en' ? v.englishAudioUrl : audioLanguage === 'ur' ? v.urduAudioUrl : v.audioUrl,
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
  const mappedPlaylist = verses.map(v => ({
    ...v,
    surahNumber: surahNum,
    surahName: surah.surahName,
    audio: audioLanguage === 'en' ? v.englishAudioUrl : audioLanguage === 'ur' ? v.urduAudioUrl : v.audioUrl
  }));

  const pageTitle = surah ? (
    surahNum === 1
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
                                : surahNum === 11
                                  ? "Surah Hud | Read & Listen Online Free — Al-Quran Hub"
                                  : surahNum === 12
                                    ? "Surah Yousaf | Read & Listen Online Free — Al-Quran Hub"
                                    : surahNum === 13
                                      ? "Surah Ar-Rad | Read & Listen Online Free — Al-Quran Hub"
                                      : surahNum === 14
                                        ? "Surah ibrahim | Read & Listen Online Free — Al-Quran Hub"
                                        : surahNum === 15
                                          ? "Surah Al-Hijr | Read & Listen Free Online — Al-Quran Hub"
                                          : surahNum === 16
                                            ? "Surah An-Nahl | Read & Listen Online Free — Al-Quran Hub"
                                            : surahNum === 17
                                              ? "Surah Al-Isra | Read & Listen Online Free — Al-Quran Hub"
                                              : surahNum === 18
                                                ? "Surah Kahf – Read & Listen Online Free | Al-Quran Hub"
                                                : surahNum === 19
                                                  ? "Surah Maryam – Read Online Free | Al-Quran Hub"
                                                  : surahNum === 20
                                                    ? "Read & Listen to Surah Taha (Ta-Ha) — Chapter 20 | Al-Quran Hub"
                                                    : surahNum === 21
                                                      ? "Surah Anbiya – Read Online Free | Al-Quran Hub"
                                                      : surahNum === 22
                                                        ? "Surah Al-Hajj – Read Online Free | Al-Quran Hub"
                                                        : surahNum === 23
                                                          ? "Surah Al-Muminun – Read Online Free | Al-Quran Hub"
                                                          : surahNum === 24
                                                            ? "Surah An-Nur | Read & Listen Online on — Al-Quran Hub"
                                                            : surahNum === 25
                                                              ? "Surah Furqan | Read & Listen Online on — Al-Quran Hub"
                                                              : surahNum === 26
                                                                ? "Surah Ash-Shuara | Read & Listen Online on — Al-Quran Hub"
                                                                : surahNum ===
                                                                    27
                                                                  ? "Surah An-Naml | Read & Listen Online on  Al-Quran Hub."
                                                                  : surahNum ===
                                                                      28
                                                                    ? "Surah Al-Qasas | Read & Listen Online on  Al-Quran Hub"
                                                                    : surahNum ===
                                                                        29
                                                                      ? "Surah Al-Ankabut | Read & Listen Online on Al-Quran Hub."
                                                                      : surahNum ===
                                                                          30
                                                                        ? "Surah Ar-Rum | Read & Listen Online on Al-Quran Hub."
                                                                        : surahNum ===
                                                                            31
                                                                          ? "Surah Luqman | Read & Listen with Translation."
                                                                          : surahNum ===
                                                                              32
                                                                            ? "Surah As-Sajdah | Read & Listen with Translation."
                                                                           : surahNum === 33
                                                                           ? "Read Surah Al-Ahzab Online with Translation Free."
                                                                           : surahNum === 34
                                                                           ? "Surah Saba | Read & Listen Online — Al-Quran Hub."
                                                                           : surahNum === 35
                                                                           ? "Surah Fatir | Read & Listen Online — Al-Quran Hub."
                                                                            : surahNum ===
                                                                                36
                                                                              ? "Surah Yaseen Full | Read Online — Al-Quran Hub."
                                                                              : surahNum === 37
                                                                              ? "As-Saffat | Surah 37 Read Online — Al-Quran Hub."
                                                                              : surahNum ===
                                                                                  18
                                                                                ? "Surah Al-Kahf - Read & Listen with English Translation"
                                                                                : surahNum ===
                                                                                    22
                                                                                  ? "Surah Al-Hajj - Read Online with English Translation"
                                                                                  : `Surah ${surah.surahName} (${surah.nameTranslation}) - ${surah.arabicName} - Read Online`
  ) : "Al-Quran Hub";

  const pageDescription = surah ? (
    surahNum === 1
                ? "Surah Al-Fatiha (Chapter 1). Read in Arabic, listen to beautiful recitations, and explore English translations. Free on Al-Quran Hub."
                : surahNum === 2
                  ? "Read and listen to Surah Al-Baqarah (The Cow) — Chapter 2 of the Quran. Includes Ayatul Kursi, Arabic text, and English translations. Free on Al-Quran Hub."
                  : surahNum === 3
                    ? "Read and listen to Surah Al-Imran (Family of Imran) — Chapter 3 of the Quran. 200 verses with Arabic text and English translation. Free at Al-Quran Hub."
                    : surahNum === 4
                      ? "Read and listen to Surah An-Nisa (Women) - Chapter 4. 176 verses on women's rights, inheritance, family laws. Arabic and English. Free on Al-Quran Hub."
                      : surahNum === 5
                        ? "Read and listen to Surah Al-Maidah (Table Spread) - Chapter 5. 120 verses on halal food, justice & Islamic law. Arabic & English. Free on Al-Quran Hub."
                        : surahNum === 6
                          ? "Read and listen to Surah Al-Anam (The Cattle) — Chapter 6 of the Holy Quran. 165 verses on Tawheed & faith. Arabic & English — Free on Al-Quran Hub."
                          : surahNum === 7
                            ? "Read and listen to Surah Al-Araf (The Heights) — Chapter 7 of the Holy Quran. 206 verses on Adam, Day of Judgment. Arabic & English — Free on Al-Quran Hub."
                            : surahNum === 8
                              ? "Read and listen to Surah Al-Anfal (Spoils of War) - Chapter 8. 75 verses on Battle of Badr, faith & unity. Arabic & English — Free on Al-Quran Hub."
                              : surahNum === 9
                                ? "Read and listen to Surah Tawbah (The Repentance) — Chapter 9 of the Holy Quran. 129 verses. Arabic & English — Free on Al-Quran Hub."
                                : surahNum === 10
                                  ? "Read and listen to Surah Younus (Jonah) — Ch. 10. 109 verses on faith, patience & repentance. Arabic & English — Free on Al-Quran Hub."
                                  : surahNum === 11
                                    ? "Read and listen to Surah Hud — Chapter 11 of the Quran. 123 verses with stories of 7 Prophets. Arabic & English. Free on Al-Quran Hub."
                                    : surahNum === 12
                                      ? "Read and listen to Surah Yousaf (Joseph) — Ch 12. 111 verses - the Quran story. Patience, faith & forgiveness. Arabic & English. Free on Al-Quran Hub."
                                      : surahNum === 13
                                        ? "Read and listen to Surah Ar-Rad (Thunder) - Ch 13. 43 verses on Allah's power & nature signs. Verses 11 & 28. Arabic & English. Free on Al-Quran Hub."
                                        : surahNum === 14
                                          ? "Read and listen to Surah ibrahim (Abraham) — Chapter 14. 52 verses on gratitude, faith & ibrahim's dua. Arabic & English. Free on Al-Quran Hub."
                                          : surahNum === 15
                                            ? "Read and listen to Surah Al-Hijr — Chapter 15 of the Quran. 99 verses on Allah's protection & Prophet stories. Arabic & English. Free on Al-Quran Hub."
                                            : surahNum === 16
                                              ? "Surah An-Nahl – Quran Chapter 16. Features verse 90 & 125. Arabic, English translation & recitation. Free on Al-Quran Hub."
                                              : surahNum === 17
                                                ? "Surah Al-Isra (Chapter 17) – 111 verses on Isra & Miraj, parents' rights & moral laws. Arabic + English. Free on Al-Quran Hub."
                                                : surahNum === 18
                                                  ? "Read Surah Kahf full online – Surah Al-Kahf Chapter 18, 110 verses. Arabic text, English translation & audio recitation. Free on Al-Quran Hub."
                                                  : surahNum === 19
                                                    ? "Read Surah Maryam online – Chapter 19, 98 verses on Prophet Isa, Yahya & Zakariya. Arabic text & English translation. Free on Al-Quran Hub."
                                                    : surahNum === 20
                                                      ? "Read Surah Taha online – Chapter 20, 135 verses on Prophet Musa & the Burning Bush. Arabic text & English translation. Free on Al-Quran Hub."
                                                      : surahNum === 21
                                                        ? "Read Surah Anbiya (Al-Anbiya) online – Quran Chapter 21, 112 verses on Prophets Ibrahim, Nuh & Yunus. Arabic text & English translation. Free."
                                                        : surahNum === 22
                                                          ? "Read Surah Al-Hajj online – Quran Chapter 22, 78 verses. Arabic text, Urdu & English translation with audio recitation. Full surah free on Al-Quran Hub."
                                                          : surahNum === 23
                                                            ? "Read Surah Al-Muminun online – Quran Chapter 23, 118 verses. Arabic text & English translation with audio recitation. Full surah free on Al-Quran Hub."
                                                            : surahNum === 24
                                                              ? "Surah An-Nur (Chapter 24) – Free online reading with English translation & audio recitation. Al-Quran Hub"
                                                              : surahNum === 25
                                                                ? "Read and listen to Surah Furqan (Chapter 25) online for free with English translation, and audio recitation. Explore the full surah on Al-Quran Hub."
                                                                : surahNum ===
                                                                    26
                                                                  ? "Read and listen to Surah Ash-Shuara (Chapter 26) online for free with English translation, and audio recitation. Explore the full surah on Al-Quran Hub."
                                                                  : surahNum ===
                                                                      27
                                                                    ? "Read and listen to Surah An-Naml (Chapter 27) online for free with English translation, and audio recitation. Explore the full surah on Al-Quran Hub."
                                                                    : surahNum ===
                                                                        28
                                                                      ? "Read and listen to Surah Al-Qasas (Chapter 28) online for free with English translation, and audio recitation. Explore the full surah on Al-Quran Hub."
                                                                      : surahNum ===
                                                                          29
                                                                        ? "Read and listen to Surah Al-Ankabut (Chapter 29) online for free with English translation, and audio recitation. Explore the full surah on Al-Quran Hub."
                                                                        : surahNum ===
                                                                            30
                                                                          ? "Read and listen to Surah Ar-Rum (Chapter 30) online for free with English translation, and audio recitation. Explore the full surah on Al-Quran Hub."
                                                                          : surahNum ===
                                                                              31
                                                                            ? "Read & listen to Surah Luqman (Chapter 31) online with English translation & audio recitation. Explore it free on Al-Quran Hub."
                                                                            : surahNum ===
                                                                                32
                                                                              ? "Read & listen to Surah As-Sajdah (Chapter 32) full online with English translation & audio recitation. Explore it free on Al-Quran Hub."
                                                                            : surahNum === 33
                                                                            ? "Read & listen to Surah Al-Ahzab (Chapter 33) full online with English translation & audio recitation. Start exploring now on Al-Quran Hub."
                                                                             : surahNum === 34
                                                                             ? "Read Surah Saba (Chapter 34) online with English translation & audio recitation. Explore the full Quran Saba for free on Al-Quran Hub."
                                                                            : surahNum === 35
                                                                             ? "Read Surah Fatir (Chapter 35) online with English translation & audio recitation. Explore Fatir Surah for free on Al-Quran Hub."
                                                                             : surahNum ===
                                                                                  36
                                                                                ? "Read Surah Yaseen full online with English translation & audio recitation. Explore Yaseen Shareef & Surah Yasin for free on Al-Quran Hub."
                                                                               : surahNum === 37
                                                                               ? "Explore As-Saffat, the 37th chapter of the Quran, with English translation & audio recitation. Read Surah As-Saffat verse by verse free on Al-Quran Hub."
                                                                                : surahNum ===
                                                                                    18
                                                                                  ? "Read complete Surah Al-Kahf in Arabic with English translation. Listen with 7 Qari recitations including Mishary. First & last 10 verses. Free on Al-Quran Hub."
                                                                                  : surahNum ===
                                                                                      22
                                                                                    ? "Read complete Surah Al-Hajj in Arabic with English translation. Listen with 7 Qari recitations including Mishary. Free on Al-Quran Hub."
                                                                                    : `Read and listen to Surah ${surah.surahName} (${surah.nameTranslation}). Contains ${surah.versesCount} verses. Revealed in ${surah.revelation}. Arabic text, translation and audio available.`
  ) : "Read and listen to the Holy Quran online.";

  return (
    <div
      className="surah-view page-enter"
      ref={topRef}
      style={{ "--arabic-font-size": `${fontSize}rem`, "--translation-font-size": `${translationFontSize}rem` }}
    >
      {surah && (() => {
        const cleanTitle = pageTitle.replace(/&amp;/g, '&');
        const cleanDescription = pageDescription.replace(/&amp;/g, '&');
        const cleanSurahName = surah.surahName.replace(/&amp;/g, '&');

        return (
        <Helmet encodeSpecialCharacters={false}>
          <title>{cleanTitle}</title>
          <meta name="description" content={cleanDescription} />
          <link rel="canonical" href={`https://alquranhub.org/surah/${id}`} />
          <meta property="og:title" content={cleanTitle} />
          <meta property="og:description" content={cleanDescription} />
          <meta property="og:url" content={`https://alquranhub.org/surah/${id}`} />
          <meta property="og:type" content="article" />
        </Helmet>
        );
      })()}

      {surah && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebPage",
              "name": pageTitle.replace(/&amp;/g, '&'),
              "url": `https://alquranhub.org/surah/${id}`,
              "description": pageDescription.replace(/&amp;/g, '&'),
              "inLanguage": "ar"
            })
          }}
        />
      )}
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

                  {/* Translations — shown if global toggle is on, OR this verse is individually revealed */}
                  {(showEn || showUr || revealedVerses.has(verse.number)) && (
                    <div className="translations-container" style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '16px' }}>
                      {(showEn || revealedVerses.has(verse.number)) && verse.translation && (
                        <p className="translation verse-translation" style={{ margin: 0, color: 'var(--accent-gold)', fontSize: 'var(--translation-font-size, 1rem)', lineHeight: '1.8' }}>
                          {verse.translation}
                        </p>
                      )}
                      {(showUr || revealedVerses.has(verse.number)) && verse.urduTranslation && (
                        <p className="translation verse-translation-ur" dir="rtl" style={{ margin: 0, fontFamily: '"Noto Nastaliq Urdu", serif', fontStyle: 'normal', textAlign: 'right', fontSize: `calc(var(--translation-font-size, 1rem) * 1.6)`, lineHeight: '2.8', color: 'var(--accent-gold)' }}>
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
