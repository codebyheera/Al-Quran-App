/**
 * components/Navbar.jsx — Sticky top navigation bar
 * Contains logo, nav links, search input, qari selector, bookmark link, and theme toggle
 */

import { NavLink, useNavigate } from 'react-router-dom';
import { useState, useRef, useEffect } from 'react';
import { useTheme } from '../context/ThemeContext';
import { useQari } from '../context/QariContext';
import '../styles/Navbar.css';

function QariDropdown({ reciter, changeReciter, reciters }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const current = reciters.find((r) => r.id === reciter);

  // Close when clicking outside
  useEffect(() => {
    function handleClickOutside(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="navbar-dropdown" ref={ref}>
      <button
        className={`dropdown-trigger ${open ? 'open' : ''}`}
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="listbox"
        aria-expanded={open}
        title="Select Reciter"
      >
        <span className="dropdown-trigger-icon">🎙️</span>
        <span className="dropdown-trigger-label">{current?.name}</span>
        <svg className={`dropdown-chevron ${open ? 'rotated' : ''}`} viewBox="0 0 24 24" width="14" height="14" fill="currentColor">
          <path d="M7 10l5 5 5-5z"/>
        </svg>
      </button>

      {open && (
        <div className="dropdown-panel" role="listbox">
          <div className="dropdown-panel-header">Reciter</div>
          {reciters.map((r) => (
            <button
              key={r.id}
              className={`dropdown-option ${r.id === reciter ? 'selected' : ''}`}
              role="option"
              aria-selected={r.id === reciter}
              onClick={() => { changeReciter(r.id); setOpen(false); }}
            >
              <span className="dropdown-option-info">
                <span className="dropdown-option-name">{r.name}</span>
              </span>
              {r.id === reciter && (
                <svg viewBox="0 0 24 24" width="15" height="15" fill="currentColor">
                  <path d="M9 16.2L4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4L9 16.2z"/>
                </svg>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function ThemeDropdown({ theme, changeTheme, themes }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const current = themes.find((t) => t.id === theme);

  // Close when clicking outside
  useEffect(() => {
    function handleClickOutside(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="navbar-dropdown" ref={ref}>
      <button
        className={`dropdown-trigger ${open ? 'open' : ''}`}
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="listbox"
        aria-expanded={open}
        title="Select Theme"
      >
        <span className="dropdown-trigger-icon">🎨</span>
        <span className="dropdown-trigger-label" style={{display: 'none'}}>{current?.name}</span>
        <svg className={`dropdown-chevron ${open ? 'rotated' : ''}`} viewBox="0 0 24 24" width="14" height="14" fill="currentColor">
          <path d="M7 10l5 5 5-5z"/>
        </svg>
      </button>

      {open && (
        <div className="dropdown-panel theme-panel" role="listbox">
          <div className="dropdown-panel-header">Theme</div>
          {themes.map((t) => (
            <button
              key={t.id}
              className={`dropdown-option ${t.id === theme ? 'selected' : ''}`}
              role="option"
              aria-selected={t.id === theme}
              onClick={() => { changeTheme(t.id); setOpen(false); }}
            >
              <span className="dropdown-option-info">
                <span className="dropdown-trigger-icon" style={{marginRight: '8px'}}>{t.icon}</span>
                <span className="dropdown-option-name">{t.name}</span>
              </span>
              {t.id === theme && (
                <svg viewBox="0 0 24 24" width="15" height="15" fill="currentColor">
                  <path d="M9 16.2L4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4L9 16.2z"/>
                </svg>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default function Navbar() {
  const { theme, changeTheme, themes } = useTheme();
  const { reciter, changeReciter, reciters } = useQari();
  const [query, setQuery] = useState('');
  const navigate = useNavigate();

  function handleSearch(e) {
    if (e.key === 'Enter' && query.trim()) {
      navigate(`/search?q=${encodeURIComponent(query.trim())}`);
      setQuery('');
    }
  }

  return (
    <nav className="navbar">
      <div className="navbar-inner">
        {/* Logo */}
        <NavLink to="/" className="navbar-logo">
          <span className="navbar-logo-icon">☪</span>
          <span className="navbar-logo-text">Al-<span>Quran</span></span>
        </NavLink>

        {/* Nav links (desktop) */}
        <div className="navbar-links">
          <NavLink to="/surah"     className={({ isActive }) => 'navbar-link' + (isActive ? ' active' : '')}>Surahs</NavLink>
          <NavLink to="/juz"       className={({ isActive }) => 'navbar-link' + (isActive ? ' active' : '')}>Juz</NavLink>
          <NavLink to="/bookmarks" className={({ isActive }) => 'navbar-link' + (isActive ? ' active' : '')}>Bookmarks</NavLink>
        </div>

        {/* Search bar */}
        <div className="navbar-search">
          <input
            className="input"
            type="text"
            placeholder="Search Surahs or verses..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleSearch}
            aria-label="Search"
          />
        </div>

        {/* Action buttons */}
        <div className="navbar-actions">
          {/* Custom Qari Dropdown */}
          <QariDropdown reciter={reciter} changeReciter={changeReciter} reciters={reciters} />

          {/* Bookmarks shortcut */}
          <NavLink to="/bookmarks">
            <button className="nav-icon-btn" title="Bookmarks">🔖</button>
          </NavLink>
          
          {/* Custom Theme Dropdown */}
          <ThemeDropdown theme={theme} changeTheme={changeTheme} themes={themes} />
        </div>
      </div>
    </nav>
  );
}
