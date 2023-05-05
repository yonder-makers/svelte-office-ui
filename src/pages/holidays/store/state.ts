import { writable } from 'svelte/store';
import type { HolidayDto } from '../../../apis/holidays.api';

export const currentYearState = writable<number>(new Date().getFullYear());

type HolidaysState = {
  byId: { [holidayId: string]: HolidayDto };
  allIds: string[];
};

export const holidaysState = writable<HolidaysState>({
  byId: {},
  allIds: [],
});
