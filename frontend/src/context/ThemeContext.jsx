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
  const [theme, setTheme] = useState(() => localStorage.getItem('quran-theme') || 'dark');

  // Apply theme class to <html> whenever it changes
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('quran-theme', theme);
  }, [theme]);

  const changeTheme = (newTheme) => setTheme(newTheme);

  return (
    <ThemeContext.Provider value={{ theme, changeTheme, themes: THEMES }}>
      {children}
    </ThemeContext.Provider>
  );
}

// Custom hook for consuming theme context
export function useTheme() {
  return useContext(ThemeContext);
}
