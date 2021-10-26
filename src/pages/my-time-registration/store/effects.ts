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
  navigateKeyPressed,
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

  document.addEventListener('keydown', (ev) => {
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
  });
}
