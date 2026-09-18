/**
 * components/LanguagePrefDropdown.jsx — Change the translation language
 * preference at any time from the navbar. Desktop only (hidden by CSS below
 * the mobile breakpoint).
 *
 * Reuses the navbar's existing dropdown markup/classes so it matches the
 * Qari and Theme dropdowns exactly.
 */

import { useState, useRef, useEffect } from 'react';
import { useAudio } from '../context/AudioContext';
import './LanguagePreference.css';

const OPTIONS = [
  { id: 'english', name: 'English', short: 'EN' },
  { id: 'urdu', name: 'Urdu', short: 'UR' },
];

export default function LanguagePrefDropdown() {
  const { preferredLanguage, setPreferredLanguage } = useAudio();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    function handleClickOutside(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Never asked yet (prompt still pending or dismissed on mobile) — show the
  // effective default rather than a blank trigger.
  const current = OPTIONS.find((o) => o.id === preferredLanguage) || OPTIONS[0];

  return (
    <div className="navbar-dropdown lang-pref-dropdown" ref={ref}>
      <button
        className={`dropdown-trigger ${open ? 'open' : ''}`}
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="listbox"
        aria-expanded={open}
        title={`Translation language (${current.name})`}
      >
        <span className="dropdown-trigger-icon" aria-hidden="true">🌐</span>
        <span className="lang-pref-trigger-label">{current.short}</span>
        <svg
          className={`dropdown-chevron ${open ? 'rotated' : ''}`}
          viewBox="0 0 24 24"
          width="14"
          height="14"
          fill="currentColor"
        >
          <path d="M7 10l5 5 5-5z" />
        </svg>
      </button>

      {open && (
        <div className="dropdown-panel theme-panel" role="listbox">
          <div className="dropdown-panel-header">Translation</div>
          {OPTIONS.map((o) => (
            <button
              key={o.id}
              className={`dropdown-option ${o.id === preferredLanguage ? 'selected' : ''}`}
              role="option"
              aria-selected={o.id === preferredLanguage}
              onClick={() => { setPreferredLanguage(o.id); setOpen(false); }}
            >
              <span className="dropdown-option-info">
                <span className="dropdown-option-name">{o.name}</span>
              </span>
              {o.id === preferredLanguage && (
                <svg viewBox="0 0 24 24" width="15" height="15" fill="currentColor">
                  <path d="M9 16.2L4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4L9 16.2z" />
                </svg>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
