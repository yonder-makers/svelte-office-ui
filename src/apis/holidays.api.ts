import { doDelete, doGet, doPost, doPut } from './core/base-api';
import { toWebOfficeFormat } from './core/date-utils';

export type HolidayDto = {
  uid: string;
  rowState: string;
  user: string;
  advice: boolean | string;
  numberOfDays: number;
  decision: boolean | string;
  description: string;
  startDate: string;
  endDate: string;
  createdAt: string;
  modifiedBy: string;
  modifiedDate: string;
  type: 'Legal' | 'Paid' | 'Compensation' | 'Not paid';
};

export enum HolidayType {
  PAID = 1,
  COMPENSATION = 2,
  NOT_PAID = 3,
  LEGAL = 4,
}

export type ApprovalStatus = 'YES' | 'NO' | '?';

export interface HolidayRequest {
  employeeCode?: string;
  startDate: string;
  endDate: string;
  days: number;
  type: HolidayType;
  isAM: boolean;
  description: string;
}

export interface HolidayResponse {
  id: number;
  employeeCode: string;
  employeeName: string;
  requestDate: string;
  startDate: string;
  endDate: string;
  days: number;
  type: HolidayType;
  typeName: string;
  isAM: boolean;
  description: string;
  supervisorAdvice: ApprovalStatus;
  managerDecision: ApprovalStatus;
  status: string;
  canModify: boolean;
  canDelete: boolean;
  modifiedDate: string;
  modifiedBy: string;
}

export interface LegalHoliday {
  day: number;
  month: number;
  description: string;
}

export interface RemainingHolidaysResponse {
  employeeCode?: string;
  total: number;
  used: number;
  remaining: number;
  pending: number;
}

export interface HolidayFilters {
  // New format (for future backend support)
  startDateFrom?: string;
  startDateTo?: string;
  endDateFrom?: string;
  endDateTo?: string;
  // Legacy format (current backend expects these)
  startDate?: string;
  endDate?: string;
}

// Legacy function for compatibility
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

// New CRUD operations
export async function listHolidays(
  filters?: HolidayFilters,
  signal?: AbortSignal
): Promise<HolidayResponse[]> {
  const params: Record<string, string> = {};
  if (filters) {
    Object.entries(filters).forEach(([key, value]) => {
      if (value) params[key] = value;
    });
  }

  return await doGet<HolidayResponse[]>('/api/holidays', params, signal);
}

export async function getHoliday(
  id: number,
  signal?: AbortSignal
): Promise<HolidayResponse> {
  return await doGet<HolidayResponse>(`/api/holidays/${id}`, undefined, signal);
}

export async function createHoliday(
  data: HolidayRequest,
  signal?: AbortSignal
): Promise<HolidayResponse> {
  const transformedData = transformHolidayRequestForBackend(data);
  return await doPost<HolidayResponse>('/api/holidays', transformedData, signal);
}

export async function updateHoliday(
  id: number,
  data: Partial<HolidayRequest>,
  signal?: AbortSignal
): Promise<HolidayResponse> {
  // Transform the fields that need conversion
  const transformedData: any = { ...data };
  if (data.days !== undefined) {
    transformedData.numberOfDays = data.days;
    delete transformedData.days;
  }
  if (data.type !== undefined) {
    transformedData.type = getHolidayTypeForBackend(data.type);
  }
  return await doPut<HolidayResponse>(`/api/holidays/${id}`, transformedData, signal);
}

export async function deleteHoliday(
  id: number | string,
  signal?: AbortSignal
): Promise<void> {
  return await doDelete<void>(`/api/holidays/${id}`, undefined, signal);
}

// Approval endpoints
export async function setAdvice(
  id: number,
  advice: ApprovalStatus,
  signal?: AbortSignal
): Promise<HolidayResponse> {
  return await doPut<HolidayResponse>(
    `/api/holidays/${id}/advice`,
    { advice },
    signal
  );
}

export async function setDecision(
  id: number,
  decision: ApprovalStatus,
  signal?: AbortSignal
): Promise<HolidayResponse> {
  return await doPut<HolidayResponse>(
    `/api/holidays/${id}/decision`,
    { decision },
    signal
  );
}

// Employee info
export async function getRemainingHolidays(
  signal?: AbortSignal
): Promise<RemainingHolidaysResponse> {
  return await doGet<RemainingHolidaysResponse>(
    '/api/employees/me/remaining',
    undefined,
    signal
  );
}

// Lookups
export async function getLegalHolidays(
  signal?: AbortSignal
): Promise<LegalHoliday[]> {
  return await doGet<LegalHoliday[]>('/api/legal-holidays', undefined, signal);
}

export function getHolidayTypeName(type: HolidayType): string {
  const names: Record<HolidayType, string> = {
    [HolidayType.PAID]: 'Paid',
    [HolidayType.COMPENSATION]: 'Compensation',
    [HolidayType.NOT_PAID]: 'Not Paid',
    [HolidayType.LEGAL]: 'Legal',
  };
  return names[type] || 'Unknown';
}

/**
 * Convert HolidayType enum to backend format string
 * Backend expects: 'Paid' | 'Compensation' | 'Not paid' | 'Legal'
 */
export function getHolidayTypeForBackend(type: HolidayType | number): string {
  const typeMap: Record<number, string> = {
    [HolidayType.PAID]: 'Paid',
    [HolidayType.COMPENSATION]: 'Compensation',
    [HolidayType.NOT_PAID]: 'Not paid',  // ✅ lowercase 'paid'
    [HolidayType.LEGAL]: 'Legal',
  };
  return typeMap[type] || 'Paid';
}

/**
 * Transform frontend HolidayRequest to backend format
 * Backend controller expects: numberOfDays, type as string
 */
function transformHolidayRequestForBackend(request: HolidayRequest) {
  return {
    startDate: request.startDate,
    endDate: request.endDate,
    numberOfDays: request.days,  // Convert days → numberOfDays
    type: getHolidayTypeForBackend(request.type),  // Convert enum → string
    description: request.description,
    isAM: request.isAM,
  };
}
