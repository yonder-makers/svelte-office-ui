import { writable } from 'svelte/store';

interface RootState {
  isLoading: boolean;
  projects: {
    byId: {
      [id: number]: {
        id: number;
        name: string;
      };
    };
    all: number[];
  };
  tasks: {
    byId: {
      [id: number]: {
        id: number;
        name: string;
        yoId: number;
      };
    };
    byProjectId: {
      [projectId: number]: number[];
    };
  };
}

function createInitialState(): RootState {
  return {
    isLoading: false,
    projects: {
      byId: {},
      all: [],
    },
    tasks: {
      byId: {},
      byProjectId: {},
    },
  };
}

export const rootState = writable<RootState>(createInitialState());
