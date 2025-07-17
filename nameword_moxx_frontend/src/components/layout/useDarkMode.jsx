import { useState, useEffect } from 'react';

export default function useDarkMode() {
  const [mode, setMode] = useState('light');

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
      setMode(savedTheme);
      applyTheme(savedTheme);
    } else {
      systemMode();
    }
  }, []);

  const applyTheme = (theme) => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  const darkMode = () => {
    applyTheme('dark');
    localStorage.setItem('theme', 'dark');
    setMode('dark');
  };

  const lightMode = () => {
    applyTheme('light');
    localStorage.setItem('theme', 'light');
    setMode('light');
  };

  const systemMode = () => {
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    if (prefersDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('theme', 'system');
    setMode('system');
  };

  return { mode, darkMode, lightMode, systemMode };
}
