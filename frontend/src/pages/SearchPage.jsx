/**
 * pages/SearchPage.jsx — Quran search
 *
 * As you type: instant Surah / Ayah / Juz results (lib/searchEngine.js, no API) —
 * any spelling, typos, Arabic/Urdu names, "2:255", "para 30".
 * Enter: opens the result when the match is certain ("surah yaseen"), else
 * searches the verses' English translation (`?q=` → /api/search), with Load more.
 * Empty: popular shortcuts and all 114 Surahs to browse.
 */

import { useEffect, useMemo, useRef, useState } from 'react';
import { useSearchParams, Link, useLocation, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import api from '../lib/api';
import { pageSeo } from '../data/pageSeo';
import { SURAHS } from '../data/surahIndex';
import { searchQuran } from '../lib/searchEngine';
import SearchSuggestions, { moveActive } from '../components/SearchSuggestions';
import SurahCard from '../components/SurahCard';
import './SearchPage.css';

const PAGE_SIZE = 20;

const POPULAR = [
  { label: 'Yaseen', to: '/surah/Yaseen' },
  { label: 'Ar-Rahman', to: '/surah/Ar-Rahmaan' },
  { label: 'Al-Mulk', to: '/surah/Al-Mulk' },
  { label: 'Al-Kahf', to: '/surah/Al-Kahf' },
  { label: 'Al-Waqiah', to: '/surah/Al-Waaqia' },
  { label: 'Ayat al-Kursi', to: '/surah/Al-Baqara#verse-255' },
  { label: 'Juz 30', to: '/juz/30' },
];

const REVELATION_FILTERS = [
  { id: 'all', label: 'All 114' },
  { id: 'Meccan', label: 'Meccan' },
  { id: 'Medinan', label: 'Medinan' },
];

function track(event, params) {
  try { window.gtag?.('event', event, params); } catch { /* analytics is optional */ }
}

export default function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const location = useLocation();
  const navigate = useNavigate();
  const inputRef = useRef(null);

  // The URL param is the single source of truth for the verse search
  const urlQuery = (searchParams.get('q') || '').trim();

  const [input, setInput] = useState(urlQuery);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [verses, setVerses] = useState([]);
  const [terms, setTerms] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState(null);
  const [revelation, setRevelation] = useState('all');

  const smart = useMemo(() => searchQuran(input), [input]);
  const typed = input.trim();

  // Verse search whenever the URL q param changes
  useEffect(() => {
    setInput(urlQuery); // keep the box in sync when landing from the homepage
    setActiveIndex(-1);
    setVerses([]);
    setTotal(0);
    setError(null);
    if (!urlQuery) return undefined;
    let cancelled = false;
    setLoading(true);
    api.get('/api/search', { params: { q: urlQuery, limit: PAGE_SIZE, offset: 0 } })
      .then(({ data }) => {
        if (cancelled) return;
        setVerses(data.matches || []);
        setTerms(data.terms || []);
        setTotal(data.total ?? (data.matches || []).length);
        setLoading(false);
        const surahHits = searchQuran(urlQuery).items.length;
        track('search', { search_term: urlQuery });
        if (!data.total && !surahHits) track('search_no_results', { search_term: urlQuery });
      })
      .catch((err) => {
        if (cancelled) return;
        setError(err.response?.data?.error || 'Search failed. Please try again.');
        setLoading(false);
      });
    return () => { cancelled = true; };
  }, [urlQuery]);

  // Esc leaves search (opened via the header button or Ctrl+K / "/"),
  // returning to the page the visitor came from.
  useEffect(() => {
    function handleEscape(e) {
      if (e.key !== 'Escape') return;
      if (location.key !== 'default') navigate(-1);
      else navigate('/');
    }
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [location.key, navigate]);

  function loadMore() {
    setLoadingMore(true);
    api.get('/api/search', { params: { q: urlQuery, limit: PAGE_SIZE, offset: verses.length } })
      .then(({ data }) => {
        setVerses((prev) => [...prev, ...(data.matches || [])]);
        setLoadingMore(false);
      })
      .catch(() => setLoadingMore(false));
  }

  function handleSubmit(e) {
    e.preventDefault();
    if (!typed) return;
    // A highlighted suggestion, or a certain match, opens directly.
    const picked = activeIndex >= 0 ? smart.items[activeIndex] : smart.best;
    if (picked) {
      navigate(picked.url);
      return;
    }
    setSearchParams({ q: typed });
  }

  // "Try" examples fill the box, so the instant results show what each one does.
  function tryQuery(q) {
    setInput(q);
    setActiveIndex(-1);
    inputRef.current?.focus();
  }

  function handleKeyDown(e) {
    moveActive(e, smart.items.length, activeIndex, setActiveIndex);
  }

  const showVerses = urlQuery && urlQuery === typed;
  const browseList = revelation === 'all' ? SURAHS : SURAHS.filter((s) => s.revelation === revelation);

  return (
    <div className="search-page page-enter">
      <Helmet>
        <title>{pageSeo.search.title}</title>
        <meta name="description" content={pageSeo.search.description} />
        <link rel="canonical" href={`https://alquranhub.org${pageSeo.search.path}`} />
      </Helmet>
      <div className="container">
        <h1 className="sp-title">Search the Quran</h1>

        <form className="sp-form" onSubmit={handleSubmit} role="search">
          <input
            ref={inputRef}
            className="input sp-input"
            type="search"
            placeholder="Surah name, number, ayah (2:255) or a word…"
            aria-label="Search the Quran"
            value={input}
            onChange={(e) => { setInput(e.target.value); setActiveIndex(-1); }}
            onKeyDown={handleKeyDown}
            autoFocus
            autoComplete="off"
            aria-controls="sp-suggestions"
            aria-activedescendant={activeIndex >= 0 ? `sp-suggestions-${activeIndex}` : undefined}
          />
          <button type="submit" className="btn btn-primary">Search</button>
        </form>

        {/* Instant Surah / Ayah / Juz results */}
        {typed && smart.items.length > 0 && (
          <section className="sp-section" aria-label="Surahs and Ayahs">
            <h2 className="sp-section-title">Surahs &amp; Ayahs</h2>
            <div className="sp-suggestions card">
              <SearchSuggestions
                id="sp-suggestions"
                items={smart.items}
                didYouMean={smart.didYouMean}
                activeIndex={activeIndex}
              />
            </div>
            {!showVerses && (
              <p className="sp-hint text-muted">
                Press <kbd>Enter</kbd> to {smart.best ? `open ${smart.best.type === 'surah' ? `Surah ${smart.best.surah.englishName}` : 'it'}` : `search verses for “${typed}”`}.
              </p>
            )}
          </section>
        )}

        {typed && !smart.items.length && !showVerses && (
          <p className="sp-hint text-muted">No Surah matches “{typed}”. Press <kbd>Enter</kbd> to search the verses.</p>
        )}

        {/* Verse results */}
        {showVerses && (
          <section className="sp-section" aria-label="Verses">
            <h2 className="sp-section-title">Verses</h2>
            {loading && <div className="loading-center"><div className="spinner" /><p>Searching…</p></div>}
            {error && <p className="sp-error">{error}</p>}
            {!loading && !error && (
              <p className="sp-count text-muted">
                {total === 0
                  ? `No verses found for “${urlQuery}”.`
                  : `${total} verse${total !== 1 ? 's' : ''} for “${urlQuery}”`}
              </p>
            )}
            <div className="sp-results">
              {verses.map((r) => (
                <Link
                  key={`${r.surahNumber}-${r.verseNumber}`}
                  to={`/surah/${r.surahName}#verse-${r.verseNumber}`}
                  className="sp-card card"
                >
                  <div className="flex-between mb-1">
                    <span className="badge badge-gold">{r.surahName} {r.surahNumber}:{r.verseNumber}</span>
                    <span className="text-muted" style={{ fontSize: '0.75rem' }}>→ Read</span>
                  </div>
                  <p className="sp-text">{highlightTerms(r.text, terms)}</p>
                </Link>
              ))}
            </div>
            {!loading && verses.length < total && (
              <div className="sp-more">
                <button type="button" className="btn btn-secondary" onClick={loadMore} disabled={loadingMore}>
                  {loadingMore ? 'Loading…' : `Load more (${total - verses.length} left)`}
                </button>
              </div>
            )}
          </section>
        )}

        {/* Nothing typed: shortcuts + browse all Surahs */}
        {!typed && (
          <>
            <section className="sp-section" aria-label="Popular">
              <h2 className="sp-section-title">Popular</h2>
              <div className="sp-chips">
                {POPULAR.map((p) => (
                  <Link key={p.to} to={p.to} className="sp-chip">{p.label}</Link>
                ))}
              </div>
              <p className="sp-hint text-muted">
                Try: <button type="button" className="sp-try" onClick={() => tryQuery('surah rehman')}>surah rehman</button>,{' '}
                <button type="button" className="sp-try" onClick={() => tryQuery('2:255')}>2:255</button>,{' '}
                <button type="button" className="sp-try" onClick={() => tryQuery('para 30')}>para 30</button>,{' '}
                <button type="button" className="sp-try" onClick={() => tryQuery('mercy')}>mercy</button>
              </p>
            </section>

            <section className="sp-section" aria-label="All Surahs">
              <div className="sp-browse-head">
                <h2 className="sp-section-title">Browse all Surahs</h2>
                <div className="sp-filter" role="group" aria-label="Filter by revelation">
                  {REVELATION_FILTERS.map((f) => (
                    <button
                      key={f.id}
                      type="button"
                      className={`sp-filter-btn${revelation === f.id ? ' active' : ''}`}
                      aria-pressed={revelation === f.id}
                      onClick={() => setRevelation(f.id)}
                    >
                      {f.label}
                    </button>
                  ))}
                </div>
              </div>
              {/* Same cards as the /surah page */}
              <div className="surah-grid">
                {browseList.map((s) => <SurahCard key={s.number} surah={s} />)}
              </div>
            </section>
          </>
        )}
      </div>
    </div>
  );
}

/**
 * Wrap matched words in <mark>, the same way the API matched them: a term of
 * 4+ letters marks every word starting with it ("forgiv" → "forgiveness"),
 * a shorter one only that whole word ("me" never marks "mercy").
 */
function highlightTerms(text, terms) {
  if (!terms.length) return text;
  const parts = terms.map((t) => (t.length < 4 ? `${escapeRegex(t)}\\b` : `${escapeRegex(t)}[\\w'-]*`));
  const re = new RegExp(`\\b(?:${parts.join('|')})`, 'gi');
  const out = [];
  let last = 0;
  for (const m of text.matchAll(re)) {
    if (m.index > last) out.push(text.slice(last, m.index));
    out.push(<mark key={m.index} className="sp-highlight">{m[0]}</mark>);
    last = m.index + m[0].length;
  }
  if (last < text.length) out.push(text.slice(last));
  return out;
}

function escapeRegex(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
