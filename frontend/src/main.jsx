/**
 * main.jsx — React app entry point
 * Wraps the app with ThemeProvider and BookmarkProvider
 */

import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';

import { ThemeProvider }   from './context/ThemeContext';
import { BookmarkProvider } from './context/BookmarkContext';
import { AudioProvider }    from './context/AudioContext';
import App from './App';

import './styles/global.css';
import '@fontsource/noto-nastaliq-urdu';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <ThemeProvider>
        <BookmarkProvider>
          <AudioProvider>
            <App />
          </AudioProvider>
        </BookmarkProvider>
      </ThemeProvider>
    </BrowserRouter>
  </React.StrictMode>
);
