import { derived, writable } from 'svelte/store';
import type { EmployeeDto } from '../../../apis/employee.api';

export const currentYearState = writable<number>(new Date().getFullYear());

type EmployeeHistoryState = {
  isLoading: boolean;
  errorMessage?: string;
  yoShort: string;
  byId: { [historyId: number]: EmployeeDto };
  allIds: number[];
  departmentNames: string[];
};

export const employeeHistoryState = writable<EmployeeHistoryState>({
  isLoading: true,
  yoShort: '',
  byId: {},
  allIds: [],
  departmentNames: [],
});

export const departmentNames = derived(
  employeeHistoryState,
  (state) => state.departmentNames,
);

export const activeEntry = derived(employeeHistoryState, (state) => {
  const activeEntryId = state.allIds[state.allIds.length - 1];
  return state.byId[activeEntryId];
});
