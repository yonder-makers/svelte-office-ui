import { getWorkedTimeFromToggl } from '@svelte-office/api';
import { endOfMonth, format, isSameDay, startOfMonth } from 'date-fns';
import { differenceWith, intersectionWith, isEqual } from 'lodash';
import { addNotification } from 'src/state/notifications/notifications.state';
import { get } from 'svelte/store';
import { bulkUpsertTasksLog, fetchTasksLog } from '../../../apis/tasks-log.api';
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
    interval.endDate
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
  const bulkResult = await bulkUpsertTasksLog(affectedEntries);
  const successfulEntries = bulkResult.filter((i) => !i.errorDescription);
  const errors = bulkResult.filter((i) => i.errorDescription);

  for (const error of errors) {
    addNotification(
      'Error from server',
      error.errorDescription,
      `TaskId: ${error.taskId}, Date: ${format(error.date, 'yyyy-MM-dd')}`
    );
  }
  logEntries.update((oldEntries) => {
    let result = differenceWith(
      oldEntries,
      successfulEntries,
      errors,
      areLogEntriesEqual
    );

    const errorRollback = intersectionWith(
      entriesSafeCopy,
      errors,
      areLogEntriesEqual
    );
    const notDeletedEntries = successfulEntries.filter((l) => l.hours > 0);
    return [...result, ...notDeletedEntries, ...errorRollback];
  });
  loadingLogs.update((old) => {
    return differenceWith(old, affectedLogs, isEqual);
  });
  importEntriesSafeCopy.set([]);
}
