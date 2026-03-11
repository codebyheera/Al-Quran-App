/**
 * pages/JuzList.jsx — Grid of all 30 Juz
 */

import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import './JuzList.css';

export default function JuzList() {
  const [juzList, setJuzList] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get('/api/juz')
      .then(({ data }) => { setJuzList(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  if (loading) return <div className="loading-center"><div className="spinner" /><p>Loading Juz list…</p></div>;

  return (
    <div className="juz-list page-enter">
      <div className="container">
        <div className="jl-header">
          <h1>Juz</h1>
          <p className="text-muted">All 30 parts of the Holy Quran</p>
        </div>

        <div className="juz-grid">
          {juzList.map((j) => (
            <Link key={j.juzNumber} to={`/juz/${j.juzNumber}`} className="juz-card card">
              {/* Decorative Arabic Juz number */}
              <div className="juz-arabic-num">
                {toArabicNum(j.juzNumber)}
              </div>
              <div className="juz-info">
                <span className="juz-label">Juz</span>
                <span className="juz-number">{j.juzNumber}</span>
              </div>
              <div className="juz-start text-muted">
                <span>Starts at</span>
                <span>Surah {j.startSurah} : {j.startVerse}</span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

// Convert a western numeral to Arabic-Indic numeral for decoration
function toArabicNum(n) {
  return String(n).split('').map((d) => '٠١٢٣٤٥٦٧٨٩'[parseInt(d)]).join('');
}
