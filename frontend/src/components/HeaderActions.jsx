/**
 * components/HeaderActions.jsx — Right-side icon cluster of the navbar:
 * [Search] [Theme toggle] [Bell, only when unread] [Settings]
 *
 * Search goes to the existing /search page (Ctrl+K, or "/" when no field is
 * focused). Reciter, translation language and reader options live in the
 * Settings drawer, which slides in from the right.
 */

import { useEffect, useRef, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { IconSearch, IconSunHigh, IconMoonStars, IconSettings } from '@tabler/icons-react';
import { useTheme } from '../context/ThemeContext';
import NotificationBell from './NotificationBell';
import SettingsDrawer from './SettingsDrawer';
import './HeaderActions.css';

function isTypingTarget(el) {
  if (!el) return false;
  const tag = el.tagName;
  return tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || el.isContentEditable;
}

export default function HeaderActions() {
  const { isLight, toggleLightDark } = useTheme();
  const [settingsOpen, setSettingsOpen] = useState(false);
  // Only animate the theme icon after a click, never on page load.
  const [themeSwitched, setThemeSwitched] = useState(false);
  const settingsBtnRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();

  // Ctrl/Cmd+K anywhere, or "/" outside a text field, opens search.
  useEffect(() => {
    function handleKey(e) {
      const isCmdK = (e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k';
      const isSlash = e.key === '/' && !e.ctrlKey && !e.metaKey && !e.altKey && !isTypingTarget(document.activeElement);
      if (!isCmdK && !isSlash) return;
      e.preventDefault();
      setSettingsOpen(false);
      if (location.pathname === '/search') {
        document.querySelector('.sp-input')?.focus();
      } else {
        navigate('/search');
      }
    }
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [location.pathname, navigate]);

  const themeLabel = isLight ? 'Switch to dark theme' : 'Switch to light theme';

  return (
    <>
      <div className="hdr-actions">
        <Link to="/search" className="hdr-icon-btn" aria-label="Search" data-tip="Search">
          <IconSearch size={20} stroke={1.75} className="hdr-ico-search" />
        </Link>

        <button
          type="button"
          className="hdr-icon-btn hdr-theme-btn"
          onClick={() => { setThemeSwitched(true); toggleLightDark(); }}
          aria-label={themeLabel}
          data-tip={themeLabel}
        >
          {isLight
            ? <IconMoonStars key="moon" size={20} stroke={1.75} className={`hdr-ico-theme ${themeSwitched ? 'is-switching' : ''}`} />
            : <IconSunHigh key="sun" size={20} stroke={1.75} className={`hdr-ico-theme ${themeSwitched ? 'is-switching' : ''}`} />}
        </button>

        <NotificationBell />

        <button
          ref={settingsBtnRef}
          type="button"
          className={`hdr-icon-btn ${settingsOpen ? 'is-active' : ''}`}
          onClick={() => setSettingsOpen((o) => !o)}
          aria-label="Settings"
          aria-haspopup="dialog"
          aria-expanded={settingsOpen}
          aria-controls="settings-drawer"
          data-tip="Settings"
        >
          <IconSettings size={20} stroke={1.75} className="hdr-ico-gear" />
        </button>
      </div>

      <SettingsDrawer
        open={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        returnFocusRef={settingsBtnRef}
      />
    </>
  );
}
