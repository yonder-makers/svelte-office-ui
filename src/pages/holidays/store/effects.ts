import {
  loadLegalHolidays,
  loadRemainingDays,
  refreshData,
  triggerRefresh,
} from './actions';
import { currentYearState } from './state';

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
