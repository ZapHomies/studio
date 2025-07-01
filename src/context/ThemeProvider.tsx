'use client';

import React, { createContext, useContext, useEffect, useState, ReactNode, useCallback } from 'react';
import { themes, type Theme } from '@/lib/themes';

interface ThemeProviderState {
  theme: Theme;
  setTheme: (name: string) => void;
}

const initialState: ThemeProviderState = {
  theme: themes[0],
  setTheme: () => {},
};

const ThemeProviderContext = createContext<ThemeProviderState>(initialState);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, _setTheme] = useState<Theme>(initialState.theme);

  useEffect(() => {
    const storedThemeName = localStorage.getItem('muslim-mission-theme');
    const storedTheme = themes.find((t) => t.name === storedThemeName) || themes[0];
    if (storedTheme) {
        setTheme(storedTheme.name);
    }
  }, []);

  const applyTheme = useCallback((themeToApply: Theme) => {
    const root = document.documentElement;
    root.style.cssText = ''; // Clear previous styles
    Object.entries(themeToApply.colors).forEach(([key, value]) => {
      root.style.setProperty(key, value);
    });
  }, []);
  
  const setTheme = (name: string) => {
    const newTheme = themes.find((t) => t.name === name);
    if (newTheme) {
      _setTheme(newTheme);
      localStorage.setItem('muslim-mission-theme', name);
      applyTheme(newTheme);
    }
  };

  return (
    <ThemeProviderContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeProviderContext.Provider>
  );
}

export const useTheme = () => {
  const context = useContext(ThemeProviderContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
