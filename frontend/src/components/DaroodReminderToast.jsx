import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { usePopupTurn } from '../lib/popupQueue';
import './DaroodReminderToast.css';

const DISMISS_KEY = 'darood-toast-dismissed-date';

const DEFAULT_MESSAGE = 'Missed your Durood today? Take a moment to recite it now.';
const DEFAULT_BUTTON_LABEL = 'Recite Now →';

function getToday() {
  return new Date().toISOString().split('T')[0];
}

function isDismissedToday() {
  try {
    return localStorage.getItem(DISMISS_KEY) === getToday();
  } catch {
    return false;
  }
}

function markDismissedToday() {
  try {
    localStorage.setItem(DISMISS_KEY, getToday());
  } catch {}
}

/**
 * Slide-in toast that nudges visitors to recite Durood-e-Ibrahim.
 * English-only copy; navigation to /durood-sharif happens only through the
 * "Recite Now" button, not by clicking the card itself.
 * Non-blocking, capped at once-per-day, and timed by the shared popup queue
 * (lib/popupQueue.js) so it never shows on arrival or alongside another popup.
 */
export default function DaroodReminderToast({
  message = DEFAULT_MESSAGE,
  buttonLabel = DEFAULT_BUTTON_LABEL,
}) {
  const location = useLocation();
  const [dismissedToday] = useState(isDismissedToday);

  // Never show on the Durood page itself — the visitor is already there.
  const onDuroodPage = location.pathname === '/durood-sharif';

  // Waits its turn in the popup queue instead of showing on page load.
  const [visible, done] = usePopupTurn('durood', !onDuroodPage && !dismissedToday);

  function handleDismiss() {
    markDismissedToday();
    done();
  }

  function handleRecite() {
    markDismissedToday();
    done();
    // Link handles the actual navigation — this just closes the toast and
    // records today's dismissal so it won't pop back up on the next page.
  }

  if (!visible || onDuroodPage) return null;

  return (
    <div className="darood-toast" role="status">
      <button
        type="button"
        className="darood-toast-close"
        onClick={handleDismiss}
        aria-label="Dismiss Durood reminder for today"
      >
        ✕
      </button>

      <div className="darood-toast-row">
        <span className="darood-toast-icon" aria-hidden="true">🌙</span>
        <p className="darood-toast-message">{message}</p>
      </div>

      <Link to="/durood-sharif" className="darood-toast-btn" onClick={handleRecite}>
        {buttonLabel}
      </Link>
    </div>
  );
}
