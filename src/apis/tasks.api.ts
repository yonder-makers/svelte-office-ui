import {doGet} from './core/base-api';

export async function getTasks(signal?: AbortSignal): Promise<TaskDto[]> {
  const result = await doGet<TaskDto[]>(
      '/api/tasks',
      undefined,
      signal
  );
  return result;
}

export interface TaskDto {
  description: string;
  custRefDescription: string;
  taskId: number;
  project: string;
}

export async function getTaskById(taskId: number) {
  const result = await doGet(`/api/task/${taskId}`);
  return result as TaskDto;
}
