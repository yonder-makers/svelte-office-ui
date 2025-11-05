import { refreshData, triggerRefresh } from './actions';
import { currentYearState } from './state';

async function onYearChanged(year: number) {
  console.log('Year changed to', year);
  
  // Run both refresh operations in parallel for better performance
  await Promise.all([
    refreshData(),
    triggerRefresh()
  ]);
}

let registered = false;

export function registerEffects() {
  if (registered) {
    return;
  }
  
  registered = true;
  
  // Subscribe to year changes
  currentYearState.subscribe((year) => {
    // Always call on subscription (including first call)
    onYearChanged(year);
  });
}
