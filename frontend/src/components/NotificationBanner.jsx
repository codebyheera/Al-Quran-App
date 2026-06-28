import { useState, useEffect } from 'react';
import usePushNotification from '../hooks/usePushNotification';
import './NotificationBanner.css';

const DISMISS_KEY  = 'notif_dismissed_until';
const DISMISS_DAYS = 7;

export default function NotificationBanner() {
  const { permission, subscribed, loading, subscribe } = usePushNotification();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) return;
    if (permission === 'granted' || permission === 'denied' || subscribed) return;

    try {
      const until = localStorage.getItem(DISMISS_KEY);
      if (until && Date.now() < Number(until)) return;
    } catch {}

    // Small delay so it doesn't flash immediately on page load
    const t = setTimeout(() => setVisible(true), 3000);
    return () => clearTimeout(t);
  }, [permission, subscribed]);

  function dismiss() {
    try {
      localStorage.setItem(DISMISS_KEY, String(Date.now() + DISMISS_DAYS * 86400_000));
    } catch {}
    setVisible(false);
  }

  async function handleSubscribe() {
    await subscribe();
    setVisible(false);
  }

  if (!visible) return null;

  return (
    <div className="notif-banner" role="alert">
      <span className="notif-banner-icon">🌙</span>
      <p className="notif-banner-text">
        Get daily Quran reminders — free, ad-free, always.
      </p>
      <div className="notif-banner-actions">
        <button
          className="btn btn-primary notif-banner-allow"
          onClick={handleSubscribe}
          disabled={loading}
        >
          {loading ? 'Enabling…' : 'Allow'}
        </button>
        <button
          className="btn btn-ghost notif-banner-dismiss"
          onClick={dismiss}
          aria-label="Dismiss notification banner"
        >
          Not now
        </button>
      </div>
    </div>
  );
}
