import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './SupportPopup.css';

export default function SupportPopup() {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    // Check if the popup has already been shown in this session
    const hasShown = sessionStorage.getItem('supportPopupShown');
    
    if (!hasShown) {
      // Show popup after 5 seconds
      const timer = setTimeout(() => {
        setIsOpen(true);
      }, 5000);
      
      return () => clearTimeout(timer);
    }
  }, []);

  const handleClose = () => {
    setIsOpen(false);
    sessionStorage.setItem('supportPopupShown', 'true');
  };

  if (!isOpen) return null;

  return (
    <div className="support-popup-overlay" onClick={handleClose}>
      <div 
        className="support-popup-content" 
        onClick={(e) => e.stopPropagation()} // Prevent clicks inside from closing
      >
        <div className="support-popup-header">
          <h3 className="support-popup-title">SUPPORT THE PROJECT</h3>
          <button className="support-popup-close" onClick={handleClose} aria-label="Close popup">
            ✕
          </button>
        </div>
        
        <div className="support-popup-body">
          {/* Left Panel */}
          <div className="sp-left-panel">
            <h2>Keep the Quran<br/>Free & Accessible</h2>
            <p>
              No ads, no paywalls — just the Holy Quran, free forever. Your sadaqah keeps this alive.
            </p>
            
            <div className="sp-quote-box">
              <p className="sp-quote-text">
                "Who will lend Allah a goodly loan so He may multiply it many times over?"
              </p>
              <p className="sp-quote-author">— Al-Baqarah 2:245</p>
            </div>
          </div>

          {/* Right Panel */}
          <div className="sp-right-panel">
            <div className="sp-stats-grid">
              {/* Surahs */}
              <div className="sp-stat-card green">
                <div className="sp-stat-icon green">
                  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" width="24" height="24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>
                </div>
                <div className="sp-stat-info">
                  <span className="sp-stat-num">114</span>
                  <span className="sp-stat-label green">Surahs</span>
                </div>
              </div>

              {/* Juz */}
              <div className="sp-stat-card gold">
                <div className="sp-stat-icon gold">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg>
                </div>
                <div className="sp-stat-info">
                  <span className="sp-stat-num">30</span>
                  <span className="sp-stat-label gold">Juz covered</span>
                </div>
              </div>

              {/* Reciters */}
              <div className="sp-stat-card purple">
                <div className="sp-stat-icon purple">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"></path><path d="M19 10v2a7 7 0 0 1-14 0v-2"></path><line x1="12" y1="19" x2="12" y2="23"></line><line x1="8" y1="23" x2="16" y2="23"></line></svg>
                </div>
                <div className="sp-stat-info">
                  <span className="sp-stat-num">5</span>
                  <span className="sp-stat-label purple">Reciters</span>
                </div>
              </div>

              {/* Ads */}
              <div className="sp-stat-card blue">
                <div className="sp-stat-icon blue">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="4.93" y1="4.93" x2="19.07" y2="19.07"></line></svg>
                </div>
                <div className="sp-stat-info">
                  <span className="sp-stat-num">0</span>
                  <span className="sp-stat-label blue">Ads, ever</span>
                </div>
              </div>

              {/* Themes */}
              <div className="sp-stat-card pink">
                <div className="sp-stat-icon pink">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="13.5" cy="6.5" r=".5" fill="currentColor"></circle><circle cx="17.5" cy="10.5" r=".5" fill="currentColor"></circle><circle cx="8.5" cy="7.5" r=".5" fill="currentColor"></circle><circle cx="6.5" cy="12.5" r=".5" fill="currentColor"></circle><path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 0 1 1.668-1.668h1.996c3.051 0 5.555-2.503 5.555-5.554C21.965 6.012 17.461 2 12 2z"></path></svg>
                </div>
                <div className="sp-stat-info">
                  <span className="sp-stat-num">7</span>
                  <span className="sp-stat-label pink">Themes</span>
                </div>
              </div>

              {/* Translation */}
              <div className="sp-stat-card green">
                <div className="sp-stat-icon green">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 5h7M9 3v2c0 4.418-2.239 8-5 8"></path><path d="M5 9c2.106 0 4.5 1.79 4.5 4"></path><path d="M12 21l3-9 3 9"></path><path d="M13.5 16.5h3"></path></svg>
                </div>
                <div className="sp-stat-info">
                  <span className="sp-stat-num">EN</span>
                  <span className="sp-stat-label green">Translation</span>
                </div>
              </div>
            </div>

            <Link to="/support" className="sp-support-btn" onClick={handleClose}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>
              Support Al-Quran Hub
            </Link>

            <p className="sp-footer-text">
              Every rupee is Sadaqah Jariyah. May Allah accept it. 🤲
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
