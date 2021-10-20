import { writable } from 'svelte/store';
import { startOfMonth, addMonths, subMonths } from 'date-fns';

export const currentMonth = writable<Date>(startOfMonth(new Date(0, 0, 0)));

export interface LogEntry {
  uid: string;
  hours: number;
  date: Date;
  taskId: number;
  description: string;
  projectName: string;
}

export const logEntries = writable<LogEntry[]>([]);
export const logEntriesAreLoading = writable<boolean>(false);

interface LogId {
  day: Date;
  taskId: number;
}
export const selectedLogs = writable<LogId[]>([]);
export const loadingLogs = writable<LogId[]>([]);

export type EnteringMode = 'none' | 'hours' | 'description';
export const enteringMode = writable<EnteringMode>('none');

export const editingValue = writable<string>('');
