import { derived, writable } from 'svelte/store';

interface AuthState {
  accessToken: string;
  apiUrl: string;
}

export const authState = writable<AuthState>({
  accessToken: undefined,
  apiUrl: undefined,
});

export function loggedIn(accessToken: string) {
  authState.update((state) => {
    return {
      ...state,
      accessToken,
    };
  });
}

export function configurationLoaded(apiUrl: string) {
  authState.update((state) => {
    return {
      ...state,
      apiUrl,
    };
  });
}

export const userSession = derived(authState, (state) => state);

export const isConfigLoaded = derived(authState, (state) => {
  return state.apiUrl !== undefined;
});
