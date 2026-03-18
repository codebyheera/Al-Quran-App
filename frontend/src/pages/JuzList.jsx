/**
 * pages/JuzList.jsx — Grid of all 30 Juz
 */

import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import api from '../lib/api';
import './JuzList.css';

export default function JuzList() {
  const [juzList, setJuzList] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/api/juz')
      .then(({ data }) => { setJuzList(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  if (loading) return <div className="loading-center"><div className="spinner" /><p>Loading Juz list…</p></div>;

  return (
    <div className="juz-list page-enter">
      <Helmet>
        <title>Holy Quran Juz – Arabic Recitation Online</title>
        <meta name="description" content="Read and listen to the complete Quran Juz online. Perfect for recitation, learning, and spiritual growth." />
        <link rel="canonical" href="https://al-quran-by-subhan.vercel.app/juz" />
      </Helmet>
      
      <div className="container">
        <div className="jl-header">
          <h1>Juz</h1>
          <p className="text-muted">All 30 parts of the Holy Quran</p>
        </div>

        <div className="juz-grid">
          {juzList.map((j) => (
            <Link key={j.juzNumber} to={`/juz/${j.juzNumber}`} className="juz-card card">
              <div className="juz-card-content">
                <div className="juz-info">
                  <span className="juz-label">JUZ</span>
                  <span className="juz-number">{j.juzNumber}</span>
                </div>
                <div className="juz-divider"></div>
                <div className="juz-start">
                  <span className="juz-start-label text-muted">Starts at</span>
                  <span className="juz-start-value">Surah {j.startSurah} : {j.startVerse}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
