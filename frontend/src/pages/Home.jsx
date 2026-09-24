/**
 * pages/Home.jsx — Landing page
 * Shows hero, Surah/Juz cards, search bar, and recent bookmarks
 */

import { Link, useNavigate } from 'react-router-dom';
import { useState, useEffect, useRef, useCallback } from 'react';
import { useBookmarks } from '../context/BookmarkContext';
import { Helmet } from 'react-helmet-async';
import { lazy, Suspense } from 'react';
import api from '../lib/api';
import { smartSearch } from '../lib/searchEngine';
import { BlogCard } from '../components/BlogCard';
import PrayerTimes from '../components/PrayerTimes';
import StreakWidget from '../components/StreakWidget';
import { pageSeo } from '../data/pageSeo';
import { getLastReading } from '../lib/readingProgress';
import { RevealSection } from '../components/RevealSection';
import './Home.css';
import './SurahList.css';

const VerseOfDay    = lazy(() => import('../components/VerseOfDay'));
const TasbihCounter = lazy(() => import('../components/TasbihCounter'));

const FEATURES = [
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 18v-6a9 9 0 0 1 18 0v6" />
        <path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3v5Z" />
        <path d="M3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3v5Z" />
      </svg>
    ),
    title: 'Top Reciters',
    desc: 'Listen to beautiful recitations by Mishary Al-Afasy, Abdul Rahman Al-Sudais, and more.',
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 6.5c-1.5-1-3.5-1.5-5.5-1.5C5.3 5 4.1 5.2 3 5.5v13c1.1-.3 2.3-.5 3.5-.5 2 0 4 .5 5.5 1.5 1.5-1 3.5-1.5 5.5-1.5 1.2 0 2.4.2 3.5.5v-13c-1.1-.3-2.3-.5-3.5-.5-2 0-4 .5-5.5 1.5Z" />
        <path d="M12 6.5v13" />
      </svg>
    ),
    title: 'Arabic with Translation',
    desc: 'Read every Surah with clear Arabic text, English translation, and word-by-word meaning.',
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <path d="M6 3h12v18l-6-4-6 4V3Z" />
      </svg>
    ),
    title: 'Bookmark Any Verse',
    desc: 'Save your favorite verses and pick up exactly where you left off — anytime.',
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2 4 5v6c0 5 3.5 9 8 11 4.5-2 8-6 8-11V5l-8-3Z" />
        <path d="m9 12 2 2 4-4" />
      </svg>
    ),
    title: '100% Ad-Free',
    desc: 'No ads, no banners, no tracking. Just you and the words of Allah.',
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <rect x="6" y="2" width="12" height="20" rx="2" />
        <path d="M11 18h2" />
      </svg>
    ),
    title: 'Mobile Friendly',
    desc: 'Optimized for every device — read and listen comfortably on your phone or tablet.',
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 1 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78Z" />
      </svg>
    ),
    title: 'Completely Free',
    desc: 'Al-Quran Hub is and will always be free — built as sadaqah jariyah for the Ummah.',
  },
];

// Popular Surahs — static quick-access shown on the home page
const POPULAR = [
  { number: 1,   name: 'Al-Faatiha',  arabic: 'الفاتحة',   verses: 7   },
  { number: 2,   name: 'Al-Baqarah',  arabic: 'البقرة',    verses: 286 },
  { number: 18,  name: 'Al-Kahf',     arabic: 'الكهف',     verses: 110 },
  { number: 36,  name: 'Yaseen',      arabic: 'يس',        verses: 83  },
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
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const searchWrapperRef = useRef(null);
  const navigate = useNavigate();
  const { bookmarks } = useBookmarks();
  const [lastReading, setLastReading] = useState(null);

  // Read on mount only (not during render) so this stays SSR/prerender-safe —
  // localStorage doesn't exist in the Node build that generates static HTML.
  useEffect(() => {
    setLastReading(getLastReading());
  }, []);

  useEffect(() => {
    api.get('/api/surah')
      .then(({ data }) => setAllSurahs(data))
      .catch((err) => console.error('Could not fetch surahs for suggestions', err));

    api.get('/api/blogs', { params: { page: 1, limit: 3 } })
      .then(({ data }) => setRecentBlogs(data.blogs || []))
      .catch((err) => console.error('Could not fetch recent blogs', err));
  }, []);

  // Close dropdown on outside click or Escape
  useEffect(() => {
    function onClickOutside(e) {
      if (searchWrapperRef.current && !searchWrapperRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    }
    function onKeyDown(e) {
      if (e.key === 'Escape') setDropdownOpen(false);
    }
    document.addEventListener('mousedown', onClickOutside);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('mousedown', onClickOutside);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, []);

  function handleSearch(e) {
    e.preventDefault();
    setDropdownOpen(false);
    if (query.trim()) navigate(`/search?q=${encodeURIComponent(query.trim())}`);
  }

  function handleQueryChange(e) {
    setQuery(e.target.value);
    setDropdownOpen(true);
  }

  const { results: suggestions, didYouMean } = smartSearch(query, allSurahs);
  const showDropdown = dropdownOpen && (suggestions.length > 0 || didYouMean);

  const developerJsonLd = JSON.stringify({
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Person',
        '@id': 'https://alquranhub.org/#founder',
        name: 'Muhammad Subhan Naeem',
        jobTitle: 'Founder & Developer',
        url: 'https://alquranhub.org',
        image: 'https://avatars.githubusercontent.com/codebyheera',
        sameAs: [
          'https://github.com/codebyheera',
          'https://www.linkedin.com/in/codebysubhan/',
          'https://medium.com/@muhammadsubhan189345',
          'https://about.me/muhammadsubhannaeem',
        ],
        worksFor: { '@id': 'https://alquranhub.org/#organization' },
      },
      {
        '@type': 'Organization',
        '@id': 'https://alquranhub.org/#organization',
        name: 'Al-Quran Hub',
        url: 'https://alquranhub.org',
      },
    ],
  });

  return (
    <div className="home page-enter">
      <Helmet>
        <title>{pageSeo.home.title}</title>
        <meta name="description" content={pageSeo.home.description} />
        <meta name="keywords" content={pageSeo.home.keywords} />
        <link rel="canonical" href={`https://alquranhub.org${pageSeo.home.path}`} />
        <script type="application/ld+json">{developerJsonLd}</script>
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
          <div className="hero-search-wrapper" ref={searchWrapperRef}>
            <form className="hero-search" onSubmit={handleSearch}>
              <input
                className="input"
                type="text"
                placeholder="Search by Surah name, number, or keyword…"
                value={query}
                onChange={handleQueryChange}
                onFocus={() => query.trim() && setDropdownOpen(true)}
                autoComplete="off"
              />
              <button type="submit" className="btn btn-primary">Search</button>
            </form>

            {showDropdown && (
              <div className="search-dropdown">
                {/* Did You Mean banner */}
                {didYouMean && (
                  <div className="search-did-you-mean">
                    <span>🔍 Did you mean&nbsp;</span>
                    <Link
                      to={`/surah/${didYouMean.englishName}`}
                      className="search-dym-link"
                      onClick={() => setDropdownOpen(false)}
                    >
                      {didYouMean.englishName}
                    </Link>
                    <span>?</span>
                  </div>
                )}

                {suggestions.map((s) => (
                  <Link
                    key={s.number}
                    to={`/surah/${s.englishName}`}
                    className="search-dropdown-item"
                    onClick={() => setDropdownOpen(false)}
                  >
                    <span className="search-dropdown-num badge badge-gold">{s.number}</span>
                    <div style={{ flex: 1, textAlign: 'left' }}>
                      <div style={{ fontWeight: 600 }}>{s.englishName}</div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{s.nameTranslation}</div>
                    </div>
                    <div className="search-item-right">
                      <span className="arabic" style={{ fontSize: '1.2rem', lineHeight: '1.2' }}>{s.name}</span>

                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* ── Daily Reading Streak — lives inside the hero, divided only by a hairline ── */}
        <StreakWidget />
      </section>

      <div className="container">
        {/* ── Quick Access ──────────────────────────────────── */}
        <RevealSection className="home-section">
          <div className="flex-between mb-2">
            <h2>Start Reading</h2>
          </div>
          <div className="home-mode-cards">
            <Link to="/surah" className="mode-card reveal reveal-fade-up stagger-1">
              <div className="mode-card-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 6.5c-1.5-1-3.5-1.5-5.5-1.5C5.3 5 4.1 5.2 3 5.5v13c1.1-.3 2.3-.5 3.5-.5 2 0 4 .5 5.5 1.5 1.5-1 3.5-1.5 5.5-1.5 1.2 0 2.4.2 3.5.5v-13c-1.1-.3-2.3-.5-3.5-.5-2 0-4 .5-5.5 1.5Z" />
                  <path d="M12 6.5v13" />
                </svg>
              </div>
              <div>
                <h3>By Surah</h3>
                <p>Browse all 114 chapters</p>
              </div>
            </Link>
            <Link to="/juz" className="mode-card reveal reveal-fade-up stagger-2">
              <div className="mode-card-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 3 2 8l10 5 10-5-10-5Z" />
                  <path d="M2 12l10 5 10-5" />
                  <path d="M2 16l10 5 10-5" />
                </svg>
              </div>
              <div>
                <h3>By Juz</h3>
                <p>Browse all 30 parts</p>
              </div>
            </Link>
            {lastReading ? (
              <Link
                to={lastReading.url}
                className="mode-card reveal reveal-fade-up stagger-3"
                aria-label={`Continue reading Surah ${lastReading.surahName}, Ayah ${lastReading.ayahNumber}`}
              >
                <div className="mode-card-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M3 11a9 9 0 1 0 2.6-6.3" />
                    <path d="M3 4v5h5" />
                    <path d="M12 8v4l3 2" />
                  </svg>
                </div>
                <div>
                  <h3>Continue Reading</h3>
                  <p>{lastReading.surahName} · Ayah {lastReading.ayahNumber}</p>
                </div>
              </Link>
            ) : (
              <Link
                to="/surah"
                className="mode-card reveal reveal-fade-up stagger-3"
                aria-label="Start your Quran reading journey"
              >
                <div className="mode-card-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M3 11a9 9 0 1 0 2.6-6.3" />
                    <path d="M3 4v5h5" />
                    <path d="M12 8v4l3 2" />
                  </svg>
                </div>
                <div>
                  <h3>Continue Reading</h3>
                  <p>Start your Quran reading journey</p>
                </div>
              </Link>
            )}
            <Link to="/bookmarks" className="mode-card reveal reveal-fade-up stagger-4">
              <div className="mode-card-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M6 3h12v18l-6-4-6 4V3Z" />
                </svg>
              </div>
              <div>
                <h3>Bookmarks</h3>
                <p>{bookmarks.length} saved verses</p>
              </div>
            </Link>
          </div>
        </RevealSection>

        {/* ── Popular Surahs ────────────────────────────────── */}
        <RevealSection className="home-section">
          <div className="flex-between mb-2">
            <h2>Popular Surahs</h2>
            <Link to="/surah" className="btn btn-ghost" style={{ fontSize: '0.85rem' }}>View All →</Link>
          </div>
          <div className="popular-grid">
            {POPULAR.map((s, idx) => (
              <Link key={s.number} to={`/surah/${encodeURIComponent(s.name)}`} className={`card popular-card reveal reveal-fade-up stagger-${(idx % 6) + 1} reveal-visible`}>
                <span className="popular-num badge badge-gold">{s.number}</span>
                <div className="popular-info">
                  <span className="popular-english">{s.name}</span>
                  <span className="popular-arabic arabic" style={{ fontSize: '1.25rem', lineHeight: 1.2, marginTop: '0.2rem' }}>{s.arabic}</span>
                </div>
                <span className="popular-verses text-muted">{s.verses}v</span>
              </Link>
            ))}
          </div>
        </RevealSection>

        {/* ── Prayer Times ──────────────────────────────────── */}
        <RevealSection className="home-section">
          <PrayerTimes />
        </RevealSection>

        {/* ── Why Al-Quran Hub ──────────────────────────────── */}
        <RevealSection className="home-section features-section">
          <h2>
            Everything You Need to <span className="text-gold">Read the Quran</span>
          </h2>
          <p className="features-subheading">
            Built for Muslims who want a clean, distraction-free experience — no ads, no subscriptions, just the Quran.
          </p>
          <div className="features-grid">
            {FEATURES.map((f, idx) => (
              <div key={f.title} className={`feature-card card reveal reveal-fade-up stagger-${(idx % 6) + 1} reveal-visible`}>
                <div className="feature-icon">{f.icon}</div>
                <h3 className="feature-title">{f.title}</h3>
                <p className="feature-desc">{f.desc}</p>
              </div>
            ))}
          </div>
        </RevealSection>

        {/* ── Tasbih Counter ────────────────────────────────── */}
        <RevealSection className="home-section">
          <Suspense fallback={<div style={{ minHeight: '80px' }} />}>
            <TasbihCounter />
          </Suspense>
        </RevealSection>

        {/* ── Random Verse Of The Day ──────────────────────── */}
        <RevealSection className="home-section votd-section">
          <Suspense fallback={<div style={{ minHeight: '220px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><div className="spinner" /></div>}>
            <VerseOfDay />
          </Suspense>
        </RevealSection>

        {/* ── Recent Blogs ────────────────────────────────── */}
        {recentBlogs.length > 0 && (
          <RevealSection className="home-section">
            <div className="flex-between mb-2">
              <h2>Newest Articles</h2>
              <Link to="/blog" className="btn btn-ghost" style={{ fontSize: '0.85rem' }}>View All →</Link>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.75rem' }}>
              {recentBlogs.map((blog, idx) => (
                <div key={blog.id} className={`reveal reveal-fade-up stagger-${(idx % 6) + 1} reveal-visible`}>
                  <BlogCard blog={blog} />
                </div>
              ))}
            </div>
          </RevealSection>
        )}

        {/* ── Recent Bookmarks ──────────────────────────────── */}
        {bookmarks.length > 0 && (
          <RevealSection className="home-section">
            <div className="flex-between mb-2">
              <h2>Recent Bookmarks</h2>
              <Link to="/bookmarks" className="btn btn-ghost" style={{ fontSize: '0.85rem' }}>View All →</Link>
            </div>
            <div className="recent-bookmarks">
              {bookmarks.slice(0, 3).map((b, idx) => (
                <Link key={b._id} to={`/surah/${encodeURIComponent(b.surahName)}#verse-${b.verseNumber}`} className={`card bookmark-preview reveal reveal-fade-up stagger-${(idx % 6) + 1} reveal-visible`}>
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
          </RevealSection>
        )}

        {/* ── All Surahs (Grid) ──────────────────────────────── */}
        {allSurahs.length > 0 && (
          <RevealSection className="home-section">
            <div className="flex-between mb-2">
              <h2>All Surahs</h2>
              <Link to="/surah" className="btn btn-ghost" style={{ fontSize: '0.85rem' }}>Filter Surahs →</Link>
            </div>
            <div className="surah-grid">
              {allSurahs.slice(0, showAllSurahs ? allSurahs.length : 42).map((s, idx) => (
                <Link key={s.number} to={`/surah/${s.englishName}`} className={`surah-card card reveal reveal-fade-up stagger-${(idx % 6) + 1} reveal-visible`}>
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
          </RevealSection>
        )}

        {/* ── Developer Note ─────────────────────────────────── */}
        <RevealSection className="home-section">
          <div className="developer-note reveal reveal-fade-up stagger-1 reveal-visible">
            <img
              className="developer-note-avatar"
              src="https://avatars.githubusercontent.com/codebyheera"
              alt="Muhammad Subhan Naeem, developer of Al-Quran Hub"
              width={72}
              height={72}
              loading="lazy"
            />
            <div className="developer-note-text">
              <div className="developer-note-header">
                <div className="developer-note-name">Muhammad Subhan Naeem</div>
                <span className="developer-note-role">Founder & Developer</span>
              </div>
              <p className="developer-note-message">
                I built this site on my own so anyone can read and listen to the Quran without ads or distractions.
                If Al-Quran Hub has benefited you, please remember me and my family in your duas.
              </p>
              <p className="developer-note-dua">May Allah accept this effort. Ameen</p>
              <div className="developer-note-socials">
                <a href="https://github.com/codebyheera" target="_blank" rel="noopener noreferrer"
                  className="developer-note-social-btn" aria-label="GitHub">
                  <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
                    <path d="M12 2C6.477 2 2 6.484 2 12.021c0 4.428 2.865 8.184 6.839 9.504.5.092.682-.217.682-.482 0-.237-.009-.868-.013-1.703-2.782.605-3.369-1.342-3.369-1.342-.454-1.155-1.11-1.463-1.11-1.463-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0 1 12 6.844a9.59 9.59 0 0 1 2.504.337c1.909-1.296 2.747-1.026 2.747-1.026.546 1.378.202 2.397.1 2.65.64.7 1.028 1.595 1.028 2.688 0 3.848-2.338 4.695-4.566 4.943.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.579.688.481C19.138 20.2 22 16.447 22 12.021 22 6.484 17.523 2 12 2z"/>
                  </svg>
                  GitHub
                </a>
                <a href="https://www.linkedin.com/in/codebysubhan/" target="_blank" rel="noopener noreferrer"
                  className="developer-note-social-btn" aria-label="LinkedIn">
                  <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
                    <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14zm-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.32 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.79zM6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68zm1.39 9.94v-8.37H5.5v8.37h2.77z"/>
                  </svg>
                  LinkedIn
                </a>
                <a href="https://medium.com/@muhammadsubhan189345" target="_blank" rel="noopener noreferrer"
                  className="developer-note-social-btn" aria-label="Medium">
                  <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
                    <path d="M13.54 12a6.8 6.8 0 0 1-6.77 6.82A6.8 6.8 0 0 1 0 12a6.8 6.8 0 0 1 6.77-6.82A6.8 6.8 0 0 1 13.54 12zm7.42 0c0 3.54-1.51 6.42-3.38 6.42-1.87 0-3.39-2.88-3.39-6.42s1.52-6.42 3.39-6.42 3.38 2.88 3.38 6.42M24 12c0 3.17-.53 5.75-1.19 5.75-.66 0-1.19-2.58-1.19-5.75s.53-5.75 1.19-5.75C23.47 6.25 24 8.83 24 12z"/>
                  </svg>
                  Medium
                </a>
                <a href="https://about.me/muhammadsubhannaeem" target="_blank" rel="noopener noreferrer"
                  className="developer-note-social-btn" aria-label="About.me">
                  <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/>
                  </svg>
                  About.me
                </a>
              </div>
            </div>
          </div>
        </RevealSection>
      </div>

      {/* ── Support CTA ──────────────────────────────────────── */}
      <RevealSection className="home-cta-section">
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
      </RevealSection>
    </div>
  );
}
