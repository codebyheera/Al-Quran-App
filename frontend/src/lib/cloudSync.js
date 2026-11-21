/**
 * lib/cloudSync.js — Keeps reader settings + progress the same on every
 * device a user is logged in on. Loaded only for logged-in users.
 *
 * How it works
 *   • The app keeps reading/writing localStorage exactly as before (works
 *     offline, no code changes in pages). While logged in, writes to the keys
 *     listed below are noticed and pushed to Supabase a few seconds later.
 *   • On login, on returning to the tab and when coming back online, the
 *     cloud copy is pulled and merged into localStorage. Changed keys are
 *     announced with a `storage` event, which the theme/font/reciter/audio
 *     code already listens to, so the screen updates live.
 *
 * Merge rules (per key)
 *   • Settings, last reading …  newest change wins (timestamps per key)
 *   • Tasbih/Durood totals      the bigger number wins (counts never drop)
 *   • Reading streak            day-by-day history from both devices combined
 *   • First login of an account on a device: the cloud copy wins, so one
 *     account's data never leaks into another account on a shared device.
 *
 * Cloud format: { "<key>": { "v": "<localStorage string or null>", "t": <ms> } }
 */

const META_KEY = 'alqh-sync-meta'; // { uid, t: { key: lastLocalChangeMs } }

// Reader preferences → user_settings
const SETTINGS_KEYS = new Set([
  'quran-theme-choice',
  'arabicFontSize',
  'translationFontSize',
  'quranScript',
  'urduFont',
  'selectedReciter',
  'audioLanguage',
  'preferredLanguage',
  'showEn',
  'showUr',
  'prayer_method',
]);

// Reading/worship progress → user_progress
const PROGRESS_KEYS = new Set([
  'alquranhub_last_reading',
  'quranStreakData',
  'tasbih_lifetime_total',
  'darood_lifetime_total',
  'tasbih_streak',
  'tasbih_last_active_date',
]);

// Today's counters (tasbih_<dhikr>_<date>, darood_count_<date>). Only the
// last few days are synced so the cloud copy stays tiny.
const DAILY_PATTERNS = [/^tasbih_.+_(\d{4}-\d{2}-\d{2})$/, /^darood_count_(\d{4}-\d{2}-\d{2})$/];
const DAILY_KEEP_DAYS = 7;

const MAX_KEYS = new Set(['tasbih_lifetime_total', 'darood_lifetime_total']);
const STREAK_KEY = 'quranStreakData';

const PUSH_DEBOUNCE_MS = 4000;
const PUSH_MAX_WAIT_MS = 30000;
const REFRESH_MIN_GAP_MS = 30000;

// ── Key helpers ──────────────────────────────────────────────────────────────

function dailyDate(key) {
  for (const re of DAILY_PATTERNS) {
    const m = key.match(re);
    if (m) return m[1];
  }
  return null;
}

function dailyCutoff() {
  return new Date(Date.now() - DAILY_KEEP_DAYS * 86_400_000).toISOString().slice(0, 10);
}

/** 'settings' | 'progress' | null (not synced). */
function docFor(key) {
  if (SETTINGS_KEYS.has(key)) return 'settings';
  if (PROGRESS_KEYS.has(key)) return 'progress';
  const date = dailyDate(key);
  if (date && date >= dailyCutoff()) return 'progress';
  return null;
}

// ── Raw storage access (bypasses the change tracker below) ──────────────────

const proto = typeof Storage !== 'undefined' ? Storage.prototype : null;
const rawGet = proto?.getItem;
const rawSet = proto?.setItem;
const rawRemove = proto?.removeItem;

function local() {
  try { return window.localStorage; } catch { return null; }
}

function readRaw(key) {
  try { return rawGet.call(local(), key); } catch { return null; }
}

function writeRaw(key, value) {
  try {
    if (value === null || value === undefined) rawRemove.call(local(), key);
    else rawSet.call(local(), key, value);
  } catch { /* quota / blocked — skip */ }
}

function readMeta() {
  try {
    const m = JSON.parse(readRaw(META_KEY));
    if (m && typeof m === 'object' && m.t && typeof m.t === 'object') return m;
  } catch { /* corrupted */ }
  return { uid: null, t: {} };
}

function saveMeta(meta) {
  writeRaw(META_KEY, JSON.stringify(meta));
}

/** Forget which account this device last synced with (account deleted). */
export function resetSyncMeta() {
  writeRaw(META_KEY, null);
}

// ── Change tracker ───────────────────────────────────────────────────────────
// Wraps Storage#setItem/removeItem once so every existing writer (contexts,
// hooks, pages) is covered without touching them. It only records a
// timestamp for synced keys whose value actually changed, while logged in.

let installed = false;
let tracking = false;
let applying = false;
let onLocalChange = null;

function noteChange(storage, key, prev, next) {
  if (!tracking || applying || storage !== local()) return;
  const k = String(key);
  if (!docFor(k) || prev === next) return;
  const meta = readMeta();
  meta.t[k] = Date.now();
  saveMeta(meta);
  onLocalChange?.();
}

function installTracker() {
  if (installed || !proto) return;
  installed = true;
  proto.setItem = function setItem(key, value) {
    const prev = tracking ? rawGet.call(this, key) : null;
    rawSet.call(this, key, value);
    noteChange(this, key, prev, String(value));
  };
  proto.removeItem = function removeItem(key) {
    const prev = tracking ? rawGet.call(this, key) : null;
    rawRemove.call(this, key);
    noteChange(this, key, prev, null);
  };
}

// ── Merging ──────────────────────────────────────────────────────────────────

function validEntry(e) {
  return e && typeof e === 'object' && (typeof e.v === 'string' || e.v === null)
    ? { v: e.v, t: Number(e.t) || 0 }
    : null;
}

function toNum(v) {
  const n = parseInt(v ?? '0', 10);
  return Number.isFinite(n) && n > 0 ? n : 0;
}

/** Combine two devices' reading streak data without losing either's days. */
function mergeStreak(L, R) {
  let a; let b;
  try { a = JSON.parse(L.v); b = JSON.parse(R.v); } catch { return L.t > R.t ? L : R; }
  if (!a || !b || typeof a !== 'object' || typeof b !== 'object') return L.t > R.t ? L : R;

  const newer = L.t > R.t ? a : b;
  const history = {};
  const dates = new Set([...Object.keys(a.history || {}), ...Object.keys(b.history || {})]);
  [...dates].sort().forEach((d) => {
    const x = a.history?.[d] || {};
    const y = b.history?.[d] || {};
    history[d] = { s: Math.max(x.s || 0, y.s || 0), c: Math.max(x.c || 0, y.c || 0) };
  });

  const todayDate = (a.todayDate || '') >= (b.todayDate || '') ? a.todayDate : b.todayDate;
  const todaySecondsRead = Math.max(
    a.todayDate === todayDate ? a.todaySecondsRead || 0 : 0,
    b.todayDate === todayDate ? b.todaySecondsRead || 0 : 0,
  );
  const lastA = a.lastCompletedDate || '';
  const lastB = b.lastCompletedDate || '';
  const streakFrom = lastA === lastB
    ? (a.currentStreak >= b.currentStreak ? a : b)
    : (lastA > lastB ? a : b);

  // Fixed key order → identical inputs always give an identical string.
  const merged = {
    dailyGoalMinutes: newer.dailyGoalMinutes ?? a.dailyGoalMinutes ?? b.dailyGoalMinutes ?? null,
    todayDate,
    todaySecondsRead,
    currentStreak: streakFrom.currentStreak || 0,
    longestStreak: Math.max(a.longestStreak || 0, b.longestStreak || 0),
    lastCompletedDate: streakFrom.lastCompletedDate || null,
    history,
  };
  return { v: JSON.stringify(merged), t: Math.max(L.t, R.t) };
}

function mergeEntry(key, L, R, firstForThisAccount) {
  if (!R) return L;
  if (!L) return R;
  if (firstForThisAccount) return R; // cloud wins on an account's first sync here
  if (MAX_KEYS.has(key) || dailyDate(key)) {
    const v = Math.max(toNum(L.v), toNum(R.v));
    return { v: v ? String(v) : null, t: Math.max(L.t, R.t) };
  }
  if (key === STREAK_KEY && L.v && R.v) return mergeStreak(L, R);
  return L.t > R.t ? L : R; // tie → cloud
}

function readLocalDocs(meta) {
  const docs = { settings: {}, progress: {} };
  let keys = [];
  try { keys = Object.keys(local()); } catch { /* blocked */ }
  for (const key of keys) {
    const doc = docFor(key);
    if (!doc) continue;
    docs[doc][key] = { v: readRaw(key), t: Number(meta.t[key]) || 0 };
  }
  // Keys removed locally since the last sync still need to reach the cloud.
  for (const key of Object.keys(meta.t)) {
    const doc = docFor(key);
    if (doc && !(key in docs[doc])) docs[doc][key] = { v: null, t: Number(meta.t[key]) || 0 };
  }
  return docs;
}

/** Write cloud values locally and tell the live UI about them. */
function applyLocal(changes) {
  if (!changes.length) return;
  applying = true;
  try {
    for (const [key, value] of changes) {
      const oldValue = readRaw(key);
      writeRaw(key, value);
      try {
        window.dispatchEvent(new StorageEvent('storage', {
          key, oldValue, newValue: value, storageArea: local(), url: window.location.href,
        }));
      } catch { /* very old browsers — values still apply on next load */ }
    }
  } finally {
    applying = false;
  }
  window.dispatchEvent(new CustomEvent('alqh:cloud-sync', { detail: { keys: changes.map(([k]) => k) } }));
}

// ── Sync controller ──────────────────────────────────────────────────────────

/**
 * Starts syncing for a logged-in user.
 * @param {{ supabase, uid, onStatus?: (status: {state, lastSyncedAt, error}) => void }} opts
 * @returns {{ syncNow: () => Promise<void>, stop: () => void }}
 */
export function startCloudSync({ supabase, uid, onStatus }) {
  installTracker();
  tracking = true;

  let stopped = false;
  let running = null;
  let rerun = false;
  let debounceTimer = null;
  let maxWaitTimer = null;
  let lastSyncedAt = 0;

  const report = (state, error = null) => {
    if (!stopped) onStatus?.({ state, lastSyncedAt: lastSyncedAt || null, error });
  };

  async function syncOnce() {
    const [settingsRes, progressRes] = await Promise.all([
      supabase.from('user_settings').select('settings').maybeSingle(),
      supabase.from('user_progress').select('progress').maybeSingle(),
    ]);
    if (settingsRes.error) throw settingsRes.error;
    if (progressRes.error) throw progressRes.error;
    if (stopped) return;

    const remote = {
      settings: settingsRes.data?.settings || {},
      progress: progressRes.data?.progress || {},
    };
    const meta = readMeta();
    const firstForThisAccount = meta.uid !== uid;
    const localDocs = readLocalDocs(meta);
    const changes = [];
    const patch = { settings: {}, progress: {} };

    for (const doc of ['settings', 'progress']) {
      const keys = new Set([...Object.keys(localDocs[doc]), ...Object.keys(remote[doc])]);
      for (const key of keys) {
        if (docFor(key) !== doc) continue; // unknown or expired daily key
        const L = localDocs[doc][key] || null;
        const R = validEntry(remote[doc][key]);
        const M = mergeEntry(key, L, R, firstForThisAccount);
        if (!M) continue;
        if ((L?.v ?? null) !== M.v) changes.push([key, M.v]);
        if (!R || R.v !== M.v) patch[doc][key] = { v: M.v, t: Math.max(M.t, R?.t || 0) };
        meta.t[key] = Math.max(M.t, R?.t || 0);
      }
    }

    applyLocal(changes);
    meta.uid = uid;
    saveMeta(meta);

    if (Object.keys(patch.settings).length || Object.keys(patch.progress).length) {
      const { error } = await supabase.rpc('sync_push', {
        p_settings: patch.settings,
        p_progress: patch.progress,
      });
      if (error) throw error;
    }
  }

  async function syncNow() {
    if (stopped) return;
    clearTimeout(debounceTimer); debounceTimer = null;
    clearTimeout(maxWaitTimer); maxWaitTimer = null;
    if (running) { rerun = true; return running; }
    if (typeof navigator !== 'undefined' && navigator.onLine === false) {
      report('offline');
      return undefined;
    }
    report('syncing');
    running = (async () => {
      try {
        do {
          rerun = false;
          await syncOnce();
        } while (rerun && !stopped);
        lastSyncedAt = Date.now();
        report('synced');
      } catch (err) {
        console.error('Cloud sync failed:', err?.message || err);
        report('error', err?.message || 'Sync failed');
      } finally {
        running = null;
      }
    })();
    return running;
  }

  // Local change → push soon (debounced, but never later than PUSH_MAX_WAIT_MS).
  onLocalChange = () => {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(syncNow, PUSH_DEBOUNCE_MS);
    if (!maxWaitTimer) maxWaitTimer = setTimeout(syncNow, PUSH_MAX_WAIT_MS);
  };

  const onVisibility = () => {
    if (document.visibilityState === 'hidden') {
      if (debounceTimer || maxWaitTimer) syncNow(); // flush before the tab sleeps
    } else if (Date.now() - lastSyncedAt > REFRESH_MIN_GAP_MS) {
      syncNow(); // pick up changes made on other devices
    }
  };
  const onOnline = () => syncNow();
  document.addEventListener('visibilitychange', onVisibility);
  window.addEventListener('online', onOnline);

  syncNow();

  return {
    syncNow,
    stop() {
      stopped = true;
      tracking = false;
      onLocalChange = null;
      clearTimeout(debounceTimer);
      clearTimeout(maxWaitTimer);
      document.removeEventListener('visibilitychange', onVisibility);
      window.removeEventListener('online', onOnline);
    },
  };
}
