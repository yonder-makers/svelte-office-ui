import { BXModalBody } from 'carbon-web-components';
import { endOfMonth, startOfMonth } from 'date-fns';
import { get } from 'svelte/store';
import { getTasksLog } from '../../../apis/tasks-log.api';
import { userSession } from '../../../state/auth/auth.state';
import {
  enterKeyPressed,
  escapeKeyPressed,
  logEntriesLoaded,
  logEntriesLoadingStarted,
} from './actions';
import { currentMonth } from './state';

export function registerEffects() {
  currentMonth.subscribe(async (newCurrentMonth) => {
    logEntriesLoadingStarted();

    const tasksLog = await getTasksLog(
      get(userSession),
      startOfMonth(newCurrentMonth),
      endOfMonth(newCurrentMonth)
    );

    logEntriesLoaded(tasksLog);
  });

  document.addEventListener('keyup', (ev) => {
    switch (ev.key) {
      case 'Enter':
        enterKeyPressed();
        break;
      case 'Escape':
        escapeKeyPressed();
        break;
    }
  });
}
