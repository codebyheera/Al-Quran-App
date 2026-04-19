/**
 * NotFound.jsx — 404 Page Component
 *
 * Shown automatically by React Router when no route matches.
 * SEO: Sets document title + meta description dynamically.
 * Themeable: uses CSS custom properties from global.css.
 */

import { useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import './NotFound.css';

/* ── Inline SVG icons (no extra dep) ─────────────────────────── */
const HomeIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24"
    fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 9.5L12 3l9 6.5V20a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9.5z" />
    <polyline points="9 21 9 12 15 12 15 21" />
  </svg>
);

const ArrowLeftIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24"
    fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="19" y1="12" x2="5" y2="12" />
    <polyline points="12 19 5 12 12 5" />
  </svg>
);

const LinkIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24"
    fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
    <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
  </svg>
);

const BookIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24"
    fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
    <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
  </svg>
);

const SearchIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24"
    fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8" />
    <line x1="21" y1="21" x2="16.65" y2="16.65" />
  </svg>
);

const BookmarkIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24"
    fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
  </svg>
);

/* ── Quick links config ───────────────────────────────────────── */
const QUICK_LINKS = [
  { to: '/surah',     label: 'All Surahs',  icon: <BookIcon /> },
  { to: '/juz',       label: 'Juz / Para',  icon: <BookIcon /> },
  { to: '/search',    label: 'Search',      icon: <SearchIcon /> },
  { to: '/bookmarks', label: 'Bookmarks',   icon: <BookmarkIcon /> },
];

/* ── Component ───────────────────────────────────────────────── */
export default function NotFound() {
  const navigate  = useNavigate();
  const location  = useLocation();
  const badPath   = location.pathname;

  /* ── SEO: update document title & meta description ── */
  useEffect(() => {
    const prevTitle = document.title;
    document.title  = '404 — Page Not Found | Al-Quran Hub';

    // Update or inject meta description
    let metaDesc = document.querySelector('meta[name="description"]');
    const prevDesc = metaDesc?.getAttribute('content') ?? '';
    if (metaDesc) {
      metaDesc.setAttribute(
        'content',
        'The page you are looking for could not be found on Al-Quran Hub. Return home to read the Quran online.'
      );
    }

    // Tell crawlers this page doesn't exist
    let robotsMeta = document.querySelector('meta[name="robots"]');
    if (!robotsMeta) {
      robotsMeta = document.createElement('meta');
      robotsMeta.setAttribute('name', 'robots');
      document.head.appendChild(robotsMeta);
    }
    robotsMeta.setAttribute('content', 'noindex, follow');

    return () => {
      document.title = prevTitle;
      if (metaDesc) metaDesc.setAttribute('content', prevDesc);
      if (robotsMeta) robotsMeta.setAttribute('content', 'index, follow');
    };
  }, []);

  return (
    /* role="main" + aria-label help screen readers identify this landmark */
    <section
      className="not-found-page page-enter"
      aria-label="404 — Page not found"
    >
      <div className="not-found-card">

        {/* Arabic ornamental text */}
        <div className="not-found-ornament" aria-hidden="true">
          ٱللَّٰهُ
        </div>

        {/* 404 code */}
        <h1 className="not-found-code" aria-label="Error 404">404</h1>

        {/* Ornamental divider */}
        <div className="not-found-divider" aria-hidden="true">
          <span className="not-found-divider-icon">✦</span>
        </div>

        {/* Human-readable headline (single h2 since h1 = "404") */}
        <h2 className="not-found-title">Page Not Found</h2>

        {/* Description */}
        <p className="not-found-desc">
          The page you&apos;re looking for doesn&apos;t exist or may have been moved.
          Return home and continue your journey through the Quran.
        </p>

        {/* Show the bad URL so the user knows what went wrong */}
        {badPath && badPath !== '/' && (
          <div className="not-found-url-pill" title={`Attempted path: ${badPath}`}>
            <LinkIcon aria-hidden="true" />
            <span aria-label={`Requested path: ${badPath}`}>{badPath}</span>
          </div>
        )}

        {/* Primary actions */}
        <nav className="not-found-actions" aria-label="Recovery navigation">
          <Link
            to="/"
            id="not-found-home-btn"
            className="not-found-btn-home"
            aria-label="Go to Al-Quran Hub home page"
          >
            <HomeIcon aria-hidden="true" />
            Back to Home
          </Link>

          <button
            id="not-found-back-btn"
            className="not-found-btn-back"
            onClick={() => navigate(-1)}
            aria-label="Go back to the previous page"
          >
            <ArrowLeftIcon aria-hidden="true" />
            Go Back
          </button>
        </nav>

        {/* Quick-link pills */}
        <p className="not-found-links-label" aria-label="Or visit">Or jump to</p>
        <nav className="not-found-quick-links" aria-label="Quick site links">
          {QUICK_LINKS.map(({ to, label, icon }) => (
            <Link
              key={to}
              to={to}
              className="not-found-quick-link"
              id={`not-found-link-${label.toLowerCase().replace(/\s+/g, '-')}`}
              aria-label={`Go to ${label}`}
            >
              {icon}
              {label}
            </Link>
          ))}
        </nav>

      </div>
    </section>
  );
}
