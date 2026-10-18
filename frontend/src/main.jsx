/**
 * main.jsx — React app entry point
 * Wraps the app with ThemeProvider, BookmarkProvider, QariProvider, and AudioProvider
 */

import './lib/sentry'; // first, so errors during startup are caught too

import { StrictMode } from 'react';
import { createRoot, hydrateRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';

import { ThemeProvider }   from './context/ThemeContext';
import { BookmarkProvider } from './context/BookmarkContext';
import { AudioProvider }    from './context/AudioContext';
import { QariProvider }     from './context/QariContext';
import { HelmetProvider }   from 'react-helmet-async';
import App, { getRoutePreload } from './App';

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

// The landing page's lazy chunk is loaded before the first render (prerender.js
// <link>s it in the HTML, so it downloads alongside the main bundle). Otherwise
// that render would suspend and show <PageLoader /> before the page itself.
//
// Homepage, /surah and /surah/:id: the static HTML is a build-time snapshot (see
// scripts/prerender.js) shown so the page paints before the JS runs. It is not
// hydrated — client-only state (streak, bookmarks, theme) differs from the
// snapshot — so React renders fresh and replaces it in a single commit; the
// snapshot stays on screen in the meantime.
const start = () => {
  if (rootElement.dataset.prerender === 'snapshot' || !rootElement.hasChildNodes()) {
    createRoot(rootElement).render(app);
  } else {
    hydrateRoot(rootElement, app);
  }
};
const preload = getRoutePreload(window.location.pathname);
if (preload) preload().then(start, start);
else start();
