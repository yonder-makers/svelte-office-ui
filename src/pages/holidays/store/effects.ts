import { refreshData } from './actions';
import { currentYearState } from './state';

async function onYearChanged(year: number) {
  console.log('Year changed to', year);
  await refreshData();
}

let registered = false;
export function registerEffects() {
  if (registered) {
    return;
  }
  registered = true;

  currentYearState.subscribe(onYearChanged);
}
