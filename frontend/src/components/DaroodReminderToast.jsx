import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import './DaroodReminderToast.css';

const DISMISS_KEY = 'darood-toast-dismissed-date';

const DEFAULT_MESSAGE = 'Missed your Durood today? Take a moment to recite it now.';
const DEFAULT_BUTTON_LABEL = 'Recite Now →';

function getToday() {
  return new Date().toISOString().split('T')[0];
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
 * Non-blocking, delayed, and capped at once-per-day — see the mount effect
 * below for the localStorage gate.
 */
export default function DaroodReminderToast({
  message = DEFAULT_MESSAGE,
  buttonLabel = DEFAULT_BUTTON_LABEL,
  delayMs = 2500,
}) {
  const [visible, setVisible] = useState(false);
  const location = useLocation();

  // Never show on the Durood page itself — the visitor is already there.
  const onDuroodPage = location.pathname === '/durood-sharif';

  useEffect(() => {
    if (onDuroodPage) return;

    // Already dismissed (or clicked through) today — skip the timer
    // entirely so it can't flash in and immediately vanish.
    try {
      if (localStorage.getItem(DISMISS_KEY) === getToday()) return;
    } catch {}

    const timer = setTimeout(() => setVisible(true), delayMs);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [onDuroodPage, delayMs]);

  function handleDismiss() {
    markDismissedToday();
    setVisible(false);
  }

  function handleRecite() {
    markDismissedToday();
    setVisible(false);
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
