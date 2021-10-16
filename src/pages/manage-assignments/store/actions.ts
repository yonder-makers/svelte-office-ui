import { addMonths, subMonths } from 'date-fns';
import { getDateForMonthId, getMonthId, MonthId } from '../../../core/id-utils';
import { selectedMonthState } from './state';

export function goNextMonth() {
  selectedMonthState.update((state) => {
    const currentMonth = getDateForMonthId(state);
    const nextMonth = addMonths(currentMonth, 1);

    return getMonthId(nextMonth);
  });
}

export function goPreviousMonth() {
  selectedMonthState.update((state) => {
    const currentMonth = getDateForMonthId(state);
    const prevMonth = subMonths(currentMonth, 1);

    return getMonthId(prevMonth);
  });
}


