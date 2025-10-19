import React from 'react';
import { useTheme } from '../context/ThemeContext';
import { FaSun, FaMoon } from 'react-icons/fa';

const ThemeToggle = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className="p-2 rounded-full text-text-secondary hover:bg-surface focus:outline-none transition-colors"
      aria-label="Toggle theme"
    >
      {theme === 'light' ? (
        <FaMoon size="1.25rem" /> // Show moon icon in light mode
      ) : (
        <FaSun size="1.25rem" />  // Show sun icon in dark mode
      )}
    </button>
  );
};

export default ThemeToggle;