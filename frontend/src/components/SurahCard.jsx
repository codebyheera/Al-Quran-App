/**
 * components/SurahCard.jsx — The Surah card used in every Surah grid
 * (/surah, homepage, Prayer Times, /search), so they all look the same.
 * Place inside a `.surah-grid`. Styles: pages/SurahList.css.
 *
 * `surah` needs: number, englishName, nameTranslation, name, versesCount, revelation.
 */

import { Link } from 'react-router-dom';
import '../pages/SurahList.css';

export default function SurahCard({ surah: s, className = '' }) {
  return (
    <Link to={`/surah/${s.englishName}`} className={`surah-card card${className ? ` ${className}` : ''}`}>
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
  );
}
