import type { Writable } from 'svelte/store';
import { authState } from './auth/auth.state';

function init(key: string, state: Writable<any>) {
  const existing = localStorage.getItem(key);
  if (existing) {
    state.set(JSON.parse(existing));
  }

  state.subscribe((state) => {
    localStorage.setItem(key, JSON.stringify(state));
  });
}

export function startPersistance() {
  init('AuthState', authState);
}
