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
import App from './App';

import './styles/global.css';
import '@fontsource/noto-nastaliq-urdu';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <ThemeProvider>
        <QariProvider>
          <BookmarkProvider>
            <AudioProvider>
              <App />
            </AudioProvider>
          </BookmarkProvider>
        </QariProvider>
      </ThemeProvider>
    </BrowserRouter>
  </React.StrictMode>
);
