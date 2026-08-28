/**
 * components/TopBar.jsx — Thin utility bar above the main navbar.
 * Hidden on mobile, visible from tablet width up. Shows today's
 * Hijri + Gregorian date (left) and social links (right, same as Footer).
 */

import useHijriDate from '../hooks/useHijriDate';
import { SOCIAL_LINKS } from '../data/socialLinks';
import './TopBar.css';

export default function TopBar() {
  const { hijri, gregorianLong } = useHijriDate();

  return (
    <div className="topbar">
      <div className="topbar-inner">
        <div className="topbar-date">
          {hijri && <span>{hijri} AH</span>}
          {hijri && gregorianLong && <span className="topbar-sep">•</span>}
          {gregorianLong && <span>{gregorianLong}</span>}
        </div>

        <div className="topbar-socials">
          {SOCIAL_LINKS.map(({ id, label, href, Icon }) => (
            <a
              key={id}
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="topbar-social-link"
              aria-label={label}
            >
              <Icon />
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
