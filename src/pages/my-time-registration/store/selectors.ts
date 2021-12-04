import {
  eachDayOfInterval,
  endOfMonth,
  isBefore,
  isSameDay,
  startOfMonth,
} from 'date-fns';
import { derived } from 'svelte/store';
import {
  currentMonthState,
  enteringMode,
  loadingLogs,
  logEntries,
  logEntriesAreLoading,
  selectedLogs,
  importinfo,
  typesOfWork,
} from './state';

export const getDaysRange = derived(currentMonthState, (month) => {
  const start = startOfMonth(month);
  const end = endOfMonth(start);
  return eachDayOfInterval({ start, end });
});

export const getDisplayedDateRange = derived(currentMonthState, (month) => {
  return {
    startDate: startOfMonth(month),
    endDate: endOfMonth(month),
  };
});

export function getLogInfo(taskId: number, date: Date) {
  return derived(logEntries, (entries) => {
    const log = entries.find(
      (e) => e.taskId === taskId && isSameDay(e.date, date),
    );
    return log;
  });
}

export function getTotalHoursForDay(date: Date) {
  return derived(logEntries, (entries) => {
    const logs = entries.filter((e) => isSameDay(e.date, date));

    return logs.reduce((sum, log) => {
      return sum + log.hours;
    }, 0);
  });
}

export function getTotalHoursForTask(taskId: number) {
  return derived(logEntries, (entries) => {
    const logs = entries.filter((e) => e.taskId === taskId);

    return logs.reduce((sum, log) => {
      return sum + log.hours;
    }, 0);
  });
}

export const getTotalForMonth = derived(logEntries, (entries) => {
  return entries.reduce((sum, log) => {
    return sum + log.hours;
  }, 0);
});

export function isLogSelected(taskId: number, date: Date) {
  return derived(selectedLogs, (logs) => {
    return (
      logs.find(
        (l) =>
          l.taskId === taskId &&
          isSameDay(date, l.day) &&
          l.status === 'selected',
      ) !== undefined
    );
  });
}

export function isLogImported(taskId: number, date: Date) {
  return derived(selectedLogs, (logs) => {
    return (
      logs.find(
        (l) =>
          l.taskId === taskId &&
          isSameDay(date, l.day) &&
          l.status === 'imported',
      ) !== undefined
    );
  });
}

export function isLogUpdated(taskId: number, date: Date) {
  return derived(selectedLogs, (logs) => {
    return (
      logs.find(
        (l) =>
          l.taskId === taskId &&
          isSameDay(date, l.day) &&
          l.status === 'updated',
      ) !== undefined
    );
  });
}

export function isLogLoading(taskId: number, date: Date) {
  return derived(loadingLogs, (logs) => {
    return (
      logs.find((l) => l.taskId === taskId && isSameDay(date, l.day)) !==
      undefined
    );
  });
}

export const isGridReadOnly = derived(currentMonthState, (month) => {
  return isBefore(month, startOfMonth(new Date()));
});

export const hintMessage = derived(
  [
    currentMonthState,
    logEntriesAreLoading,
    selectedLogs,
    loadingLogs,
    enteringMode,
  ],
  ([month, logsAreLoading, selected, loading, mode]) => {
    if (logsAreLoading) {
      return 'Loading data. Please wait.';
    }

    if (loading.length > 0) {
      if (loading.length < 5) {
        return 'Data is saving. Please wait.';
      } else {
        return `${loading.length} entries are updating. This might take a while, so hold on!`;
      }
    }

    if (mode === 'hours') {
      return `You are editing ${selected.length} entries. Hit ENTER to submit or ESC to cancel. Use value 0 to delete the entry`;
    }

    if (selected.length == 1) {
      return 'Hit CTRL+ENTER to edit. Or hold CTRL (or CMD) and click on other cells to select more';
    } else if (selected.length > 1) {
      return `${selected.length} days selected. Hit CTRL+ENTER to edit or ESC to cancel`;
    }

    if (isBefore(month, startOfMonth(new Date()))) {
      return 'You are not allowed to change data in the past, but you can look at it and be proud of your work!';
    }

    return 'Click on a cell to start logging your hours';
  },
);

export const hasImportedData = derived(selectedLogs, (selections) =>
  selections.some(
    (select) => select.status === 'imported' || select.status === 'updated',
  ),
);

export const getSelected = derived(selectedLogs, (logs) =>
  logs.filter((log) => log.status === 'selected'),
);

export const getImported = derived(selectedLogs, (logs) =>
  logs.filter((log) => log.status === 'imported'),
);

export const importedEntries = derived(
  [getImported, logEntries],
  ([imported, allEntries]) =>
    allEntries.filter((entry) =>
      imported.some(
        (imported) =>
          imported.taskId === entry.taskId &&
          isSameDay(imported.day, entry.date),
      ),
    ),
);

export const isImportMetadataReady = derived(importinfo, (info) =>
  info &&
  info.isWorkFromHome !== undefined &&
  info.selectedTypeOfWorkIndex !== undefined &&
  info.isWorkFromHome
    ? info.workFromHomeStart !== undefined
    : true,
);

export const selectedTypeOfWorkKeyForImport = derived(
  [importinfo, typesOfWork],
  ([importinfo, typesOfWork]) => {
    const DEFAULT_TYPE_OF_WORK = 'PROG';
    if ((typesOfWork?.length ?? 0) < 1) return DEFAULT_TYPE_OF_WORK;
    if ((importinfo?.selectedTypeOfWorkIndex ?? undefined) === undefined) {
      return DEFAULT_TYPE_OF_WORK;
    }

    if (importinfo.selectedTypeOfWorkIndex > typesOfWork.length - 1) {
      return DEFAULT_TYPE_OF_WORK;
    }

    return (
      typesOfWork[importinfo.selectedTypeOfWorkIndex]?.key ??
      DEFAULT_TYPE_OF_WORK
    );
  },
);

export const affectedLogsDuringImport = derived(selectedLogs, (logs) =>
  logs?.filter((log) => log.status === 'imported' || log.status === 'updated'),
);

export const affectedEntriesDuringImport = derived(
  [affectedLogsDuringImport, logEntries],
  ([logs, entries]) => {
    const updated = entries.filter((entry) =>
      logs.some(
        (imported) =>
          imported.taskId === entry.taskId &&
          isSameDay(imported.day, entry.date),
      ),
    );
    return updated;
  },
);
