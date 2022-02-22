import { getWorkedTimeFromToggl } from '@svelte-office/api';
import { endOfMonth, format, isSameDay, startOfMonth } from 'date-fns';
import { differenceWith, intersectionWith, isEqual } from 'lodash';
import { addNotification } from 'src/state/notifications/notifications.state';
import { get } from 'svelte/store';
import {
  bulkUpsertTasksLog,
  fetchTasksLog,
  TaskLogDto,
} from '../../../apis/tasks-log.api';
import { fetchTypesOfWork } from '../../../apis/types-of-work.api';
import { createAbortable } from '../../../utils/create-abortable';
import {
  addDataFromToggl,
  enterKeyPressed,
  escapeKeyPressed,
  logEntriesLoaded,
  logEntriesLoadingStarted,
  navigateKeyPressed,
} from './actions';
import {
  affectedEntriesDuringImport,
  affectedLogsDuringImport,
  getDisplayedDateRange,
} from './selectors';
import {
  currentMonthState,
  importEntriesSafeCopy,
  lastRefreshDateState,
  loadingLogs,
  logEntries,
  logEntriesAreLoading,
  LogEntry,
  selectedLogs,
} from './state';

async function onDataNeedsRefresh(signal: AbortSignal, refreshDate: Date) {
  if (!refreshDate) {
    return;
  }

  const month = get(currentMonthState);
  logEntriesLoadingStarted();

  const [tasksLog, typesOfWork] = await Promise.all([
    fetchTasksLog(startOfMonth(month), endOfMonth(month), signal),
    fetchTypesOfWork(signal),
  ]);

  logEntriesLoaded(tasksLog, typesOfWork);
}

export async function startTogglImport(signal?: AbortSignal) {
  logEntriesAreLoading.set(true);
  const interval = get(getDisplayedDateRange);
  const worktimes = await getWorkedTimeFromToggl(
    signal,
    interval.startDate,
    interval.endDate,
  );
  addDataFromToggl(worktimes);
  logEntriesAreLoading.set(false);
}

function onKeyDown(ev: KeyboardEvent) {
  switch (ev.key) {
    case 'Enter':
      if (ev.ctrlKey) {
        enterKeyPressed();
      }
      break;

    case 'Escape':
      escapeKeyPressed();
      break;

    case 'ArrowUp':
      navigateKeyPressed('up');
      break;

    case 'ArrowDown':
      navigateKeyPressed('down');
      break;

    case 'ArrowLeft':
      navigateKeyPressed('left');
      break;

    case 'ArrowRight':
      navigateKeyPressed('right');
      break;
  }
}

export function registerEffects() {
  lastRefreshDateState.subscribe(createAbortable(onDataNeedsRefresh, true));

  document.addEventListener('keydown', onKeyDown);
}

const areLogEntriesEqual = (a, b) =>
  a.taskId === b.taskId && isSameDay(a.date, b.date);
export async function saveImportedData() {
  const affectedEntries = get(affectedEntriesDuringImport);
  const affectedLogs = get(affectedLogsDuringImport);
  const entriesSafeCopy = get(importEntriesSafeCopy);
  selectedLogs.update((old) => {
    return differenceWith(old, affectedLogs, isEqual);
  });
  loadingLogs.set([...affectedLogs]);

  for (let affectedEntry of affectedEntries) {
    await upsertTaskLog(affectedEntry);
  }

  importEntriesSafeCopy.set([]);
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
