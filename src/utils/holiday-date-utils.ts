import {
  eachDayOfInterval,
  getDay,
  format,
  startOfYear,
  endOfYear,
  parseISO,
} from 'date-fns';
import type { LegalHoliday } from '../apis/holidays.api';

/**
 * Check if a date falls on a weekend (Saturday or Sunday)
 */
export function isWeekend(date: Date): boolean {
  const day = getDay(date);
  return day === 0 || day === 6; // Sunday=0, Saturday=6
}

/**
 * Count working days (excluding weekends) between two dates (inclusive)
 */
export function countWorkingDays(startDate: Date, endDate: Date): number {
  const days = eachDayOfInterval({ start: startDate, end: endDate });
  return days.filter((day) => !isWeekend(day)).length;
}

/**
 * Count weekend days between two dates (inclusive)
 */
export function countWeekendDays(startDate: Date, endDate: Date): number {
  const days = eachDayOfInterval({ start: startDate, end: endDate });
  return days.filter((day) => isWeekend(day)).length;
}

/**
 * Check if a date is a legal holiday
 */
export function isLegalHoliday(
  date: Date,
  legalHolidays: LegalHoliday[]
): boolean {
  const day = date.getDate();
  const month = date.getMonth() + 1; // getMonth() returns 0-11
  return legalHolidays.some((h) => h.day === day && h.month === month);
}

/**
 * Check if a date range overlaps with any legal holidays
 */
export function overlapsLegalHoliday(
  startDate: Date,
  endDate: Date,
  legalHolidays: LegalHoliday[]
): boolean {
  const days = eachDayOfInterval({
    start: startDate,
    end: endDate,
  });
  return days.some((day) => isLegalHoliday(day, legalHolidays));
}

/**
 * Find overlapping holiday request
 * Returns the first overlapping request, or null if none found
 */
export function findOverlappingRequest<
  T extends { startDate: string | Date; endDate: string | Date }
>(newRequest: { startDate: string | Date; endDate: string | Date }, existingRequests: T[]): T | null {
  const newStart =
    typeof newRequest.startDate === 'string'
      ? parseISO(newRequest.startDate)
      : newRequest.startDate;
  const newEnd =
    typeof newRequest.endDate === 'string'
      ? parseISO(newRequest.endDate)
      : newRequest.endDate;

  for (const existing of existingRequests) {
    const existStart =
      typeof existing.startDate === 'string'
        ? parseISO(existing.startDate)
        : existing.startDate;
    const existEnd =
      typeof existing.endDate === 'string'
        ? parseISO(existing.endDate)
        : existing.endDate;

    // Check four overlap scenarios:
    // 1. New starts during existing
    if (newStart >= existStart && newStart <= existEnd) {
      return existing;
    }
    // 2. New ends during existing
    if (newEnd >= existStart && newEnd <= existEnd) {
      return existing;
    }
    // 3. New encompasses existing
    if (newStart <= existStart && newEnd >= existEnd) {
      return existing;
    }
    // Note: scenario 4 (new within existing) is already covered by 1 and 2
  }
  return null;
}

/**
 * Check if overlap is allowed (0.5 day Paid + 0.5 day Compensation on same date)
 */
export function isAllowedOverlap(
  newRequest: {
    startDate: string | Date;
    endDate: string | Date;
    days: number;
    type: number;
  },
  existingRequest: {
    startDate: string | Date;
    endDate: string | Date;
    days: number;
    type: number;
  }
): boolean {
  const newStart =
    typeof newRequest.startDate === 'string'
      ? parseISO(newRequest.startDate)
      : newRequest.startDate;
  const newEnd =
    typeof newRequest.endDate === 'string'
      ? parseISO(newRequest.endDate)
      : newRequest.endDate;
  const existStart =
    typeof existingRequest.startDate === 'string'
      ? parseISO(existingRequest.startDate)
      : existingRequest.startDate;
  const existEnd =
    typeof existingRequest.endDate === 'string'
      ? parseISO(existingRequest.endDate)
      : existingRequest.endDate;

  // Allow 0.5 day Paid (type=1) + 0.5 day Compensation (type=2) on same date
  return (
    newRequest.days === 0.5 &&
    existingRequest.days === 0.5 &&
    newStart.getTime() === existStart.getTime() &&
    newEnd.getTime() === existEnd.getTime() &&
    ((newRequest.type === 1 && existingRequest.type === 2) ||
      (newRequest.type === 2 && existingRequest.type === 1))
  );
}

/**
 * Get date range for the current year
 */
export function getYearDateRange() {
  const now = new Date();
  return {
    start: startOfYear(now),
    end: endOfYear(now),
  };
}

/**
 * Format date as YYYY-MM-DD (for API/inputs)
 */
export function formatDate(date: Date | string): string {
  const d = typeof date === 'string' ? parseISO(date) : date;
  return format(d, 'yyyy-MM-dd');
}

/**
 * Format date for display (e.g., "Jan 15, 2024")
 */
export function formatDisplayDate(date: Date | string): string {
  const d = typeof date === 'string' ? parseISO(date) : date;
  return format(d, 'MMM dd, yyyy');
}

/**
 * Get weekday name (e.g., "Monday")
 */
export function getWeekdayName(date: Date | string): string {
  const d = typeof date === 'string' ? parseISO(date) : date;
  return format(d, 'EEEE');
}

/**
 * Parse ISO date string to Date object
 */
export function parseDate(dateStr: string): Date {
  return parseISO(dateStr);
}

/**
 * Get today's date as YYYY-MM-DD string
 */
export function getTodayString(): string {
  return formatDate(new Date());
}

/**
 * Get end of year as YYYY-MM-DD string
 */
export function getEndOfYearString(): string {
  return formatDate(endOfYear(new Date()));
}
