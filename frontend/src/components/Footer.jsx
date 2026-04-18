import { Link } from 'react-router-dom';
import './Footer.css';

const QUICK_LINKS = [
  { label: 'Home',      to: '/' },
  { label: 'Surahs',    to: '/surah' },
  { label: 'Juz',       to: '/juz' },
  { label: 'Bookmarks', to: '/bookmarks' },
  { label: 'Support ✨', to: '/support' },
];

const FEATURES = [
  'Arabic Text with Translation',
  'Audio Recitation by Top Reciters',
  'Word-by-Word Playback',
  'Bookmark Any Verse',
  'Multiple Premium Themes',
];

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="footer">
      <div className="footer-inner">

        {/* ── Brand ── */}
        <div className="footer-brand">
          <Link to="/" className="footer-logo">
            <span className="footer-logo-icon">☪</span>
            <span className="footer-logo-text">Al-<span>Quran</span></span>
          </Link>
          <p className="footer-tagline">
            Read, Listen, and Reflect on the Holy Quran — anytime, anywhere.
          </p>
          <p className="footer-verse">
            ❝ …Indeed, it is We who sent down the Quran, and indeed, We will be its guardian. ❞
            <span className="footer-verse-ref"> — Surah Al-Hijr (15:9)</span>
          </p>
        </div>

        {/* ── Quick Links ── */}
        <div className="footer-col">
          <h4 className="footer-col-title">Quick Links</h4>
          <ul className="footer-list">
            {QUICK_LINKS.map(link => (
              <li key={link.to}>
                <Link to={link.to} className="footer-link">{link.label}</Link>
              </li>
            ))}
          </ul>
        </div>

        {/* ── Features ── */}
        <div className="footer-col">
          <h4 className="footer-col-title">Features</h4>
          <ul className="footer-list">
            {FEATURES.map(f => (
              <li key={f} className="footer-feature-item">
                <span className="footer-feature-dot" />
                {f}
              </li>
            ))}
          </ul>
        </div>

      </div>

      {/* ── Bottom bar ── */}
      <div className="footer-bottom">
        <p className="footer-credit">
          Built with <span className="footer-heart">♥</span> by{' '}
          <strong className="footer-author">Muhammad Subhan Naeem</strong>
        </p>
        <p className="footer-copy">© {year} Al-Quran App. All rights reserved.</p>
      </div>
    </footer>
  );
}
