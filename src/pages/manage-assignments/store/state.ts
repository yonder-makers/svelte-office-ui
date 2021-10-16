import { writable } from 'svelte/store';
import { getMonthId, MonthId } from '../../../core/id-utils';

export const selectedMonthState = writable<MonthId>(getMonthId(new Date()));
