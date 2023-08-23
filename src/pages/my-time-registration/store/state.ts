import { startOfMonth } from 'date-fns';
import type { FavoriteTaskDto } from '../../../apis/favorite-tasks.api';
import { writable } from 'svelte/store';
import type { TypeOfWorkDto } from '../../../apis/types-of-work.api';
import type {TaskDto} from "../../../apis/tasks.api";

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

export interface LogId {
  day: Date;
  taskId: number;
  status: 'selected' | 'imported' | 'updated';
}

export interface Task {
  taskId: number;
  project: string;
  description: string;
  custRefDescription: string;
}

export const currentMonthState = writable<Date>(
  startOfMonth(Date.UTC(2023, 7, 20)),
);
export const lastRefreshDateState = writable<Date>(undefined);
export const logEntries = writable<LogEntry[]>([]);
export const importEntriesSafeCopy = writable<LogEntry[]>([]);
export const logEntriesAreLoading = writable<boolean>(false);

export const tasksState = writable<{
  byId: { [taskId: number]: Task };
  allIds: number[];
}>({ byId: {}, allIds: [] });

export const selectedLogs = writable<LogId[]>([]);
export const loadingLogs = writable<LogId[]>([]);

export type EnteringMode = 'none' | 'hours' | 'full';
export const enteringMode = writable<EnteringMode>('none');

export const editingValue = writable<string>('');

export const typesOfWork = writable<TypeOfWorkDto[]>([]);

export const displayWeekend = writable<boolean>(false);

export interface ImportLogAttributes {
  selectedTypeOfWorkIndex?: number;
  isWorkFromHome?: boolean;
  workFromHomeStart?: number;
}
export const importinfo = writable<ImportLogAttributes>({
  isWorkFromHome: true,
  selectedTypeOfWorkIndex: undefined,
  workFromHomeStart: 8,
});

export const favoritesTasks = writable<FavoriteTaskDto[]>([]);

export const assignableTasks = writable<TaskDto[]>([]);
