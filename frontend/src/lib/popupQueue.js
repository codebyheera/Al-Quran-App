/**
 * lib/popupQueue.js — Shows the site's popups one at a time, never on arrival.
 *
 * Nothing appears during the visitor's first FIRST_DELAY_MS on the site. After
 * that, the highest-priority popup that wants to show gets a turn; once it is
 * closed the next one waits GAP_MS. Timing is kept in sessionStorage so page
 * navigations and reloads don't restart the clock.
 *
 * A popup may ask for an earlier first slot with { afterMs } (e.g. the daily
 * dua at 20s). That only applies while no popup has shown yet this session;
 * after that it waits the normal GAP_MS like everyone else.
 */

import { useEffect, useState } from 'react';

const FIRST_DELAY_MS = 3 * 60 * 1000;
const GAP_MS = 3 * 60 * 1000;
const TICK_MS = 2000;
const NEXT_AT_KEY = 'popupQueueNextAt';
const START_KEY = 'popupQueueStart';     // session start (ms)
const SHOWN_KEY = 'popupQueueAnyShown';  // '1' once any popup has shown this session

// Lower number = asked first.
export const POPUP_PRIORITY = {
  language: 1,
  notifications: 2,
  durood: 3,
  support: 4,
  dua: 5,
};

const waiting = new Map(); // id -> { setVisible, afterMs }
let activeId = null;
let timer = null;

function readNextAt() {
  try {
    const saved = Number(sessionStorage.getItem(NEXT_AT_KEY));
    if (saved) return saved;
    const first = Date.now() + FIRST_DELAY_MS;
    sessionStorage.setItem(NEXT_AT_KEY, String(first));
    return first;
  } catch {
    return Date.now() + FIRST_DELAY_MS;
  }
}

function writeNextAt(value) {
  try { sessionStorage.setItem(NEXT_AT_KEY, String(value)); } catch {}
}

function ssGet(key) { try { return sessionStorage.getItem(key); } catch { return null; } }
function ssSet(key, v) { try { sessionStorage.setItem(key, v); } catch {} }

function sessionStart() {
  const saved = Number(ssGet(START_KEY));
  if (saved) return saved;
  const now = Date.now();
  ssSet(START_KEY, String(now));
  return now;
}

function isReady({ afterMs }, now) {
  if (now >= readNextAt()) return true;
  // Early slot: only before anything else has shown this session
  return afterMs != null && ssGet(SHOWN_KEY) !== '1' && now >= sessionStart() + afterMs;
}

function tryShowNext() {
  if (activeId || waiting.size === 0) return;
  // Only offer a turn while the visitor is actually looking at the page.
  if (typeof document !== 'undefined' && document.visibilityState === 'hidden') return;

  const now = Date.now();
  const [id] = [...waiting.keys()]
    .filter((key) => isReady(waiting.get(key), now))
    .sort((a, b) => (POPUP_PRIORITY[a] ?? 99) - (POPUP_PRIORITY[b] ?? 99));
  if (!id) return;
  activeId = id;
  ssSet(SHOWN_KEY, '1');
  waiting.get(id).setVisible(true);
}

function ensureTimer() {
  if (timer || typeof window === 'undefined') return;
  sessionStart(); // starts the clock on first load
  readNextAt();
  timer = setInterval(tryShowNext, TICK_MS);
}

function release(id) {
  if (activeId !== id) return;
  activeId = null;
  writeNextAt(Date.now() + GAP_MS);
}

/**
 * usePopupTurn(id, wanted, { afterMs }) → [visible, done]
 * `wanted`: whether this popup still has a reason to show.
 * `afterMs` (optional): earliest time after session start to show, instead
 * of the default FIRST_DELAY_MS.
 * Call `done()` when the visitor closes or acts on it.
 */
export function usePopupTurn(id, wanted, { afterMs } = {}) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!wanted) return;
    waiting.set(id, { setVisible, afterMs });
    ensureTimer();
    tryShowNext();
    return () => {
      waiting.delete(id);
      // Unmounted (or no longer wanted) while showing — free the slot.
      if (activeId === id) release(id);
    };
  }, [id, wanted, afterMs]);

  function done() {
    setVisible(false);
    waiting.delete(id);
    release(id);
  }

  return [visible && wanted, done];
}
