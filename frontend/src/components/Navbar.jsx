/**
 * components/Navbar.jsx — Sticky top navigation bar
 * Contains logo, nav links, search input, bookmark link, and theme toggle
 */

import { NavLink, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useTheme } from '../context/ThemeContext';
import '../styles/Navbar.css';

export default function Navbar() {
  const { theme, toggleTheme } = useTheme();
  const [query, setQuery] = useState('');
  const navigate = useNavigate();

  // Navigate to search page on Enter
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
          {/* Bookmarks shortcut */}
          <NavLink to="/bookmarks">
            <button className="nav-icon-btn" title="Bookmarks">🔖</button>
          </NavLink>
          {/* Theme toggle */}
          <button
            className="nav-icon-btn"
            onClick={toggleTheme}
            title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          >
            {theme === 'dark' ? '☀️' : '🌙'}
          </button>
        </div>
      </div>
    </nav>
  );
}
