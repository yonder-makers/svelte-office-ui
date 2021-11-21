import type { LoginResponse } from '../auth.api';
import { doPost } from '../core/base-api';

export async function togglLogin(username: string, password: string) {
  const body = { username, password };
  const loginResponse = await doPost<LoginResponse>('/api/toggl-login', body);

  return {
    accessToken: loginResponse.access_token,
  };
}
