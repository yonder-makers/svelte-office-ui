import {
  endOfDay,
  endOfToday,
  formatISO,
  isAfter,
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
      startDate: startDate ? formatShortISO(startDate) : undefined,
      endDate: endDate ? getEndDate(endDate) : undefined,
    },
    signal
  );

  return response;
}

const formatShortISO = (date: Date) => {
  return formatISO(date, { format: 'extended', representation: 'date' });
};

function getEndDate(endDate: Date): string {
  if (isAfter(endOfDay(endDate), endOfToday())) {
    return formatShortISO(startOfToday());
  }
  return formatShortISO(endDate);
}
