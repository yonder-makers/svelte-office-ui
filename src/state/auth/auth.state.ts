import { derived, writable } from 'svelte/store';

interface AuthState {
  accessToken: string | null;
  apiUrl: string;
  webOfficeUrl: string;
  isUserLoggedInToggl: boolean;
}

export const authState = writable<AuthState>({
  accessToken: null,
  apiUrl: '',
  webOfficeUrl: '',
  isUserLoggedInToggl: false,
});

export function loggedIn(accessToken: string) {
  authState.update((state) => {
    return {
      ...state,
      accessToken: accessToken,
      isUserLoggedInToggl: false,
    };
  });
}

export function loggedOut() {
  authState.update((state) => {
    return {
      ...state,
      accessToken: null,
      isUserLoggedInToggl: false,
    };
  });
}

export function loggedInToggl(accessToken: string) {
  authState.update((state) => {
    return {
      ...state,
      accessToken: accessToken,
      isUserLoggedInToggl: true,
    };
  });
}

export function configurationLoaded(apiUrl: string, webOfficeUrl: string) {
  authState.update((state) => {
    return {
      ...state,
      apiUrl,
      webOfficeUrl
    };
  });
}

export const userSession = derived(authState, (state) => state);
export const isUserAuthenticated = derived(
  userSession,
  (state) => state.accessToken !== undefined && state.accessToken !== null,
);
export const isUserAuthenticatedInToggl = derived(
  userSession,
  (state) => state.isUserLoggedInToggl,
);

export const isConfigLoaded = derived(authState, (state) => {
  return state.apiUrl !== undefined;
});
