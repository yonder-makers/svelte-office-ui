import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { parseDateFromWebOffice } from '../src/utils/holiday-date-utils';

describe('parseDateFromWebOffice - Timezone Consistency Bug Fix', () => {
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

  describe('UTC date creation', () => {
    it('should create dates at midnight UTC regardless of timezone', () => {
      const dateStr = '29-12-2025';
      
      // Test in UTC
      process.env.TZ = 'UTC';
      const dateUTC = parseDateFromWebOffice(dateStr);
      expect(dateUTC.toUTCString()).toBe('Mon, 29 Dec 2025 00:00:00 GMT');
      expect(dateUTC.getUTCHours()).toBe(0);
      expect(dateUTC.getUTCMinutes()).toBe(0);
      expect(dateUTC.getUTCSeconds()).toBe(0);
      
      // Test in Australia/Sydney (UTC+11 in Dec)
      process.env.TZ = 'Australia/Sydney';
      const dateSydney = parseDateFromWebOffice(dateStr);
      expect(dateSydney.toUTCString()).toBe('Mon, 29 Dec 2025 00:00:00 GMT');
      expect(dateSydney.getUTCHours()).toBe(0);
      
      // Test in America/Los_Angeles (UTC-8 in Dec)
      process.env.TZ = 'America/Los_Angeles';
      const dateLA = parseDateFromWebOffice(dateStr);
      expect(dateLA.toUTCString()).toBe('Mon, 29 Dec 2025 00:00:00 GMT');
      expect(dateLA.getUTCHours()).toBe(0);
      
      // All should represent the same instant in time
      expect(dateUTC.getTime()).toBe(dateSydney.getTime());
      expect(dateUTC.getTime()).toBe(dateLA.getTime());
    });

    it('should parse DD-MM-YYYY format correctly', () => {
      const testCases = [
        { input: '01-01-2025', expectedUTC: 'Wed, 01 Jan 2025 00:00:00 GMT' },
        { input: '15-06-2025', expectedUTC: 'Sun, 15 Jun 2025 00:00:00 GMT' },
        { input: '31-12-2025', expectedUTC: 'Wed, 31 Dec 2025 00:00:00 GMT' },
      ];

      testCases.forEach(({ input, expectedUTC }) => {
        const date = parseDateFromWebOffice(input);
        expect(date.toUTCString()).toBe(expectedUTC);
      });
    });
  });

  describe('getUTCDay() consistency', () => {
    it('should have consistent UTC day-of-week across timezones', () => {
      // Monday 29-12-2025
      process.env.TZ = 'UTC';
      expect(parseDateFromWebOffice('29-12-2025').getUTCDay()).toBe(1); // Monday

      process.env.TZ = 'Australia/Sydney';
      expect(parseDateFromWebOffice('29-12-2025').getUTCDay()).toBe(1); // Monday

      process.env.TZ = 'America/Los_Angeles';
      expect(parseDateFromWebOffice('29-12-2025').getUTCDay()).toBe(1); // Monday

      process.env.TZ = 'Europe/London';
      expect(parseDateFromWebOffice('29-12-2025').getUTCDay()).toBe(1); // Monday

      // Sunday 28-12-2025
      process.env.TZ = 'UTC';
      expect(parseDateFromWebOffice('28-12-2025').getUTCDay()).toBe(0); // Sunday

      process.env.TZ = 'Australia/Sydney';
      expect(parseDateFromWebOffice('28-12-2025').getUTCDay()).toBe(0); // Sunday

      process.env.TZ = 'America/Los_Angeles';
      expect(parseDateFromWebOffice('28-12-2025').getUTCDay()).toBe(0); // Sunday
    });
  });

  describe('Edge cases', () => {
    it('should handle empty string', () => {
      const result = parseDateFromWebOffice('');
      expect(result).toBeInstanceOf(Date);
      // Should return new Date() which is the current time
    });

    it('should handle invalid DD-MM-YYYY format by falling back to parseISO', () => {
      const isoDate = '2025-12-29'; // YYYY-MM-DD format
      const result = parseDateFromWebOffice(isoDate);
      expect(result).toBeInstanceOf(Date);
      expect(result.getUTCFullYear()).toBe(2025);
      expect(result.getUTCMonth()).toBe(11); // December (0-indexed)
      expect(result.getUTCDate()).toBe(29);
    });

    it('should parse various date formats', () => {
      // DD-MM-YYYY format (primary)
      const webOffice = parseDateFromWebOffice('15-06-2025');
      expect(webOffice.getUTCDate()).toBe(15);
      expect(webOffice.getUTCMonth()).toBe(5); // June (0-indexed)
      expect(webOffice.getUTCFullYear()).toBe(2025);
      
      // ISO format (fallback)
      const iso = parseDateFromWebOffice('2025-06-15');
      expect(iso.getUTCDate()).toBe(15);
      expect(iso.getUTCMonth()).toBe(5);
      expect(iso.getUTCFullYear()).toBe(2025);
    });
  });

  describe('Consistency with isWeekend and countWorkingDays', () => {
    // Helper function (matches the actual implementation)
    function isWeekend(date: Date): boolean {
      const day = date.getUTCDay();
      return day === 0 || day === 6;
    }

    it('should correctly identify weekends when used with isWeekend in all timezones', () => {
      const timezones = ['UTC', 'Australia/Sydney', 'America/Los_Angeles', 'Europe/London'];
      
      timezones.forEach((tz) => {
        process.env.TZ = tz;
        
        // Monday should not be weekend
        expect(isWeekend(parseDateFromWebOffice('29-12-2025'))).toBe(false);
        
        // Sunday should be weekend
        expect(isWeekend(parseDateFromWebOffice('28-12-2025'))).toBe(true);
        
        // Saturday should be weekend
        expect(isWeekend(parseDateFromWebOffice('27-12-2025'))).toBe(true);
        
        // Friday should not be weekend
        expect(isWeekend(parseDateFromWebOffice('26-12-2025'))).toBe(false);
      });
    });
  });
});
