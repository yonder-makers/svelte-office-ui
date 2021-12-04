import type { WorkTimeDto } from '@svelte-office/api';
import {
  addDays,
  addMonths,
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
import { bulkUpsertTasksLog } from '../../../apis/tasks-log.api';
import type { TaskDto } from '../../../apis/tasks.api';
import type { TypeOfWorkDto } from '../../../apis/types-of-work.api';
import { addNotification } from '../../../state/notifications/notifications.state';
import {
  hasImportedData,
  importedEntries,
  getSelected,
  selectedTypeOfWorkKeyForImport,
} from './selectors';
import {
  currentMonthState,
  editingValue,
  enteringMode,
  lastRefreshDateState,
  loadingLogs,
  logEntries,
  logEntriesAreLoading,
  LogEntry,
  LogId,
  selectedLogs,
  Task,
  tasksState,
  typesOfWork,
  importinfo,
  importEntriesSafeCopy,
} from './state';

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
}

export function logEntriesLoaded(entries: LogEntry[], types: TypeOfWorkDto[]) {
  logEntries.set(entries);
  typesOfWork.set(types);

  const tasks = uniqBy(
    entries.map(
      (log) =>
        ({
          description: log.custRefDescription,
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
    tasks[task.task.taskId] = task.task;
    taskIds.push(task.task.taskId);
    for (const day of task.timeEntries) {
      const date = parseISO(day.entryDay);
      const existingOne = existingLogEntries.find(
        (e) => e.taskId === task.task.taskId && isSameDay(date, e.date),
      );

      if (existingOne?.hours === day.duration) {
        continue;
      }

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

export function selectLog(taskId: number, day: Date, ctrlPressed: boolean) {
  const isImport = get(hasImportedData);
  selectedLogs.update((prevSelected) => {
    if (ctrlPressed || isImport) {
      const existingLog = prevSelected.find(
        (s) => s.taskId === taskId && isSameDay(s.day, day),
      );
      if (existingLog !== undefined) {
        return prevSelected.filter((s) => s !== existingLog);
      }
      return [...prevSelected, { day, taskId, status: 'selected' }];
    }
    return [{ day, taskId, status: 'selected' }];
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
    const bulkResult = await bulkUpsertTasksLog(upsertEntries);
    updatedLogs = bulkResult.filter((i) => !i.errorDescription);
    const errors = bulkResult.filter((i) => i.errorDescription);

    for (const error of errors) {
      addNotification(
        'Error from server',
        error.errorDescription,
        `TaskId: ${error.taskId}, Date: ${format(error.date, 'yyyy-MM-dd')}`,
      );
    }
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
