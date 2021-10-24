import { get } from 'svelte/store';
import { authState } from '../../state/auth/auth.state';

export function resolveApiURL(relativePath: string) {
  let base = get(authState).apiUrl;

  if (base?.length == 0) {
    base = 'http://localhost:3000/';
    console.warn(
      'API URL is not configured. Fallback to http://localhost:3000/'
    );
  }
  return new URL(relativePath, base);
}
