import { Link } from 'react-router-dom';
import { SOCIAL_LINKS } from '../data/socialLinks';
import './Footer.css';

const QUICK_LINKS = [
  { label: 'Home', to: '/' },
  { label: 'Surahs', to: '/surah' },
  { label: 'Juz', to: '/juz' },
  { label: 'Tasbih Counter', to: '/tasbih' },
  { label: 'Prayer Times', to: '/prayer-times' },
];

const MORE_LINKS = [
  { label: 'Bookmarks', to: '/bookmarks' },
  { label: 'Blog', to: '/blog' },
  { label: 'Support', to: '/support' },
  { label: 'Contact', to: '/contact' },
];

const FEATURES = [
  'Arabic Text with Translation',
  'Audio Recitation by Top Reciters',
  'Word-by-Word Playback',
  'Bookmark Any Verse',
  'Digital Tasbih Counter',
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
            <span className="footer-logo-text">Al-<span>Quran</span> Hub</span>
          </Link>
          <p className="footer-tagline">
            Read, Listen, and Reflect on the Holy Quran — anytime, anywhere.
          </p>
          <p className="footer-verse">
            ❝ …Indeed, it is We who sent down the Quran, and indeed, We will be its guardian. ❞
            <span className="footer-verse-ref"> — Surah Al-Hijr (15:9)</span>
          </p>
          <div className="footer-socials">
            {SOCIAL_LINKS.map(({ id, label, href, Icon }) => (
              <a key={id} href={href} target="_blank" rel="noopener noreferrer" className="social-icon-link" aria-label={label}>
                <Icon />
              </a>
            ))}
          </div>
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

        {/* ── More ── */}
        <div className="footer-col">
          <h4 className="footer-col-title">More</h4>
          <ul className="footer-list">
            {MORE_LINKS.map(link => (
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
          <a
            href="https://www.linkedin.com/in/codebysubhan/"
            target="_blank"
            rel="noopener noreferrer"
            className="footer-author"
          >
            Muhammad Subhan Naeem
          </a>
        </p>
        <p className="footer-copy">© {year} Al-Quran Hub. All rights reserved.</p>
      </div>
    </footer>
  );
}
