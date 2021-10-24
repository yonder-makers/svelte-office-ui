import { get } from 'svelte/store';
import { authState } from '../../state/auth/auth.state';

export function resolveAuthToken() {
  return get(authState).accessToken;
}
