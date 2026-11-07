/**
 * lib/scrollToVerse.js — Scroll a verse card into view, accurately.
 *
 * Off-screen verse cards use `content-visibility: auto` (global.css), so the
 * browser only estimates their height until they are shown. A long jump
 * (e.g. Al-Baqara verse 250) would then stop in the wrong place. So, just for
 * the jump, every verse is rendered at its real size; once the scroll ends the
 * optimisation comes back (the browser keeps the measured heights).
 */

const CLASS = 'verses-rendered';
let restoreTimer = null;

export function scrollToVerse(el, { behavior = 'smooth' } = {}) {
  if (!el) return;
  const root = document.documentElement;
  root.classList.add(CLASS);
  void el.getBoundingClientRect(); // lay out all verses at their real height first
  el.scrollIntoView({ behavior, block: 'start' });

  window.clearTimeout(restoreTimer);
  const restore = () => {
    window.clearTimeout(restoreTimer);
    window.removeEventListener('scrollend', restore);
    root.classList.remove(CLASS);
  };
  if ('onscrollend' in window) window.addEventListener('scrollend', restore, { once: true });
  // Fallback (and safety net if the page didn't need to scroll at all)
  restoreTimer = window.setTimeout(restore, 1500);
}
