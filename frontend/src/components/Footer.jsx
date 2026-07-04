import { Link } from 'react-router-dom';
import './Footer.css';

const QUICK_LINKS = [
  { label: 'Home', to: '/' },
  { label: 'Surahs', to: '/surah' },
  { label: 'Juz', to: '/juz' },
  { label: 'Bookmarks', to: '/bookmarks' },
  { label: 'Blog', to: '/blog' },
  { label: 'Support', to: '/support' },
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
            <a href="https://www.instagram.com/alquranhub.official/" target="_blank" rel="noopener noreferrer" className="social-icon-link" aria-label="Instagram">
              <svg viewBox="0 0 448 512" xmlns="http://www.w3.org/2000/svg">
                <path d="M224.1 141c-63.6 0-114.9 51.3-114.9 114.9s51.3 114.9 114.9 114.9S339 319.5 339 255.9 287.7 141 224.1 141zm0 189.6c-41.1 0-74.7-33.5-74.7-74.7s33.5-74.7 74.7-74.7 74.7 33.5 74.7 74.7-33.6 74.7-74.7 74.7zm146.4-194.3c0 14.9-12 26.8-26.8 26.8-14.9 0-26.8-12-26.8-26.8s12-26.8 26.8-26.8 26.8 12 26.8 26.8zm76.1 27.2c-1.7-35.9-9.9-67.7-36.2-93.9-26.2-26.2-58-34.4-93.9-36.2-37-2.1-147.9-2.1-184.9 0-35.8 1.7-67.6 9.9-93.9 36.1s-34.4 58-36.2 93.9c-2.1 37-2.1 147.9 0 184.9 1.7 35.9 9.9 67.7 36.2 93.9s58 34.4 93.9 36.2c37 2.1 147.9 2.1 184.9 0 35.9-1.7 67.7-9.9 93.9-36.2 26.2-26.2 34.4-58 36.2-93.9 2.1-37 2.1-147.8 0-184.8zM398.8 388c-7.8 19.6-22.9 34.7-42.6 42.6-29.5 11.7-99.5 9-132.1 9s-102.7 2.6-132.1-9c-19.6-7.8-34.7-22.9-42.6-42.6-11.7-29.5-9-99.5-9-132.1s-2.6-102.7 9-132.1c7.8-19.6 22.9-34.7 42.6-42.6 29.5-11.7 99.5-9 132.1-9s102.7-2.6 132.1 9c19.6 7.8 34.7 22.9 42.6 42.6 11.7 29.5 9 99.5 9 132.1s2.7 102.7-9 132.1z"/>
              </svg>
            </a>
            <a href="https://www.linkedin.com/company/alquranhub/" target="_blank" rel="noopener noreferrer" className="social-icon-link" aria-label="LinkedIn">
              <svg viewBox="0 0 448 512" xmlns="http://www.w3.org/2000/svg">
                <path d="M100.28 448H7.4V148.9h92.88zM53.79 108.1C24.09 108.1 0 83.5 0 53.8a53.79 53.79 0 0 1 107.58 0c0 29.7-24.1 54.3-53.79 54.3zM447.9 448h-92.68V302.4c0-34.7-.7-79.2-48.29-79.2-48.29 0-55.69 37.7-55.69 76.7V448h-92.78V148.9h89.08v40.8h1.3c12.4-23.5 42.69-48.3 87.88-48.3 94 0 111.28 61.9 111.28 142.3V448z"/>
              </svg>
            </a>
            <a href="https://www.youtube.com/@alquranhuborg" target="_blank" rel="noopener noreferrer" className="social-icon-link" aria-label="YouTube">
              <svg viewBox="0 0 576 512" xmlns="http://www.w3.org/2000/svg">
                <path d="M549.7 124.1c-6.3-23.7-24.8-42.3-48.3-48.6C458.8 64 288 64 288 64S117.2 64 74.6 75.5c-23.5 6.3-42 24.9-48.3 48.6-11.4 42.9-11.4 132.3-11.4 132.3s0 89.4 11.4 132.3c6.3 23.7 24.8 41.5 48.3 47.8C117.2 448 288 448 288 448s170.8 0 213.4-11.5c23.5-6.3 42-24.1 48.3-47.8 11.4-42.9 11.4-132.3 11.4-132.3s0-89.4-11.4-132.3zm-317.5 213.5V175.2l142.7 81.2-142.7 81.2z"/>
              </svg>
            </a>
            <a href="https://www.tiktok.com/@alquranhuborg" target="_blank" rel="noopener noreferrer" className="social-icon-link" aria-label="TikTok">
              <svg viewBox="0 0 448 512" xmlns="http://www.w3.org/2000/svg">
                <path d="M448 209.9a210.1 210.1 0 0 1-122.8-39.3V349.4A162.6 162.6 0 1 1 185 188.3V278a74.6 74.6 0 1 0 52.2 71.2V0l88 0a121.2 121.2 0 0 0 1.9 22.2h0A122.2 122.2 0 0 0 381 102.4a121.4 121.4 0 0 0 67 20.1z"/>
              </svg>
            </a>
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
