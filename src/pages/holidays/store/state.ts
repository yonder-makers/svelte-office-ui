import { writable } from 'svelte/store';
import type {
  HolidayDto,
  HolidayResponse,
  LegalHoliday,
  RemainingHolidaysResponse,
} from '../../../apis/holidays.api';

export const currentYearState = writable<number>(new Date().getFullYear());

type HolidaysState = {
  byId: { [holidayId: string]: HolidayDto };
  allIds: string[];
};

export const holidaysState = writable<HolidaysState>({
  byId: {},
  allIds: [],
});

// New state for full holiday management
export const holidayRequestsStore = writable<HolidayResponse[]>([]);

// Legal holidays store (cached)
export const legalHolidaysStore = writable<LegalHoliday[]>([]);

// Remaining days store
export const remainingDaysStore = writable<RemainingHolidaysResponse>({
  total: 0,
  used: 0,
  remaining: 0,
  pending: 0,
});

// Loading states
export const loadingRemainingStore = writable<boolean>(false);
export const loadingLegalHolidaysStore = writable<boolean>(false);

// Error states
export const errorStore = writable<string | null>(null);

// Selected holiday for editing
export const selectedHolidayStore = writable<HolidayResponse | null>(null);

// Modal states
export const showCreateModalStore = writable<boolean>(false);
export const showEditModalStore = writable<boolean>(false);

// Refresh trigger
export const refreshTriggerStore = writable<number>(0);
