import { isSameDay } from 'date-fns';
import { loop_guard } from 'svelte/internal';
import { derived, get, writable } from 'svelte/store';
import { submitHours } from '../store/actions';
import {
  enteringMode,
  selectedLogs,
  logEntries,
  typesOfWork,
  tasksState,
} from '../store/state';

interface EditingLog {
  selectedTypeOfWorkIndex: number;
  hours: string;
  description: string;
  isWorkFromHome: boolean;
  workFromHomeStarted: string;
}

export const editingLog = writable<EditingLog>({
  selectedTypeOfWorkIndex: -1,
  hours: '8',
  description: '',
  isWorkFromHome: true,
  workFromHomeStarted: '8',
});

/* actions */

export function save() {
  const log = get(editingLog);
  const h = parseFloat(log.hours);
  const started = parseFloat(log.workFromHomeStarted);
  const typeOfWork = get(typesOfWorkComboItems)[log.selectedTypeOfWorkIndex].id;
  submitHours(typeOfWork, h, log.description, log.isWorkFromHome, started);
}

/* selectors */

export const isEditLogModalOpen = derived(enteringMode, (mode) => {
  return mode === 'full';
});

export const typesOfWorkComboItems = derived(typesOfWork, (types) => {
  return types.map((t) => {
    return {
      id: t.key,
      text: t.description,
    };
  });
});

/* effects */
isEditLogModalOpen.subscribe((newValue) => {
  if (!newValue) return;

  const allLogs = get(logEntries);
  const logIds = get(selectedLogs);
  for (const logId of logIds) {
    const log = allLogs.find(
      (t) => t.taskId === logId.taskId && isSameDay(t.date, logId.day)
    );

    if (log) {
      const typeOfWorkIndex = get(typesOfWorkComboItems).findIndex(
        (t) => t.id === log.typeOfWork
      );
      editingLog.set({
        hours: log.hours.toString(),
        description: log.description,
        isWorkFromHome: log.isWorkFromHome,
        workFromHomeStarted: log.workFromHomeStarted.toString(),
        selectedTypeOfWorkIndex: typeOfWorkIndex,
      });

      return;
    }
  }

  const task = get(tasksState).byId[logIds[0].taskId];

  editingLog.update((old) => {
    return {
      ...old,
      description: task.description,
    };
  });
});
