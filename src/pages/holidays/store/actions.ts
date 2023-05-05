import { get } from 'svelte/store';
import { fetchHolidays } from '../../../apis/holidays.api';
import { currentYearState, holidaysState } from './state';

import { keyBy } from 'lodash';
import { createAbortable } from '../../../utils/create-abortable';

export function goNextYear() {
  currentYearState.update((year) => year + 1);
}

export function goPreviousYear() {
  currentYearState.update((year) => year - 1);
}

export const refreshData = createAbortable(async (signal: AbortSignal) => {
  const startDate = new Date(get(currentYearState), 0, 1);
  const endDate = new Date(get(currentYearState), 11, 31);

  const holidays = await fetchHolidays(startDate, endDate, signal);

  holidaysState.update((state) => {
    return {
      ...state,
      byId: keyBy(holidays, (h) => h.uid),
      allIds: holidays.map((h) => h.uid),
    };
  });
});
