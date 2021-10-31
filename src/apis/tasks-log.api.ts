import { doPost } from './core/base-api';
import { fromWebOfficeFormat, toWebOfficeFormat } from './core/date-utils';

export interface TaskLogDto {
  uid: string;
  created: Date;
  date: Date;
  description: string;
  custRefDescription: string;
  hours: number;
  projectName: string;
  taskId: number;
  typeOfWork: string;
  typeOfWorkDescription: string;
  isWorkFromHome: boolean;
  workFromHomeStarted: number;
}

function mapFromDto(item: any): TaskLogDto {
  return {
    ...item,
    created: fromWebOfficeFormat(item.created),
    date: fromWebOfficeFormat(item.date),
  };
}

export async function fetchTasksLog(startDate: Date, endDate: Date) {
  const body = {
    startDate: toWebOfficeFormat(startDate),
    endDate: toWebOfficeFormat(endDate),
  };

  const entries = (await doPost('/api/tasks-log', body)) as any[];

  return entries.map(mapFromDto);
}

export interface BulkUpsertEntry {
  uid?: string;
  date: Date;
  taskId: number;
  hours: number;
  description: string;
  typeOfWork: string;
  isWorkFromHome: boolean;
  workFromHomeStarted: number;
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

  return updatedEntries.map(mapFromDto);
}
