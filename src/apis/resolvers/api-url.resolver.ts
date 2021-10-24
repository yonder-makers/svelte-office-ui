import { get } from 'svelte/store';
import { authState } from '../../state/auth/auth.state';

export function resolveApiURL(relativePath: string) {
  const base = get(authState).apiUrl;
  return new URL(relativePath, base);
}
