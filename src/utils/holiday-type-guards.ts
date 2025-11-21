import type { HolidayDto, HolidayResponse } from '../apis/holidays.api';

/**
 * Union type for holiday data that can come in different formats from the backend
 */
export type HolidayData = HolidayResponse | HolidayDto;

/**
 * Type guard to check if a holiday is a HolidayResponse (new format)
 */
export function isHolidayResponse(holiday: HolidayData | any): holiday is HolidayResponse {
    return holiday && ('managerDecision' in holiday || 'status' in holiday || 'id' in holiday);
}

/**
 * Type guard to check if a holiday is a HolidayDto (old format)
 */
export function isHolidayDto(holiday: HolidayData | any): holiday is HolidayDto {
    return holiday && 'decision' in holiday && 'advice' in holiday && !('managerDecision' in holiday);
}

/**
 * Safely get the ID from either format
 */
export function getHolidayId(holiday: HolidayData): number | string {
    if (isHolidayResponse(holiday)) {
        return holiday.id;
    } else if (isHolidayDto(holiday)) {
        return holiday.uid;
    }
    return (holiday as any)?.id ?? (holiday as any)?.uid;
}

/**
 * Safely get the number of days from either format
 */
export function getHolidayDays(holiday: HolidayData): number {
    if (isHolidayResponse(holiday)) {
        return holiday.days;
    } else if (isHolidayDto(holiday)) {
        return holiday.numberOfDays;
    }
    return (holiday as any)?.days ?? (holiday as any)?.numberOfDays ?? 0;
}

/**
 * Safely check if a holiday request is pending
 */
export function isHolidayPending(holiday: HolidayData): boolean {
    if (isHolidayResponse(holiday)) {
        // New format: check managerDecision or status
        if (holiday.managerDecision === '?' || holiday.managerDecision === null || holiday.managerDecision === undefined) {
            return true;
        }
        if (holiday.status) {
            return holiday.status === 'Pending';
        }
        // If we have a HolidayResponse structure but no decision and no status, it might be pending
        // But let's be careful. If managerDecision is strictly checked above, we might be good.
        // However, the issue is likely that managerDecision is null.
        return !holiday.managerDecision && !holiday.status;
    } else if (isHolidayDto(holiday)) {
        // Old format: decision is boolean or string '?'
        // Pending when:
        // 1. decision is false AND advice is false (legacy boolean logic)
        // 2. decision is '?' (legacy string logic)
        // 3. advice is '?' (legacy string logic)
        const decision = String(holiday.decision).trim();
        const advice = String(holiday.advice).trim();

        if (decision === '?' || advice === '?') {
            return true;
        }
        return holiday.decision === false && holiday.advice === false;
    }

    // Fallback for unknown formats with _raw data
    const holidayAny = holiday as any;
    if (holidayAny._raw && Array.isArray(holidayAny._raw)) {
        // Index 6 appears to be the decision field based on user logs
        return holidayAny._raw[6] === '?';
    }

    return false;
}

/**
 * Safely check if a holiday request is approved
 */
export function isHolidayApproved(holiday: HolidayData): boolean {
    if (isHolidayResponse(holiday)) {
        return holiday.managerDecision === 'YES';
    } else if (isHolidayDto(holiday)) {
        return holiday.decision === true;
    }

    const decision = (holiday as any)?.managerDecision ?? (holiday as any)?.decision;
    return decision === 'YES' || decision === true;
}

/**
 * Safely check if a holiday request is rejected
 */
export function isHolidayRejected(holiday: HolidayData): boolean {
    if (isHolidayResponse(holiday)) {
        return holiday.managerDecision === 'NO';
    } else if (isHolidayDto(holiday)) {
        return holiday.decision === false && holiday.advice !== false;
    }

    const holidayAny = holiday as any;
    const decision = holidayAny?.managerDecision ?? holidayAny?.decision;
    return decision === 'NO' || (decision === false && holidayAny?.advice !== false);
}

/**
 * Safely get the request/created date from either format
 */
export function getHolidayRequestDate(holiday: HolidayData): string {
    if (isHolidayResponse(holiday)) {
        return holiday.requestDate;
    } else if (isHolidayDto(holiday)) {
        return holiday.createdAt;
    }
    return (holiday as any)?.requestDate ?? (holiday as any)?.createdAt ?? '';
}

/**
 * Safely get the modified date from either format
 */
export function getHolidayModifiedDate(holiday: HolidayData): string {
    return holiday.modifiedDate ?? '';
}

/**
 * Safely get the modified by user from either format
 */
export function getHolidayModifiedBy(holiday: HolidayData): string {
    return holiday.modifiedBy ?? '';
}
