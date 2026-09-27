import { useState, useRef, useEffect } from 'react';
import { useAudio } from '../context/AudioContext';

export default function AudioDropdown({ isCompact = false, upwards = false }) {
  const { audioLanguage, setAudioLanguage } = useAudio();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  const options = [
    { id: 'ar', name: 'Arabic' },
    { id: 'en', name: 'English' },
    { id: 'ur', name: 'Urdu' },
    { id: 'combine', name: 'Combine' },
  ];

  const current = options.find((o) => o.id === audioLanguage);

  useEffect(() => {
    function handleClickOutside(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    function handleEscape(e) {
      if (e.key === 'Escape') setOpen(false);
    }
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, []);

  return (
    <div className={`navbar-dropdown audio-custom-dropdown ${isCompact ? 'compact' : ''}`} ref={ref}>
      <button
        className={`dropdown-trigger ${open ? 'open' : ''}`}
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="listbox"
        aria-expanded={open}
        title="Select Audio Language"
      >
        <span className="dropdown-trigger-icon">🎧</span>
        <span className="dropdown-trigger-label">{current?.name}</span>
        <span className="dropdown-trigger-label-mobile">
          {current?.id === 'combine' ? 'COMB' : current?.id}
        </span>
        <svg className={`dropdown-chevron ${open ? 'rotated' : ''}`} viewBox="0 0 24 24" width="14" height="14" fill="currentColor">
          <path d="M7 10l5 5 5-5z" />
        </svg>
      </button>

      {open && (
        <div
          className={`dropdown-panel theme-panel audio-dropdown-panel ${upwards ? 'upwards' : ''}`}
          role="listbox"
        >
          <div className="dropdown-panel-header">Audio Language</div>
          {options.map((o) => (
            <button
              key={o.id}
              className={`dropdown-option ${o.id === audioLanguage ? 'selected' : ''}`}
              role="option"
              aria-selected={o.id === audioLanguage}
              onClick={() => { setAudioLanguage(o.id); setOpen(false); }}
            >
              <span className="dropdown-option-info">
                <span className="dropdown-option-name">{o.name}</span>
              </span>
              {o.id === audioLanguage && (
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
