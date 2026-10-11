/**
 * context/ThemeContext.jsx — Dark/Light mode toggle
 * Persists choice in localStorage, applies [data-theme] attribute to <html>
 */

import { createContext, useContext, useEffect, useState } from 'react';

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

export function ThemeProvider({ children }) {
  // Read saved theme from localStorage (default: dark)
  const [theme, setTheme] = useState(() => localStorage.getItem('quran-theme') || 'emerald');

  // Apply theme class to <html> whenever it changes
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('quran-theme', theme);
    // Remember the last dark-family theme so the header's light/dark toggle
    // can return to it instead of always falling back to the default.
    if (theme !== 'light') localStorage.setItem('quran-last-dark-theme', theme);
  }, [theme]);

  const changeTheme = (newTheme) => setTheme(newTheme);

  // Quick light/dark switch for the header — every theme except 'light' counts as dark.
  const isLight = theme === 'light';
  const toggleLightDark = () => {
    setTheme(isLight ? (localStorage.getItem('quran-last-dark-theme') || 'emerald') : 'light');
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
