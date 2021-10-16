import { writable } from 'svelte/store';
import { DayId, getMonthId, MonthId } from '../core/id-utils';

interface Project {
  id: number;
  name: string;
}
interface ProjectsState {
  byId: {
    [id: number]: Project;
  };
  all: number[];
}

export interface Task {
  id: number;
  projectId: number;
  title: string;
  yoId: number;
  defaultDescription: string;
}
interface TasksState {
  byId: {
    [id: number]: Task;
  };
  byProjectId: {
    [projectId: number]: number[];
  };
}

export const projectsState = writable<ProjectsState>({
  byId: {},
  all: [],
});

export const tasksState = writable<TasksState>({
  byId: {},
  byProjectId: {},
});
interface AssignmentsState {
  byMonth: {
    [monthId: string]: number[];
  };
}

export const assignmentsState = writable<AssignmentsState>({
  byMonth: {
    // [getMonthId(new Date())]: [1, 2, 3],
  },
});

export interface TimeEntry {
  hours: number;
  note: string;
}

interface TimeEntriesState {
  [dayId: string]: {
    [taskId: number]: TimeEntry;
  };
}
export const timeEntriesState = writable<TimeEntriesState>({});
