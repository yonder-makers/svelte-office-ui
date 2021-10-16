import { derived, writable } from 'svelte/store';

interface AuthState {
  accessToken: string;
}

export const authState = writable<AuthState>({ accessToken: undefined });

export function loggedIn(accessToken: string) {
  authState.update((state) => {
    return {
      ...state,
      accessToken,
    };
  });
}

export const userSession = derived(authState, (state) => state);
