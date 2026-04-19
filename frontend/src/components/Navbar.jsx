/**
 * components/Navbar.jsx — Sticky top navigation bar
 * Includes rich slide-in sidebar for mobile, Qari and Theme dropdowns.
 */

import { NavLink } from 'react-router-dom';
import { useState, useRef, useEffect } from 'react';
import { useTheme } from '../context/ThemeContext';
import { useQari } from '../context/QariContext';
import '../styles/Navbar.css';

function QariDropdown({ reciter, changeReciter, reciters }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const current = reciters.find((r) => r.id === reciter);

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
          <path d="M7 10l5 5 5-5z" />
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

function ThemeDropdown({ theme, changeTheme, themes }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

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
        <span className="dropdown-trigger-icon">🌗</span>
        <span className="dropdown-trigger-label">Theme</span>
        <svg className={`dropdown-chevron ${open ? 'rotated' : ''}`} viewBox="0 0 24 24" width="14" height="14" fill="currentColor">
          <path d="M7 10l5 5 5-5z" />
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
                <span className="dropdown-trigger-icon">{t.icon}</span>
                <span className="dropdown-option-name">{t.name}</span>
              </span>
              {t.id === theme && (
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

export default function Navbar() {
  const { theme, changeTheme, themes } = useTheme();
  const { reciter, changeReciter, reciters } = useQari();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Lock body scroll when sidebar is open
  useEffect(() => {
    if (sidebarOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [sidebarOpen]);

  function closeSidebar() { setSidebarOpen(false); }

  return (
    <>
      <nav className="navbar">
        <div className="navbar-inner">
          {/* Logo */}
          <NavLink to="/" className="navbar-logo" onClick={closeSidebar}>
            <span className="navbar-logo-icon">☪</span>
            <span className="navbar-logo-text">Al-<span>Quran</span></span>
          </NavLink>

          {/* Nav links (desktop) */}
          <div className="navbar-links">
            <NavLink to="/surah" className={({ isActive }) => 'navbar-link' + (isActive ? ' active' : '')}>Surahs</NavLink>
            <NavLink to="/juz" className={({ isActive }) => 'navbar-link' + (isActive ? ' active' : '')}>Juz</NavLink>
            <NavLink to="/bookmarks" className={({ isActive }) => 'navbar-link' + (isActive ? ' active' : '')}>Bookmarks</NavLink>
            <NavLink to="/support" className={({ isActive }) => 'navbar-link' + (isActive ? ' active' : '')}>Support ✨</NavLink>
          </div>

          {/* Right actions */}
          <div className="navbar-actions">
            <QariDropdown reciter={reciter} changeReciter={changeReciter} reciters={reciters} />
            <NavLink to="/bookmarks">
              <button className="nav-icon-btn" title="Bookmarks">🔖</button>
            </NavLink>
            <ThemeDropdown theme={theme} changeTheme={changeTheme} themes={themes} />

            {/* Hamburger (mobile only) */}
            <button
              className={`hamburger ${sidebarOpen ? 'open' : ''}`}
              onClick={() => setSidebarOpen((o) => !o)}
              aria-label="Toggle menu"
            >
              <span /><span /><span />
            </button>
          </div>
        </div>
      </nav>

      {/* ── Mobile Sidebar ── */}
      {/* Backdrop */}
      <div
        className={`sidebar-backdrop ${sidebarOpen ? 'visible' : ''}`}
        onClick={closeSidebar}
        aria-hidden="true"
      />

      {/* Sidebar panel */}
      <aside className={`sidebar ${sidebarOpen ? 'open' : ''}`} aria-label="Mobile navigation">

        {/* Sidebar Header */}
        <div className="sidebar-header">
          <div className="sidebar-logo">
            <span className="navbar-logo-icon">☪</span>
            <span className="navbar-logo-text">Al-<span>Quran</span></span>
          </div>
          <button className="sidebar-close" onClick={closeSidebar} aria-label="Close menu">
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Search Bar */}
        <div className="sidebar-search">
          <svg className="sidebar-search-icon" viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" />
          </svg>
          <input
            className="sidebar-search-input"
            type="text"
            placeholder="Search Surah..."
            onKeyDown={(e) => {
              if (e.key === 'Enter' && e.target.value.trim()) {
                closeSidebar();
                window.location.href = `/search?q=${encodeURIComponent(e.target.value.trim())}`;
              }
            }}
          />
        </div>

        {/* Stats Row */}
        <div className="sidebar-stats">
          <div className="sidebar-stat">
            <span className="sidebar-stat-num">114</span>
            <span className="sidebar-stat-label">Surahs</span>
          </div>
          <div className="sidebar-stat-divider" />
          <div className="sidebar-stat">
            <span className="sidebar-stat-num">30</span>
            <span className="sidebar-stat-label">Juz</span>
          </div>
          <div className="sidebar-stat-divider" />
          <div className="sidebar-stat">
            <span className="sidebar-stat-num">6,236</span>
            <span className="sidebar-stat-label">Ayahs</span>
          </div>
        </div>

        {/* Decorative divider */}
        <div className="sidebar-divider" />

        {/* Nav label */}
        <div className="sidebar-section-label">Navigation</div>

        {/* Nav Links */}
        <nav className="sidebar-nav">
          <NavLink to="/surah" className={({ isActive }) => `sidebar-link surah-link ${isActive ? 'active' : ''}`} onClick={closeSidebar}>
            <span className="sidebar-link-icon icon-green">📖</span>
            <span className="sidebar-link-text">Surahs</span>
            <svg className="sidebar-link-arrow" viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 18l6-6-6-6" />
            </svg>
          </NavLink>

          <NavLink to="/juz" className={({ isActive }) => `sidebar-link juz-link ${isActive ? 'active' : ''}`} onClick={closeSidebar}>
            <span className="sidebar-link-icon icon-blue">📚</span>
            <span className="sidebar-link-text">Juz</span>
            <svg className="sidebar-link-arrow" viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 18l6-6-6-6" />
            </svg>
          </NavLink>

          <NavLink to="/bookmarks" className={({ isActive }) => `sidebar-link bookmarks-link ${isActive ? 'active' : ''}`} onClick={closeSidebar}>
            <span className="sidebar-link-icon icon-amber">🔖</span>
            <span className="sidebar-link-text">Bookmarks</span>
            <svg className="sidebar-link-arrow" viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 18l6-6-6-6" />
            </svg>
          </NavLink>

          <NavLink to="/support" className={({ isActive }) => `sidebar-link support-link ${isActive ? 'active' : ''}`} onClick={closeSidebar}>
            <span className="sidebar-link-icon icon-purple">✨</span>
            <span className="sidebar-link-text">Support</span>
            <svg className="sidebar-link-arrow" viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 18l6-6-6-6" />
            </svg>
          </NavLink>
        </nav>

        {/* Footer */}
        <div className="sidebar-footer">
          <div className="sidebar-footer-text">Free · Non-Profit · No Ads</div>
          <div className="sidebar-footer-bottom">
            <span className="sidebar-footer-domain">alquranhub.org</span>
            <span className="sidebar-footer-version">v1.0.0</span>
          </div>
        </div>

      </aside>
    </>
  );
}