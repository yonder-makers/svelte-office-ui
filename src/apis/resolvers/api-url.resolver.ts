import { derived, get } from 'svelte/store';
import { authState } from '../../state/auth/auth.state';

function computeUrl(base: string, relativePath: string) {
  if (base?.length == 0) {
    base = 'http://localhost:3000/';
    console.warn(
      'API URL is not configured. Fallback to http://localhost:3000/',
    );
  }

  let url: URL | null = null;
  try {
    url = new URL(relativePath, base);
  } catch (err) {
    url = new URL(relativePath, window.location.origin + base);
    authState.update((state) => {
      return {
        ...state,
        apiUrl: new URL(base, window.location.origin).toString(),
      };
    });
  }

  return url;
}

export function resolveApiURL(relativePath: string) {
  let base = get(authState).apiUrl;
  return computeUrl(base, relativePath);
}

export function apiUrlSelectorForPath(relativePath: string) {
  return derived(authState, (auth) => {
    return computeUrl(auth.apiUrl, relativePath);
  });
}
