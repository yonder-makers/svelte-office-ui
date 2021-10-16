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

export interface TaskDto {
  description: string;
  custRefDescription: string;
  taskId: number;
  project: string;
}

export async function getTaskById(apiSession: ApiSession, taskId: number) {
  const result = await fetch(`${API_URL}api/task/${taskId}`, {
    method: 'get',
    headers: {
      'Content-Type': 'application/json',
      Authorization: 'Bearer ' + apiSession.accessToken,
    },
  });

  const response = await result.json();
  return response as TaskDto;
}
