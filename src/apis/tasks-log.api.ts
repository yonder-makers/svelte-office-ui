import { doPost } from './core/base-api';
import { fromWebOfficeFormat, toWebOfficeFormat } from './core/date-utils';

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

export async function getTasksLog(startDate: Date, endDate: Date) {
  const body = {
    startDate: toWebOfficeFormat(startDate),
    endDate: toWebOfficeFormat(endDate),
  };

  const entries = (await doPost('/api/tasks-log', body)) as any[];

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
export async function bulkUpsertTasksLog(entries: BulkUpsertEntry[]) {
  const body = entries.map((entry) => {
    return {
      ...entry,
      date: toWebOfficeFormat(entry.date),
    };
  });

  const updatedEntries = (await doPost(
    '/api/tasks-log/bulk-upsert',
    body
  )) as any[];

  updatedEntries.forEach((element) => {
    element.created = fromWebOfficeFormat(element.created);
    element.date = fromWebOfficeFormat(element.date);
  });
  return entries as TaskLogDto[];
}
