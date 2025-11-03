import { writable } from 'svelte/store';

export type ThemeMode = 'white' | 'g100';

// Load theme from localStorage or default to light
const storedTheme = (typeof window !== 'undefined' 
  ? localStorage.getItem('theme') 
  : null) as ThemeMode | null;

export const themeStore = writable<ThemeMode>(storedTheme || 'white');

// Subscribe to changes and persist to localStorage
themeStore.subscribe((value) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('theme', value);
    document.documentElement.setAttribute('data-theme', value);
  }
});

export function toggleTheme() {
  themeStore.update(current => current === 'white' ? 'g100' : 'white');
}
