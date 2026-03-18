/**
 * pages/SurahList.jsx — Grid of all 114 Surahs
 * Fetches from /api/surah and allows client-side filtering
 */

import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import api from '../lib/api';
import './SurahList.css';

export default function SurahList() {
  const [surahs, setSurahs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [query, setQuery] = useState('');

  useEffect(() => {
    api.get('/api/surah')
      .then(({ data }) => { setSurahs(data); setLoading(false); })
      .catch(() => { setError('Failed to load Surahs'); setLoading(false); });
  }, []);

  // Filter by name or number
  const filtered = surahs.filter(
    (s) =>
      s.englishName.toLowerCase().includes(query.toLowerCase()) ||
      String(s.number).includes(query) ||
      s.name.includes(query)
  );

  if (loading) return <div className="loading-center"><div className="spinner" /><p>Loading Surahs…</p></div>;
  if (error) return <div className="loading-center"><p style={{ color: '#e74c3c' }}>{error}</p></div>;

  return (
    <div className="surah-list page-enter">
      <Helmet>
        <title>Surahs of the Quran – Read & Listen Online Free</title>
        <meta name="description" content="Access all Surahs of the Holy Quran online. Read in Arabic, listen to authentic recitations, and explore each Ayah easily." />
        <link rel="canonical" href="https://al-quran-by-subhan.vercel.app/surah" />
      </Helmet>

      <div className="container">
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

        {/* Grid */}
        <div className="surah-grid">
          {filtered.map((s) => (
            <Link key={s.number} to={`/surah/${s.number}`} className="surah-card card">
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
