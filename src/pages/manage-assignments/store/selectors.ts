import { difference, flatMap } from 'lodash';
import { derived } from 'svelte/store';
import { assignmentsState, tasksState } from '../../../state/root-state';
import { selectedMonthState } from './state';

export const selectedMonth = derived(selectedMonthState, (state) => state);

export const currentMonthTasks = derived(
  [selectedMonthState, assignmentsState],
  ([month, assignments]) => {
    return assignments.byMonth[month] || [];
  }
);

export const otherTasks = derived(
  [currentMonthTasks, tasksState],
  ([current, tasks]) => {
    const allTasks = flatMap(Object.values(tasks.byProjectId));
    return difference(allTasks, current);
  }
);
