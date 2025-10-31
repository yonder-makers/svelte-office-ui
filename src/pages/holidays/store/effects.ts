import { currentYearState } from './state';
import { createAbortable } from '../../../utils/create-abortable';
import { fetchHolidays } from '../../../apis/holidays.api';
import {
  refreshData,
  triggerRefresh,
  loadLegalHolidays,
  loadRemainingDays,
} from './actions';

async function onYearChanged(year: number) {
  console.log('Year changed to', year);
  refreshData();
  triggerRefresh();
}

let registered = false;
export function registerEffects() {
  if (registered) {
    return;
  }
  registered = true;

  currentYearState.subscribe(onYearChanged);

  // Load initial data
  loadLegalHolidays();
  loadRemainingDays();
  triggerRefresh();
}
