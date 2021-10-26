import { startOfMonth } from 'date-fns';
import { writable } from 'svelte/store';
import type { TypeOfWorkDto } from '../../../apis/types-of-work.api';

export const currentMonth = writable<Date>(startOfMonth(new Date(0, 0, 0)));

export interface LogEntry {
  uid: string;
  hours: number;
  date: Date;
  taskId: number;
  description: string;
  projectName: string;
  custRefDescription: string;
  typeOfWork: string;
  isWorkFromHome: boolean;
  workFromHomeStarted: number;
}

export interface Task {
  taskId: number;
  project: string;
  description: string;
  custRefDescription: string;
}

export const logEntries = writable<LogEntry[]>([]);
export const logEntriesAreLoading = writable<boolean>(false);

export const tasksState = writable<{
  byId: { [taskId: number]: Task };
  allIds: number[];
}>({ byId: {}, allIds: [] });

interface LogId {
  day: Date;
  taskId: number;
}
export const selectedLogs = writable<LogId[]>([]);
export const loadingLogs = writable<LogId[]>([]);

export type EnteringMode = 'none' | 'hours' | 'full';
export const enteringMode = writable<EnteringMode>('none');

export const editingValue = writable<string>('');

export const typesOfWork = writable<TypeOfWorkDto[]>([]);
