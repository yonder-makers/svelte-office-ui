import { currentYearState } from './state';
import { createAbortable } from '../../../utils/create-abortable';
import { fetchHolidays } from '../../../apis/holidays.api';
import { refreshData } from './actions';

async function onYearChanged(year: number) {
  console.log('Year changed to', year);
  refreshData();
}

let registered = false;
export function registerEffects() {
  if (registered) {
    return;
  }
  registered = true;

  currentYearState.subscribe(onYearChanged);
}
