/**
 * components/NotificationBell.jsx — Header bell for in-site announcements
 * Reads from the hardcoded `notifications` array; read state lives in
 * localStorage only (no backend, no login).
 */

import { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { IconBell } from '@tabler/icons-react';
import { notifications } from '../data/notifications';

const STORAGE_KEY = 'lastReadNotificationId';

function formatNotifDate(dateStr) {
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
  });
}

function getLastReadId() {
  try {
    return localStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
}

function saveLastReadId(id) {
  try {
    localStorage.setItem(STORAGE_KEY, id);
  } catch {}
}

export default function NotificationBell() {
  const latestId = notifications[0]?.id ?? null;
  const [open, setOpen] = useState(false);
  const [unread, setUnread] = useState(() => latestId !== null && getLastReadId() !== latestId);
  const ref = useRef(null);

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

  function markAllRead() {
    if (latestId !== null) saveLastReadId(latestId);
    setUnread(false);
    setOpen(false);
  }

  // Nothing unread → no bell in the header at all.
  if (!unread) return null;

  return (
    <div className="navbar-dropdown hdr-bell" ref={ref}>
      <button
        type="button"
        className={`hdr-icon-btn ${open ? 'is-active' : ''}`}
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="true"
        aria-expanded={open}
        aria-label="Notifications"
        data-tip="Notifications"
      >
        <IconBell size={20} stroke={1.5} />
        <span className="notif-badge-dot" aria-hidden="true" />
      </button>

      {open && (
        <div className="dropdown-panel notif-panel" role="menu">
          <div className="notif-panel-header">
            <span className="notif-panel-title">Notifications</span>
            <button
              type="button"
              className="notif-mark-read-btn"
              onClick={markAllRead}
              disabled={!unread}
            >
              Mark all as read
            </button>
          </div>

          <div className="notif-list">
            {notifications.length === 0 ? (
              <div className="notif-empty">
                <span className="notif-empty-icon">🔕</span>
                <p>No notifications yet</p>
              </div>
            ) : (
              notifications.map((n) => {
                const body = (
                  <>
                    <div className="notif-item-title">{n.title}</div>
                    <div className="notif-item-message">{n.message}</div>
                    <div className="notif-item-date">{formatNotifDate(n.date)}</div>
                  </>
                );

                return n.link ? (
                  <Link
                    key={n.id}
                    to={n.link}
                    className="notif-item notif-item-link"
                    onClick={() => setOpen(false)}
                  >
                    {body}
                  </Link>
                ) : (
                  <div key={n.id} className="notif-item">
                    {body}
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}
