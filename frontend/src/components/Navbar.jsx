/**
 * components/Navbar.jsx — Sticky top navigation bar
 * Includes rich slide-in sidebar for mobile, Qari and Theme dropdowns.
 */

import { NavLink } from 'react-router-dom';
import { useState, useRef, useEffect } from 'react';
import { useTheme } from '../context/ThemeContext';
import { useQari } from '../context/QariContext';
import { useBookmarks } from '../context/BookmarkContext';
import { useAudio } from '../context/AudioContext';
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
  const { bookmarks } = useBookmarks();
  const { isPlaying } = useAudio();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isHidden, setIsHidden] = useState(false);
  const lastScrollY = useRef(0);

  // Lock body scroll when sidebar is open
  useEffect(() => {
    if (sidebarOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [sidebarOpen]);

  // Handle header hiding when playing
  useEffect(() => {
    if (!isPlaying) {
      setIsHidden(false);
      return;
    }
    
    // Hide immediately if already scrolled past 10px when play starts
    if (window.scrollY >= 10) {
      setIsHidden(true);
    }
  }, [isPlaying]);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      
      if (currentScrollY < 10) {
        setIsHidden(false);
      } else if (currentScrollY < lastScrollY.current) {
        setIsHidden(false);
      } else if (currentScrollY > lastScrollY.current && isPlaying) {
        setIsHidden(true);
      }
      
      lastScrollY.current = currentScrollY;
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [isPlaying]);

  function closeSidebar() { setSidebarOpen(false); }

  return (
    <>
      <nav className={`navbar ${isHidden ? 'navbar-hidden' : ''}`}>
        <div className="navbar-inner">
          {/* Logo */}
          <NavLink to="/" className="navbar-logo" onClick={closeSidebar}>
            <span className="navbar-logo-icon">☪</span>
            <span className="navbar-logo-text">Al-<span>Quran</span> Hub</span>
          </NavLink>

          {/* Nav links (desktop) */}
          <div className="navbar-links">
            <NavLink to="/" className={({ isActive }) => 'navbar-link' + (isActive ? ' active' : '')}>Home</NavLink>
            <NavLink to="/surah" className={({ isActive }) => 'navbar-link' + (isActive ? ' active' : '')}>Surahs</NavLink>
            <NavLink to="/juz" className={({ isActive }) => 'navbar-link' + (isActive ? ' active' : '')}>Juz</NavLink>
            <NavLink to="/bookmarks" className={({ isActive }) => 'navbar-link' + (isActive ? ' active' : '')}>Bookmarks</NavLink>
            <NavLink to="/support" className={({ isActive }) => 'navbar-link' + (isActive ? ' active' : '')}>Support</NavLink>
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
            <span className="sidebar-logo-icon">☪</span>
            <span className="sidebar-logo-text">Al-<span>Quran</span> Hub</span>
          </div>
          <button className="sidebar-close-btn" onClick={closeSidebar} aria-label="Close menu">
            <i className="ti ti-x"></i>
          </button>
        </div>

        {/* Search Bar */}
        <div className="sidebar-search-container">
          <div className="sidebar-search-box">
            <i className="ti ti-search search-icon"></i>
            <input
              className="sidebar-search-input"
              type="text"
              placeholder="Search Surah or Ayah..."
              onKeyDown={(e) => {
                if (e.key === 'Enter' && e.target.value.trim()) {
                  closeSidebar();
                  window.location.href = `/search?q=${encodeURIComponent(e.target.value.trim())}`;
                }
              }}
            />
          </div>
        </div>

        {/* Stats Row */}
        <div className="sidebar-stats-boxes">
          <div className="stat-box">
            <span className="stat-num">114</span>
            <span className="stat-label">SURAHS</span>
          </div>
          <div className="stat-box">
            <span className="stat-num">30</span>
            <span className="stat-label">JUZ</span>
          </div>
          <div className="stat-box">
            <span className="stat-num">6,236</span>
            <span className="stat-label">AYAHS</span>
          </div>
        </div>

        {/* Navigation Section */}
        <div className="sidebar-nav-label">NAVIGATION</div>

        <nav className="sidebar-nav-links">
          <NavLink to="/" className={({ isActive }) => `sidebar-nav-item ${isActive ? 'active' : ''}`} onClick={closeSidebar}>
            <i className="ti ti-home nav-icon"></i>
            <span className="nav-text">Home</span>
          </NavLink>

          <NavLink to="/surah" className={({ isActive }) => `sidebar-nav-item ${isActive ? 'active' : ''}`} onClick={closeSidebar}>
            <i className="ti ti-book nav-icon"></i>
            <span className="nav-text">Surahs</span>
          </NavLink>

          <NavLink to="/juz" className={({ isActive }) => `sidebar-nav-item ${isActive ? 'active' : ''}`} onClick={closeSidebar}>
            <i className="ti ti-book-2 nav-icon"></i>
            <span className="nav-text">Juz</span>
          </NavLink>

          <NavLink to="/bookmarks" className={({ isActive }) => `sidebar-nav-item ${isActive ? 'active' : ''}`} onClick={closeSidebar}>
            <i className="ti ti-bookmark nav-icon"></i>
            <span className="nav-text">Bookmarks</span>
            {bookmarks.length > 0 && <span className="nav-badge">{bookmarks.length}</span>}
          </NavLink>

          <NavLink to="/support" className={({ isActive }) => `sidebar-nav-item ${isActive ? 'active' : ''}`} onClick={closeSidebar}>
            <i className="ti ti-heart nav-icon"></i>
            <span className="nav-text">Support</span>
          </NavLink>
        </nav>

        {/* Footer */}
        <div className="sidebar-bottom-footer">
          <div className="footer-line1">Free · Non-Profit · No Ads</div>
          <div className="footer-line2">alquranhub.org</div>
        </div>

      </aside>
    </>
  );
}