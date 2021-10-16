import { derived } from 'svelte/store';
import { loadingLogs, logEntries, selectedLogs } from './state';
import { uniq } from 'lodash';
import { isSameDay } from 'date-fns';

export const getLogEntryIds = derived(logEntries, (entries) => {
  const allIds = entries.map((entry) => entry.taskId);
  return uniq(allIds);
});

export function getTaskInfoById(taskId: number) {
  return derived(logEntries, (entries) => {
    const entry = entries.find((e) => e.taskId === taskId);
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
