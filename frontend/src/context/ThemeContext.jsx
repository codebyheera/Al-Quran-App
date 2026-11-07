/**
 * context/ThemeContext.jsx — Dark/Light mode toggle
 * Persists choice in localStorage, applies [data-theme] attribute to <html>
 */

import { createContext, useContext, useEffect, useState } from 'react';
import { flushSync } from 'react-dom';

const ThemeContext = createContext();

export const THEMES = [
  { id: 'dark', name: 'Dark', icon: '🌙' },
  { id: 'light', name: 'Light', icon: '☀️' },
  { id: 'emerald', name: 'Emerald', icon: '🌿' },
  { id: 'sapphire', name: 'Sapphire', icon: '🌊' },
  { id: 'obsidian', name: 'Obsidian', icon: '🌑' },
  { id: 'sunset', name: 'Sunset', icon: '🌅' },
  { id: 'amethyst', name: 'Amethyst', icon: '🔮' }
];

export const DEFAULT_THEME = 'light';
// Where the header's light/dark toggle goes when no dark theme was picked before.
const DEFAULT_DARK_THEME = 'emerald';
const THEME_KEY = 'quran-theme-choice';

function readStorage(key) {
  try { return localStorage.getItem(key); } catch { return null; }
}

function writeStorage(key, value) {
  try { localStorage.setItem(key, value); } catch {}
}

export function ThemeProvider({ children }) {
  // Light unless the visitor has picked a theme themselves. Only explicit
  // choices are stored (THEME_KEY); the old 'quran-theme' key was written
  // automatically for everyone, so it's ignored.
  const [theme, setTheme] = useState(() => {
    const saved = readStorage(THEME_KEY);
    return THEMES.some((t) => t.id === saved) ? saved : DEFAULT_THEME;
  });

  // Apply theme class to <html> whenever it changes
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    // Remember the last dark-family theme so the header's light/dark toggle
    // can return to it instead of always falling back to the default.
    if (theme !== 'light') writeStorage('quran-last-dark-theme', theme);
  }, [theme]);

  // Switching themes used to animate the colors of every element on the page
  // at once (their `transition`s), which took seconds on long Surahs. Now all
  // transitions are paused for the switch, so it costs a single repaint, and
  // where supported the old and new screens simply cross-fade (one cheap
  // GPU snapshot fade instead of thousands of animated elements).
  const changeTheme = (newTheme) => {
    writeStorage(THEME_KEY, newTheme);
    const root = document.documentElement;
    const apply = () => {
      root.setAttribute('data-theme', newTheme); // paint the new colors right away
      flushSync(() => setTheme(newTheme));
    };
    const done = () => requestAnimationFrame(() => root.classList.remove('theme-switching'));

    root.classList.add('theme-switching');
    const reduceMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    if (document.startViewTransition && !reduceMotion) {
      document.startViewTransition(apply).finished.finally(done);
    } else {
      apply();
      requestAnimationFrame(done);
    }
  };

  // Quick light/dark switch for the header — every theme except 'light' counts as dark.
  const isLight = theme === 'light';
  const toggleLightDark = () => {
    changeTheme(isLight ? (readStorage('quran-last-dark-theme') || DEFAULT_DARK_THEME) : 'light');
  };

  return (
    <ThemeContext.Provider value={{ theme, changeTheme, themes: THEMES, isLight, toggleLightDark }}>
      {children}
    </ThemeContext.Provider>
  );
}

// Custom hook for consuming theme context
export function useTheme() {
  return useContext(ThemeContext);
}
