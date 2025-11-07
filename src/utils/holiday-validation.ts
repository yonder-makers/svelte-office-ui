import type {
  HolidayRequest,
  HolidayResponse,
  HolidayType,
  LegalHoliday,
  RemainingHolidaysResponse,
} from '../apis/holidays.api';
import {
  countWeekendDays,
  countWorkingDays,
  findOverlappingRequest,
  isAllowedOverlap,
  overlapsLegalHoliday,
  parseDate,
  parseDateFromWebOffice,
} from './holiday-date-utils';

export interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings?: string[];
}

export interface ValidationContext {
  existingRequests: HolidayResponse[];
  legalHolidays: LegalHoliday[];
  remainingDays?: RemainingHolidaysResponse;
}

/**
 * Validate a holiday request according to business rules
 */
export async function validateHolidayRequest(
  request: HolidayRequest,
  context: ValidationContext
): Promise<ValidationResult> {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Parse dates - handle both DD-MM-YYYY (WebOffice) and ISO formats
  // Try WebOffice format first (DD-MM-YYYY), fall back to ISO
  let startDate: Date;
  let endDate: Date;

  try {
    startDate = parseDateFromWebOffice(request.startDate);
    endDate = parseDateFromWebOffice(request.endDate);
  } catch (e) {
    console.warn('Failed to parse dates as WebOffice format, trying ISO:', e);
    startDate = parseDate(request.startDate);
    endDate = parseDate(request.endDate);
  }

  console.log('[validateHolidayRequest] Parsed dates:', {
    input: { startDate: request.startDate, endDate: request.endDate },
    parsed: { startDate, endDate }
  });

  // 1. Date Validation
  if (!request.startDate) {
    errors.push('Start date is required');
  }
  if (!request.endDate) {
    errors.push('End date is required');
  }

  // Check if dates are valid Date objects
  if (isNaN(startDate.getTime())) {
    errors.push(`Invalid start date: "${request.startDate}". Expected format: DD-MM-YYYY`);
    return { valid: false, errors, warnings };
  }
  if (isNaN(endDate.getTime())) {
    errors.push(`Invalid end date: "${request.endDate}". Expected format: DD-MM-YYYY`);
    return { valid: false, errors, warnings };
  }

  if (request.startDate && request.endDate && endDate < startDate) {
    errors.push('End date must be on or after start date');
  }

  // 2. Days Validation
  if (!request.days || request.days < 0.5) {
    errors.push('Minimum 0.5 days required');
  } else {
    // For < 1 day: Only 0.5 allowed
    if (request.days < 1 && request.days !== 0.5) {
      errors.push('For less than 1 day, only 0.5 is allowed');
    }
    // For >= 1 day: Must be integer
    if (request.days >= 1 && request.days % 1 !== 0) {
      errors.push('For 1 day or more, must be a whole number');
    }
  }

  // Check weekend days
  try {
    const weekendDays = countWeekendDays(startDate, endDate);
    if (weekendDays > 0) {
      warnings.push(
        `Period includes ${weekendDays} weekend day(s) - they are not counted`
      );
    }

    // Validate days match timeline
    const calculatedDays = countWorkingDays(startDate, endDate);
    if (Math.abs(calculatedDays - request.days) > 0.1) {
      warnings.push(
        `Calculated ${calculatedDays} working days, but ${request.days} entered`
      );
    }
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : 'Unknown error';
    console.error('[validateHolidayRequest] Error calculating days:', errorMsg);
    errors.push(`Unable to process date range: ${errorMsg}`);
    return { valid: false, errors, warnings };
  }

  // 3. Legal Holiday Check
  if (overlapsLegalHoliday(startDate, endDate, context.legalHolidays)) {
    errors.push(
      'Period overlaps with legal holiday - please split your request'
    );
  }

  // 4. Overlap Detection
  const overlap = findOverlappingRequest(request, context.existingRequests);
  if (overlap) {
    // Special case: 0.5 Paid + 0.5 Comp on same day is allowed
    if (
      !isAllowedOverlap(
        {
          ...request,
          type: request.type as number,
        },
        {
          startDate: overlap.startDate,
          endDate: overlap.endDate,
          days: overlap.days,
          type: overlap.type as number,
        }
      )
    ) {
      errors.push(
        `Request overlaps with existing holiday request from ${overlap.startDate} to ${overlap.endDate}`
      );
    }
  }

  // 5. Remaining Holiday Check (only for Paid holidays)
  if (request.type === 1 && context.remainingDays) {
    // type=1 is Paid
    if (request.days > context.remainingDays.remaining) {
      errors.push(
        `Insufficient remaining days. Available: ${context.remainingDays.remaining.toFixed(
          1
        )}, Requested: ${request.days}`
      );
    }
  }

  // 6. Description Check
  if (!request.description || request.description.trim().length === 0) {
    errors.push('Description is required');
  } else if (request.description.length > 50) {
    errors.push('Description must be 50 characters or less');
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings: warnings.length > 0 ? warnings : undefined,
  };
}

/**
 * Validate if a holiday request can be modified
 */
export function canModifyRequest(request: HolidayResponse): boolean {
  // Cannot modify approved requests (dec = YES)
  return request.managerDecision !== 'YES';
}

/**
 * Validate if a holiday request can be deleted
 */
export function canDeleteRequest(request: HolidayResponse): boolean {
  // Cannot delete approved requests
  return request.managerDecision !== 'YES';
}

/**
 * Get validation error message for a specific field
 */
export function getFieldError(
  fieldName: string,
  validationResult: ValidationResult
): string | null {
  const error = validationResult.errors.find((err) =>
    err.toLowerCase().includes(fieldName.toLowerCase())
  );
  return error || null;
}

/**
 * Check if user can auto-approve their own request
 * Auto-approval: If requester is supervisor AND days <= 1
 */
export function canAutoApprove(
  isSupervisor: boolean,
  days: number
): boolean {
  return isSupervisor && days <= 1;
}
