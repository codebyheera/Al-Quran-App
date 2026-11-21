/**
 * lib/supabaseClient.js — Lazily-loaded Supabase client for login + sync.
 *
 * Login is optional, so supabase-js (~45 kB gz) is only downloaded when it's
 * actually needed: the visitor clicks "Login", has a saved session, or is
 * coming back from Google/GitHub. Everyone else never loads it.
 *
 * "Remember me":
 *   ✅ on  → session in localStorage, kept for 30 days from login
 *   ❌ off → session in sessionStorage, gone when the browser closes
 * (Supabase's free plan can't time-box sessions server-side, so this is
 * enforced here, in the storage adapter the auth client reads from.)
 */

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const isSupabaseConfigured = Boolean(SUPABASE_URL && SUPABASE_KEY);

export const AUTH_STORAGE_KEY = 'alqh-auth';
const REMEMBER_KEY = 'alqh-auth-remember'; // { remember: boolean, since: ms }
const REMEMBER_DAYS = 30;
const REMEMBER_MS = REMEMBER_DAYS * 24 * 60 * 60 * 1000;

// Storage can throw (private mode, blocked site data) — never let it crash.
function tryStorage(fn, fallback = null) {
  try { return fn(); } catch { return fallback; }
}

export function getRememberPref() {
  return tryStorage(() => JSON.parse(localStorage.getItem(REMEMBER_KEY)));
}

/** Called right before redirecting to Google/GitHub. */
export function setRememberPref(remember) {
  tryStorage(() => localStorage.setItem(REMEMBER_KEY, JSON.stringify({ remember: !!remember, since: Date.now() })));
}

function activeStore() {
  return getRememberPref()?.remember === false ? sessionStorage : localStorage;
}

function rememberExpired() {
  const pref = getRememberPref();
  return !!pref?.remember && Date.now() - (pref.since || 0) > REMEMBER_MS;
}

/** Wipes the saved session (both storages) and the remember preference. */
export function clearAuthStorage() {
  for (const store of [localStorage, sessionStorage]) {
    tryStorage(() => {
      Object.keys(store)
        .filter((k) => k.startsWith(AUTH_STORAGE_KEY))
        .forEach((k) => store.removeItem(k));
    });
  }
  tryStorage(() => localStorage.removeItem(REMEMBER_KEY));
}

const authStorage = {
  getItem(key) {
    if (rememberExpired()) {
      clearAuthStorage();
      return null;
    }
    return tryStorage(() => activeStore().getItem(key));
  },
  setItem(key, value) {
    tryStorage(() => activeStore().setItem(key, value));
  },
  removeItem(key) {
    tryStorage(() => localStorage.removeItem(key));
    tryStorage(() => sessionStorage.removeItem(key));
  },
};

/**
 * True when there's a reason to load Supabase on page load: a saved session,
 * or a half-finished login (PKCE verifier) we're returning from. Cheap and
 * synchronous — no network, no library.
 */
export function hasAuthState() {
  if (!isSupabaseConfigured || typeof window === 'undefined') return false;
  if (rememberExpired()) {
    clearAuthStorage();
    return false;
  }
  return [localStorage, sessionStorage].some((store) =>
    tryStorage(() => Object.keys(store).some((k) => k.startsWith(AUTH_STORAGE_KEY)), false)
  );
}

let clientPromise = null;

/** The shared Supabase client, created on first call. */
export function getSupabase() {
  if (!isSupabaseConfigured) return Promise.reject(new Error('Supabase is not configured'));
  clientPromise ||= import('@supabase/supabase-js').then(({ createClient }) =>
    createClient(SUPABASE_URL, SUPABASE_KEY, {
      auth: {
        storageKey: AUTH_STORAGE_KEY,
        storage: authStorage,
        flowType: 'pkce',
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    })
  );
  return clientPromise;
}
