import { API_URL } from '../constants';
import { fromWebOfficeFormat, toWebOfficeFormat } from './date-utils';
import type { ApiSession } from './session.model';

export interface TaskLogDto {
  uid: string;
  created: Date;
  date: Date;
  description: string;
  hours: number;
  projectName: string;
  taskId: number;
  typeOfWork: string;
  typeOfWorkDescription: string;
  workDayStarted: string;
}

export async function getTasksLog(
  apiSession: ApiSession,
  startDate: Date,
  endDate: Date
) {
  const body = {
    startDate: toWebOfficeFormat(startDate),
    endDate: toWebOfficeFormat(endDate),
  };

  const result = await fetch(API_URL + 'api/tasks-log', {
    method: 'post',
    body: JSON.stringify(body),
    headers: {
      'Content-Type': 'application/json',
      Authorization: 'Bearer ' + apiSession.accessToken,
    },
  });

  const entries = (await result.json()) as any[];
  entries.forEach((element) => {
    element.created = fromWebOfficeFormat(element.created);
    element.date = fromWebOfficeFormat(element.date);
  });
  return entries as TaskLogDto[];
}

export interface BulkUpsertEntry {
  uid?: string;
  date: Date;
  taskId: number;
  hours: number;
  description: string;
}
export async function bulkUpsertTasksLog(
  apiSession: ApiSession,
  entries: BulkUpsertEntry[]
) {
  const body = entries.map((entry) => {
    return {
      ...entry,
      date: toWebOfficeFormat(entry.date),
    };
  });

  const result = await fetch(API_URL + 'api/tasks-log/bulk-upsert', {
    method: 'post',
    body: JSON.stringify(body),
    headers: {
      'Content-Type': 'application/json',
      Authorization: 'Bearer ' + apiSession.accessToken,
    },
  });

  const updatedEntries = (await result.json()) as any[];
  updatedEntries.forEach((element) => {
    element.created = fromWebOfficeFormat(element.created);
    element.date = fromWebOfficeFormat(element.date);
  });
  return entries as TaskLogDto[];
}
