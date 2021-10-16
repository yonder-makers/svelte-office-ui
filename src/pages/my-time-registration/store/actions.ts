import { addMonths, subMonths } from 'date-fns';
import isSameDay from 'date-fns/isSameDay';
import { differenceWith, isEqual, uniqWith } from 'lodash';
import { get } from 'svelte/store';
import {
  BulkUpsertEntry,
  bulkUpsertTasksLog,
} from '../../../apis/tasks-log.api';
import { authState } from '../../../state/auth/auth.state';
import {
  currentMonth,
  editingValue,
  enteringMode,
  loadingLogs,
  logEntries,
  logEntriesAreLoading,
  LogEntry,
  selectedLogs,
} from './state';

export function goNextMonth() {
  currentMonth.update((state) => {
    if (state === null) return null;

    return addMonths(state, 1);
  });
}

export function goPreviousMonth() {
  currentMonth.update((state) => {
    if (state === null) return null;

    return subMonths(state, 1);
  });
}

export function logEntriesLoadingStarted() {
  logEntriesAreLoading.set(true);
  logEntries.set([]);
}

export function logEntriesLoaded(entries: LogEntry[]) {
  logEntries.set(entries);
  logEntriesAreLoading.set(false);
}

export function selectLog(taskId: number, day: Date, ctrlPressed: boolean) {
  selectedLogs.update((prevSelected) => {
    if (ctrlPressed) {
      const existingLog = prevSelected.find(
        (s) => s.taskId === taskId && isSameDay(s.day, day)
      );
      if (existingLog !== undefined) {
        return prevSelected.filter((s) => s !== existingLog);
      }
      return [...prevSelected, { day, taskId }];
    }
    return [{ day, taskId }];
  });
  enteringMode.set('none');
}

export function updateEditingValue(newValue: string) {
  editingValue.set(newValue);
}

export async function submitHours(moveToNotes: boolean) {
  const selected = get(selectedLogs);
  loadingLogs.update((old) => {
    return uniqWith([...old, ...selected], isEqual);
  });

  selectedLogs.set([]);
  enteringMode.set('none');

  const newHoursValue = parseFloat(get(editingValue));
  const existingEntries = get(logEntries);
  const upsertEntries = selected.map<BulkUpsertEntry>((s) => {
    const existingOne = existingEntries.find(
      (e) => e.taskId === s.taskId && isSameDay(s.day, e.date)
    );
    return {
      uid: existingOne?.uid,
      date: s.day,
      taskId: s.taskId,
      hours: newHoursValue,
      description: 'new description',
    };
  });
  const updatedLogs = await bulkUpsertTasksLog(get(authState), upsertEntries);
  logEntries.update((oldEntries) => {
    let result = differenceWith(
      oldEntries,
      updatedLogs,
      (a, b) => a.taskId === b.taskId && isSameDay(a.date, b.date)
    );
    return [...result, ...updatedLogs];
  });

  loadingLogs.update((old) => {
    return differenceWith(old, selected, isEqual);
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
    enteringMode.set('hours');
  } else {
    enteringMode.set('none');
  }
}

export function escapeKeyPressed() {
  selectedLogs.set([]);
  enteringMode.set('none');
}