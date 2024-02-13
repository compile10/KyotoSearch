import React, { useState, useEffect } from 'react';

function ThemeSwitcher() {
  // State to track the current theme
  const [theme, setTheme] = useState(
    () => window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
  );

  // Effect to apply the theme attribute to the document element
  useEffect(() => {
    document.documentElement.setAttribute('data-bs-theme', theme);
  }, [theme]);

  // Effect to update theme based on system preference change
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (e) => {
      setTheme(e.matches ? 'dark' : 'light');
    };

    handleChange(mediaQuery); // Initial check

    // Listen for changes in system preference
    mediaQuery.addListener(handleChange);

    // Clean up
    return () => {
      mediaQuery.removeListener(handleChange);
    };
  }, []);

  return null; // This component doesn't render anything visible
}

export default ThemeSwitcher;
