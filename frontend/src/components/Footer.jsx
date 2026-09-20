import { Link } from 'react-router-dom';
import { SOCIAL_LINKS } from '../data/socialLinks';
import './Footer.css';

/**
 * components/Footer.jsx — Site-wide footer.
 *
 * Reusable/self-contained: every list of links is an optional prop with a
 * default matching the current live site, so this component can be dropped
 * into another route (or reused in a different project) by overriding props
 * instead of editing the file. See the propTypes-style defaults below for
 * the exact shape each prop expects.
 *
 * Colors/typography intentionally use the app's CSS custom properties
 * (var(--accent-gold), var(--font-ui), etc. — see src/styles/global.css)
 * rather than fixed hex values or a fixed font-family. This site ships 7
 * switchable themes (dark, light, emerald, deep-sea, and others via
 * ThemeContext) — one of which the Footer's own Features list advertises
 * ("Multiple Premium Themes") — so hardcoding colors here would make the
 * footer the one part of the site that ignores the user's chosen theme.
 */

const DEFAULT_QUICK_LINKS = [
  { label: 'Home', to: '/' },
  { label: 'Surahs', to: '/surah' },
  { label: 'Juz', to: '/juz' },
  { label: 'Tasbih Counter', to: '/tasbih' },
  { label: 'Prayer Times', to: '/prayer-times' },
];

const DEFAULT_MORE_LINKS = [
  { label: 'Bookmarks', to: '/bookmarks' },
  { label: 'Durood Sharif', to: '/durood-sharif' },
  { label: 'Blog', to: '/blog' },
  { label: 'Support', to: '/support' },
  { label: 'Contact', to: '/contact' },
];

const DEFAULT_LEGAL_LINKS = [
  { label: 'Privacy Policy', to: '/privacy-policy' },
  { label: 'Terms & Conditions', to: '/terms-and-conditions' },
];

const DEFAULT_FEATURES = [
  'Arabic Text with Translation',
  'Audio Recitation by Top Reciters',
  'Word-by-Word Playback',
  'Bookmark Any Verse',
  'Digital Tasbih Counter',
  'Multiple Premium Themes',
];

export default function Footer({
  companyName = 'Al-Quran Hub',
  tagline = 'Read, Listen, and Reflect on the Holy Quran — anytime, anywhere.',
  quoteText = '…Indeed, it is We who sent down the Quran, and indeed, We will be its guardian.',
  quoteRef = 'Surah Al-Hijr (15:9)',
  authorName = 'Muhammad Subhan Naeem',
  authorUrl = 'https://www.linkedin.com/in/codebysubhan/',
  year = new Date().getFullYear(),
  socialLinks = SOCIAL_LINKS,
  quickLinks = DEFAULT_QUICK_LINKS,
  moreLinks = DEFAULT_MORE_LINKS,
  legalLinks = DEFAULT_LEGAL_LINKS,
  features = DEFAULT_FEATURES,
}) {
  return (
    <footer className="footer">
      <div className="footer-inner">

        {/* ── Brand ── */}
        <section className="footer-brand" aria-label={`${companyName} branding`}>
          <Link to="/" className="footer-logo">
            <span className="footer-logo-icon" aria-hidden="true">☪</span>
            <span className="footer-logo-text">Al-<span>Quran</span> Hub</span>
          </Link>
          <p className="footer-tagline">{tagline}</p>
          <p className="footer-verse">
            ❝ {quoteText} ❞
            <span className="footer-verse-ref"> — {quoteRef}</span>
          </p>
          {socialLinks.length > 0 && (
            <div className="footer-socials">
              {socialLinks.map(({ id, label, href, Icon }) => (
                <a
                  key={id}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="social-icon-link"
                  aria-label={label}
                >
                  <Icon />
                </a>
              ))}
            </div>
          )}
        </section>

        {/* ── Quick Links ── */}
        {quickLinks.length > 0 && (
          <nav className="footer-col" aria-label="Quick links">
            <h2 className="footer-col-title">Quick Links</h2>
            <ul className="footer-list">
              {quickLinks.map(link => (
                <li key={link.to}>
                  <Link to={link.to} className="footer-link">{link.label}</Link>
                </li>
              ))}
            </ul>
          </nav>
        )}

        {/* ── More ── */}
        {moreLinks.length > 0 && (
          <nav className="footer-col" aria-label="More links">
            <h2 className="footer-col-title">More</h2>
            <ul className="footer-list">
              {moreLinks.map(link => (
                <li key={link.to}>
                  <Link to={link.to} className="footer-link">{link.label}</Link>
                </li>
              ))}
            </ul>
          </nav>
        )}

        {/* ── Features ── */}
        {features.length > 0 && (
          <section className="footer-col" aria-label="Features">
            <h2 className="footer-col-title">Features</h2>
            <ul className="footer-list">
              {features.map(f => (
                <li key={f} className="footer-feature-item">
                  <span className="footer-feature-check" aria-hidden="true">✓</span>
                  {f}
                </li>
              ))}
            </ul>
          </section>
        )}

      </div>

      {/* ── Bottom bar ── */}
      <div className="footer-bottom">
        <p className="footer-credit">
          Built with <span className="footer-heart" aria-hidden="true">♥</span> by{' '}
          <a
            href={authorUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="footer-author"
          >
            {authorName}
          </a>
          <span className="footer-bottom-sep" aria-hidden="true"> | </span>
          <span className="footer-copy">© {year} {companyName}. All rights reserved.</span>
        </p>

        {legalLinks.length > 0 && (
          <nav className="footer-legal" aria-label="Legal">
            {legalLinks.map((link, i) => (
              <span key={link.to} className="footer-legal-item">
                <Link to={link.to} className="footer-link footer-legal-link">{link.label}</Link>
                {i < legalLinks.length - 1 && <span className="footer-bottom-sep" aria-hidden="true"> | </span>}
              </span>
            ))}
          </nav>
        )}
      </div>
    </footer>
  );
}
