import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import {
  isWeekend,
  countWorkingDays,
  countWeekendDays,
} from './holiday-date-utils';

describe('Holiday Date Utils - Timezone Bug Fix', () => {
  let originalTZ: string | undefined;

  beforeEach(() => {
    // Save original timezone
    originalTZ = process.env.TZ;
  });

  afterEach(() => {
    // Restore original timezone
    if (originalTZ) {
      process.env.TZ = originalTZ;
    } else {
      delete process.env.TZ;
    }
  });

  describe('isWeekend', () => {
    it('should correctly identify Monday (12/29/2025) as weekday in UTC', () => {
      process.env.TZ = 'UTC';
      const date = new Date('2025-12-29'); // Monday
      expect(isWeekend(date)).toBe(false);
    });

    it('should correctly identify Monday (12/29/2025) as weekday in America/New_York', () => {
      process.env.TZ = 'America/New_York';
      const date = new Date('2025-12-29'); // Monday
      expect(isWeekend(date)).toBe(false);
    });

    it('should correctly identify Monday (12/29/2025) as weekday in America/Los_Angeles', () => {
      process.env.TZ = 'America/Los_Angeles';
      const date = new Date('2025-12-29'); // Monday
      expect(isWeekend(date)).toBe(false);
    });

    it('should correctly identify Sunday (12/28/2025) as weekend in all timezones', () => {
      const date = new Date('2025-12-28'); // Sunday
      
      process.env.TZ = 'UTC';
      expect(isWeekend(date)).toBe(true);
      
      process.env.TZ = 'America/New_York';
      expect(isWeekend(date)).toBe(true);
      
      process.env.TZ = 'America/Los_Angeles';
      expect(isWeekend(date)).toBe(true);
    });

    it('should correctly identify Saturday (12/27/2025) as weekend in all timezones', () => {
      const date = new Date('2025-12-27'); // Saturday
      
      process.env.TZ = 'UTC';
      expect(isWeekend(date)).toBe(true);
      
      process.env.TZ = 'America/New_York';
      expect(isWeekend(date)).toBe(true);
      
      process.env.TZ = 'America/Los_Angeles';
      expect(isWeekend(date)).toBe(true);
    });

    it('should correctly identify Friday (12/26/2025) as weekday in all timezones', () => {
      const date = new Date('2025-12-26'); // Friday
      
      process.env.TZ = 'UTC';
      expect(isWeekend(date)).toBe(false);
      
      process.env.TZ = 'America/New_York';
      expect(isWeekend(date)).toBe(false);
      
      process.env.TZ = 'America/Los_Angeles';
      expect(isWeekend(date)).toBe(false);
    });
  });

  describe('countWorkingDays - Bug Report Case', () => {
    it('should count 3 working days for 12/29/2025 to 12/31/2025 in UTC', () => {
      process.env.TZ = 'UTC';
      const start = new Date('2025-12-29'); // Monday
      const end = new Date('2025-12-31');   // Wednesday
      expect(countWorkingDays(start, end)).toBe(3);
    });

    it('should count 3 working days for 12/29/2025 to 12/31/2025 in America/New_York', () => {
      process.env.TZ = 'America/New_York';
      const start = new Date('2025-12-29'); // Monday
      const end = new Date('2025-12-31');   // Wednesday
      expect(countWorkingDays(start, end)).toBe(3);
    });

    it('should count 3 working days for 12/29/2025 to 12/31/2025 in America/Los_Angeles', () => {
      process.env.TZ = 'America/Los_Angeles';
      const start = new Date('2025-12-29'); // Monday
      const end = new Date('2025-12-31');   // Wednesday
      expect(countWorkingDays(start, end)).toBe(3);
    });

    it('should count 3 working days for 12/29/2025 to 12/31/2025 in Europe/London', () => {
      process.env.TZ = 'Europe/London';
      const start = new Date('2025-12-29'); // Monday
      const end = new Date('2025-12-31');   // Wednesday
      expect(countWorkingDays(start, end)).toBe(3);
    });

    it('should count 3 working days for 12/29/2025 to 12/31/2025 in Asia/Tokyo', () => {
      process.env.TZ = 'Asia/Tokyo';
      const start = new Date('2025-12-29'); // Monday
      const end = new Date('2025-12-31');   // Wednesday
      expect(countWorkingDays(start, end)).toBe(3);
    });
  });

  describe('countWorkingDays - Additional Cases', () => {
    it('should count 3 working days for mid-week dates (12/02/2025 to 12/04/2025) across timezones', () => {
      const start = new Date('2025-12-02'); // Tuesday
      const end = new Date('2025-12-04');   // Thursday
      
      process.env.TZ = 'UTC';
      expect(countWorkingDays(start, end)).toBe(3);
      
      process.env.TZ = 'America/New_York';
      expect(countWorkingDays(start, end)).toBe(3);
      
      process.env.TZ = 'America/Los_Angeles';
      expect(countWorkingDays(start, end)).toBe(3);
    });

    it('should count 1 working day for Friday to Sunday (12/26/2025 to 12/28/2025) across timezones', () => {
      const start = new Date('2025-12-26'); // Friday
      const end = new Date('2025-12-28');   // Sunday
      
      process.env.TZ = 'UTC';
      expect(countWorkingDays(start, end)).toBe(1);
      
      process.env.TZ = 'America/New_York';
      expect(countWorkingDays(start, end)).toBe(1);
      
      process.env.TZ = 'America/Los_Angeles';
      expect(countWorkingDays(start, end)).toBe(1);
    });

    it('should count 1 working day for single Monday (12/29/2025) across timezones', () => {
      const date = new Date('2025-12-29'); // Monday
      
      process.env.TZ = 'UTC';
      expect(countWorkingDays(date, date)).toBe(1);
      
      process.env.TZ = 'America/New_York';
      expect(countWorkingDays(date, date)).toBe(1);
      
      process.env.TZ = 'America/Los_Angeles';
      expect(countWorkingDays(date, date)).toBe(1);
    });

    it('should count 0 working days for single Sunday (12/28/2025) across timezones', () => {
      const date = new Date('2025-12-28'); // Sunday
      
      process.env.TZ = 'UTC';
      expect(countWorkingDays(date, date)).toBe(0);
      
      process.env.TZ = 'America/New_York';
      expect(countWorkingDays(date, date)).toBe(0);
      
      process.env.TZ = 'America/Los_Angeles';
      expect(countWorkingDays(date, date)).toBe(0);
    });

    it('should count 5 working days for full work week (12/29/2025 to 01/02/2026) across timezones', () => {
      const start = new Date('2025-12-29'); // Monday
      const end = new Date('2026-01-02');   // Friday
      
      process.env.TZ = 'UTC';
      expect(countWorkingDays(start, end)).toBe(5);
      
      process.env.TZ = 'America/New_York';
      expect(countWorkingDays(start, end)).toBe(5);
      
      process.env.TZ = 'America/Los_Angeles';
      expect(countWorkingDays(start, end)).toBe(5);
    });
  });

  describe('countWeekendDays', () => {
    it('should count 0 weekend days for 12/29/2025 to 12/31/2025 across timezones', () => {
      const start = new Date('2025-12-29'); // Monday
      const end = new Date('2025-12-31');   // Wednesday
      
      process.env.TZ = 'UTC';
      expect(countWeekendDays(start, end)).toBe(0);
      
      process.env.TZ = 'America/New_York';
      expect(countWeekendDays(start, end)).toBe(0);
      
      process.env.TZ = 'America/Los_Angeles';
      expect(countWeekendDays(start, end)).toBe(0);
    });

    it('should count 2 weekend days for Friday to Sunday (12/26/2025 to 12/28/2025) across timezones', () => {
      const start = new Date('2025-12-26'); // Friday
      const end = new Date('2025-12-28');   // Sunday
      
      process.env.TZ = 'UTC';
      expect(countWeekendDays(start, end)).toBe(2);
      
      process.env.TZ = 'America/New_York';
      expect(countWeekendDays(start, end)).toBe(2);
      
      process.env.TZ = 'America/Los_Angeles';
      expect(countWeekendDays(start, end)).toBe(2);
    });
  });

  describe('Edge cases', () => {
    it('should handle dates at the end of year crossing into new year', () => {
      process.env.TZ = 'UTC';
      const start = new Date('2025-12-30'); // Tuesday
      const end = new Date('2026-01-03');   // Saturday
      // Dec 30 (Tue), Dec 31 (Wed), Jan 1 (Thu), Jan 2 (Fri) = 4 weekdays
      // Jan 3 (Sat) = 1 weekend
      expect(countWorkingDays(start, end)).toBe(4);
      expect(countWeekendDays(start, end)).toBe(1);
    });

    it('should handle Monday after weekend correctly in negative UTC offset', () => {
      process.env.TZ = 'America/Los_Angeles'; // UTC-8
      const monday = new Date('2025-12-29'); // Monday at midnight UTC
      // At midnight UTC, it's still Sunday evening in LA
      // But getUTCDay() should still identify it correctly as Monday
      expect(isWeekend(monday)).toBe(false);
      expect(countWorkingDays(monday, monday)).toBe(1);
    });
  });
});
