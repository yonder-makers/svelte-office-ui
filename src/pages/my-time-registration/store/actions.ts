import type { WorkTimeDto } from '@svelte-office/api';
import {
  add,
  addDays,
  addMonths,
  differenceInCalendarDays,
  format,
  isSameMonth,
  parseISO,
  subDays,
  subMonths,
} from 'date-fns';
import isSameDay from 'date-fns/isSameDay';
import {
  differenceWith,
  isEqual,
  keyBy,
  last,
  uniq,
  uniqBy,
  uniqWith,
} from 'lodash';
import { get } from 'svelte/store';
import {
  addFavoriteTask,
  type FavoriteTaskDto,
  removeFavoriteTask,
} from '../../../apis/favorite-tasks.api';
import { bulkUpsertTasksLog, type TaskLogDto } from '../../../apis/tasks-log.api';
import type { TaskDto } from '../../../apis/tasks.api';
import type { TypeOfWorkDto } from '../../../apis/types-of-work.api';
import { addNotification } from '../../../state/notifications/notifications.state';
import { DaySelectionType } from '../enums';
import type { AssistantSettings } from '../models';
import {
  getSelected,
  hasImportedData,
  selectedTypeOfWorkKeyForImport,
} from './selectors';
import {
  assignableTasks,
  assistantSettings,
  currentMonthState,
  displayWeekend,
  editingValue,
  enteringMode,
  favoritesTasks,
  importEntriesSafeCopy,
  importinfo,
  lastRefreshDateState,
  loadingLogs,
  logEntries,
  logEntriesAreLoading,
  type LogEntry,
  type LogId,
  selectedLogs,
  type Task,
  tasksState,
  typesOfWork
} from './state';
  
  // newlyAddedTaskIds imported separately to avoid circular reference issues in some environments
  import { newlyAddedTaskIds } from './state';

export function changeDisplayWeekend(newValue: boolean) {
  displayWeekend.set(newValue);
}

export function goNextMonth() {
  currentMonthState.update((state) => {
    if (state === null) return null;

    return addMonths(state, 1);
  });

  lastRefreshDateState.set(new Date());
}

export function goPreviousMonth() {
  currentMonthState.update((state) => {
    if (state === null) return null;

    return subMonths(state, 1);
  });

  lastRefreshDateState.set(new Date());
}

export async function addTaskToFavorites(taskId: number) {
  const allTasks = get(tasksState);
  const task = allTasks.byId[taskId];
  const favTask: FavoriteTaskDto = {
    custRefDescription: task.custRefDescription,
    description: task.description,
    projectName: task.project,
    taskNumber: task.taskId,
  };

  favoritesTasks.update((old) => {
    const newFavorites = [...old, favTask];
    const result = uniqBy(newFavorites, (t) => t.taskNumber);
    return result;
  });

  try {
    await addFavoriteTask(taskId);
  } catch (er) {
    console.log(er);
    favoritesTasks.update((old) => {
      return old.filter((t) => t.taskNumber !== taskId);
    });
  }
}

export async function removeTaskFromFavorites(taskId: number) {
  const favorites = get(favoritesTasks);
  const favTask = favorites.find((f) => f.taskNumber === taskId);
  favoritesTasks.update((old) => {
    return old.filter((t) => t.taskNumber !== taskId);
  });

  try {
    await removeFavoriteTask(taskId);
  } catch (er) {
    console.log(er);
    favoritesTasks.update((old) => {
      const newFavorites = [...old, favTask];
      const result = uniqBy(newFavorites, (t) => t.taskNumber);
      return result;
    });
  }
}

export function refreshData() {
  lastRefreshDateState.set(new Date());
}

export function logEntriesLoadingStarted() {
  logEntriesAreLoading.set(true);
  logEntries.set([]);
  tasksState.set({
    byId: {},
    allIds: [],
  });
  selectedLogs.set([]);
  loadingLogs.set([]);
  enteringMode.set('none');
  editingValue.set('');
  // Clear newly added tasks when refreshing data
  newlyAddedTaskIds.set([]);
}

export function logEntriesLoaded(
  entries: LogEntry[],
  types: TypeOfWorkDto[],
  favs: FavoriteTaskDto[],
  assignable: TaskDto[],
) {
  logEntries.set(entries);
  typesOfWork.set(types);
  favoritesTasks.set(favs);
  assignableTasks.set(assignable);

  // Only create tasks from entries with hours > 0
  const tasks = uniqBy(
    entries
      .filter((log) => log.hours > 0)
      .map(
        (log) =>
        ({
          description: log.custRefDescription || log.description,
          project: log.projectName,
          taskId: log.taskId,
        } as Task),
      ),
    (p) => p.taskId,
  );

  tasksState.set({
    byId: keyBy(tasks, (t) => t.taskId),
    allIds: tasks.map((t) => t.taskId),
  });

  logEntriesAreLoading.set(false);
}

export function addNewTask(task: TaskDto) {
  tasksState.update((old) => {
    return {
      byId: {
        ...old.byId,
        [task.taskId]: task,
      },
      allIds: uniq([...old.allIds, task.taskId]),
    };
  });
  // Track as newly added (so it appears in the grid immediately)
  newlyAddedTaskIds.update((ids: number[]) => {
    const updated = uniq([...ids, task.taskId]);
    return updated;
  });
}

export async function setWorkFromHomeForDay(date: Date, value: boolean) {
  const existingEntries = get(logEntries);
  const logsOfTheDay = existingEntries.filter((e) => isSameDay(e.date, date));
  const logsToBeUpdated = logsOfTheDay.filter((e) => e.isWorkFromHome != value);
  const logIdsToBeUpdate = logsToBeUpdated.map((e) => {
    return {
      day: e.date,
      status: 'selected',
      taskId: e.taskId,
    } as LogId;
  });

  loadingLogs.update((old) => {
    return uniqWith([...old, ...logIdsToBeUpdate], isEqual);
  });

  for (let upsertEntry of logsToBeUpdated) {
    const entry: LogEntry = {
      ...upsertEntry,
      isWorkFromHome: value,
    };

    await upsertTaskLog(entry);
  }
}

export function cancelImportFromToggl() {
  selectedLogs.update((logs) =>
    logs.filter((log) => log.status === 'selected'),
  );

  const initialEntries = get(importEntriesSafeCopy);
  logEntries.set([...initialEntries]);
  importEntriesSafeCopy.set([]);
}

export function addDataFromToggl(workTimes: WorkTimeDto[]) {
  const importedLogs: LogId[] = [];
  const tasks: Record<number, Task> = {};
  const taskIds: number[] = [];
  const updatedLogEntries: LogEntry[] = [];
  const existingLogEntries = get(logEntries);
  const importMetaData = get(importinfo);
  const selectedTypeOfWork = get(selectedTypeOfWorkKeyForImport);
  importEntriesSafeCopy.set([...existingLogEntries]);
  for (const task of workTimes) {
    let hasNewEntries = false;
    for (const day of task.timeEntries) {
      // Only import entries with hours > 0
      if (day.duration <= 0) {
        continue;
      }
      
      const date = parseISO(day.entryDay);
      const existingOne = existingLogEntries.find(
        (e) => e.taskId === task.task.taskId && isSameDay(date, e.date),
      );

      if (existingOne?.hours === day.duration) {
        continue;
      }

      hasNewEntries = true;
      importedLogs.push({
        day: date,
        taskId: task.task.taskId,
        status: 'imported',
      });
      updatedLogEntries.push({
        hours: day.duration,
        custRefDescription: task.task.custRefDescription,
        date: date,
        description: task.task.description,
        isWorkFromHome: importMetaData.isWorkFromHome,
        projectName: task.task.project,
        taskId: task.task.taskId,
        typeOfWork: selectedTypeOfWork,
        workFromHomeStarted: importMetaData.workFromHomeStart,
        uid: existingOne?.uid,
      });
    }
    // Only add task if it has new entries with hours > 0
    if (hasNewEntries) {
      tasks[task.task.taskId] = task.task;
      taskIds.push(task.task.taskId);
    }
  }

  logEntries.update((oldEntries) => {
    let result = differenceWith(
      oldEntries,
      updatedLogEntries,
      (a, b) => a.taskId === b.taskId && isSameDay(a.date, b.date),
    );

    return [...result, ...updatedLogEntries];
  });

  tasksState.update((state) => {
    return {
      byId: {
        ...state.byId,
        ...tasks,
      },
      allIds: uniq([...state.allIds, ...taskIds]),
    };
  });
  selectedLogs.update((logs) => {
    let result = differenceWith(
      logs,
      importedLogs,
      (a, b) => a.taskId === b.taskId && isSameDay(a.day, b.day),
    );

    return [...result, ...importedLogs];
  });
}

function isBusinessDay(date: Date): boolean {
  const dayOfWeek = date.getDay();
  return dayOfWeek > 0 && dayOfWeek < 6;
}

function getRowSelectionDates(taskId: number, startDay: Date, endDay: Date): LogId[] {
  const selectionRow: LogId[] = [];
  if (startDay > endDay) {
    [startDay, endDay] = [endDay, startDay];
  }
  const numberOfDays = differenceInCalendarDays(endDay, startDay) + 1;
  [...Array(numberOfDays)].forEach((_, index) => {
    const day = add(startDay, { days: index });
    if (isBusinessDay(day)) {
      selectionRow.push({ taskId, day, status: 'selected' });
    }
  });
  return selectionRow;
}

function isInRowSelection(rowSelection: LogId[], log: LogId): boolean {
  return rowSelection.find(selectedLog =>
    selectedLog.taskId === log.taskId && selectedLog.day.getDate() === log.day.getDate()
  ) !== undefined;
}

export function selectLog(taskId: number, day: Date, daySelectionType: DaySelectionType): void {
  const isImport = get(hasImportedData);
  selectedLogs.update((prevSelected) => {
    
    if (daySelectionType === DaySelectionType.Single || prevSelected.length === 0) {
      return [{ day, taskId, status: 'selected' }];
    }
    if (daySelectionType === DaySelectionType.Row && prevSelected.at(-1).taskId === taskId) {
      const startDaySelection = prevSelected.at(-1);
      const rowSelection = getRowSelectionDates(taskId, startDaySelection.day, day);
      const previousDatesFiltered = prevSelected.filter(prevDay => !isInRowSelection(rowSelection, prevDay));
      return [...previousDatesFiltered, ...rowSelection];
    }
    if (daySelectionType === DaySelectionType.Scattered || isImport) {
      const existingLog = prevSelected.find(
        (s) => s.taskId === taskId && isSameDay(s.day, day),
      );
      if (existingLog !== undefined) {
        return prevSelected.filter((s) => s !== existingLog);
      }
      return [...prevSelected, { day, taskId, status: 'selected' }];
    }

    return prevSelected;
  });
  enteringMode.set('none');
}

export function updateEditingValue(newValue: string) {
  editingValue.set(newValue);
}

export async function submitHours(
  typeOfWork: string,
  hours: number,
  description: string,
  isWorkFromHome: boolean,
  workFromHomeStarted: number,
) {
  const allSelected = get(selectedLogs);

  const isDataImported = get(hasImportedData);
  const manualSeleted = get(getSelected);
  const existingEntries = get(logEntries);
  if (!isDataImported) {
    loadingLogs.update((old) => {
      return uniqWith([...old, ...allSelected], isEqual);
    });
    const lastSelected = last(allSelected);
    selectedLogs.set([lastSelected]);
    enteringMode.set('none');
  } else {
    enteringMode.set('hours');
    selectedLogs.update((prev) => {
      const updated: LogId[] = manualSeleted.map((log) => {
        return { ...log, status: 'updated' };
      });

      const notUpdated = differenceWith(
        prev,
        updated,
        (a, b) => a.taskId === b.taskId && isSameDay(a.day, b.day),
      );

      return [...notUpdated, ...updated];
    });
  }

  const upsertEntries = manualSeleted.map<LogEntry>((s) => {
    const existingOne = existingEntries.find(
      (e) => e.taskId === s.taskId && isSameDay(s.day, e.date),
    );
    return {
      uid: existingOne?.uid,
      date: s.day,
      taskId: s.taskId,
      typeOfWork,
      isWorkFromHome,
      workFromHomeStarted,
      hours,
      description,
      projectName: '',
      custRefDescription: '',
    };
  });

  let updatedLogs = upsertEntries;

  if (!isDataImported) {
    for (let upsertEntry of upsertEntries) {
      await upsertTaskLog(upsertEntry);
    }

    return;
  }

  logEntries.update((oldEntries) => {
    let result = differenceWith(
      oldEntries,
      updatedLogs,
      (a, b) => a.taskId === b.taskId && isSameDay(a.date, b.date),
    );
    const notDeletedEntries = isDataImported
      ? updatedLogs
      : updatedLogs.filter((l) => l.hours > 0);
    return [...result, ...notDeletedEntries];
  });

  loadingLogs.update((old) => {
    return differenceWith(old, allSelected, isEqual);
  });
}

async function upsertTaskLog(logEntry: LogEntry) {
  try {
    const bulkResult = await bulkUpsertTasksLog([logEntry]);
    const result = bulkResult[0];
    if (result.errorDescription) {
      updateTaskLogFailed(result.errorDescription, logEntry);
    } else {
      updateTaskLogSuccessful(result);
    }
  } catch {
    updateTaskLogFailed('Check your internet or your auth session', logEntry);
  }
}

async function updateTaskLogSuccessful(taskLog: TaskLogDto) {
  logEntries.update((oldEntries) => {
    let newEntries = oldEntries.filter(
      (e) => e.taskId !== taskLog.taskId || !isSameDay(e.date, taskLog.date),
    );
    if (taskLog.hours === 0) {
      return newEntries;
    } else {
      return [...newEntries, taskLog];
    }
  });

  loadingLogs.update((old) => {
    return old.filter(
      (l) => l.taskId !== taskLog.taskId || !isSameDay(l.day, taskLog.date),
    );
  });
}

async function updateTaskLogFailed(errorMessage: string, taskLog: LogEntry) {
  addNotification(
    'Error from server',
    errorMessage,
    `TaskId: ${taskLog.taskId}, Date: ${format(taskLog.date, 'yyyy-MM-dd')}`,
  );

  loadingLogs.update((old) => {
    return old.filter(
      (l) => l.taskId !== taskLog.taskId || !isSameDay(l.day, taskLog.date),
    );
  });
}

export function enterKeyPressed() {
  const selected = get(selectedLogs);
  if (selected.length === 0) {
    return;
  }

  const mode = get(enteringMode);
  if (mode === 'none') {
    editingValue.set('0');
    // enteringMode.set('hours');
    enteringMode.set('full');
  } else {
    enteringMode.set('none');
  }
}

export function escapeKeyPressed() {
  // selectedLogs.set([]);
  enteringMode.set('none');
}

export function navigateKeyPressed(
  direction: 'up' | 'down' | 'left' | 'right',
) {
  if (get(enteringMode) !== 'none') return;

  selectedLogs.update((selected) => {
    const cursor = last(selected);
    if (!cursor) return [];

    if (direction == 'up') {
      const taskIndex = get(tasksState).allIds.indexOf(cursor.taskId);
      const prevTaskId = get(tasksState).allIds[taskIndex - 1];
      if (prevTaskId) {
        return [
          {
            day: cursor.day,
            taskId: prevTaskId,
            status: 'selected',
          },
        ];
      }
    } else if (direction == 'down') {
      const taskIndex = get(tasksState).allIds.indexOf(cursor.taskId);
      const prevTaskId = get(tasksState).allIds[taskIndex + 1];
      if (prevTaskId) {
        return [
          {
            day: cursor.day,
            taskId: prevTaskId,
            status: 'selected',
          },
        ];
      }
    } else if (direction == 'left') {
      const prevDay = subDays(cursor.day, 1);
      if (isSameMonth(cursor.day, prevDay)) {
        return [
          {
            day: prevDay,
            taskId: cursor.taskId,
            status: 'selected',
          },
        ];
      }
    } else if (direction == 'right') {
      const nextDay = addDays(cursor.day, 1);
      if (isSameMonth(cursor.day, nextDay)) {
        return [
          {
            day: nextDay,
            taskId: cursor.taskId,
            status: 'selected',
          },
        ];
      }
    }
    return [cursor];
  });
}

export function saveAssistantSettings(newSettings: AssistantSettings): void {
  assistantSettings.set(newSettings);
}
