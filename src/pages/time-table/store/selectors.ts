import { derived } from 'svelte/store';
import type { DayId } from '../../../core/id-utils';
import { assignmentsState } from '../../../state/root-state';
import { focusedEntryState, selectedMonthState } from './state';

export const getTasksIdsForCurrentMonth = derived(
  [assignmentsState, selectedMonthState],
  ([assignments, selectedMonth]) => {
    return assignments.byMonth[selectedMonth] || [];
  }
);

export const selectedMonth = derived(selectedMonthState, (state) => state);

export const focusedEntry = derived(focusedEntryState, (state) => state);
