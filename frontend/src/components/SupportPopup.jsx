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

        {/* Social Section */}
        <div className="sp-social-section">
          <div className="sp-divider">
            <span className="sp-divider-line"></span>
            <span className="sp-divider-text">Stay connected with us</span>
            <span className="sp-divider-line"></span>
          </div>
          <div className="sp-social-buttons">
            <a href="https://www.linkedin.com/company/alquranhub/" target="_blank" rel="noopener noreferrer" className="sp-social-icon-link" aria-label="LinkedIn">
              <svg viewBox="0 0 448 512" xmlns="http://www.w3.org/2000/svg">
                <path d="M100.28 448H7.4V148.9h92.88zM53.79 108.1C24.09 108.1 0 83.5 0 53.8a53.79 53.79 0 0 1 107.58 0c0 29.7-24.1 54.3-53.79 54.3zM447.9 448h-92.68V302.4c0-34.7-.7-79.2-48.29-79.2-48.29 0-55.69 37.7-55.69 76.7V448h-92.78V148.9h89.08v40.8h1.3c12.4-23.5 42.69-48.3 87.88-48.3 94 0 111.28 61.9 111.28 142.3V448z"/>
              </svg>
            </a>
            <a href="https://www.instagram.com/alquranhub.official/" target="_blank" rel="noopener noreferrer" className="sp-social-icon-link" aria-label="Instagram">
              <svg viewBox="0 0 448 512" xmlns="http://www.w3.org/2000/svg">
                <path d="M224.1 141c-63.6 0-114.9 51.3-114.9 114.9s51.3 114.9 114.9 114.9S339 319.5 339 255.9 287.7 141 224.1 141zm0 189.6c-41.1 0-74.7-33.5-74.7-74.7s33.5-74.7 74.7-74.7 74.7 33.5 74.7 74.7-33.6 74.7-74.7 74.7zm146.4-194.3c0 14.9-12 26.8-26.8 26.8-14.9 0-26.8-12-26.8-26.8s12-26.8 26.8-26.8 26.8 12 26.8 26.8zm76.1 27.2c-1.7-35.9-9.9-67.7-36.2-93.9-26.2-26.2-58-34.4-93.9-36.2-37-2.1-147.9-2.1-184.9 0-35.8 1.7-67.6 9.9-93.9 36.1s-34.4 58-36.2 93.9c-2.1 37-2.1 147.9 0 184.9 1.7 35.9 9.9 67.7 36.2 93.9s58 34.4 93.9 36.2c37 2.1 147.9 2.1 184.9 0 35.9-1.7 67.7-9.9 93.9-36.2 26.2-26.2 34.4-58 36.2-93.9 2.1-37 2.1-147.8 0-184.8zM398.8 388c-7.8 19.6-22.9 34.7-42.6 42.6-29.5 11.7-99.5 9-132.1 9s-102.7 2.6-132.1-9c-19.6-7.8-34.7-22.9-42.6-42.6-11.7-29.5-9-99.5-9-132.1s-2.6-102.7 9-132.1c7.8-19.6 22.9-34.7 42.6-42.6 29.5-11.7 99.5-9 132.1-9s102.7-2.6 132.1 9c19.6 7.8 34.7 22.9 42.6 42.6 11.7 29.5 9 99.5 9 132.1s2.7 102.7-9 132.1z"/>
              </svg>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
