import { writable } from 'svelte/store';
import type { EmployeeDto } from '../../../apis/employee.api';

export const currentYearState = writable<number>(new Date().getFullYear());

type EmployeeHistoryState = {
  isLoading: boolean;
  errorMessage?: string;
  yoShort: string;
  byId: { [historyId: number]: EmployeeDto };
  allIds: number[];
};

export const employeeHistoryState = writable<EmployeeHistoryState>({
  isLoading: true,
  yoShort: '',
  byId: {},
  allIds: [],
});
