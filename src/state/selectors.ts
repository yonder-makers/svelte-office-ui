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
    console.log('calcul', result);
    return result;
  }
);

export const projectsCount = derived(projectsSelector, (projects) => {
  console.log('here');
  return projects.all.length;
});
