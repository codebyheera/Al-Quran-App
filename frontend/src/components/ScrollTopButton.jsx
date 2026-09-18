/**
 * components/ScrollTopButton.jsx — Floating "back to top" arrow
 *
 * Mounted once in App.jsx, so every route gets it for free. Appears after
 * 300px of scroll and sits directly above the ChatWidget launcher in the
 * bottom-right stack — see ScrollTopButton.css for the full offset map.
 *
 * Not to be confused with ScrollToTop.jsx, which is the route-change scroll
 * reset helper and renders nothing.
 */

import { useEffect, useState } from 'react';
import { IconArrowUp } from '@tabler/icons-react';
import './ScrollTopButton.css';

const SHOW_AFTER_PX = 300;

export default function ScrollTopButton() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    let frame = null;

    // rAF-throttled: scroll events fire far faster than paint, so we coalesce
    // them into at most one layout read per frame (same pattern as Navbar's
    // hide-on-scroll handler).
    const handleScroll = () => {
      if (frame !== null) return;
      frame = requestAnimationFrame(() => {
        frame = null;
        setVisible(window.scrollY > SHOW_AFTER_PX);
      });
    };

    handleScroll(); // catch a restored scroll position on mount
    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      if (frame !== null) cancelAnimationFrame(frame);
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  function scrollToTop() {
    const prefersReducedMotion = window.matchMedia?.(
      '(prefers-reduced-motion: reduce)'
    ).matches;

    window.scrollTo({ top: 0, behavior: prefersReducedMotion ? 'auto' : 'smooth' });
  }

  return (
    <button
      type="button"
      className={`scroll-top-btn ${visible ? 'is-visible' : ''}`}
      onClick={scrollToTop}
      aria-label="Scroll to top"
      title="Scroll to top"
      // Kept out of the tab order while hidden — nothing should be focusable
      // that the visitor can't see.
      tabIndex={visible ? 0 : -1}
      aria-hidden={!visible}
    >
      <IconArrowUp size={22} stroke={2.2} />
    </button>
  );
}
