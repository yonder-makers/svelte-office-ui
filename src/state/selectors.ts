import { derived } from 'svelte/store';
import { rootState } from './root-state';

export const isLoading = derived(rootState, (rootState) => rootState.isLoading);

const projectsSelector = derived(rootState, (root) => root.projects);

const tasksSelector = derived(rootState, (root) => root.tasks);

export const projects = derived(
  [projectsSelector, tasksSelector],
  ([projects, tasks]) => {
    const result = projects.all.map((id) => {
      return projects.byId[id];
    });
    return result;
  }
);

export const projectsCount = derived(projectsSelector, (projects) => {
  console.log('here');
  return projects.all.length;
});

export function projectById(projectId: number) {
  return derived(projectsSelector, (projects) => {
    return projects.byId[projectId];
  });
}

export function taskIdsByProjectId(projectId: number) {
  return derived(tasksSelector, (tasks) => {
    return tasks.byProjectId[projectId] || [];
  });
}

export function tasksByProjectId(projectId: number) {
  return derived(tasksSelector, (tasks) => {
    const taskIds = tasks.byProjectId[projectId] || [];
    return taskIds.map((tId) => tasks.byId[tId]);
  });
}
