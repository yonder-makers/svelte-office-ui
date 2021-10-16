import { addDays, addMonths, isLastDayOfMonth, subMonths } from 'date-fns';
import {
  DayId,
  getDateForDayId,
  getDateForMonthId,
  getDayId,
  getMonthId,
} from '../../../core/id-utils';
import { assignmentsState } from '../../../state/root-state';
import { focusedEntryState, selectedMonthState } from './state';

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

export function focusOnEntry(day?: DayId, taskId?: number) {
  if (!day || !taskId) {
    focusedEntryState.set(undefined);
  } else {
    focusedEntryState.set({
      day,
      taskId,
    });
  }
}

export function focusOnNextEntry() {
  assignmentsState.update((assignments) => {
    focusedEntryState.update((focused) => {
      if (!focused) {
        return focused;
      }

      let day = getDateForDayId(focused.day);
      const monthId = getMonthId(day);
      const taskIds = assignments.byMonth[monthId];

      let nextIndex = taskIds.indexOf(focused.taskId) + 1;
      if (nextIndex >= taskIds.length) {
        nextIndex = 0;
        if (isLastDayOfMonth(day)) {
          return undefined;
        }

        day = addDays(day, 1);
      }

      return {
        day: getDayId(day),
        taskId: taskIds[nextIndex],
      };
    });

    return assignments;
  });
}
