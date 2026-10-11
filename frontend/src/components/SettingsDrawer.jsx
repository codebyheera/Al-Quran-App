/**
 * components/SettingsDrawer.jsx — Side drawer opened from the header's
 * Settings button. Every control reuses an existing app preference, each of
 * which already persists to localStorage and applies immediately:
 *   - Theme (ThemeContext)            - Translation language (AudioContext)
 *   - Show English/Urdu (AudioContext) - Reciter (QariContext)
 *   - Arabic font size (useArabicFontSize, shared with Surah/Juz pages)
 */

import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import {
  IconX, IconAdjustmentsHorizontal, IconTextSize, IconLanguage, IconBook,
  IconMicrophone2, IconPalette, IconRefresh, IconCheck, IconPlus, IconMinus,
} from '@tabler/icons-react';
import { useTheme } from '../context/ThemeContext';
import { useAudio } from '../context/AudioContext';
import { useQari } from '../context/QariContext';
import useArabicFontSize, {
  ARABIC_FONT_MIN, ARABIC_FONT_MAX, ARABIC_FONT_STEP, ARABIC_FONT_DEFAULT,
} from '../hooks/useArabicFontSize';

const LANGUAGES = [
  { id: 'english', label: 'EN', name: 'English' },
  { id: 'urdu', label: 'UR', name: 'Urdu' },
];

const DEFAULT_THEME = 'emerald';
const DEFAULT_RECITER = 'alafasy';
const FONTS_HREF = 'https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap';
const FOCUSABLE = 'a[href], button:not([disabled]), input:not([disabled]), select, textarea, [tabindex]:not([tabindex="-1"])';

// Drawer fonts are only fetched the first time it opens, so the header
// itself adds no extra font requests to every page load.
function loadDrawerFonts() {
  if (document.getElementById('settings-drawer-fonts')) return;
  const link = document.createElement('link');
  link.id = 'settings-drawer-fonts';
  link.rel = 'stylesheet';
  link.href = FONTS_HREF;
  document.head.appendChild(link);
}

function Toggle({ label, checked, onChange }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      className="sd-toggle-row"
      onClick={onChange}
    >
      <span>{label}</span>
      <span className={`sd-switch ${checked ? 'on' : ''}`} aria-hidden="true"><span /></span>
    </button>
  );
}

export default function SettingsDrawer({ open, onClose, returnFocusRef }) {
  const { theme, changeTheme, themes } = useTheme();
  const { preferredLanguage, setPreferredLanguage, showEn, setShowEn, showUr, setShowUr } = useAudio();
  const { reciter, changeReciter, reciters } = useQari();
  const [arabicSize, setArabicSize] = useArabicFontSize();
  const panelRef = useRef(null);
  const bodyRef = useRef(null);
  const [mounted, setMounted] = useState(false);
  const currentLang = preferredLanguage || 'english';

  useEffect(() => setMounted(true), []);

  // Focus the drawer on open, lock page scroll, restore focus on close.
  useEffect(() => {
    if (!open) return;
    loadDrawerFonts();
    const returnTo = returnFocusRef?.current;
    document.body.style.overflow = 'hidden';
    // Always open at the top, with focus on the panel itself (no ring
    // on the close button).
    if (bodyRef.current) bodyRef.current.scrollTop = 0;
    panelRef.current?.focus({ preventScroll: true });
    return () => {
      document.body.style.overflow = '';
      returnTo?.focus();
    };
  }, [open, returnFocusRef]);

  function handleKeyDown(e) {
    if (e.key === 'Escape') {
      // Keep Esc from also reaching page-level handlers (e.g. the search page).
      e.stopPropagation();
      onClose();
      return;
    }
    if (e.key !== 'Tab') return;
    const items = [...panelRef.current.querySelectorAll(FOCUSABLE)];
    if (!items.length) return;
    const first = items[0];
    const last = items[items.length - 1];
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  }

  // Same behavior as the EN/UR toggles on the Surah page: turning one on
  // records it as the preference, turning it off only hides the text.
  const toggleEn = () => (showEn ? setShowEn(false) : setPreferredLanguage('english', { applyAudio: false }));
  const toggleUr = () => (showUr ? setShowUr(false) : setPreferredLanguage('urdu', { applyAudio: false }));

  function handleReset() {
    changeTheme(DEFAULT_THEME);
    setPreferredLanguage('english', { applyAudio: false });
    changeReciter(DEFAULT_RECITER);
    setArabicSize(ARABIC_FONT_DEFAULT);
  }

  // Portals can't render in the homepage's renderToString prerender, so the
  // drawer only exists once mounted in the browser.
  if (!mounted) return null;

  return createPortal(
    <div className={`sd-root ${open ? 'is-open' : ''}`}>
      <div className="sd-overlay" onClick={onClose} aria-hidden="true" />
      <div
        ref={panelRef}
        id="settings-drawer"
        className="sd-panel"
        role="dialog"
        aria-modal="true"
        aria-labelledby="settings-drawer-title"
        aria-hidden={!open}
        tabIndex={-1}
        onKeyDown={handleKeyDown}
      >
        <div className="sd-header">
          <div className="sd-header-main">
            <span className="sd-header-icon" aria-hidden="true">
              <IconAdjustmentsHorizontal size={20} stroke={1.5} />
            </span>
            <h2 id="settings-drawer-title" className="sd-title">Settings</h2>
          </div>
          <button type="button" className="sd-close" onClick={onClose} aria-label="Close settings">
            <IconX size={20} stroke={1.5} />
          </button>
        </div>

        <div className="sd-body" ref={bodyRef}>
          <section className="sd-card" style={{ '--i': 0 }}>
            <div className="sd-card-head">
              <IconTextSize size={18} stroke={1.5} className="sd-card-icon" />
              <label className="sd-card-title" htmlFor="sd-arabic-size">Arabic font size</label>
              <span className="sd-value">{arabicSize.toFixed(1)}</span>
            </div>
            {/* Same font and text as the Surah/Juz pages (.arabic → MeQuran) */}
            <div className="sd-preview">
              <p className="arabic sd-arabic-preview" lang="ar" dir="rtl" style={{ fontSize: `${arabicSize}rem` }}>
                بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
              </p>
            </div>
            <div className="sd-range-row">
              <button
                type="button"
                className="sd-step-btn"
                onClick={() => setArabicSize(arabicSize - ARABIC_FONT_STEP)}
                disabled={arabicSize <= ARABIC_FONT_MIN}
                aria-label="Decrease Arabic font size"
              >
                <IconMinus size={16} stroke={2} />
              </button>
              <input
                id="sd-arabic-size"
                className="sd-range"
                type="range"
                min={ARABIC_FONT_MIN}
                max={ARABIC_FONT_MAX}
                step={ARABIC_FONT_STEP}
                value={arabicSize}
                style={{ '--fill': `${((arabicSize - ARABIC_FONT_MIN) / (ARABIC_FONT_MAX - ARABIC_FONT_MIN)) * 100}%` }}
                onChange={(e) => setArabicSize(parseFloat(e.target.value))}
              />
              <button
                type="button"
                className="sd-step-btn"
                onClick={() => setArabicSize(arabicSize + ARABIC_FONT_STEP)}
                disabled={arabicSize >= ARABIC_FONT_MAX}
                aria-label="Increase Arabic font size"
              >
                <IconPlus size={16} stroke={2} />
              </button>
            </div>
          </section>

          <section className="sd-card" style={{ '--i': 1 }}>
            <div className="sd-card-head">
              <IconLanguage size={18} stroke={1.5} className="sd-card-icon" />
              <h3 className="sd-card-title" id="sd-lang-label">Language</h3>
            </div>
            <div className={`sd-segmented ${currentLang === 'urdu' ? 'second' : ''}`} role="radiogroup" aria-labelledby="sd-lang-label">
              <span className="sd-segmented-thumb" aria-hidden="true" />
              {LANGUAGES.map((l) => (
                <button
                  key={l.id}
                  type="button"
                  role="radio"
                  aria-checked={currentLang === l.id}
                  className={currentLang === l.id ? 'active' : ''}
                  onClick={() => setPreferredLanguage(l.id)}
                >
                  {l.name}
                </button>
              ))}
            </div>
            <p className="sd-hint">Translation shown on Surah &amp; Juz pages and used for recitation.</p>
          </section>

          <section className="sd-card" style={{ '--i': 2 }}>
            <div className="sd-card-head">
              <IconBook size={18} stroke={1.5} className="sd-card-icon" />
              <h3 className="sd-card-title">Translations</h3>
            </div>
            <Toggle label="English translation" checked={showEn} onChange={toggleEn} />
            <Toggle label="Urdu translation" checked={showUr} onChange={toggleUr} />
          </section>

          <section className="sd-card" style={{ '--i': 3 }}>
            <div className="sd-card-head">
              <IconMicrophone2 size={18} stroke={1.5} className="sd-card-icon" />
              <h3 className="sd-card-title" id="sd-reciter-label">Reciter</h3>
            </div>
            <div className="sd-options" role="radiogroup" aria-labelledby="sd-reciter-label">
              {reciters.map((r) => (
                <button
                  key={r.id}
                  type="button"
                  role="radio"
                  aria-checked={reciter === r.id}
                  className={`sd-option ${reciter === r.id ? 'active' : ''}`}
                  onClick={() => changeReciter(r.id)}
                >
                  <span className="sd-radio" aria-hidden="true" />
                  {r.name}
                </button>
              ))}
            </div>
          </section>

          <section className="sd-card" style={{ '--i': 4 }}>
            <div className="sd-card-head">
              <IconPalette size={18} stroke={1.5} className="sd-card-icon" />
              <h3 className="sd-card-title" id="sd-theme-label">Theme</h3>
            </div>
            <div className="sd-theme-grid" role="radiogroup" aria-labelledby="sd-theme-label">
              {themes.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  role="radio"
                  aria-checked={theme === t.id}
                  className={`sd-option ${theme === t.id ? 'active' : ''}`}
                  onClick={() => changeTheme(t.id)}
                >
                  <span aria-hidden="true">{t.icon}</span>
                  {t.name}
                </button>
              ))}
            </div>
          </section>
        </div>

        <div className="sd-footer">
          <button type="button" className="sd-btn sd-btn-outline" onClick={handleReset}>
            <IconRefresh size={16} stroke={1.75} /> Reset
          </button>
          <button type="button" className="sd-btn sd-btn-gold" onClick={onClose}>
            <IconCheck size={16} stroke={2} /> Done
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}
