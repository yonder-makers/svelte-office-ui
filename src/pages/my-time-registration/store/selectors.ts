import { derived } from 'svelte/store';
import { currentMonth, loadingLogs, logEntries, selectedLogs } from './state';
import { uniq } from 'lodash';
import {
  eachDayOfInterval,
  endOfMonth,
  isSameDay,
  startOfMonth,
} from 'date-fns';

export const getLogEntryIds = derived(logEntries, (entries) => {
  const allIds = entries.map((entry) => entry.taskId);
  return uniq(allIds);
});

export const getDaysRange = derived(currentMonth, (month) => {
  const start = startOfMonth(month);
  const end = endOfMonth(start);
  return eachDayOfInterval({ start, end });
});

export function getTaskInfoById(taskId: number) {
  return derived(logEntries, (entries) => {
    const entry = entries.find((e) => e.taskId === taskId);
    if (!entry) {
      return {
        taskId: 0,
        projectName: 'no details yet',
        taskName: 'no details yet',
      };
    }

    return {
      taskId: entry.taskId,
      projectName: entry.projectName,
      taskName: entry.description,
    };
  });
}

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
