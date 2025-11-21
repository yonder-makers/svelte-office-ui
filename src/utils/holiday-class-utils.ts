import { isPendingHoliday } from './holiday-status-utils';
import type { HolidayData } from './holiday-type-guards';

/**
 * Get CSS classes for holiday status styling
 * Used by both LogColumnHeader and LogDay components
 */
export function getHolidayStatusClasses(
    day: Date,
    holidayRequests: HolidayData[],
    isLegalDay: boolean,
    isApprovedDay: boolean
): string {
    const isPending = isPendingHoliday(day, holidayRequests);

    if (isPending) {
        return 'pending-holiday';
    } else if (isApprovedDay) {
        return 'approved-holiday';
    } else if (isLegalDay) {
        return 'legal-holiday';
    }

    return '';
}
