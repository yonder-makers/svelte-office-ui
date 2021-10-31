import { endOfMonth, startOfMonth } from 'date-fns';
import { get } from 'svelte/store';
import { fetchTasksLog } from '../../../apis/tasks-log.api';
import { fetchTypesOfWork } from '../../../apis/types-of-work.api';
import {
  enterKeyPressed,
  escapeKeyPressed,
  logEntriesLoaded,
  logEntriesLoadingStarted,
  navigateKeyPressed,
} from './actions';
import { currentMonthState, lastRefreshDateState } from './state';

async function onDataNeedsRefresh() {
  const month = get(currentMonthState);
  logEntriesLoadingStarted();

  const tasksLog = await fetchTasksLog(startOfMonth(month), endOfMonth(month));

  const typesOfWork = await fetchTypesOfWork();

  logEntriesLoaded(tasksLog, typesOfWork);
}

function onKeyDown(ev: KeyboardEvent) {
  switch (ev.key) {
    case 'Enter':
      if (ev.ctrlKey) {
        enterKeyPressed();
      }
      break;

    case 'Escape':
      escapeKeyPressed();
      break;

    case 'ArrowUp':
      navigateKeyPressed('up');
      break;

    case 'ArrowDown':
      navigateKeyPressed('down');
      break;

    case 'ArrowLeft':
      navigateKeyPressed('left');
      break;

    case 'ArrowRight':
      navigateKeyPressed('right');
      break;
  }
}

export function registerEffects() {
  lastRefreshDateState.subscribe(onDataNeedsRefresh);

  document.addEventListener('keydown', onKeyDown);
}
