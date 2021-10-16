import type { Writable } from 'svelte/store';
import { authState } from './auth/auth.state';
import {
  assignmentsState,
  projectsState,
  tasksState,
  timeEntriesState,
} from './root-state';

function init(key: string, state: Writable<any>) {
  const existing = localStorage.getItem(key);
  if (existing) {
    console.log(existing);
    state.set(JSON.parse(existing));
  }

  state.subscribe((state) => {
    localStorage.setItem(key, JSON.stringify(state));
  });
}

export function startPersistance() {
  init('LogsState', timeEntriesState);
  init('Projects', projectsState);
  init('Tasks', tasksState);
  init('Assignments', assignmentsState);
  init('AuthState', authState);
}
