/**
 * lib/streakUtils.js — Daily Quran Reading Streak logic
 *
 * Everything here is localStorage-only: no backend, no login. This module
 * is the single source of truth for reading/writing `quranStreakData` — UI
 * components should never touch localStorage directly, they should call
 * getStreakData()/setDailyGoal()/recordReadingSeconds() so the date and
 * streak invariants below always hold.
 */

const STORAGE_KEY = 'quranStreakData';

// ── Local date helpers ───────────────────────────────────────────────────
// We deliberately avoid `Date#toISOString()` for "today" because it uses
// UTC and would flip to the next day several hours early/late depending on
// the visitor's timezone. Everything here uses the browser's local time.

function todayLocalDateStr(d = new Date()) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

/** Whole days between two "YYYY-MM-DD" local date strings (b - a). */
function daysBetween(aStr, bStr) {
  const [ay, am, ad] = aStr.split('-').map(Number);
  const [by, bm, bd] = bStr.split('-').map(Number);
  const a = new Date(ay, am - 1, ad);
  const b = new Date(by, bm - 1, bd);
  return Math.round((b - a) / 86_400_000);
}

/**
 * Adds `offsetDays` (can be negative) to a "YYYY-MM-DD" local date string.
 * Lets the Date constructor normalize month/year rollovers instead of doing
 * millisecond arithmetic (which is DST-fragile) — used to compute the
 * *actual* calendar yesterday relative to now, not just "whatever was
 * stored", since a visitor may skip several days without opening the app.
 */
function addDays(dateStr, offsetDays) {
  const [y, m, d] = dateStr.split('-').map(Number);
  return todayLocalDateStr(new Date(y, m - 1, d + offsetDays));
}

// ── Storage helpers ──────────────────────────────────────────────────────

function defaultData() {
  return {
    dailyGoalMinutes: null, // no goal chosen yet → UI shows the setup card
    todayDate: todayLocalDateStr(),
    todaySecondsRead: 0,
    currentStreak: 0,
    longestStreak: 0,
    lastCompletedDate: null,
  };
}

function isValidShape(data) {
  return (
    data && typeof data === 'object' &&
    typeof data.todayDate === 'string' &&
    typeof data.todaySecondsRead === 'number' &&
    typeof data.currentStreak === 'number' &&
    typeof data.longestStreak === 'number'
  );
}

function readRaw() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return isValidShape(parsed) ? parsed : null; // corrupted → treated as missing
  } catch {
    return null;
  }
}

function writeRaw(data) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {
    // localStorage unavailable (private mode / quota) — fail silently,
    // the feature just won't persist for this session.
  }
}

/**
 * Reads streak data, repairing anything missing/corrupted and rolling over
 * to a new day if `todayDate` is stale. Call this (not localStorage
 * directly) from anywhere the streak needs to be read — it's what
 * guarantees "on every page load, check if a new day has started".
 */
export function getStreakData() {
  let data = readRaw();
  if (!data) {
    data = defaultData();
    writeRaw(data);
    return data;
  }

  const today = todayLocalDateStr();
  if (data.todayDate !== today) {
    // A new day has started since the last save. Goal completion for the
    // previous day was already recorded (if it happened) via
    // `lastCompletedDate` at the moment recordReadingSeconds() crossed the
    // threshold — so we only need to reset today's counter, and only zero
    // the streak if the ACTUAL calendar yesterday's goal was missed.
    //
    // Important: we compare against `yesterday` (today - 1), not against
    // the stale `data.todayDate` — a visitor may not have opened the app
    // for several days, in which case `data.todayDate` could be more than
    // one day stale, and comparing against it directly would wrongly keep
    // the streak alive across a multi-day gap.
    const yesterday = addDays(today, -1);
    const goalMetYesterday = data.lastCompletedDate === yesterday;
    if (!goalMetYesterday) {
      data.currentStreak = 0;
    }
    data.todayDate = today;
    data.todaySecondsRead = 0;
    writeRaw(data);
  }

  return data;
}

/** Sets/changes the daily goal (5, 10, or 15 minutes). */
export function setDailyGoal(minutes) {
  const data = getStreakData();
  data.dailyGoalMinutes = minutes;
  writeRaw(data);
  return data;
}

/**
 * Adds `seconds` of active reading time to today's total. If this push
 * crosses the daily goal for the first time today, updates the streak:
 *   - lastCompletedDate was yesterday → currentStreak += 1
 *   - lastCompletedDate was already today → no-op (guards against
 *     duplicate/rapid saves double-counting)
 *   - otherwise (gap of >1 day, or never completed) → currentStreak = 1
 * Also bumps longestStreak if needed.
 *
 * Calling getStreakData() first means a reading session that spans
 * midnight is handled correctly: the moment a post-midnight save fires,
 * the day rolls over (today's counter zeroes, streak resets if
 * yesterday's goal was missed) and the elapsed seconds are then credited
 * to the new day, not lost or misfiled into the old one.
 */
export function recordReadingSeconds(seconds) {
  if (!seconds || seconds <= 0) return getStreakData();

  const data = getStreakData();
  const goalSeconds = (data.dailyGoalMinutes || 0) * 60;
  const alreadyCompletedToday = data.lastCompletedDate === data.todayDate;

  data.todaySecondsRead += seconds;

  if (goalSeconds > 0 && !alreadyCompletedToday && data.todaySecondsRead >= goalSeconds) {
    const gap = data.lastCompletedDate ? daysBetween(data.lastCompletedDate, data.todayDate) : null;
    data.currentStreak = gap === 1 ? data.currentStreak + 1 : 1;
    data.lastCompletedDate = data.todayDate;
    if (data.currentStreak > data.longestStreak) {
      data.longestStreak = data.currentStreak;
    }
  }

  writeRaw(data);
  return data;
}
