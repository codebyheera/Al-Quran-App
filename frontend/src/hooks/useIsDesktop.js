/**
 * hooks/useIsDesktop.js — Is the viewport wider than the mobile breakpoint?
 *
 * 768px is the same breakpoint the rest of the app treats as "mobile"
 * (see AudioContext's isMinimized default and the Navbar CSS).
 *
 * Always starts as `false` so the server-rendered markup and the first
 * client render match during hydration — the real value lands on the first
 * effect, which is exactly the behaviour desktop-only UI wants anyway
 * (nothing flashes on mobile).
 */

import { useEffect, useState } from 'react';

const DESKTOP_QUERY = '(min-width: 769px)';

export default function useIsDesktop() {
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    if (typeof window.matchMedia !== 'function') return;

    const mq = window.matchMedia(DESKTOP_QUERY);
    const update = () => setIsDesktop(mq.matches);
    update();

    // addListener is the Safari < 14 fallback for addEventListener
    if (mq.addEventListener) {
      mq.addEventListener('change', update);
      return () => mq.removeEventListener('change', update);
    }
    mq.addListener(update);
    return () => mq.removeListener(update);
  }, []);

  return isDesktop;
}
