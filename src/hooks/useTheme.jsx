import React, { createContext, useContext, useState, useEffect } from 'react';
import { THEMES } from '../data/themes';

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const [currentTheme, setCurrentTheme] = useState(() => {
    return localStorage.getItem('bioTheme') || 'midnight';
  });

  const applyTheme = (themeKey) => {
    const theme = THEMES[themeKey];
    if (!theme) return;

    const root = document.documentElement;
    
    // --- FIX IS HERE ---
    // Was: `root.style.setProperty('--color-${key}', value);`
    // Now: Removing 'color-' so it matches Tailwind's 'var(--page)'
    Object.entries(theme.colors).forEach(([key, value]) => {
      root.style.setProperty(`--${key}`, value);
    });

    localStorage.setItem('bioTheme', themeKey);
    setCurrentTheme(themeKey);
  };

  useEffect(() => {
    applyTheme(currentTheme);
  }, []);

  return (
    <ThemeContext.Provider value={{ currentTheme, applyTheme, themes: THEMES }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);