/**
 * components/LanguagePrompt.jsx — First-visit translation language prompt
 *
 * A dismissible bottom banner (cookie-consent style, never a modal) that asks
 * once which translation language the visitor wants. Desktop only.
 *
 * It only writes a preference — it never navigates anywhere and never starts
 * audio playback.
 */

import { useEffect, useState } from 'react';
import { useAudio } from '../context/AudioContext';
import useIsDesktop from '../hooks/useIsDesktop';
import './LanguagePreference.css';

export default function LanguagePrompt() {
  const { preferredLanguage, setPreferredLanguage } = useAudio();
  const isDesktop = useIsDesktop();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Already chosen (or dismissed, which also stores a preference) — never ask again.
    if (preferredLanguage) return;
    if (!isDesktop) return;

    // Small delay so it slides up after the page has settled instead of
    // fighting the first paint.
    const t = setTimeout(() => setVisible(true), 1200);
    return () => clearTimeout(t);
  }, [preferredLanguage, isDesktop]);

  // Nudge the push-notification banner (which also lives at the bottom
  // centre, on a 3s delay) out of the way for as long as this one is up.
  useEffect(() => {
    if (!visible) return;
    document.body.classList.add('lang-prompt-open');
    return () => document.body.classList.remove('lang-prompt-open');
  }, [visible]);

  function choose(lang) {
    setPreferredLanguage(lang);
    setVisible(false);
  }

  // Dismissing without choosing still settles on a default, so the visitor
  // gets a working translation and is never asked twice.
  function dismiss() {
    choose('english');
  }

  if (!visible) return null;

  return (
    <div className="lang-prompt" role="dialog" aria-label="Choose your translation language">
      <span className="lang-prompt-icon" aria-hidden="true">🌐</span>

      <p className="lang-prompt-text">Choose your translation language</p>

      <div className="lang-prompt-actions">
        <button
          className="lang-prompt-btn"
          onClick={() => choose('urdu')}
          lang="ur"
        >
          Urdu
        </button>
        <button
          className="lang-prompt-btn"
          onClick={() => choose('english')}
        >
          English
        </button>
      </div>

      <button
        className="lang-prompt-close"
        onClick={dismiss}
        aria-label="Dismiss and use English"
        title="Dismiss (English will be used)"
      >
        ✕
      </button>
    </div>
  );
}
