import { keyBy, flatMap, reduce } from 'lodash';
import type { ProjectDto } from '../apis/project-api';
import { rootState } from './root-state';

export function projectsLoading() {
  rootState.update((state) => {
    return {
      ...state,
      isLoading: true,
    };
  });
}

export function projectsLoaded(projects: ProjectDto[]) {
  rootState.update((state) => {
    return {
      ...state,
      isLoading: false,
      projects: {
        byId: keyBy(projects, (p) => p.id),
        all: projects.map((p) => p.id),
      },
      tasks: {
        byId: keyBy(
          flatMap(projects, (project) => project.tasks || []),
          (task) => task.id
        ),
        byProjectId: reduce(
          projects,
          (acum, project) => {
            const taskIds = (project.tasks || []).map((t) => t.id);
            acum[project.id] = taskIds;
            return acum;
          },
          {}
        ),
      },
    };
  });
}

export function projectAdded(name: string) {
  rootState.update((state) => {
    const nextId = Math.max(...state.projects.all) + 1;
    const newProject = {
      name,
      id: nextId,
    };
    return {
      ...state,
      projects: {
        byId: {
          ...state.projects.byId,
          [nextId]: newProject,
        },
        all: [...state.projects.all, nextId],
      },
    };
  });
}
