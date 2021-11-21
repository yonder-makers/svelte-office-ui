import {
  endOfDay,
  endOfMonth,
  endOfToday,
  formatISO,
  isAfter,
  startOfDay,
  startOfToday,
} from 'date-fns';
import { doGet } from '../core/base-api';
import type { WorkTimeDto } from './work-time.dto';

export async function getWorkedTimeFromToggl(
  signal?: AbortSignal,
  startDate?: Date,
  endDate?: Date
): Promise<WorkTimeDto[]> {
  const response = await doGet<WorkTimeDto[]>(
    '/api/work-times',
    {
      startDate: startDate ? formatShortISO(startOfDay(startDate)) : undefined,
      endDate: endDate ? getEndDate(endOfDay(endDate)) : undefined,
    },
    signal
  );

  return response;
}

const formatShortISO = (date: Date) => {
  return formatISO(date, { format: 'extended', representation: 'date' });
};

function getEndDate(endDate: Date): string {
  const lastDayOfMonth = endOfMonth(endOfToday());
  if (isAfter(endOfDay(endDate), lastDayOfMonth)) {
    return formatShortISO(lastDayOfMonth);
  }
  return formatShortISO(endDate);
}
