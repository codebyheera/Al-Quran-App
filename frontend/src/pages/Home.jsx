/**
 * pages/Home.jsx — Landing page
 * Shows hero, Surah/Juz cards, search bar, and recent bookmarks
 */

import { Link, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useBookmarks } from '../context/BookmarkContext';
import { Helmet } from 'react-helmet-async';
import { lazy, Suspense } from 'react';
import api from '../lib/api';
import { BlogCard } from '../components/BlogCard';
import './Home.css';
import './SurahList.css';

const VerseOfDay      = lazy(() => import('../components/VerseOfDay'));
const PrayerTimes     = lazy(() => import('../components/PrayerTimes'));
const TasbihCounter   = lazy(() => import('../components/TasbihCounter'));

const FEATURES = [
  {
    icon: '🎧',
    title: 'Top Reciters',
    desc: 'Listen to beautiful recitations by Mishary Al-Afasy, Abdul Rahman Al-Sudais, and more.',
  },
  {
    icon: '📖',
    title: 'Arabic with Translation',
    desc: 'Read every Surah with clear Arabic text, English translation, and word-by-word meaning.',
  },
  {
    icon: '🔖',
    title: 'Bookmark Any Verse',
    desc: 'Save your favorite verses and pick up exactly where you left off — anytime.',
  },
  {
    icon: '🌙',
    title: '100% Ad-Free',
    desc: 'No ads, no banners, no tracking. Just you and the words of Allah.',
  },
  {
    icon: '📱',
    title: 'Mobile Friendly',
    desc: 'Optimized for every device — read and listen comfortably on your phone or tablet.',
  },
  {
    icon: '🆓',
    title: 'Completely Free',
    desc: 'Al-Quran Hub is and will always be free — built as sadaqah jariyah for the Ummah.',
  },
];

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
  const [showAllSurahs, setShowAllSurahs] = useState(false);
  const [recentBlogs, setRecentBlogs] = useState([]);
  const navigate = useNavigate();
  const { bookmarks } = useBookmarks();

  useEffect(() => {
    api.get('/api/surah')
      .then(({ data }) => setAllSurahs(data))
      .catch((err) => console.error("Could not fetch surahs for suggestions", err));

    api.get('/api/blogs', { params: { page: 1, limit: 3 } })
      .then(({ data }) => setRecentBlogs(data.blogs || []))
      .catch((err) => console.error("Could not fetch recent blogs", err));
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
        <meta name="description" content="Read Quran Pak online for free with daily prayer times, Verse of the Day, and Islamic blog. Access all Surahs and Juz with beautiful recitation on Al-Quran Hub." />
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

        {/* ── Prayer Times ──────────────────────────────────── */}
        <section className="home-section">
          <Suspense fallback={<div className="prayer-loading"><div className="spinner" /></div>}>
            <PrayerTimes />
          </Suspense>
        </section>

        {/* ── Why Al-Quran Hub ──────────────────────────────── */}
        <section className="home-section features-section">
          <h2>
            Everything You Need to <span className="text-gold">Read the Quran</span>
          </h2>
          <p className="features-subheading">
            Built for Muslims who want a clean, distraction-free experience — no ads, no subscriptions, just the Quran.
          </p>
          <div className="features-grid">
            {FEATURES.map((f) => (
              <div key={f.title} className="feature-card card">
                <div className="feature-icon">{f.icon}</div>
                <h3 className="feature-title">{f.title}</h3>
                <p className="feature-desc">{f.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── Tasbih Counter ────────────────────────────────── */}
        <section className="home-section">
          <Suspense fallback={<div style={{ minHeight: '80px' }} />}>
            <TasbihCounter />
          </Suspense>
        </section>

        {/* ── Random Verse Of The Day ──────────────────────── */}
        <section className="home-section votd-section">
          <Suspense fallback={<div style={{ minHeight: '220px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><div className="spinner" /></div>}>
            <VerseOfDay />
          </Suspense>
        </section>

        {/* ── Recent Blogs ──────────────────────────────── */}
        {recentBlogs.length > 0 && (
          <section className="home-section">
            <div className="flex-between mb-2">
              <h2>Newest Articles</h2>
              <Link to="/blog" className="btn btn-ghost" style={{ fontSize: '0.85rem' }}>View All →</Link>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.75rem' }}>
              {recentBlogs.map((blog) => (
                <BlogCard key={blog.id} blog={blog} />
              ))}
            </div>
          </section>
        )}

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

        {/* ── All Surahs (Grid) ──────────────────────────────── */}
        {allSurahs.length > 0 && (
          <section className="home-section">
            <div className="flex-between mb-2">
              <h2>All Surahs</h2>
              <Link to="/surah" className="btn btn-ghost" style={{ fontSize: '0.85rem' }}>Filter Surahs →</Link>
            </div>
            <div className="surah-grid">
              {allSurahs.slice(0, showAllSurahs ? allSurahs.length : 42).map((s) => (
                <Link key={s.number} to={`/surah/${s.englishName}`} className="surah-card card">
                  <div className="surah-number">
                    <span>{s.number}</span>
                  </div>
                  <div className="surah-info">
                    <span className="surah-english">{s.englishName}</span>
                    <span className="surah-translation text-muted">{s.nameTranslation}</span>
                  </div>
                  <div className="surah-meta">
                    <span className="arabic surah-arabic-name">{s.name}</span>
                    <div style={{ display: 'flex', gap: '0.4rem', justifyContent: 'flex-end', marginTop: '0.35rem' }}>
                      <span className="badge badge-muted">{s.versesCount} verses</span>
                      <span className={`badge ${s.revelation === 'Meccan' ? 'badge-gold' : 'badge-green'}`}>{s.revelation}</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
            {!showAllSurahs && allSurahs.length > 42 && (
              <div style={{ textAlign: 'center', marginTop: '1.5rem' }}>
                <button className="btn btn-primary" onClick={() => setShowAllSurahs(true)}>
                  Load All Surahs
                </button>
              </div>
            )}
          </section>
        )}
      </div>

      {/* ── Support CTA ──────────────────────────────────────── */}
      <section className="home-cta-section">
        <div className="home-cta-inner">
          <h2 className="home-cta-heading">
            Help Keep the Quran <span className="text-gold">Free &amp; Accessible</span>
          </h2>
          <p className="home-cta-sub">
            Al-Quran Hub is built and funded personally no ads, no investors, just sincere effort
            for the Ummah. Your support helps keep the servers running and new features coming.
          </p>
<Link to="/support" className="btn btn-primary home-cta-btn">
            Support Al-Quran Hub →
          </Link>
        </div>
      </section>
    </div>
  );
}
