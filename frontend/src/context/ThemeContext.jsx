/**
 * context/ThemeContext.jsx — Dark/Light mode toggle
 * Persists choice in localStorage, applies [data-theme] attribute to <html>
 */

import { createContext, useContext, useEffect, useState } from 'react';

const ThemeContext = createContext();

export function ThemeProvider({ children }) {
  // Read saved theme from localStorage (default: dark)
  const [theme, setTheme] = useState(() => localStorage.getItem('quran-theme') || 'dark');

  // Apply theme class to <html> whenever it changes
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('quran-theme', theme);
  }, [theme]);

  const toggleTheme = () => setTheme((t) => (t === 'dark' ? 'light' : 'dark'));

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

// Custom hook for consuming theme context
export function useTheme() {
  return useContext(ThemeContext);
}
