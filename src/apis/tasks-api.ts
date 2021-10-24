import { doGet } from './core/base-api';

export async function getTasks() {
  // not used for now, but helpful later after we enhance "explore tasks page"
  const result = await doGet('/api/tasks');
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
