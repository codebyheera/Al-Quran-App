/**
 * components/LanguagePrompt.jsx — First-visit translation language prompt
 *
 * A dismissible bottom banner (cookie-consent style, never a modal) that asks
 * once which translation language the visitor wants. Desktop only.
 *
 * It only writes a preference — it never navigates anywhere and never starts
 * audio playback.
 */

import { useEffect } from 'react';
import { useAudio } from '../context/AudioContext';
import useIsDesktop from '../hooks/useIsDesktop';
import { usePopupTurn } from '../lib/popupQueue';
import './LanguagePreference.css';

export default function LanguagePrompt() {
  const { preferredLanguage, setPreferredLanguage } = useAudio();
  const isDesktop = useIsDesktop();
  // Already chosen (or dismissed, which also stores a preference) — never ask
  // again. Otherwise it waits its turn in the popup queue.
  const [visible, done] = usePopupTurn('language', !preferredLanguage && isDesktop);

  // Nudge the push-notification banner (which also lives at the bottom
  // centre) out of the way for as long as this one is up.
  useEffect(() => {
    if (!visible) return;
    document.body.classList.add('lang-prompt-open');
    return () => document.body.classList.remove('lang-prompt-open');
  }, [visible]);

  function choose(lang) {
    setPreferredLanguage(lang);
    done();
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
