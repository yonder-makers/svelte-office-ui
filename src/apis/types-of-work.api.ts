import { doGet } from './core/base-api';

export interface TypeOfWorkDto {
  id: string;
  key: string;
  description: string;
}

export async function fetchTypesOfWork(
  signal?: AbortSignal
): Promise<TypeOfWorkDto[]> {
  const response = await doGet<TypeOfWorkDto[]>('/api/types-of-work', signal);
  return response;
}
