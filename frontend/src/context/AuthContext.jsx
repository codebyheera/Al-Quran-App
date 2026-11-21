/**
 * context/AuthContext.jsx — Optional login (Google / GitHub) + private profile.
 *
 * Logged-out visitors never download supabase-js: the client is only loaded
 * when there's a saved session, a login in progress, or the user clicks Login.
 *
 * Exposes: user, profile, avatarSrc, status ('loading' | 'ready'),
 *          openLogin(), closeLogin(), loginOpen, authError,
 *          signIn(provider, remember), signOut(),
 *          updateProfile(patch), uploadAvatar(file), removeAvatar()
 */

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import {
  getSupabase, hasAuthState, isSupabaseConfigured, setRememberPref, clearAuthStorage,
} from '../lib/supabaseClient';
import { compressAvatar } from '../lib/compressAvatar';

const AVATAR_CACHE_KEY = 'alqh-avatar-cache'; // { path, dataUrl } — saves re-downloading
const PROFILE_COLUMNS = 'id, name, email, bio, avatar_path, socials, created_at';

// Safe defaults so components (and the build-time prerender, which has no
// AuthProvider) can call useAuth() without crashing.
const noop = async () => {};
const AuthContext = createContext({
  user: null,
  profile: null,
  avatarSrc: null,
  status: 'ready',
  configured: false,
  loginOpen: false,
  authError: null,
  sync: { state: 'idle', lastSyncedAt: null, error: null },
  openLogin: () => {},
  closeLogin: () => {},
  signIn: noop,
  signOut: noop,
  updateProfile: noop,
  uploadAvatar: noop,
  removeAvatar: noop,
  syncNow: noop,
  deleteAccount: noop,
});

function readAvatarCache(path) {
  try {
    const cached = JSON.parse(localStorage.getItem(AVATAR_CACHE_KEY));
    return cached?.path === path ? cached.dataUrl : null;
  } catch { return null; }
}

function writeAvatarCache(path, dataUrl) {
  try {
    if (path && dataUrl) localStorage.setItem(AVATAR_CACHE_KEY, JSON.stringify({ path, dataUrl }));
    else localStorage.removeItem(AVATAR_CACHE_KEY);
  } catch { /* storage full / blocked — just skip caching */ }
}

function blobToDataUrl(blob) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

/** Errors Google/GitHub/Supabase put in the URL when a login fails. */
function readUrlAuthError() {
  const params = new URLSearchParams(window.location.search);
  const hash = new URLSearchParams(window.location.hash.replace(/^#/, ''));
  const desc = params.get('error_description') || hash.get('error_description');
  if (!desc && !params.get('error')) return null;
  // Remove the error from the address bar so a refresh doesn't show it again.
  const url = new URL(window.location.href);
  ['error', 'error_code', 'error_description'].forEach((k) => url.searchParams.delete(k));
  window.history.replaceState(window.history.state, '', url.pathname + url.search);
  // Never show the URL's own text: anyone can craft a link with a fake
  // "error" message, so only our fixed wording is displayed.
  if (desc) console.warn('Login failed:', desc);
  return 'Login was cancelled or failed. Please try again.';
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [avatarSrc, setAvatarSrc] = useState(null);
  // Logged-out visitors are 'ready' from the very first render (no session to
  // restore), so nothing on the page waits or shifts for them.
  const [status, setStatus] = useState(() => (typeof window !== 'undefined' && hasAuthState() ? 'loading' : 'ready'));
  const [loginOpen, setLoginOpen] = useState(false);
  const [authError, setAuthError] = useState(null);
  const [sync, setSync] = useState({ state: 'idle', lastSyncedAt: null, error: null });
  const userIdRef = useRef(null);
  const syncRef = useRef(null);

  const loadProfile = useCallback(async (uid) => {
    const supabase = await getSupabase();
    const { data, error } = await supabase.from('profiles').select(PROFILE_COLUMNS).eq('id', uid).maybeSingle();
    if (error) {
      console.error('Failed to load profile:', error.message);
      return;
    }
    if (userIdRef.current === uid) setProfile(data);
  }, []);

  const applySession = useCallback((session) => {
    const nextUser = session?.user ?? null;
    const prevId = userIdRef.current;
    userIdRef.current = nextUser?.id ?? null;
    setUser(nextUser);
    if (!nextUser) {
      setProfile(null);
    } else if (nextUser.id !== prevId) {
      loadProfile(nextUser.id);
    }
  }, [loadProfile]);

  // ── Startup: only load Supabase if there's a session to restore ──────────
  useEffect(() => {
    const urlError = readUrlAuthError();
    if (urlError) {
      setAuthError(urlError);
      setLoginOpen(true);
    }

    if (!hasAuthState()) {
      setStatus('ready');
      return undefined;
    }

    let unsubscribe = () => {};
    let cancelled = false;
    getSupabase()
      .then(async (supabase) => {
        if (cancelled) return;
        const { data } = supabase.auth.onAuthStateChange((_event, session) => {
          // Supabase warns against awaiting its own calls inside this callback.
          setTimeout(() => applySession(session), 0);
        });
        unsubscribe = () => data.subscription.unsubscribe();
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) setAuthError(error.message);
        // A login abandoned half-way leaves a stale verifier behind; clear it
        // so the next visit doesn't load supabase-js for nothing.
        if (!session) clearAuthStorage();
        applySession(session);
      })
      .catch((err) => {
        console.error('Auth init failed:', err.message);
      })
      .finally(() => { if (!cancelled) setStatus('ready'); });

    return () => { cancelled = true; unsubscribe(); };
  }, [applySession]);

  // ── Settings + progress sync (only while logged in) ──────────────────────
  const uid = user?.id ?? null;
  useEffect(() => {
    if (!uid) { setSync({ state: 'idle', lastSyncedAt: null, error: null }); return undefined; }
    let controller = null;
    let cancelled = false;
    Promise.all([getSupabase(), import('../lib/cloudSync')])
      .then(([supabase, { startCloudSync }]) => {
        if (cancelled) return;
        controller = startCloudSync({ supabase, uid, onStatus: setSync });
        syncRef.current = controller;
      })
      .catch((err) => setSync({ state: 'error', lastSyncedAt: null, error: err.message }));
    return () => {
      cancelled = true;
      controller?.stop();
      if (syncRef.current === controller) syncRef.current = null;
    };
  }, [uid]);

  // ── Avatar: uploaded photo (private bucket) → provider photo → none ──────
  useEffect(() => {
    if (!user) { setAvatarSrc(null); return undefined; }
    const providerPhoto = user.user_metadata?.avatar_url || user.user_metadata?.picture || null;
    const path = profile?.avatar_path;
    if (!path) { setAvatarSrc(providerPhoto); return undefined; }

    const cached = readAvatarCache(path);
    if (cached) { setAvatarSrc(cached); return undefined; }

    let cancelled = false;
    setAvatarSrc(providerPhoto);
    getSupabase()
      .then((supabase) => supabase.storage.from('avatars').download(path))
      .then(async ({ data, error }) => {
        if (error) throw error;
        const dataUrl = await blobToDataUrl(data);
        writeAvatarCache(path, dataUrl);
        if (!cancelled) setAvatarSrc(dataUrl);
      })
      .catch((err) => console.error('Failed to load avatar:', err.message));
    return () => { cancelled = true; };
  }, [user, profile?.avatar_path]);

  // ── Actions ──────────────────────────────────────────────────────────────
  const openLogin = useCallback(() => { setAuthError(null); setLoginOpen(true); }, []);
  const closeLogin = useCallback(() => { setLoginOpen(false); setAuthError(null); }, []);

  const signIn = useCallback(async (provider, remember = true) => {
    setAuthError(null);
    setRememberPref(remember);
    const supabase = await getSupabase();
    // Come back to the exact page the user was on.
    const redirectTo = window.location.origin + window.location.pathname + window.location.search;
    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo,
        // Let people pick which Google account to use instead of auto-picking.
        queryParams: provider === 'google' ? { prompt: 'select_account' } : undefined,
      },
    });
    if (error) {
      setAuthError(error.message);
      throw error;
    }
    // Browser now navigates away to Google/GitHub.
  }, []);

  /** Logs out THIS device only — other devices stay logged in. */
  const signOut = useCallback(async () => {
    // Push any not-yet-synced changes first (max 4 s, best effort).
    try {
      await Promise.race([syncRef.current?.syncNow(), new Promise((r) => setTimeout(r, 4000))]);
    } catch { /* ignore */ }
    try {
      const supabase = await getSupabase();
      await supabase.auth.signOut({ scope: 'local' });
    } catch (err) {
      console.error('Sign out failed:', err.message);
    }
    clearAuthStorage();
    writeAvatarCache(null);
    applySession(null);
  }, [applySession]);

  const updateProfile = useCallback(async (patch) => {
    const uid = userIdRef.current;
    if (!uid) throw new Error('Not logged in');
    const supabase = await getSupabase();
    const { data, error } = await supabase
      .from('profiles')
      .update(patch)
      .eq('id', uid)
      .select(PROFILE_COLUMNS)
      .single();
    if (error) throw error;
    setProfile(data);
    return data;
  }, []);

  const uploadAvatar = useCallback(async (file) => {
    const uid = userIdRef.current;
    if (!uid) throw new Error('Not logged in');
    const blob = await compressAvatar(file); // throws AvatarError with a friendly message
    const ext = blob.type === 'image/webp' ? 'webp' : 'jpg';
    // New name each time → caches (ours + browser) never show a stale photo.
    const path = `${uid}/${Date.now()}.${ext}`;
    const supabase = await getSupabase();
    const { error: upErr } = await supabase.storage
      .from('avatars')
      .upload(path, blob, { contentType: blob.type, cacheControl: '31536000', upsert: false });
    if (upErr) throw upErr;

    const oldPath = profile?.avatar_path;
    const dataUrl = await blobToDataUrl(blob);
    writeAvatarCache(path, dataUrl);
    await updateProfile({ avatar_path: path });
    setAvatarSrc(dataUrl);
    // Free the old file's space (best effort).
    if (oldPath && oldPath !== path) {
      supabase.storage.from('avatars').remove([oldPath]).catch(() => {});
    }
  }, [profile?.avatar_path, updateProfile]);

  const removeAvatar = useCallback(async () => {
    const oldPath = profile?.avatar_path;
    if (!oldPath) return;
    await updateProfile({ avatar_path: null });
    writeAvatarCache(null);
    const supabase = await getSupabase();
    supabase.storage.from('avatars').remove([oldPath]).catch(() => {});
  }, [profile?.avatar_path, updateProfile]);

  const syncNow = useCallback(() => syncRef.current?.syncNow(), []);

  /**
   * Permanently deletes the account: avatar files, then the auth user (which
   * cascades to profile, settings, progress and bookmarks in the database).
   */
  const deleteAccount = useCallback(async () => {
    const uid = userIdRef.current;
    if (!uid) throw new Error('Not logged in');
    const supabase = await getSupabase();

    const { data: files } = await supabase.storage.from('avatars').list(uid, { limit: 100 });
    if (files?.length) {
      await supabase.storage.from('avatars').remove(files.map((f) => `${uid}/${f.name}`));
    }

    const { error } = await supabase.rpc('delete_my_account');
    if (error) throw error;

    syncRef.current?.stop();
    syncRef.current = null;
    const { resetSyncMeta } = await import('../lib/cloudSync');
    resetSyncMeta();
    try { await supabase.auth.signOut({ scope: 'local' }); } catch { /* user already gone */ }
    clearAuthStorage();
    writeAvatarCache(null);
    applySession(null);
  }, [applySession]);

  const value = useMemo(() => ({
    user,
    profile,
    avatarSrc,
    status,
    configured: isSupabaseConfigured,
    loginOpen,
    authError,
    sync,
    openLogin,
    closeLogin,
    signIn,
    signOut,
    updateProfile,
    uploadAvatar,
    removeAvatar,
    syncNow,
    deleteAccount,
  }), [user, profile, avatarSrc, status, loginOpen, authError, sync, openLogin, closeLogin, signIn, signOut, updateProfile, uploadAvatar, removeAvatar, syncNow, deleteAccount]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}

/** "Abdullah Khan" → "AK" for the fallback avatar. */
export function initialsOf(name, email) {
  const source = (name || email || '?').trim();
  const parts = source.split(/\s+/).filter(Boolean);
  const letters = parts.length > 1 ? parts[0][0] + parts[parts.length - 1][0] : source.slice(0, 2);
  return letters.toUpperCase();
}
