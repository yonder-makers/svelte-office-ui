import { writable } from 'svelte/store';

type Theme = 'white' | 'g10' | 'g90' | 'g100';

// Get the initial theme from localStorage or default to 'white'
const getInitialTheme = (): Theme => {
  if (typeof window !== 'undefined') {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme && ['white', 'g10', 'g90', 'g100'].includes(savedTheme)) {
      return savedTheme as Theme;
    }
  }
  return 'white';
};

// Create the theme store
export const themeStore = writable<Theme>(getInitialTheme());

// Subscribe to theme changes and persist to localStorage
if (typeof window !== 'undefined') {
  themeStore.subscribe((value) => {
    localStorage.setItem('theme', value);
  });
}

// Toggle between light and dark themes
export function toggleTheme() {
  themeStore.update((current) => {
    return current === 'white' ? 'g100' : 'white';
  });
}

// Set a specific theme
export function setTheme(theme: Theme) {
  themeStore.set(theme);
}
