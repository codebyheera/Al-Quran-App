/**
 * pages/ProfilePage.jsx — /profile: the logged-in user's PRIVATE profile.
 * Photo (compressed in the browser), name, email (read-only), bio, socials.
 * Nobody else can see it — RLS only lets each user read their own row.
 */

import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import {
  IconCamera, IconTrash, IconLogout, IconLock, IconCloudCheck, IconCloudX, IconCloudOff, IconRefresh,
  IconBrandGoogle, IconBrandGithub, IconCheck,
} from '@tabler/icons-react';
import { useAuth } from '../context/AuthContext';
import { Avatar } from '../components/AccountMenu';
import { AvatarError } from '../lib/compressAvatar';
import { SOCIAL_FIELDS, validateSocial, cleanSocials } from '../lib/socialLinks';
import './ProfilePage.css';

const NAME_MAX = 60;
const BIO_MAX = 300;

function draftFrom(profile, user) {
  return {
    name: profile?.name ?? user?.user_metadata?.full_name ?? '',
    bio: profile?.bio ?? '',
    socials: { ...(profile?.socials || {}) },
  };
}

function sameDraft(a, b) {
  return a.name.trim() === b.name.trim()
    && a.bio.trim() === b.bio.trim()
    && JSON.stringify(cleanSocials(a.socials)) === JSON.stringify(cleanSocials(b.socials));
}

const PROVIDER_META = {
  google: { label: 'Google', Icon: IconBrandGoogle },
  github: { label: 'GitHub', Icon: IconBrandGithub },
};

export default function ProfilePage() {
  const {
    user, profile, avatarSrc, status, openLogin, signOut, updateProfile, uploadAvatar, removeAvatar,
    sync, syncNow, deleteAccount,
  } = useAuth();

  const saved = useMemo(() => draftFrom(profile, user), [profile, user]);
  const [draft, setDraft] = useState(saved);
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState(null); // { ok: boolean, text }
  const [photoBusy, setPhotoBusy] = useState(false);
  const [photoError, setPhotoError] = useState(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmText, setConfirmText] = useState('');
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState(null);
  const navigate = useNavigate();
  const fileRef = useRef(null);

  const dirty = !sameDraft(draft, saved);
  const draftRef = useRef(draft);
  draftRef.current = draft;
  const lastSavedRef = useRef(saved);

  // Pick up the loaded/updated profile, unless the user has started editing
  // (i.e. their draft differs from what was loaded BEFORE this update).
  useEffect(() => {
    if (sameDraft(draftRef.current, lastSavedRef.current)) setDraft(saved);
    lastSavedRef.current = saved;
  }, [saved]);

  const socialErrors = useMemo(() => {
    const errs = {};
    for (const field of SOCIAL_FIELDS) {
      const { error } = validateSocial(field, draft.socials[field.key]);
      if (error) errs[field.key] = error;
    }
    return errs;
  }, [draft.socials]);
  const hasErrors = Object.keys(socialErrors).length > 0 || !draft.name.trim();

  const helmet = (
    <Helmet>
      <title>My Profile | Al-Quran Hub</title>
      <meta name="robots" content="noindex, nofollow" />
    </Helmet>
  );

  if (status === 'loading') {
    return (
      <div className="pf-page">
        {helmet}
        <div className="loading-center" role="status" aria-label="Loading"><div className="spinner" /></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="pf-page">
        {helmet}
        <section className="pf-card pf-empty">
          <div className="pf-empty-icon" aria-hidden="true"><IconCloudCheck size={30} stroke={1.6} /></div>
          <h1 className="pf-title">Your profile</h1>
          <p className="pf-muted">
            Login is optional. Sign in with Google or GitHub to keep your bookmarks, reading
            progress and settings in sync on all your devices.
          </p>
          <button type="button" className="pf-btn pf-btn-primary" onClick={openLogin}>Login to sync</button>
        </section>
      </div>
    );
  }

  const provider = PROVIDER_META[user.app_metadata?.provider];
  const email = profile?.email || user.email || '';
  const memberSince = (profile?.created_at || user.created_at)
    ? new Date(profile?.created_at || user.created_at).toLocaleDateString(undefined, { year: 'numeric', month: 'long' })
    : null;

  function setField(key, value) {
    setSaveMsg(null);
    setDraft((d) => ({ ...d, [key]: value }));
  }
  function setSocial(key, value) {
    setSaveMsg(null);
    setDraft((d) => ({ ...d, socials: { ...d.socials, [key]: value } }));
  }

  async function handleSave(e) {
    e.preventDefault();
    if (!dirty || hasErrors || saving) return;
    setSaving(true);
    setSaveMsg(null);
    try {
      const updated = await updateProfile({
        name: draft.name.trim().slice(0, NAME_MAX),
        bio: draft.bio.trim().slice(0, BIO_MAX) || null,
        socials: cleanSocials(draft.socials),
      });
      setDraft(draftFrom(updated, user));
      setSaveMsg({ ok: true, text: 'Profile saved' });
    } catch (err) {
      setSaveMsg({ ok: false, text: `Couldn't save: ${err.message}` });
    } finally {
      setSaving(false);
    }
  }

  async function handlePhoto(e) {
    const file = e.target.files?.[0];
    e.target.value = ''; // allow picking the same file again
    if (!file) return;
    setPhotoError(null);
    setPhotoBusy(true);
    try {
      await uploadAvatar(file);
    } catch (err) {
      setPhotoError(err instanceof AvatarError ? err.message : `Upload failed: ${err.message}`);
    } finally {
      setPhotoBusy(false);
    }
  }

  async function handleDelete() {
    setDeleting(true);
    setDeleteError(null);
    try {
      await deleteAccount();
      navigate('/', { replace: true });
    } catch (err) {
      setDeleteError(`Couldn't delete your account: ${err.message}`);
      setDeleting(false);
    }
  }

  async function handleRemovePhoto() {
    setPhotoError(null);
    setPhotoBusy(true);
    try {
      await removeAvatar();
    } catch (err) {
      setPhotoError(`Couldn't remove photo: ${err.message}`);
    } finally {
      setPhotoBusy(false);
    }
  }

  return (
    <div className="pf-page">
      {helmet}

      <form className="pf-card" onSubmit={handleSave} noValidate>
        {/* ── Header: photo + identity ─────────────────────────── */}
        <div className="pf-head">
          <div className="pf-photo">
            <Avatar src={avatarSrc} name={draft.name} email={email} size={112} className="pf-avatar" />
            {photoBusy && <span className="pf-photo-busy" aria-hidden="true"><span className="pf-spinner" /></span>}
          </div>
          <div className="pf-head-text">
            <h1 className="pf-title">{profile?.name || 'My Profile'}</h1>
            <p className="pf-muted pf-private">
              <IconLock size={14} stroke={2} aria-hidden="true" /> Private profile, visible only to you
            </p>
            <div className="pf-photo-actions">
              <button type="button" className="pf-btn pf-btn-ghost" onClick={() => fileRef.current?.click()} disabled={photoBusy}>
                <IconCamera size={17} stroke={1.9} /> {profile?.avatar_path ? 'Change photo' : 'Upload photo'}
              </button>
              {profile?.avatar_path && (
                <button type="button" className="pf-btn pf-btn-ghost pf-btn-danger" onClick={handleRemovePhoto} disabled={photoBusy}>
                  <IconTrash size={17} stroke={1.9} /> Remove
                </button>
              )}
              <input
                ref={fileRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={handlePhoto}
                hidden
              />
            </div>
            <p className="pf-hint">JPG, PNG or WebP · max 2 MB</p>
            {photoError && <p className="pf-error" role="alert">{photoError}</p>}
          </div>
        </div>

        {/* ── Details ─────────────────────────────────────────── */}
        <fieldset className="pf-section">
          <legend className="pf-section-title">Details</legend>

          <label className="pf-field">
            <span className="pf-label">Name</span>
            <input
              type="text"
              className="pf-input"
              value={draft.name}
              maxLength={NAME_MAX}
              onChange={(e) => setField('name', e.target.value)}
              autoComplete="name"
              required
              aria-invalid={!draft.name.trim()}
            />
            {!draft.name.trim() && <span className="pf-error">Name can't be empty.</span>}
          </label>

          <div className="pf-field">
            <span className="pf-label">Email</span>
            <div className="pf-input pf-input-readonly">
              <span className="pf-email">{email || 'Not shared by your login provider'}</span>
              {provider && (
                <span className="pf-provider"><provider.Icon size={14} stroke={2} /> {provider.label}</span>
              )}
            </div>
            <span className="pf-hint">Comes from your {provider?.label || 'login'} account and can't be changed here.</span>
          </div>

          <label className="pf-field">
            <span className="pf-label">
              Bio <span className="pf-count">{draft.bio.length}/{BIO_MAX}</span>
            </span>
            <textarea
              className="pf-input pf-textarea"
              value={draft.bio}
              maxLength={BIO_MAX}
              rows={3}
              placeholder="A few words about yourself"
              onChange={(e) => setField('bio', e.target.value)}
            />
          </label>
        </fieldset>

        {/* ── Socials ─────────────────────────────────────────── */}
        <fieldset className="pf-section">
          <legend className="pf-section-title">Social links</legend>
          <div className="pf-socials">
            {SOCIAL_FIELDS.map((field) => (
              <label key={field.key} className="pf-field">
                <span className="pf-label">{field.label}</span>
                <input
                  type="url"
                  inputMode="url"
                  className="pf-input"
                  value={draft.socials[field.key] || ''}
                  placeholder={field.placeholder}
                  maxLength={200}
                  onChange={(e) => setSocial(field.key, e.target.value)}
                  aria-invalid={!!socialErrors[field.key]}
                />
                {socialErrors[field.key] && <span className="pf-error">{socialErrors[field.key]}</span>}
              </label>
            ))}
          </div>
        </fieldset>

        {/* ── Save bar ────────────────────────────────────────── */}
        <div className="pf-actions">
          {saveMsg && (
            <span className={saveMsg.ok ? 'pf-ok' : 'pf-error'} role="status">
              {saveMsg.ok && <IconCheck size={16} stroke={2.2} />} {saveMsg.text}
            </span>
          )}
          <button type="submit" className="pf-btn pf-btn-primary" disabled={!dirty || hasErrors || saving}>
            {saving ? 'Saving…' : 'Save changes'}
          </button>
        </div>
      </form>

      {/* ── Sync ──────────────────────────────────────────────── */}
      <section className="pf-card pf-row-card" aria-labelledby="pf-sync-title">
        <div className="pf-row-main">
          <h2 id="pf-sync-title" className="pf-card-title">
            <SyncIcon state={sync.state} /> Sync
          </h2>
          <p className="pf-muted" role="status">{syncLabel(sync)}</p>
          <p className="pf-hint">
            Bookmarks, reading progress, streak, tasbih counts and reader settings stay the same on
            every device you log in on.
          </p>
        </div>
        <button
          type="button"
          className="pf-btn pf-btn-ghost"
          onClick={syncNow}
          disabled={sync.state === 'syncing'}
        >
          <IconRefresh size={17} stroke={1.9} className={sync.state === 'syncing' ? 'pf-spin' : ''} />
          {sync.state === 'syncing' ? 'Syncing…' : 'Sync now'}
        </button>
      </section>

      {/* ── Account ───────────────────────────────────────────── */}
      <section className="pf-card" aria-labelledby="pf-account-title">
        <div className="pf-row-card pf-row-flat">
          <div className="pf-row-main">
            <h2 id="pf-account-title" className="pf-card-title">Account</h2>
            {memberSince && <p className="pf-muted">Member since {memberSince}</p>}
            <p className="pf-hint">Logging out only signs out this device. Log in again anytime to get your data back.</p>
          </div>
          <button type="button" className="pf-btn pf-btn-ghost" onClick={signOut}>
            <IconLogout size={17} stroke={1.9} /> Logout
          </button>
        </div>

        <div className="pf-danger">
          <h3 className="pf-danger-title">Delete account</h3>
          <p className="pf-hint pf-danger-text">
            Permanently deletes your profile, photo, synced bookmarks, progress and settings from our
            servers. This can&apos;t be undone. Data saved on this device stays until you clear it.
          </p>
          {!confirmOpen ? (
            <button type="button" className="pf-btn pf-btn-danger-solid" onClick={() => setConfirmOpen(true)}>
              <IconTrash size={17} stroke={1.9} /> Delete my account
            </button>
          ) : (
            <div className="pf-confirm">
              <label className="pf-field">
                <span className="pf-label">Type DELETE to confirm</span>
                <input
                  type="text"
                  className="pf-input"
                  value={confirmText}
                  onChange={(e) => setConfirmText(e.target.value)}
                  autoComplete="off"
                  autoCapitalize="characters"
                  spellCheck={false}
                  disabled={deleting}
                />
              </label>
              {deleteError && <p className="pf-error" role="alert">{deleteError}</p>}
              <div className="pf-confirm-actions">
                <button
                  type="button"
                  className="pf-btn pf-btn-ghost"
                  onClick={() => { setConfirmOpen(false); setConfirmText(''); setDeleteError(null); }}
                  disabled={deleting}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="pf-btn pf-btn-danger-solid"
                  onClick={handleDelete}
                  disabled={confirmText.trim().toUpperCase() !== 'DELETE' || deleting}
                >
                  {deleting ? 'Deleting…' : 'Permanently delete'}
                </button>
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

function SyncIcon({ state }) {
  if (state === 'error') return <IconCloudX size={19} stroke={1.8} className="pf-sync-err" aria-hidden="true" />;
  if (state === 'offline') return <IconCloudOff size={19} stroke={1.8} className="pf-sync-off" aria-hidden="true" />;
  return <IconCloudCheck size={19} stroke={1.8} className="pf-sync-ok" aria-hidden="true" />;
}

function syncLabel({ state, lastSyncedAt, error }) {
  if (state === 'syncing') return 'Syncing your data…';
  if (state === 'offline') return "You're offline. Changes will sync when you're back online.";
  if (state === 'error') return `Couldn't sync right now${error ? ` (${error})` : ''}. We'll try again automatically.`;
  if (lastSyncedAt) {
    const time = new Date(lastSyncedAt).toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' });
    return `All changes synced · last at ${time}`;
  }
  return 'Waiting to sync…';
}
