import type { LegalHoliday } from '../apis/holidays.api';
import { parseDateFromWebOffice } from './holiday-date-utils';
import { isHolidayPending, type HolidayData } from './holiday-type-guards';

/**
 * Check if a date falls within a pending holiday request
 * Pending means managerDecision is '?' (or status is 'Pending')
 */
export function isPendingHoliday(date: Date, requests: HolidayData[]): boolean {
    if (!requests || requests.length === 0) return false;

    // Normalize input date to midnight
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    const dateTime = d.getTime();

    return requests.some((req) => {
        // Use type-safe helper function from shared module
        if (!isHolidayPending(req)) return false;

        const start = parseDateFromWebOffice(req.startDate);
        const end = parseDateFromWebOffice(req.endDate);

        // Normalize to midnight for comparison
        const s = new Date(start);
        s.setHours(0, 0, 0, 0);
        const e = new Date(end);
        e.setHours(0, 0, 0, 0);

        const isMatch = dateTime >= s.getTime() && dateTime <= e.getTime();
        // console.log(`Checking pending holiday for ${date.toDateString()}: req=${req.startDate}-${req.endDate}, match=${isMatch}`);
        return isMatch;
    });
}

/**
 * Check if a date is a legal holiday
 */
export function isLegalHoliday(date: Date, legalHolidays: LegalHoliday[]): boolean {
    if (!legalHolidays || legalHolidays.length === 0) return false;

    const day = date.getDate();
    const month = date.getMonth() + 1;

    return legalHolidays.some((h) => h.day === day && h.month === month);
}
