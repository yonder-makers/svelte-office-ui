import { describe, expect, it } from 'vitest';
import { isHolidayPending } from './holiday-type-guards';

describe('isHolidayPending', () => {
    describe('HolidayResponse (New Format)', () => {
        it('should return true when managerDecision is "?"', () => {
            const holiday = {
                id: 1,
                managerDecision: '?',
                startDate: '2023-01-01',
                endDate: '2023-01-01'
            } as any;
            expect(isHolidayPending(holiday)).toBe(true);
        });

        it('should return true when managerDecision is null', () => {
            const holiday = {
                id: 2,
                managerDecision: null,
                startDate: '2023-01-01',
                endDate: '2023-01-01'
            } as any;
            expect(isHolidayPending(holiday)).toBe(true);
        });

        it('should return true when managerDecision is undefined', () => {
            const holiday = {
                id: 3,
                managerDecision: undefined,
                startDate: '2023-01-01',
                endDate: '2023-01-01'
            } as any;
            expect(isHolidayPending(holiday)).toBe(true);
        });

        it('should return true when status is "Pending"', () => {
            const holiday = {
                id: 4,
                status: 'Pending',
                startDate: '2023-01-01',
                endDate: '2023-01-01'
            } as any;
            expect(isHolidayPending(holiday)).toBe(true);
        });

        it('should return false when managerDecision is "YES"', () => {
            const holiday = {
                id: 5,
                managerDecision: 'YES',
                startDate: '2023-01-01',
                endDate: '2023-01-01'
            } as any;
            expect(isHolidayPending(holiday)).toBe(false);
        });

        it('should return false when managerDecision is "NO"', () => {
            const holiday = {
                id: 6,
                managerDecision: 'NO',
                startDate: '2023-01-01',
                endDate: '2023-01-01'
            } as any;
            expect(isHolidayPending(holiday)).toBe(false);
        });
    });

    describe('HolidayDto (Legacy Format)', () => {
        it('should return true when decision is false and advice is false', () => {
            const holiday = {
                uid: '1',
                decision: false,
                advice: false,
                startDate: '01-01-2023',
                endDate: '01-01-2023'
            } as any;
            expect(isHolidayPending(holiday)).toBe(true);
        });

        it('should return true when decision is "?"', () => {
            const holiday = {
                uid: '2',
                decision: '?',
                advice: true,
                startDate: '01-01-2023',
                endDate: '01-01-2023'
            } as any;
            expect(isHolidayPending(holiday)).toBe(true);
        });

        it('should return true when advice is "?"', () => {
            const holiday = {
                uid: '3',
                decision: true,
                advice: '?',
                startDate: '01-01-2023',
                endDate: '01-01-2023'
            } as any;
            expect(isHolidayPending(holiday)).toBe(true);
        });

        it('should return false when decision is true', () => {
            const holiday = {
                uid: '4',
                decision: true,
                advice: true,
                startDate: '01-01-2023',
                endDate: '01-01-2023'
            } as any;
            expect(isHolidayPending(holiday)).toBe(false);
        });

        it('should return false when decision is false but advice is true (rejected)', () => {
            const holiday = {
                uid: '5',
                decision: false,
                advice: true, // This combination usually means rejected or advice given but not approved
                startDate: '01-01-2023',
                endDate: '01-01-2023'
            } as any;
            expect(isHolidayPending(holiday)).toBe(false);
        });
    });
});
