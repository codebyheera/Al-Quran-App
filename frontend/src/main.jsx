/**
 * main.jsx — React app entry point
 * Wraps the app with ThemeProvider, BookmarkProvider, QariProvider, and AudioProvider
 */

import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';

import { ThemeProvider }   from './context/ThemeContext';
import { BookmarkProvider } from './context/BookmarkContext';
import { AudioProvider }    from './context/AudioContext';
import { QariProvider }     from './context/QariContext';
import { HelmetProvider }   from 'react-helmet-async';
import App from './App';

import './styles/global.css';
import '@fontsource/noto-nastaliq-urdu';

import { createRoot, hydrateRoot } from 'react-dom/client';

const rootElement = document.getElementById('root');
const app = (
  <React.StrictMode>
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
  </React.StrictMode>
);

if (rootElement.hasChildNodes()) {
  hydrateRoot(rootElement, app);
} else {
  createRoot(rootElement).render(app);
}
