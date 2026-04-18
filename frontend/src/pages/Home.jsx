/**
 * pages/Home.jsx — Landing page
 * Shows hero, Surah/Juz cards, search bar, and recent bookmarks
 */

import { Link, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useBookmarks } from '../context/BookmarkContext';
import { Helmet } from 'react-helmet-async';
import api from '../lib/api';
import './Home.css';

// Popular Surahs — static quick-access shown on the home page
const POPULAR = [
  { number: 1,   name: 'Al-Faatiha',  arabic: 'الفاتحة',   verses: 7   },
  { number: 2,   name: 'Al-Baqarah',  arabic: 'البقرة',    verses: 286 },
  { number: 18,  name: 'Al-Kahf',     arabic: 'الكهف',     verses: 110 },
  { number: 36,  name: 'Ya-Seen',     arabic: 'يس',        verses: 83  },
  { number: 55,  name: 'Ar-Rahmaan',  arabic: 'الرحمن',    verses: 78  },
  { number: 56,  name: 'Al-Waaqia',   arabic: 'الواقعة',   verses: 96  },
  { number: 67,  name: 'Al-Mulk',     arabic: 'الملك',     verses: 30  },
  { number: 93,  name: 'Ad-Duhaa',    arabic: 'الضحى',     verses: 11  },
  { number: 94,  name: 'ash-sharh',   arabic: 'الشرح',     verses: 8   },
  { number: 112, name: 'Al-Ikhlaas',  arabic: 'الإخلاص',   verses: 4   },
];

export default function Home() {
  const [query, setQuery] = useState('');
  const [allSurahs, setAllSurahs] = useState([]);
  const [verseOfTheDay, setVerseOfTheDay] = useState(null);
  const [isLoadingVotd, setIsLoadingVotd] = useState(true);
  const navigate = useNavigate();
  const { bookmarks } = useBookmarks();

  useEffect(() => {
    api.get('/api/surah')
      .then(({ data }) => setAllSurahs(data))
      .catch((err) => console.error("Could not fetch surahs for suggestions", err));
      
    async function fetchVOTD() {
      setIsLoadingVotd(true);
      try {
        const randomNum = Math.floor(Math.random() * 6236) + 1;
        const res = await fetch(`https://api.alquran.cloud/v1/ayah/${randomNum}/editions/quran-uthmani,en.asad`);
        const data = await res.json();
        
        if (data && data.data) {
          const arabicData = data.data[0];
          const englishData = data.data[1];
          setVerseOfTheDay({
            arabic: arabicData.text,
            translation: englishData.text,
            surahName: arabicData.surah.englishName,
            surahNumber: arabicData.surah.number,
            verseNumber: arabicData.numberInSurah
          });
        }
      } catch (err) {
        console.error("Failed to fetch verse of the day", err);
      } finally {
        setIsLoadingVotd(false);
      }
    }
    fetchVOTD();
  }, []);

  function handleSearch(e) {
    e.preventDefault();
    if (query.trim()) navigate(`/search?q=${encodeURIComponent(query.trim())}`);
  }

  const suggestions = query.trim() ? allSurahs.filter(s =>
    s.englishName.toLowerCase().startsWith(query.toLowerCase()) ||
    s.englishName.toLowerCase().includes(query.toLowerCase()) ||
    String(s.number).includes(query) ||
    s.name.includes(query)
  ).sort((a, b) => {
    const aStarts = a.englishName.toLowerCase().startsWith(query.toLowerCase());
    const bStarts = b.englishName.toLowerCase().startsWith(query.toLowerCase());
    if (aStarts && !bStarts) return -1;
    if (!aStarts && bStarts) return 1;
    return 0;
  }).slice(0, 6) : [];

  return (
    <div className="home page-enter">
      <Helmet>
        <title>Al-Quran Hub | Read Quran Pak Online Free</title>
        <meta name="description" content="Read Quran Pak online for free. Access all Surahs and Juz with beautiful recitation on Al-Quran Hub." />
        <meta name="keywords" content="quran pak, read quran online, quran online, al quran" />
        <link rel="canonical" href="https://alquranhub.org/" />
      </Helmet>

      {/* ── Hero ─────────────────────────────────────────────── */}
      <section className="hero pattern-bg">
        <div className="hero-bg-orbs"></div>
        <div className="hero-content">
          <div className="hero-bismillah arabic">بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ</div>
          <h1 className="hero-title">
            Read the <span className="text-gold">Holy Quran</span>
          </h1>
          <p className="hero-subtitle">
            Browse all 114 Surahs and 30 Juz with Arabic text, English translation, and audio recitation.
          </p>

          {/* Search */}
          <div className="hero-search-wrapper">
            <form className="hero-search" onSubmit={handleSearch}>
              <input
                className="input"
                type="text"
                placeholder="Search by Surah name, number, or keyword…"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
              <button type="submit" className="btn btn-primary">Search</button>
            </form>

            {suggestions.length > 0 && (
              <div className="search-dropdown">
                {suggestions.map((s) => (
                  <Link key={s.number} to={`/surah/${s.englishName}`} className="search-dropdown-item">
                    <span className="search-dropdown-num badge badge-gold">{s.number}</span>
                    <div style={{ flex: 1, textAlign: 'left' }}>
                      <div style={{ fontWeight: 600 }}>{s.englishName}</div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{s.nameTranslation}</div>
                    </div>
                    <span className="arabic" style={{ fontSize: '1.2rem', lineHeight: '1.2' }}>{s.name}</span>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      <div className="container">
        {/* ── Quick Access ──────────────────────────────────── */}
        <section className="home-section">
          <div className="flex-between mb-2">
            <h2>Start Reading</h2>
          </div>
          <div className="home-mode-cards">
            <Link to="/surah" className="mode-card">
              <div className="mode-card-icon">📖</div>
              <div>
                <h3>By Surah</h3>
                <p>Browse all 114 chapters</p>
              </div>
            </Link>
            <Link to="/juz" className="mode-card">
              <div className="mode-card-icon">📚</div>
              <div>
                <h3>By Juz</h3>
                <p>Browse all 30 parts</p>
              </div>
            </Link>
            <Link to="/bookmarks" className="mode-card">
              <div className="mode-card-icon">🔖</div>
              <div>
                <h3>Bookmarks</h3>
                <p>{bookmarks.length} saved verses</p>
              </div>
            </Link>
          </div>
        </section>

        {/* ── Popular Surahs ────────────────────────────────── */}
        <section className="home-section">
          <div className="flex-between mb-2">
            <h2>Popular Surahs</h2>
            <Link to="/surah" className="btn btn-ghost" style={{ fontSize: '0.85rem' }}>View All →</Link>
          </div>
          <div className="popular-grid">
            {POPULAR.map((s) => (
              <Link key={s.number} to={`/surah/${encodeURIComponent(s.name)}`} className="card popular-card">
                <span className="popular-num badge badge-gold">{s.number}</span>
                <div className="popular-info">
                  <span className="popular-english">{s.name}</span>
                  <span className="popular-arabic arabic" style={{ fontSize: '1.25rem', lineHeight: 1.2, marginTop: '0.2rem' }}>{s.arabic}</span>
                </div>
                <span className="popular-verses text-muted">{s.verses}v</span>
              </Link>
            ))}
          </div>
        </section>

        {/* ── Random Verse Of The Day ──────────────────────── */}
        <section className="home-section votd-section">
          <div className="flex-between mb-2">
            <h2>Verse of the Day</h2>
          </div>
          {isLoadingVotd ? (
            <div className="card loading-votd">
              <div className="spinner"></div>
            </div>
          ) : verseOfTheDay ? (
            <Link to={`/surah/${encodeURIComponent(verseOfTheDay.surahName)}#verse-${verseOfTheDay.verseNumber}`} className="card votd-card">
              <div className="flex-between mb-2">
                <span className="badge badge-gold">{verseOfTheDay.surahName} {verseOfTheDay.surahNumber}:{verseOfTheDay.verseNumber}</span>
              </div>
              <div className="arabic votd-arabic">
                {verseOfTheDay.arabic}
              </div>
              <div className="votd-translation mt-2">
                {verseOfTheDay.translation}
              </div>
            </Link>
          ) : null}
        </section>

        {/* ── Recent Bookmarks ──────────────────────────────── */}
        {bookmarks.length > 0 && (
          <section className="home-section">
            <div className="flex-between mb-2">
              <h2>Recent Bookmarks</h2>
              <Link to="/bookmarks" className="btn btn-ghost" style={{ fontSize: '0.85rem' }}>View All →</Link>
            </div>
            <div className="recent-bookmarks">
              {bookmarks.slice(0, 3).map((b) => (
                <Link key={b._id} to={`/surah/${encodeURIComponent(b.surahName)}#verse-${b.verseNumber}`} className="card bookmark-preview">
                  <div className="flex-between">
                    <span className="badge badge-gold">{b.surahName} {b.verseNumber}:{b.surahNumber}</span>
                    <span className="text-muted" style={{ fontSize: '0.75rem' }}>🔖</span>
                  </div>
                  <p className="translation mt-1" style={{ fontSize: '0.85rem', marginTop: '0.5rem' }}>
                    {b.translation?.slice(0, 120)}{b.translation?.length > 120 ? '…' : ''}
                  </p>
                </Link>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
