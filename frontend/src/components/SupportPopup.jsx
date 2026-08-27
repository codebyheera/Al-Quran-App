import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import './SupportPopup.css';

export default function SupportPopup() {
  const [isOpen, setIsOpen] = useState(false);
  const contentRef = useRef(null);
  const closeBtnRef = useRef(null);
  const previouslyFocusedRef = useRef(null);

  useEffect(() => {
    // Check if the popup has already been shown in this session
    const hasShown = sessionStorage.getItem('supportPopupShown');

    if (!hasShown) {
      // Show popup after 8 minutes
      const timer = setTimeout(() => {
        setIsOpen(true);
      }, 8 * 60 * 1000);

      return () => clearTimeout(timer);
    }
  }, []);

  const handleClose = () => {
    setIsOpen(false);
    sessionStorage.setItem('supportPopupShown', 'true');
  };

  // Focus trap + Escape-to-close + restore focus on close
  useEffect(() => {
    if (!isOpen) return;

    previouslyFocusedRef.current = document.activeElement;
    closeBtnRef.current?.focus();

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        handleClose();
        return;
      }

      if (e.key === 'Tab' && contentRef.current) {
        const focusable = contentRef.current.querySelectorAll(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        if (focusable.length === 0) return;

        const first = focusable[0];
        const last = focusable[focusable.length - 1];

        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
      previouslyFocusedRef.current?.focus?.();
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="support-popup-overlay" onClick={handleClose}>
      <div
        className="support-popup-content"
        role="dialog"
        aria-modal="true"
        aria-labelledby="support-popup-heading"
        ref={contentRef}
        onClick={(e) => e.stopPropagation()} // Prevent clicks inside from closing
      >
        <button
          ref={closeBtnRef}
          className="support-popup-close"
          onClick={handleClose}
          aria-label="Close popup"
        >
          ✕
        </button>

        <div className="support-popup-badge">
          <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor">
            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
          </svg>
          Support the project
        </div>

        <h2 id="support-popup-heading" className="support-popup-heading">
          Keep the Quran <span className="text-gold">free &amp; accessible</span>
        </h2>

        <p className="support-popup-sub">
          No ads, no paywalls — just the Holy Quran, free forever for everyone.
        </p>

        <div className="support-popup-quote">
          <p className="support-popup-quote-text">
            "Who will lend Allah a goodly loan so He may multiply it for him many times over?"
          </p>
          <p className="support-popup-quote-ref">— Al-Baqarah 2:245</p>
        </div>

        <Link to="/support" className="btn btn-primary support-popup-cta" onClick={handleClose}>
          <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
          </svg>
          View donation details
        </Link>

        <p className="support-popup-note">Direct bank transfer · SadaPay · No fees to us</p>

        <div className="support-popup-footnote">
          <p>
            <strong>In Pakistan:</strong> SadaPay or direct bank transfer, instant.
          </p>
          <p>
            <strong>Outside Pakistan:</strong> send to our IBAN via your Wise account for the
            lowest fees, or a standard SWIFT bank wire.
          </p>
        </div>
      </div>
    </div>
  );
}
