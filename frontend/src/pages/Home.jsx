/**
 * pages/Home.jsx — Landing page
 * Shows hero, Surah/Juz cards, search bar, and recent bookmarks
 */

import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useBookmarks } from '../context/BookmarkContext';
import './Home.css';

// Popular Surahs — static quick-access shown on the home page
const POPULAR = [
  { number: 1,   name: 'Al-Fatihah',  arabic: 'الفاتحة',   verses: 7   },
  { number: 2,   name: 'Al-Baqarah',  arabic: 'البقرة',    verses: 286 },
  { number: 18,  name: 'Al-Kahf',     arabic: 'الكهف',     verses: 110 },
  { number: 36,  name: 'Ya-Sin',      arabic: 'يس',        verses: 83  },
  { number: 55,  name: 'Ar-Rahman',   arabic: 'الرحمن',    verses: 78  },
  { number: 56,  name: 'Al-Waqiah',   arabic: 'الواقعة',   verses: 96  },
  { number: 67,  name: 'Al-Mulk',     arabic: 'الملك',     verses: 30  },
  { number: 93,  name: 'Ad-Duha',     arabic: 'الضحى',     verses: 11  },
  { number: 94,  name: 'Al-Inshirah', arabic: 'الشرح',     verses: 8   },
  { number: 112, name: 'Al-Ikhlas',   arabic: 'الإخلاص',   verses: 4   },
];

export default function Home() {
  const [query, setQuery] = useState('');
  const navigate = useNavigate();
  const { bookmarks } = useBookmarks();

  function handleSearch(e) {
    e.preventDefault();
    if (query.trim()) navigate(`/search?q=${encodeURIComponent(query.trim())}`);
  }

  return (
    <div className="home page-enter">
      {/* ── Hero ─────────────────────────────────────────────── */}
      <section className="hero pattern-bg">
        <div className="hero-content">
          <div className="hero-bismillah arabic">بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ</div>
          <h1 className="hero-title">
            Read the <span className="text-gold">Holy Quran</span>
          </h1>
          <p className="hero-subtitle">
            Browse all 114 Surahs and 30 Juz with Arabic text, English translation, and audio recitation.
          </p>

          {/* Search */}
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
              <Link key={s.number} to={`/surah/${s.number}`} className="card popular-card">
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

        {/* ── Recent Bookmarks ──────────────────────────────── */}
        {bookmarks.length > 0 && (
          <section className="home-section">
            <div className="flex-between mb-2">
              <h2>Recent Bookmarks</h2>
              <Link to="/bookmarks" className="btn btn-ghost" style={{ fontSize: '0.85rem' }}>View All →</Link>
            </div>
            <div className="recent-bookmarks">
              {bookmarks.slice(0, 3).map((b) => (
                <Link key={b._id} to={`/surah/${b.surahNumber}`} className="card bookmark-preview">
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
