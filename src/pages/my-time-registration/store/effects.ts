import { endOfMonth, isBefore, startOfMonth } from 'date-fns';
import { get } from 'svelte/store';
import { fetchTasksLog } from '../../../apis/tasks-log.api';
import { fetchTypesOfWork } from '../../../apis/types-of-work.api';
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
    if (isBefore(newCurrentMonth, new Date(2000, 1, 1))) {
      return;
    }

    logEntriesLoadingStarted();

    const tasksLog = await fetchTasksLog(
      startOfMonth(newCurrentMonth),
      endOfMonth(newCurrentMonth)
    );

    const typesOfWork = await fetchTypesOfWork();

    logEntriesLoaded(tasksLog, typesOfWork);
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
