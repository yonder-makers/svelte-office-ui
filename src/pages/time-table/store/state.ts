import { writable } from 'svelte/store';
import { DayId, getMonthId, MonthId } from '../../../core/id-utils';

interface FocusedEntryState {
  day: DayId;
  taskId: number;
}

export const focusedEntryState = writable<FocusedEntryState | undefined>(
  undefined
);
export const selectedMonthState = writable<MonthId>(getMonthId(new Date()));
