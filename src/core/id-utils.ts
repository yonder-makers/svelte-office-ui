import { format } from 'date-fns';

export type MonthId = string;
export type DayId = string;

export function getMonthId(date: Date): MonthId {
  return format(date, 'yyyy-MM');
}

export function getDateForMonthId(monthId: MonthId): Date {
  const parts = monthId.split('-');
  return new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, 1);
}

export function getDayId(date: Date): DayId {
  return format(date, 'yyyy-MM-dd');
}

export function getDateForDayId(monthId: DayId): Date {
  const parts = monthId.split('-');
  return new Date(
    parseInt(parts[0]),
    parseInt(parts[1]) - 1,
    parseInt(parts[2])
  );
}
