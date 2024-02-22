import { doGet, doPost } from './core/base-api';

export interface LoginResponse {
  access_token: string;
}

export async function login(username: string, password: string) {
  const body = { username, password };
  const loginResponse = await doPost<LoginResponse>('api/login', body) as any;

  return {
    accessToken: loginResponse.accessToken,
  };
}

interface GetProfileResponse {
  user: string;
}

export async function getProfile() {
  const result = await doGet<GetProfileResponse>('api/profile');
  return result;
}
