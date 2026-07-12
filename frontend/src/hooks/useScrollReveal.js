import { useEffect, useRef } from 'react';

/**
 * useScrollReveal
 * A lightweight hook to trigger animations when elements enter the viewport.
 * 
 * @param {Object} options - IntersectionObserver options (threshold, rootMargin)
 * @returns {React.RefObject} - Ref to attach to the target element
 */
export function useScrollReveal(options = {}) {
  const ref = useRef(null);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    // Check if user prefers reduced motion
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) {
      // If they prefer reduced motion, just make it visible immediately
      element.classList.add('reveal-visible');
      return;
    }

    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        // Add the visible class to trigger the CSS transition
        element.classList.add('reveal-visible');
        
        // Unobserve after revealing to prevent repeating animations on scroll up/down
        observer.unobserve(element);
      }
    }, {
      threshold: options.threshold || 0.1,
      rootMargin: options.rootMargin || '0px 0px -50px 0px', // Trigger slightly before it hits the very bottom
      ...options
    });

    observer.observe(element);

    return () => {
      if (element) observer.unobserve(element);
    };
  }, [options.threshold, options.rootMargin]);

  return ref;
}
