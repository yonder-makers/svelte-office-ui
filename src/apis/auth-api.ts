import { API_URL } from '../constants';
import type { ApiSession } from './session.model';

export async function login(username: string, password: string) {
  const body = { username, password };
  const result = await fetch(API_URL + 'api/login', {
    body: JSON.stringify(body),
    method: 'post',
    headers: {
      'Content-Type': 'application/json',
    },
  });
  const loginResponse = await result.json();

  if (loginResponse.errorCode) {
    throw loginResponse;
  }

  return {
    accessToken: loginResponse.access_token,
  };
}

export async function getProfile(session: ApiSession) {
  const result = await fetch(API_URL + 'api/profile', {
    method: 'get',
    headers: {
      'Content-Type': 'application/json',
      Authorization: 'Bearer ' + session.accessToken,
    },
  });
  const response = await result.json();
  return response;
}
