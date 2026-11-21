/**
 * components/LoginModal.jsx — "Continue with Google / GitHub" dialog.
 * Login is optional: it only exists to sync a reader's data across devices.
 */

import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { IconBrandGithub, IconX, IconCloudCheck, IconLock } from '@tabler/icons-react';
import { useAuth } from '../context/AuthContext';
import './LoginModal.css';

function GoogleLogo() {
  return (
    <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true">
      <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.4-.4-3.5z" />
      <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z" />
      <path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.2 0-9.6-3.3-11.3-7.9l-6.5 5C9.5 39.6 16.2 44 24 44z" />
      <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.2-4.1 5.6l6.2 5.2C37 39.2 44 34 44 24c0-1.3-.1-2.4-.4-3.5z" />
    </svg>
  );
}

const PROVIDERS = [
  { id: 'google', label: 'Continue with Google', Icon: GoogleLogo },
  { id: 'github', label: 'Continue with GitHub', Icon: () => <IconBrandGithub size={19} stroke={1.75} aria-hidden="true" /> },
];

export default function LoginModal() {
  const { loginOpen, closeLogin, signIn, authError, configured } = useAuth();
  const [remember, setRemember] = useState(true);
  const [busy, setBusy] = useState(null); // provider id being redirected to
  const dialogRef = useRef(null);
  const lastFocusRef = useRef(null);

  // Focus management + Escape to close + lock page scroll.
  useEffect(() => {
    if (!loginOpen) return undefined;
    lastFocusRef.current = document.activeElement;
    dialogRef.current?.querySelector('button.lm-provider')?.focus();
    const onKey = (e) => { if (e.key === 'Escape') closeLogin(); };
    document.addEventListener('keydown', onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prevOverflow;
      lastFocusRef.current?.focus?.();
    };
  }, [loginOpen, closeLogin]);

  // Re-enable buttons if the user comes back with the browser's Back button.
  useEffect(() => {
    const onShow = (e) => { if (e.persisted) setBusy(null); };
    window.addEventListener('pageshow', onShow);
    return () => window.removeEventListener('pageshow', onShow);
  }, []);

  if (!loginOpen) return null;

  async function handleProvider(id) {
    setBusy(id);
    try {
      await signIn(id, remember);
    } catch {
      setBusy(null); // error text comes from authError
    }
  }

  return createPortal(
    <div className="lm-overlay" onMouseDown={(e) => { if (e.target === e.currentTarget) closeLogin(); }}>
      <div className="lm-dialog" role="dialog" aria-modal="true" aria-labelledby="lm-title" ref={dialogRef}>
        <button type="button" className="lm-close" onClick={closeLogin} aria-label="Close">
          <IconX size={18} stroke={2} />
        </button>

        <div className="lm-badge" aria-hidden="true"><IconCloudCheck size={26} stroke={1.6} /></div>
        <h2 id="lm-title" className="lm-title">Sync across your devices</h2>
        <p className="lm-sub">
          Login is optional. Sign in to keep your bookmarks, reading progress and settings
          in sync on all your devices.
        </p>

        {!configured ? (
          <p className="lm-error" role="alert">Login is not available right now. Please try again later.</p>
        ) : (
          <>
            <div className="lm-providers">
              {PROVIDERS.map(({ id, label, Icon }) => (
                <button
                  key={id}
                  type="button"
                  className="lm-provider"
                  onClick={() => handleProvider(id)}
                  disabled={!!busy}
                  aria-busy={busy === id}
                >
                  {busy === id ? <span className="lm-spinner" aria-hidden="true" /> : <Icon />}
                  <span>{busy === id ? 'Redirecting…' : label}</span>
                </button>
              ))}
            </div>

            <label className="lm-remember">
              <input type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)} />
              <span>Remember me for 30 days</span>
            </label>

            {authError && <p className="lm-error" role="alert">{authError}</p>}
          </>
        )}

        <p className="lm-privacy">
          <IconLock size={13} stroke={2} aria-hidden="true" />
          Your profile is private. Only you can see it.
        </p>
      </div>
    </div>,
    document.body
  );
}
