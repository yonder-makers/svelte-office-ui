import { get } from 'svelte/store';
import { employeeHistoryState } from './state';

import { keyBy } from 'lodash';
import {
  fetchDepartmentNames,
  fetchEmployeeHistory,
} from '../../../apis/employee.api';
import { createAbortable } from '../../../utils/create-abortable';

export const refreshData = createAbortable(
  async (signal: AbortSignal, forceDepartmentsReload: boolean) => {
    const employeeCode = get(employeeHistoryState).yoShort;

    employeeHistoryState.update((state) => {
      return {
        ...state,
        isLoading: true,
        errorMessage: undefined,
      };
    });

    try {
      let departmentNames = get(employeeHistoryState).departmentNames;
      if (forceDepartmentsReload || departmentNames.length === 0) {
        departmentNames = await fetchDepartmentNames();
      }

      const history = await fetchEmployeeHistory(employeeCode, signal);
      employeeHistoryState.update((state) => {
        return {
          ...state,
          departmentNames,
          byId: keyBy(history, (h) => h.historyId),
          allIds: history.map((h) => h.historyId),
        };
      });
    } catch (error) {
      console.error(error);
      employeeHistoryState.update((state) => {
        return {
          ...state,
          errorMessage: error?.errorDescription ?? error?.message ?? error,
        };
      });
    } finally {
      employeeHistoryState.update((state) => {
        return {
          ...state,
          isLoading: false,
        };
      });
    }
  },
);

export async function loadEmployeeHistory(yoShort: string) {
  const oldYoShort = get(employeeHistoryState).yoShort;
  if (oldYoShort !== yoShort) {
    employeeHistoryState.update((state) => {
      return {
        ...state,
        yoShort,
        byId: {},
        allIds: [],
      };
    });
  }

  await refreshData(false);
}
