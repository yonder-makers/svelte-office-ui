import { get } from 'svelte/store';
import { fetchCurrentEmployee } from '../../../apis/employee.api';
import {
  createHoliday,
  deleteHoliday,
  fetchHolidays,
  getLegalHolidays,
  getRemainingHolidays,
  listHolidays,
  setAdvice,
  setDecision,
  updateHoliday,
  type ApprovalStatus,
  type HolidayFilters,
  type HolidayRequest
} from '../../../apis/holidays.api';
import {
  currentEmployeeStore,
  currentYearState,
  errorStore,
  holidayRequestsStore,
  holidaysState,
  legalHolidaysStore,
  loadingEmployeeStore,
  loadingHolidaysStore,
  loadingLegalHolidaysStore,
  loadingRemainingStore,
  refreshTriggerStore,
  remainingDaysStore,
  selectedHolidayStore,
  showCareerStatsModalStore,
  showCreateModalStore,
  showEditModalStore,
} from './state';

import { keyBy } from 'lodash';
import { addNotification } from '../../../state/notifications/notifications.state';
import { createAbortable } from '../../../utils/create-abortable';
import { formatDateForWebOffice } from '../../../utils/holiday-date-utils';

export function goNextYear() {
  currentYearState.update((year) => year + 1);
}

export function goPreviousYear() {
  currentYearState.update((year) => year - 1);
}

export const refreshData = createAbortable(async (signal: AbortSignal) => {
  const startDate = new Date(get(currentYearState), 0, 1);
  const endDate = new Date(get(currentYearState), 11, 31);

  const holidays = await fetchHolidays(startDate, endDate, signal);

  holidaysState.update((state) => {
    return {
      ...state,
      byId: keyBy(holidays, (h) => h.uid),
      allIds: holidays.map((h) => h.uid),
    };
  });
});

// New actions for full holiday management
export async function loadHolidayRequests(filters?: HolidayFilters) {
  try {
    loadingHolidaysStore.set(true);
    errorStore.set(null);
    console.log('[loadHolidayRequests] Fetching with filters:', filters);
    const requests = await listHolidays(filters);
    console.log('[loadHolidayRequests] Received', requests.length, 'holidays');
    holidayRequestsStore.set(requests);
  } catch (error) {
    console.warn('Holiday requests endpoint not available:', error);
    errorStore.set(
      'Holiday API endpoints not yet implemented. Please implement the backend endpoints according to HOLIDAY_MIGRATION_GUIDE.md'
    );
    holidayRequestsStore.set([]);
  } finally {
    loadingHolidaysStore.set(false);
  }
}

export async function loadRemainingDays() {
  try {
    loadingRemainingStore.set(true);
    const remaining = await getRemainingHolidays();
    remainingDaysStore.set(remaining);
  } catch (error) {
    console.error('Failed to load remaining days:', error);
    // Set default values on error
    remainingDaysStore.set({
      total: 0,
      used: 0,
      remaining: 0,
      pending: 0,
    });
  } finally {
    loadingRemainingStore.set(false);
  }
}

export async function loadLegalHolidays() {
  try {
    loadingLegalHolidaysStore.set(true);
    const legal = await getLegalHolidays();
    legalHolidaysStore.set(legal);
  } catch (error) {
    console.warn('Legal holidays endpoint not available:', error);
    // Set empty array if endpoint doesn't exist
    legalHolidaysStore.set([]);
  } finally {
    loadingLegalHolidaysStore.set(false);
  }
}

export async function loadCurrentEmployee() {
  try {
    loadingEmployeeStore.set(true);
    const employee = await fetchCurrentEmployee();
    currentEmployeeStore.set(employee);
  } catch (error) {
    console.warn('Current employee endpoint not available:', error);
    currentEmployeeStore.set(null);
  } finally {
    loadingEmployeeStore.set(false);
  }
}

export async function createNewHoliday(data: HolidayRequest) {
  try {
    errorStore.set(null);
    await createHoliday(data);
    await triggerRefresh();
    showCreateModalStore.set(false);
    addNotification(
      'Holiday Created',
      'Your holiday request has been submitted successfully',
      new Date().toLocaleString(),
      'success'
    );
  } catch (error) {
    errorStore.set(
      error instanceof Error ? error.message : 'Failed to create holiday'
    );
    addNotification(
      'Error',
      error instanceof Error ? error.message : 'Failed to create holiday',
      new Date().toLocaleString(),
      'error'
    );
    throw error;
  }
}

export async function updateExistingHoliday(
  id: number,
  data: Partial<HolidayRequest>
) {
  try {
    errorStore.set(null);
    await updateHoliday(id, data);
    await triggerRefresh();
    showEditModalStore.set(false);
    selectedHolidayStore.set(null);
    addNotification(
      'Holiday Updated',
      'Your holiday request has been updated successfully',
      new Date().toLocaleString(),
      'success'
    );
  } catch (error) {
    errorStore.set(
      error instanceof Error ? error.message : 'Failed to update holiday'
    );
    addNotification(
      'Error',
      error instanceof Error ? error.message : 'Failed to update holiday',
      new Date().toLocaleString(),
      'error'
    );
    throw error;
  }
}

export async function deleteExistingHoliday(id: number | string) {
  try {
    errorStore.set(null);
    await deleteHoliday(id);
    await triggerRefresh();
    addNotification(
      'Holiday Deleted',
      'Your holiday request has been deleted successfully',
      new Date().toLocaleString(),
      'success'
    );
  } catch (error) {
    errorStore.set(
      error instanceof Error ? error.message : 'Failed to delete holiday'
    );
    addNotification(
      'Error',
      error instanceof Error ? error.message : 'Failed to delete holiday',
      new Date().toLocaleString(),
      'error'
    );
    throw error;
  }
}

export function openCreateModal() {
  showCreateModalStore.set(true);
}

export function closeCreateModal() {
  showCreateModalStore.set(false);
}

export function openEditModal(holiday: any) {
  selectedHolidayStore.set(holiday);
  showEditModalStore.set(true);
}

export function closeEditModal() {
  showEditModalStore.set(false);
  selectedHolidayStore.set(null);
}

export function openCareerStatsModal() {
  showCareerStatsModalStore.set(true);
}

export function closeCareerStatsModal() {
  showCareerStatsModalStore.set(false);
}

export async function triggerRefresh() {
  refreshTriggerStore.update((n) => n + 1);
  const year = get(currentYearState);
  console.log('[triggerRefresh] Year:', year);

  // Backend expects startDate/endDate in dd-MM-yyyy format (WebOffice format)
  const filters: HolidayFilters = {
    startDate: formatDateForWebOffice(new Date(year, 0, 1)),
    endDate: formatDateForWebOffice(new Date(year, 11, 31)),
  };
  console.log('[triggerRefresh] Built filters:', filters);
  await Promise.all([
    loadHolidayRequests(filters),
    loadRemainingDays(),
    loadCurrentEmployee()
  ]);
}

// Approval workflow actions
export async function updateHolidayAdvice(
  id: number,
  advice: ApprovalStatus
) {
  try {
    errorStore.set(null);
    await setAdvice(id, advice);
    await triggerRefresh();
    addNotification(
      'Advice Updated',
      `Holiday advice has been set to ${advice}`,
      new Date().toLocaleString(),
      'success'
    );
  } catch (error) {
    errorStore.set(
      error instanceof Error ? error.message : 'Failed to update advice'
    );
    addNotification(
      'Error',
      error instanceof Error ? error.message : 'Failed to update advice',
      new Date().toLocaleString(),
      'error'
    );
    throw error;
  }
}

export async function updateHolidayDecision(
  id: number,
  decision: ApprovalStatus
) {
  try {
    errorStore.set(null);
    await setDecision(id, decision);
    await triggerRefresh();
    addNotification(
      'Decision Updated',
      `Holiday decision has been set to ${decision}`,
      new Date().toLocaleString(),
      'success'
    );
  } catch (error) {
    errorStore.set(
      error instanceof Error ? error.message : 'Failed to update decision'
    );
    addNotification(
      'Error',
      error instanceof Error ? error.message : 'Failed to update decision',
      new Date().toLocaleString(),
      'error'
    );
    throw error;
  }
}
