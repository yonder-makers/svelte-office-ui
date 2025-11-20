<script lang="ts">
  import {
    Button,
    ComposedModal,
    InlineNotification,
    ModalBody,
    ModalFooter,
    ModalHeader,
    RadioButton,
    RadioButtonGroup,
    Checkbox,
    TextArea,
  } from 'carbon-components-svelte';
  import { HolidayType } from '../../../apis/holidays.api';
  import { updateExistingHoliday, closeEditModal } from '../store';
  import {
    remainingDaysStore,
    showEditModalStore,
    selectedHolidayStore,
    holidayRequestsStore,
    legalHolidaysStore
  } from '../store/state';
  import { validateHolidayRequest } from '../../../utils/holiday-validation';
  import { formatDateForWebOffice } from '../../../utils/holiday-date-utils';

  // Helper function to parse holiday ID (handles hex strings and numbers)
  function parseHolidayId(id: string | number | null | undefined): number | null {
    if (id === null || id === undefined) return null;
    if (typeof id === 'number') return id;
    if (typeof id === 'string') {
      return id.startsWith('0x') ? parseInt(id, 16) : parseInt(id, 10);
    }
    return null;
  }

  // Form state (always in YYYY-MM-DD format internally)
  let startDate = '';
  let endDate = '';
  let days = 1;
  let type = HolidayType.PAID;
  let isAM = true;
  let isHalfDay = false;
  let description = '';
  let isSubmitting = false;
  let formError = '';
  let validationWarnings: string[] = [];
  let holidayId: number | null = null;
  let lastLoadedHolidayId: number | null = null;
  let showHalfDaySelector = false;
  let isInitialLoad = false;
  let exceedsAvailable = false;
  let overlapWarning: string | null = null;
  let originalStartDate = '';
  let originalEndDate = '';
  let originalDays = 0;

  // Get remaining days from store
  $: remainingDays = $remainingDaysStore.remaining;

  // Convert DD-MM-YYYY to YYYY-MM-DD
  function toIsoDate(dateStr: string): string {
    if (!dateStr) return '';

    // DD-MM-YYYY format
    const ddMmYyyy = dateStr.match(/^(\d{2})-(\d{2})-(\d{4})$/);
    if (ddMmYyyy) {
      const [, day, month, year] = ddMmYyyy;
      return `${year}-${month}-${day}`;
    }

    // Already in YYYY-MM-DD format
    const yyyyMmDd = dateStr.match(/^(\d{4})-(\d{2})-(\d{2})/);
    if (yyyyMmDd) {
      return dateStr.substring(0, 10);
    }

    // Try parsing as ISO datetime
    try {
      const date = new Date(dateStr);
      if (!isNaN(date.getTime())) {
        return date.toISOString().split('T')[0];
      }
    } catch (e) {
      // Ignore
    }

    return dateStr;
  }

  // Handle date picker changes
  function handleDateChange(e: CustomEvent) {
    const selectedDates = e.detail.selectedDates;
    if (selectedDates && selectedDates.length > 0) {
      startDate = selectedDates[0].toISOString().split('T')[0];
      // For range picker: if 2 dates selected use second, otherwise use first (same day)
      const end = selectedDates.length === 2 ? selectedDates[1] : selectedDates[0];
      endDate = end.toISOString().split('T')[0];
    }
  }

  // Convert YYYY-MM-DD to DD-MM-YYYY
  function toBackendDate(dateStr: string): string {
    if (!dateStr) return '';
    const [year, month, day] = dateStr.split('-');
    return `${day}-${month}-${year}`;
  }

  // Calculate working days between two dates
  function calculateWorkingDays(start: Date, end: Date): number {
    let count = 0;
    const current = new Date(start);

    while (current <= end) {
      const day = current.getUTCDay();
      if (day !== 0 && day !== 6) { // Skip weekends
        count++;
      }
      current.setDate(current.getDate() + 1);
    }

    return count;
  }

  // Load selected holiday into form when modal opens
  $: if ($selectedHolidayStore && $showEditModalStore && (($selectedHolidayStore as any).id ?? ($selectedHolidayStore as any).uid) !== lastLoadedHolidayId) {
    const holiday = $selectedHolidayStore;
    lastLoadedHolidayId = (holiday as any).id ?? (holiday as any).uid;

    // Convert dates to YYYY-MM-DD format for native date inputs
    startDate = toIsoDate(holiday.startDate);
    endDate = toIsoDate(holiday.endDate);
    originalStartDate = startDate;
    originalEndDate = endDate;

    // Load days and type (handle both 'days' and 'numberOfDays')
    days = (holiday.days ?? holiday.numberOfDays) ?? 1;
    originalDays = days;

    if (typeof holiday.type === 'number') {
      type = holiday.type;
    } else if (typeof holiday.type === 'string') {
      const typeMap: Record<string, HolidayType> = {
        'Paid': HolidayType.PAID,
        'Compensation': HolidayType.COMPENSATION,
        'Not Paid': HolidayType.NOT_PAID,
        'Not paid': HolidayType.NOT_PAID,
        'Unpaid': HolidayType.NOT_PAID,
        'Legal': HolidayType.LEGAL
      };
      type = typeMap[holiday.type] ?? HolidayType.PAID;
    } else {
      type = HolidayType.PAID;
    }

    // Load isAM flag
    isAM = typeof holiday.isAM === 'boolean' ? holiday.isAM : true;
    isHalfDay = ((holiday.days ?? holiday.numberOfDays) ?? 1) === 0.5;

    description = holiday.description || '';
    holidayId = (holiday as any).id ?? (holiday as any).uid;
    isInitialLoad = false;
  }

  // Auto-calculate days based on range + half-day toggle
  $: {
    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      const isSameDay = !isNaN(start.getTime()) && !isNaN(end.getTime()) && start.toDateString() === end.toDateString();

      if (isSameDay) {
        days = isHalfDay ? 0.5 : 1;
      } else if (!isNaN(start.getTime()) && !isNaN(end.getTime()) && end >= start) {
        // Reset half-day if user expanded to multiple days
        if (isHalfDay) isHalfDay = false;
        days = calculateWorkingDays(start, end);
      }
    }
  }

  // Show half-day checkbox only when a single day is selected
  $: {
    const start = new Date(startDate);
    const end = new Date(endDate);
    showHalfDaySelector = !isNaN(start.getTime()) && !isNaN(end.getTime()) && start.toDateString() === end.toDateString();
  }

  // Check if exceeds available days (only for Paid)
  // When editing: remaining + original days = effective available for this edit
  $: {
    const effectiveRemaining = remainingDays + originalDays;
    exceedsAvailable = type === HolidayType.PAID && days > effectiveRemaining;
  }
  $: showRemainingWarning = type === HolidayType.PAID && days > 0;

  // Check for overlaps reactively as dates change (only if dates differ from original)
  $: {
    overlapWarning = null;
    if (startDate && endDate && holidayId && !isInitialLoad && (startDate !== originalStartDate || endDate !== originalEndDate)) {
      const newStart = new Date(startDate + 'T00:00:00');
      const newEnd = new Date(endDate + 'T23:59:59');
      
      const numericHolidayId = parseHolidayId(holidayId);

      let found = false;
      
      for (let i = 0; i < $holidayRequestsStore.length; i++) {
        const other = $holidayRequestsStore[i];
        
        // Get ID from 'id' field or fallback to 'uid' (from API response)
        const otherId = (other as any).id ?? (other as any).uid;
        const parsedOtherId = parseHolidayId(otherId);

        if (parsedOtherId === numericHolidayId) {
          continue;
        }
        
        if (!other.startDate || !other.endDate) {
          continue;
        }

        // Parse as DD-MM-YYYY
        const [d1, m1, y1] = other.startDate.split('-').map(Number);
        const [d2, m2, y2] = other.endDate.split('-').map(Number);
        
        const otherStart = new Date(y1, m1 - 1, d1, 0, 0, 0);
        const otherEnd = new Date(y2, m2 - 1, d2, 23, 59, 59);
        
        const overlaps = !(newEnd < otherStart || newStart > otherEnd);

        if (overlaps) {
          const formatDate = (d: Date) => {
            const day = String(d.getDate()).padStart(2, '0');
            const month = String(d.getMonth() + 1).padStart(2, '0');
            const year = d.getFullYear();
            return `${day}-${month}-${year}`;
          };
          overlapWarning = `Overlaps with existing holiday from ${formatDate(otherStart)} to ${formatDate(otherEnd)}`;
          found = true;
          break;
        }
      }
      
      if (!found) {
        // No overlaps
      }
    }
  }

  async function handleSubmit() {
    formError = '';
    validationWarnings = [];

    if (!holidayId) {
      formError = 'No holiday selected for editing';
      return;
    }

    // Validation checks
    if (!startDate || !endDate) {
      formError = 'Start date and end date are required';
      return;
    }

    const start = new Date(startDate);
    const end = new Date(endDate);
    if (start > end) {
      formError = 'Start date cannot be after end date';
      return;
    }

    if (!description.trim()) {
      formError = 'Description is required';
      return;
    }

    if (overlapWarning) {
      formError = overlapWarning;
      return;
    }

    // Exclude current holiday from overlap check
    const otherRequests = $holidayRequestsStore.filter(r => {
      const rId = (r as any).id ?? (r as any).uid;
      return rId !== holidayId;
    });

    console.log('[HolidayEditModal] Overlap check:', {
      holidayId,
      totalRequests: $holidayRequestsStore.length,
      excludedRequests: otherRequests.length,
      requestDates: { startDate, endDate },
    });

    // When editing, calculate effective remaining:
    // Current remaining + original days (freed up) = what's available for this edit
    // So if you had 7 days pending and 0 left, you can use up to 7 days
    // Use originalDays that was saved when the modal loaded
    const adjustedRemainingDays = {
      ...$remainingDaysStore,
      remaining: $remainingDaysStore.remaining + originalDays,
    };

    // Manual overlap check
    const newStart = new Date(startDate);
    const newEnd = new Date(endDate);
    
    // Safety check - make sure dates are valid
    if (isNaN(newStart.getTime()) || isNaN(newEnd.getTime())) {
      formError = 'Invalid dates provided';
      return;
    }
    
    console.log('[HolidayEditModal] Checking overlaps for:', {
      newStart: startDate,
      newEnd: endDate,
      parsedStart: newStart.toISOString(),
      parsedEnd: newEnd.toISOString(),
    });

    for (const other of otherRequests) {
      const otherStart = new Date(other.startDate);
      const otherEnd = new Date(other.endDate);
      
      // Skip if dates are invalid
      if (isNaN(otherStart.getTime()) || isNaN(otherEnd.getTime())) {
        continue;
      }
      
      const overlaps = !(newEnd < otherStart || newStart > otherEnd);
    }

    // Run comprehensive validation
    const validationResult = await validateHolidayRequest(
      {
        startDate,
        endDate,
        days,
        type,
        description,
        isAM,
      },
      {
        existingRequests: otherRequests,
        legalHolidays: $legalHolidaysStore,
        remainingDays: adjustedRemainingDays,
      }
    );

    if (!validationResult.valid) {
      formError = validationResult.errors.join('. ');
      return;
    }

    if (validationResult.warnings && validationResult.warnings.length > 0) {
      validationWarnings = validationResult.warnings;
    }

    isSubmitting = true;

    try {
      // Convert dates to DD-MM-YYYY format for backend
      const backendStartDate = toBackendDate(startDate);
      const backendEndDate = toBackendDate(endDate);

      await updateExistingHoliday(holidayId, {
        startDate: backendStartDate,
        endDate: backendEndDate,
        days,
        type,
        isAM,
        description: description.trim(),
      });

      // Close modal on success
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to update holiday request';
      
      // Provide more helpful message for overlap errors
      if (errorMessage.includes('overlap') || errorMessage.includes('Overlap')) {
        formError = 'Holiday period overlaps with existing request. Please choose different dates.';
      } else {
        formError = errorMessage;
      }
    } finally {
      isSubmitting = false;
    }
  }

  function handleClose() {
    formError = '';
    validationWarnings = [];
    lastLoadedHolidayId = null;
    startDate = '';
    endDate = '';
    originalStartDate = '';
    originalEndDate = '';
    days = 1;
    originalDays = 0;
    type = HolidayType.PAID;
    isAM = true;
    isHalfDay = false;
    isInitialLoad = false;
    description = '';
    holidayId = null;
    closeEditModal();
  }
</script>

<ComposedModal
  open={$showEditModalStore}
  on:close={handleClose}
  preventCloseOnClickOutside={isSubmitting}
  size="default"
  hasForm
>
  <ModalHeader title="Edit Holiday Request" />

  <ModalBody hasForm>
    {#if isSubmitting}
      <div class="loading-overlay">
        <div class="loading-content">
          <div class="loading-spinner"></div>
          <p class="loading-text">Updating your request...</p>
        </div>
      </div>
    {/if}
    {#key holidayId}
      <form on:submit|preventDefault={handleSubmit} id="holiday-edit-form" class="holiday-form" class:form-submitting={isSubmitting}>
        {#if formError}
          <InlineNotification
            kind="error"
            title="Error"
            subtitle={formError}
            lowContrast
            hideCloseButton
          />
        {/if}

        {#if validationWarnings.length > 0}
          {#each validationWarnings as warning}
            <InlineNotification
              kind="warning"
              title="Warning"
              subtitle={warning}
              lowContrast
              hideCloseButton
            />
          {/each}
        {/if}

        {#if overlapWarning}
          <InlineNotification
            kind="error"
            title="Date Overlap Detected"
            subtitle={overlapWarning}
            lowContrast
            hideCloseButton
          />
        {/if}

        <div class="form-section compact">
          <div class="section-header merged">
            <span class="section-icon">📅</span>
            <h4 class="section-title">Dates & Duration</h4>
          </div>
          <div class="date-duration-row">
            <div class="date-picker-col">
              <div class="date-inputs">
                <div class="date-field">
                  <label for="start-date" class="bx--label">Start Date</label>
                  <input
                    id="start-date"
                    type="date"
                    class="bx--text-input date-input"
                    bind:value={startDate}
                    required
                  />
                </div>
                <div class="date-field">
                  <label for="end-date" class="bx--label">End Date</label>
                  <input
                    id="end-date"
                    type="date"
                    class="bx--text-input date-input"
                    bind:value={endDate}
                    min={startDate}
                    required
                  />
                </div>
              </div>
            </div>
            <div class="days-info-col">
              <div class="days-info" aria-live="polite">
                {#if showHalfDaySelector}
                  <div class="days-row half-day-toggle">
                    <Checkbox bind:checked={isHalfDay} labelText="Half day" id="half-day-checkbox" />
                  </div>
                {/if}
                {#if exceedsAvailable}
                  <div class="error-text">Exceeds available ({(remainingDays + originalDays).toFixed(1)} max)</div>
                {/if}
              </div>
            </div>
          </div>
          {#if showRemainingWarning}
            {@const currentHoliday = $holidayRequestsStore.find(r => r.id === holidayId)}
            {@const currentDays = currentHoliday?.days ?? (currentHoliday?.numberOfDays ?? 0)}
            {@const effectiveRemaining = remainingDays + currentDays}
            <div class="balance-card" class:warning={exceedsAvailable}>
              <div class="balance-header">
                <span class="balance-icon">{exceedsAvailable ? '⚠️' : '✅'}</span>
                <span class="balance-title">{exceedsAvailable ? 'Insufficient Balance' : 'Balance Check'}</span>
              </div>
              <div class="balance-stats">
                <div class="balance-stat">
                  <span class="balance-label">Available for Edit</span>
                  <span class="balance-value">{(remainingDays + originalDays).toFixed(1)} days</span>
                </div>
                <div class="balance-stat">
                  <span class="balance-label">Requesting</span>
                  <span class="balance-value requesting">{days} days</span>
                </div>
                {#if exceedsAvailable}
                  <div class="balance-stat">
                    <span class="balance-label">Over by</span>
                    <span class="balance-value error">{(days - effectiveRemaining).toFixed(1)} days</span>
                  </div>
                {/if}
              </div>
            </div>
          {/if}
        </div>

        <div class="form-section">
          <div class="section-header">
            <span class="section-icon">🏷️</span>
            <h4 class="section-title">Type & Details</h4>
          </div>
          <RadioButtonGroup
            legendText="Holiday Type"
            bind:selected={type}
          >
            <RadioButton
              labelText="💰 Paid Leave"
              value={HolidayType.PAID}
            />
            <RadioButton
              labelText="🔄 Compensation Time"
              value={HolidayType.COMPENSATION}
            />
            <RadioButton
              labelText="💸 Unpaid Leave"
              value={HolidayType.NOT_PAID}
            />
          </RadioButtonGroup>

          <!-- Removed AM/PM selector per design simplification -->

          <TextArea
            labelText="Description"
            placeholder="Please provide a reason for your holiday request..."
            bind:value={description}
            maxCount={50}
            required
            helperText={`${description.length}/50 characters`}
          />
        </div>
      </form>
    {/key}
  </ModalBody>

  <ModalFooter>
    <Button kind="secondary" on:click={handleClose} disabled={isSubmitting}>
      Cancel
    </Button>
    <Button
      kind="primary"
      type="submit"
      form="holiday-edit-form"
      disabled={isSubmitting}
    >
      {isSubmitting ? 'Updating...' : 'Update Request'}
    </Button>
  </ModalFooter>
</ComposedModal>

<style>
  .holiday-form {
    display: flex;
    flex-direction: column;
    gap: 1.75rem;
  }

  .form-section {
    background: linear-gradient(135deg, var(--custom-bg-secondary) 0%, var(--custom-bg) 100%);
    border-radius: 12px;
    padding: 1.25rem 1.25rem 1rem;
    border: 1px solid var(--custom-border);
  }

  .form-section.compact .section-header.merged {
    margin-bottom: 0.75rem;
  }

  .date-duration-row {
    display: flex;
    gap: 1.25rem;
    flex-wrap: wrap;
  }
  .date-picker-col {
    flex: 1 1 250px;
    min-width: 240px;
  }
  .days-info-col {
    flex: 1 1 220px;
    min-width: 210px;
    display: flex;
  }
  .days-info-col .days-info {
    width: 100%;
  }
  @media (max-width: 700px) {
    .date-duration-row {
      flex-direction: column;
    }
  }

  .section-header {
    display: flex;
    align-items: center;
    gap: 1rem;
    margin-bottom: 1.25rem;
  }

  .section-icon {
    font-size: 1.5rem;
  }

  .section-title {
    font-size: 1.05rem;
    font-weight: 600;
    margin: 0;
  }

  .date-inputs {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1rem;
  }

  .date-field {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .date-input {
    padding: 0.5rem;
    border: 1px solid var(--cds-border-subtle, #d0d0d0);
    border-radius: 4px;
    font-size: 1rem;
  }

  .days-info {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    padding: 1rem 1.25rem;
    background: var(--custom-bg-secondary);
    border: 1px solid var(--custom-border);
    border-radius: 10px;
  }
  .days-row {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    flex-wrap: wrap;
    font-size: 0.875rem;
  }
  .days-row .label {
    font-weight: 600;
    opacity: 0.8;
  }
  .days-row .value.strong {
    font-weight: 700;
    font-size: 0.95rem;
  }
  .badge {
    background: var(--cds-link-01);
    color: #fff;
    padding: 0.15rem 0.5rem;
    border-radius: 6px;
    font-size: 0.65rem;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }
  .half-day-toggle {
    margin-top: 0.25rem;
  }
  .error-text {
    color: var(--cds-support-error);
    font-size: 0.75rem;
    font-weight: 600;
  }

  .balance-card {
    margin-top: 1.25rem;
    padding: 1.25rem;
    background: rgba(229, 246, 255, 0.08);
    border: 2px solid var(--cds-link-01, #0f62fe);
    border-radius: 8px;
  }

  .balance-card.warning {
    background: rgba(255, 241, 241, 0.12);
    border-color: var(--cds-support-01, #da1e28);
  }

  .balance-header {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    margin-bottom: 1rem;
  }

  .balance-icon {
    font-size: 1.25rem;
  }

  .balance-title {
    font-weight: 600;
  }

  .balance-stats {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
    gap: 1rem;
  }

  .balance-stat {
    display: flex;
    flex-direction: column;
    gap: 0.375rem;
  }

  .balance-label {
    font-size: 0.75rem;
    text-transform: uppercase;
    font-weight: 600;
  }

  .balance-value {
    font-size: 1.25rem;
    font-weight: 700;
  }

  .balance-value.error {
    color: var(--cds-support-01, #da1e28);
  }

  .balance-value.requesting {
    color: var(--custom-text-secondary);
  }

  /* Loading overlay */
  .loading-overlay {
    position: fixed;
    inset: 0;
    background: rgba(255, 255, 255, 0.95);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 10000;
  }
  :global([data-carbon-theme="g90"]) .loading-overlay,
  :global([data-carbon-theme="g100"]) .loading-overlay {
    background: rgba(22, 22, 22, 0.95);
  }

  @media (prefers-color-scheme: dark) {
    .loading-overlay {
      background: rgba(22, 22, 22, 0.95) !important;
    }
  }

  .loading-content {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1rem;
  }

  .loading-spinner {
    width: 40px;
    height: 40px;
    border: 4px solid var(--cds-ui-03, #e0e0e0);
    border-top-color: var(--cds-link-01, #0f62fe);
    border-radius: 50%;
    animation: spin 0.8s linear infinite;
  }

  .loading-text {
    font-size: 0.95rem;
    font-weight: 500;
    color: var(--custom-text);
    margin: 0;
  }

  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }

  .form-submitting {
    opacity: 0.6;
    pointer-events: none;
  }

  :global(.holiday-form .bx--inline-notification) {
    margin-bottom: 1.25rem;
  }
</style>
