import usePushNotification from '../hooks/usePushNotification';
import { usePopupTurn } from '../lib/popupQueue';
import './NotificationBanner.css';

const DISMISS_KEY  = 'notif_dismissed_until';
const DISMISS_DAYS = 7;

function isSnoozed() {
  try {
    const until = localStorage.getItem(DISMISS_KEY);
    return Boolean(until && Date.now() < Number(until));
  } catch {
    return false;
  }
}

export default function NotificationBanner() {
  const { permission, setPermission, subscribed, loading, subscribeUser } = usePushNotification();
  const wanted = 'serviceWorker' in navigator && 'PushManager' in window
    && permission !== 'granted' && permission !== 'denied' && !subscribed
    && !isSnoozed();
  // Waits its turn in the popup queue instead of showing on page load.
  const [visible, done] = usePopupTurn('notifications', wanted);

  function dismiss() {
    try {
      localStorage.setItem(DISMISS_KEY, String(Date.now() + DISMISS_DAYS * 86400_000));
    } catch {}
    done();
  }

  async function handleAllow() {
    const result = await Notification.requestPermission();
    setPermission(result);
    if (result === 'granted') {
      await subscribeUser();
    }
    done();
  }

  if (!visible) return null;

  return (
    <div className="notif-banner" role="alert">
      <span className="notif-banner-icon">🌙</span>
      <p className="notif-banner-text">
        Get daily Quran reminders. Free, no ads, always.
      </p>
      <div className="notif-banner-actions">
        <button
          className="btn btn-primary notif-banner-allow"
          onClick={handleAllow}
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
