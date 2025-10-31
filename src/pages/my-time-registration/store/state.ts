import { startOfMonth } from 'date-fns';
import { writable } from 'svelte/store';
import type { FavoriteTaskDto } from '../../../apis/favorite-tasks.api';
import type { TaskDto } from '../../../apis/tasks.api';
import type { TypeOfWorkDto } from '../../../apis/types-of-work.api';
import { Languages } from '../enums/languages.enum';
import type { AssistantSettings } from '../models';

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

export const currentMonthState = writable<Date>(startOfMonth(new Date()));
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

// Track newly added tasks (cleared on refresh or on page mount)
export const newlyAddedTaskIds = writable<number[]>([]);



// Track manually added tasks (legacy - prefer using newlyAddedTaskIds)
export const manuallyAddedTaskIds = writable<number[]>([]);

// Assistant Settings
export const assistantSettings = writable<AssistantSettings>({
  languageCode: Languages.English,
  isSpeakResponse: true,
  isAutoListen: false,
  isHeyYonder: false
});