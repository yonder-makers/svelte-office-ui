import {
  eachDayOfInterval,
  endOfMonth,
  isAfter,
  isBefore,
  isSameDay,
  isThisMonth,
  startOfMonth,
} from 'date-fns';
import { derived } from 'svelte/store';
import {
  currentMonth,
  enteringMode,
  loadingLogs,
  logEntries,
  logEntriesAreLoading,
  selectedLogs,
} from './state';

export const getDaysRange = derived(currentMonth, (month) => {
  const start = startOfMonth(month);
  const end = endOfMonth(start);
  return eachDayOfInterval({ start, end });
});

export function getLogInfo(taskId: number, date: Date) {
  return derived(logEntries, (entries) => {
    const log = entries.find(
      (e) => e.taskId === taskId && isSameDay(e.date, date)
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
      logs.find((l) => l.taskId === taskId && isSameDay(date, l.day)) !==
      undefined
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

export const isGridReadOnly = derived(currentMonth, (month) => {
  return !isThisMonth(month);
});

export const hintMessage = derived(
  [currentMonth, logEntriesAreLoading, selectedLogs, loadingLogs, enteringMode],
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
      return 'Hit ENTER to edit. Or hold CTRL (or CMD) and click on other cells to select more';
    } else if (selected.length > 1) {
      return `${selected.length} days selected. Hit ENTER to edit or ESC to cancel`;
    }

    if (isBefore(month, startOfMonth(new Date()))) {
      return 'You are not allowed to change data in the past, but you can look at it and be proud of your work!';
    }

    if (isAfter(month, endOfMonth(new Date()))) {
      return 'You are not allowed to change data in the future.';
    }

    return 'Click on a cell to start logging your hours';
  }
);
