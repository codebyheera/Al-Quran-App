/**
 * lib/popupQueue.js — Shows the site's popups one at a time, never on arrival.
 *
 * Nothing appears during the visitor's first FIRST_DELAY_MS on the site. After
 * that, the highest-priority popup that wants to show gets a turn; once it is
 * closed the next one waits GAP_MS. Timing is kept in sessionStorage so page
 * navigations and reloads don't restart the clock.
 */

import { useEffect, useState } from 'react';

const FIRST_DELAY_MS = 3 * 60 * 1000;
const GAP_MS = 3 * 60 * 1000;
const TICK_MS = 5000;
const NEXT_AT_KEY = 'popupQueueNextAt';

// Lower number = asked first.
export const POPUP_PRIORITY = {
  language: 1,
  notifications: 2,
  durood: 3,
  support: 4,
};

const waiting = new Map(); // id -> setter
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

function tryShowNext() {
  if (activeId || waiting.size === 0) return;
  if (Date.now() < readNextAt()) return;
  // Only offer a turn while the visitor is actually looking at the page.
  if (typeof document !== 'undefined' && document.visibilityState === 'hidden') return;

  const [id] = [...waiting.keys()].sort((a, b) => (POPUP_PRIORITY[a] ?? 99) - (POPUP_PRIORITY[b] ?? 99));
  activeId = id;
  waiting.get(id)(true);
}

function ensureTimer() {
  if (timer || typeof window === 'undefined') return;
  readNextAt(); // starts the clock on first load
  timer = setInterval(tryShowNext, TICK_MS);
}

function release(id) {
  if (activeId !== id) return;
  activeId = null;
  writeNextAt(Date.now() + GAP_MS);
}

/**
 * usePopupTurn(id, wanted) → [visible, done]
 * `wanted`: whether this popup still has a reason to show.
 * Call `done()` when the visitor closes or acts on it.
 */
export function usePopupTurn(id, wanted) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!wanted) return;
    waiting.set(id, setVisible);
    ensureTimer();
    tryShowNext();
    return () => {
      waiting.delete(id);
      // Unmounted (or no longer wanted) while showing — free the slot.
      if (activeId === id) release(id);
    };
  }, [id, wanted]);

  function done() {
    setVisible(false);
    waiting.delete(id);
    release(id);
  }

  return [visible && wanted, done];
}
