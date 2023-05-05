import { doGet } from './core/base-api';
import { toWebOfficeFormat } from './core/date-utils';

export type HolidayDto = {
  uid: string;
  rowState: string;
  user: string;
  advice: boolean;
  numberOfDays: number;
  decision: boolean;
  description: string;
  startDate: string;
  endDate: string;
  createdAt: string;
  modifiedBy: string;
  modifiedDate: string;
  type: 'Legal' | 'Paid' | 'Compensation' | 'Not paid';
};

export async function fetchHolidays(
  startDate: Date,
  endDate: Date,
  signal?: AbortSignal,
): Promise<HolidayDto[]> {
  const body = {
    startDate: toWebOfficeFormat(startDate),
    endDate: toWebOfficeFormat(endDate),
  };

  const response = await doGet<HolidayDto[]>('/api/holidays', body, signal);
  return response;
}
