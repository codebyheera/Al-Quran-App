/**
 * pages/SearchPage.jsx — Search results page
 * Reads `?q=` from URL, calls /api/search, displays matching verses
 */

import { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import axios from 'axios';
import './SearchPage.css';

export default function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams();

  // The URL param is the single source of truth for the active search
  const urlQuery = searchParams.get('q') || '';

  const [input,    setInput]    = useState(urlQuery);
  const [results,  setResults]  = useState([]);
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState(null);
  const [searched, setSearched] = useState(false);

  // Re-run search whenever the URL q param changes
  useEffect(() => {
    setInput(urlQuery); // keep input box in sync when landing from homepage
    if (!urlQuery.trim()) return;
    setLoading(true);
    setError(null);
    setSearched(true);
    setResults([]);
    axios.get(`/api/search?q=${encodeURIComponent(urlQuery.trim())}`)
      .then(({ data }) => { setResults(data.matches || []); setLoading(false); })
      .catch((err) => {
        const msg = err.response?.data?.error || 'Search failed. Please try again.';
        setError(msg);
        setLoading(false);
      });
  }, [urlQuery]); // ← triggered on every URL change, including from homepage

  function handleSubmit(e) {
    e.preventDefault();
    if (!input.trim()) return;
    // Updating the URL param triggers the useEffect above
    setSearchParams({ q: input.trim() });
  }

  return (
    <div className="search-page page-enter">
      <div className="container">
        <h1 className="sp-title">Search the Quran</h1>

        {/* Search form */}
        <form className="sp-form" onSubmit={handleSubmit}>
          <input
            className="input sp-input"
            type="text"
            placeholder="Enter a word or phrase in English…"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            autoFocus
          />
          <button type="submit" className="btn btn-primary">Search</button>
        </form>

        {/* Loading */}
        {loading && <div className="loading-center"><div className="spinner" /><p>Searching…</p></div>}

        {/* Error */}
        {error && <p className="sp-error">{error}</p>}

        {/* Results count */}
        {!loading && searched && !error && (
          <p className="sp-count text-muted">
            {results.length === 0
              ? `No results found for "${urlQuery}".`
              : `${results.length} result${results.length !== 1 ? 's' : ''} for "${urlQuery}"`
            }
          </p>
        )}

        {/* Result cards */}
        <div className="sp-results">
          {results.map((r) => (
            <Link
              key={`${r.surahNumber}-${r.verseNumber}`}
              to={`/surah/${r.surahNumber}#verse-${r.verseNumber}`}
              className="sp-card card"
            >
              <div className="flex-between mb-1">
                <span className="badge badge-gold">{r.surahName} {r.surahNumber}:{r.verseNumber}</span>
                <span className="text-muted" style={{ fontSize: '0.75rem' }}>→ Read</span>
              </div>
              <p className="sp-text">
                {/* Highlight the search keyword */}
                {highlightMatch(r.text, urlQuery)}
              </p>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

/**
 * Wrap matching substrings in <mark> tags for highlighting
 */
function highlightMatch(text, query) {
  if (!query) return text;
  const parts = text.split(new RegExp(`(${escapeRegex(query)})`, 'gi'));
  return parts.map((part, i) =>
    part.toLowerCase() === query.toLowerCase()
      ? <mark key={i} className="sp-highlight">{part}</mark>
      : part
  );
}

function escapeRegex(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
