/**
 * pages/SurahList.jsx — Grid of all 114 Surahs
 * Fetches from /api/surah and allows client-side filtering
 */

import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import api from '../lib/api';
import Breadcrumb from '../components/Breadcrumb';
import { pageSeo } from '../data/pageSeo';
import { buildSurahListSchema } from '../data/surahListSchema';
import './SurahList.css';

// The prerendered /surah page (scripts/prerender.js) embeds the Surah list, so
// the page renders complete on first paint without waiting for the API:
// window.__PRELOADED_SURAH_LIST__ during the build-time render, and the
// #preloaded-surah-list script tag in the browser.
function getPreloadedSurahList() {
  if (typeof window !== 'undefined' && window.__PRELOADED_SURAH_LIST__) {
    return window.__PRELOADED_SURAH_LIST__;
  }
  if (typeof document !== 'undefined') {
    const scriptEl = document.getElementById('preloaded-surah-list');
    if (scriptEl) {
      try { return JSON.parse(scriptEl.textContent); } catch { /* fall back to the API */ }
    }
  }
  return null;
}

export default function SurahList() {
  const [preloaded] = useState(getPreloadedSurahList);
  const [surahs, setSurahs] = useState(preloaded || []);
  const [loading, setLoading] = useState(!preloaded);
  const [error, setError] = useState(null);
  const [query, setQuery] = useState('');

  useEffect(() => {
    if (preloaded) return;
    api.get('/api/surah')
      .then(({ data }) => { setSurahs(data); setLoading(false); })
      .catch(() => { setError('Failed to load Surahs'); setLoading(false); });
  }, [preloaded]);

  // Filter by name or number
  const filtered = surahs.filter(
    (s) =>
      s.englishName.toLowerCase().includes(query.toLowerCase()) ||
      String(s.number).includes(query) ||
      s.name.includes(query)
  );

  if (loading) return (
    <div className="loading-center">
      <Helmet encodeSpecialCharacters={false}>
        <title>{pageSeo.surahList.title}</title>
        <meta name="description" content={pageSeo.surahList.description} />
        <link rel="canonical" href={`https://alquranhub.org${pageSeo.surahList.path}`} />
      </Helmet>
      <div className="spinner" />
      <p>Loading Surahs…</p>
    </div>
  );
  if (error) return (
    <div className="loading-center">
      <Helmet encodeSpecialCharacters={false}>
        <title>{pageSeo.surahList.title}</title>
        <meta name="description" content={pageSeo.surahList.description} />
        <link rel="canonical" href={`https://alquranhub.org${pageSeo.surahList.path}`} />
      </Helmet>
      <p style={{ color: 'var(--error)' }}>{error}</p>
    </div>
  );

  return (
    <div className="surah-list page-enter">
      <Helmet encodeSpecialCharacters={false}>
        <title>{pageSeo.surahList.title}</title>
        <meta name="description" content={pageSeo.surahList.description} />
        <link rel="canonical" href={`https://alquranhub.org${pageSeo.surahList.path}`} />
        <script type="application/ld+json">{JSON.stringify(buildSurahListSchema(surahs))}</script>
      </Helmet>


      <div className="container">
        {/* ── Breadcrumb Navigation ───────────────────────── */}
        {/* BreadcrumbList is part of buildSurahListSchema's @graph above */}
        <Breadcrumb schema={false} crumbs={[
          { label: 'Home', href: '/' },
          { label: 'Surahs', href: '/surah' },
        ]} />

        {/* Header */}
        <div className="sl-header">
          <div>
            <h1>Surahs</h1>
            <p className="text-muted">All 114 chapters of the Holy Quran</p>
          </div>
          <input
            className="input sl-search"
            type="text"
            placeholder="Filter by name or number…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>

        <p className="sl-intro text-muted">
          The Holy Quran is divided into 114 Surahs (chapters), revealed over 23 years to Prophet Muhammad ﷺ.
          Of these, 86 are Meccan (revealed in Makkah) and 28 are Medinan (revealed in Madinah). The shortest
          Surah is Al-Kawthar (3 verses) and the longest is Al-Baqarah (286 verses). Browse the complete list
          below to read, listen, and reflect.
        </p>

        {/* Grid */}
        <div className="surah-grid">
          {filtered.map((s) => (
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

        {filtered.length === 0 && (
          <p className="text-center text-muted mt-3">No Surahs matched "{query}".</p>
        )}
      </div>
    </div>
  );
}
