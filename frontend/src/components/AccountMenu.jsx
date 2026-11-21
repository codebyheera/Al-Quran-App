/**
 * components/AccountMenu.jsx — Navbar account button.
 * Logged out → user icon that opens the login dialog.
 * Logged in  → avatar with a small menu (Profile · Logout).
 */

import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { IconUserCircle, IconUser, IconLogout } from '@tabler/icons-react';
import { useAuth, initialsOf } from '../context/AuthContext';
import './AccountMenu.css';

export function Avatar({ src, name, email, size = 30, className = '' }) {
  const [broken, setBroken] = useState(false);
  useEffect(() => setBroken(false), [src]);
  const style = { width: size, height: size, fontSize: Math.round(size * 0.38) };
  if (src && !broken) {
    return (
      <img
        src={src}
        alt=""
        className={`acct-avatar ${className}`}
        style={style}
        referrerPolicy="no-referrer"
        onError={() => setBroken(true)}
      />
    );
  }
  return <span className={`acct-avatar acct-avatar-initials ${className}`} style={style} aria-hidden="true">{initialsOf(name, email)}</span>;
}

export default function AccountMenu() {
  const { user, profile, avatarSrc, status, openLogin, signOut } = useAuth();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    if (!open) return undefined;
    const onDown = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    const onKey = (e) => { if (e.key === 'Escape') setOpen(false); };
    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  if (!user) {
    return (
      <button
        type="button"
        className="hdr-icon-btn acct-btn"
        onClick={openLogin}
        aria-label="Login to sync"
        data-tip="Login to sync"
        disabled={status === 'loading'}
      >
        <IconUserCircle size={21} stroke={1.75} />
      </button>
    );
  }

  const name = profile?.name || user.user_metadata?.full_name || user.user_metadata?.name || '';
  const email = profile?.email || user.email || '';

  return (
    <div className="acct-menu" ref={ref}>
      <button
        type="button"
        className={`hdr-icon-btn acct-btn ${open ? 'is-active' : ''}`}
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label="Account"
        data-tip="Account"
      >
        <Avatar src={avatarSrc} name={name} email={email} size={30} />
      </button>

      {open && (
        <div className="acct-panel" role="menu">
          <div className="acct-head">
            <Avatar src={avatarSrc} name={name} email={email} size={40} />
            <div className="acct-head-text">
              <span className="acct-name">{name || 'Your account'}</span>
              {email && <span className="acct-email">{email}</span>}
            </div>
          </div>
          <Link to="/profile" className="acct-item" role="menuitem" onClick={() => setOpen(false)}>
            <IconUser size={17} stroke={1.9} /> My Profile
          </Link>
          <button
            type="button"
            className="acct-item acct-item-danger"
            role="menuitem"
            onClick={() => { setOpen(false); signOut(); }}
          >
            <IconLogout size={17} stroke={1.9} /> Logout
          </button>
        </div>
      )}
    </div>
  );
}
