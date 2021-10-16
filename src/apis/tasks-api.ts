import { API_URL } from '../constants';
import type { ApiSession } from './session.model';

export async function getTasks(apiSession: ApiSession) {
  const result = await fetch(API_URL + 'api/tasks', {
    method: 'get',
    headers: {
      'Content-Type': 'application/json',
      Authorization: 'Bearer ' + apiSession.accessToken,
    },
  });

  const response = await result.json();
  return response;
}
