import {
  doDelete,
  doGet,
  doPost,
  doPostWithoutResponse,
} from './core/base-api';

export type FavoriteTaskDto = {
  projectName: string;
  description: string;
  custRefDescription: string;
  taskNumber: number;
};

export async function fetchFavoriteTasks(
  signal?: AbortSignal,
): Promise<FavoriteTaskDto[]> {
  const response = await doGet<FavoriteTaskDto[]>(
    '/api/favorite-tasks',
    undefined,
    signal,
  );
  return response;
}

export async function addFavoriteTask(
  taskId: number,
  signal?: AbortSignal,
): Promise<void> {
  await doPostWithoutResponse(
    `/api/favorite-tasks/${taskId}`,
    undefined,
    signal,
  );
}

export async function removeFavoriteTask(
  taskId: number,
  signal?: AbortSignal,
): Promise<void> {
  await doDelete<void>(`/api/favorite-tasks/${taskId}`, {}, signal);
}
