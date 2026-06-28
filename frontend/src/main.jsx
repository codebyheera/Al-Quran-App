/**
 * main.jsx — React app entry point
 * Wraps the app with ThemeProvider, BookmarkProvider, QariProvider, and AudioProvider
 */

import { StrictMode } from 'react';
import { createRoot, hydrateRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';

import { ThemeProvider }   from './context/ThemeContext';
import { BookmarkProvider } from './context/BookmarkContext';
import { AudioProvider }    from './context/AudioContext';
import { QariProvider }     from './context/QariContext';
import { HelmetProvider }   from 'react-helmet-async';
import App from './App';

import './styles/global.css';
// NOTE: @fontsource/noto-nastaliq-urdu removed — already loaded via Google Fonts CDN in index.html
// Bundling it added 159+ kB to the JS bundle unnecessarily

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch((err) => {
      console.warn('SW registration failed:', err);
    });
  });
}

const rootElement = document.getElementById('root');
const app = (
  <StrictMode>
    <BrowserRouter>
      <HelmetProvider>
        <ThemeProvider>
          <QariProvider>
            <BookmarkProvider>
              <AudioProvider>
                <App />
              </AudioProvider>
            </BookmarkProvider>
          </QariProvider>
        </ThemeProvider>
      </HelmetProvider>
    </BrowserRouter>
  </StrictMode>
);

if (rootElement.hasChildNodes()) {
  hydrateRoot(rootElement, app);
} else {
  createRoot(rootElement).render(app);
}
