import { derived } from 'svelte/store';
import type { DayId, MonthId } from '../core/id-utils';
import {
  assignmentsState,
  projectsState,
  tasksState,
  timeEntriesState,
} from './root-state';

export const projects = derived([projectsState], ([projects]) => {
  const result = projects.all.map((id) => {
    return projects.byId[id];
  });

  return result;
});

export const projectsCount = derived(projectsState, (projects) => {
  return projects.all.length;
});

export function getProjectById(projectId: number) {
  return derived(projectsState, (projects) => {
    return projects.byId[projectId];
  });
}

export function getTaskById(taskId: number) {
  return derived(tasksState, (tasks) => {
    return tasks.byId[taskId];
  });
}

export function taskIdsByProjectId(projectId: number) {
  return derived(tasksState, (tasks) => {
    return tasks.byProjectId[projectId] || [];
  });
}

export function tasksByProjectId(projectId: number) {
  return derived(tasksState, (tasks) => {
    const taskIds = tasks.byProjectId[projectId] || [];
    return taskIds.map((tId) => tasks.byId[tId]);
  });
}

export function getTimeEntryByDay(day: DayId, taskId: number) {
  return derived([timeEntriesState], ([timeEntries]) => {
    if (!timeEntries[day]) {
      return {
        hours: 0,
        note: '',
      };
    }

    return (
      timeEntries[day][taskId] || {
        hours: 0,
        note: '',
      }
    );
  });
}

export function getTotalHoursForDay(day: DayId) {
  return derived([timeEntriesState], ([timeEntries]) => {
    if (!timeEntries[day]) {
      return 0;
    }

    const entries = Object.values(timeEntries[day]).filter((e) => e);
    return entries.map((e) => e.hours).reduce((prev, cur) => prev + cur, 0);
  });
}

export function getAssignmentsByMonth(monthId: MonthId) {
  return derived(assignmentsState, (state) => state.byMonth[monthId] || []);
}
