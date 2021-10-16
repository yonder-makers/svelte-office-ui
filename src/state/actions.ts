import { uniq } from 'lodash';
import type { DayId, MonthId } from '../core/id-utils';
import {
  assignmentsState,
  projectsState,
  Task,
  tasksState,
  timeEntriesState,
} from './root-state';
import { tasksByProjectId } from './selectors';

// export function projectsLoading() {
//   rootState.update((state) => {
//     return {
//       ...state,
//       isLoading: true,
//     };
//   });
// }

// export function projectsLoaded(projects: ProjectDto[]) {
//   rootState.update((state) => {
//     return {
//       ...state,
//       isLoading: false,
//       projects: {
//         byId: keyBy(projects, (p) => p.id),
//         all: projects.map((p) => p.id),
//       },
//       tasks: {
//         byId: keyBy(
//           flatMap(projects, (project) => project.tasks.map || []),
//           (task) => task.id
//         ),
//         byProjectId: reduce(
//           projects,
//           (acum, project) => {
//             const taskIds = (project.tasks || []).map((t) => t.id);
//             acum[project.id] = taskIds;
//             return acum;
//           },
//           {}
//         ),
//       },
//     };
//   });
// }

export function projectAdded(name: string) {
  projectsState.update((state) => {
    const nextId = Math.max(...state.all, 1) + 1;
    const newProject = {
      name,
      id: nextId,
    };

    return {
      byId: {
        ...state.byId,
        [nextId]: newProject,
      },
      all: [...state.all, nextId],
    };
  });
}

export function createTaskForProject(
  projectId: number,
  title: string,
  yoId: number,
  description: string
) {
  tasksState.update((state) => {
    const nextId = new Date().getTime();
    const newTask: Task = {
      title,
      projectId,
      yoId: yoId,
      id: nextId,
      defaultDescription: description,
    };

    const byProdId = [...(state.byProjectId[projectId] || []), nextId];

    return {
      byId: {
        ...state.byId,
        [nextId]: newTask,
      },
      byProjectId: {
        ...state.byProjectId,
        [projectId]: byProdId,
      },
    };
  });
}

export function setLog(
  dayId: DayId,
  taskId: number,
  hours: number,
  note: string
) {
  timeEntriesState.update((state) => {
    const newValue = hours > 0 ? { hours, note } : undefined;
    return {
      ...state,
      [dayId]: {
        ...state[dayId],
        [taskId]: newValue,
      },
    };
  });
}

export function addAssignment(monthId: MonthId, taskId: number) {
  assignmentsState.update((assignments) => {
    let monthAssignments = assignments.byMonth[monthId] || [];
    monthAssignments.push(taskId);
    monthAssignments = uniq(monthAssignments);

    return {
      ...assignments,
      byMonth: {
        ...assignments.byMonth,
        [monthId]: monthAssignments,
      },
    };
  });
}

export function removeAssignment(monthId: MonthId, taskId: number) {
  assignmentsState.update((assignments) => {
    let monthAssignments = assignments.byMonth[monthId] || [];
    monthAssignments = monthAssignments.filter((t) => t !== taskId);

    return {
      ...assignments,
      byMonth: {
        ...assignments.byMonth,
        [monthId]: monthAssignments,
      },
    };
  });

  timeEntriesState.update((timeEntries) => {
    for (const key in timeEntries) {
      timeEntries[monthId];
    }
    return {
      ...timeEntries,
    };
  });
}
