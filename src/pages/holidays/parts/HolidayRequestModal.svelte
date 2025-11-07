<script lang="ts">
  import {
    Button,
    ComposedModal,
    DatePicker,
    DatePickerInput,
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
  import { createNewHoliday, closeCreateModal } from '../store';
  import {
    remainingDaysStore,
    showCreateModalStore,
    holidayRequestsStore,
    legalHolidaysStore
  } from '../store/state';
  import { validateHolidayRequest } from '../../../utils/holiday-validation';
  import { formatDateForWebOffice } from '../../../utils/holiday-date-utils';

  // Form state (always in YYYY-MM-DD format internally)
  let startDate = '';
  let endDate = '';
  let days = 1;
  let type = HolidayType.PAID;
  // Deprecated AM/PM selection replaced by a simple half-day toggle
  let isAM = true; // backend still expects this field; we'll always send true
  let isHalfDay = false; // designer-friendly half-day checkbox
  let description = '';
  let isSubmitting = false;
  let formError = '';
  let validationWarnings: string[] = [];
  let showHalfDaySelector = false; // renamed semantic: can show half-day checkbox
  let overlapWarning: string | null = null;

  // Get remaining days from store
  $: remainingDays = $remainingDaysStore.remaining;

  // Calculate working days between two dates
  function calculateWorkingDays(start: Date, end: Date): number {
    let count = 0;
    const current = new Date(start);

    while (current <= end) {
      const day = current.getDay();
      if (day !== 0 && day !== 6) { // Skip weekends
        count++;
      }
      current.setDate(current.getDate() + 1);
    }

    return count;
  }

  // Handle date picker change
  function handleDateChange(event: CustomEvent) {
    const selectedDates = event.detail.selectedDates;
    if (selectedDates && selectedDates.length >= 1) {
      const start = selectedDates[0];
      // If only one date picked in range mode, treat as single-day selection
      const end = selectedDates.length === 2 ? selectedDates[1] : selectedDates[0];
      startDate = start.toISOString().split('T')[0];
      endDate = end.toISOString().split('T')[0];
    }
  }

  // Check if start and end dates are the same day
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

  // Check for overlaps reactively as dates change
  $: {
    overlapWarning = null;
    if (startDate && endDate && $holidayRequestsStore) {
      const newStart = new Date(startDate + 'T00:00:00');
      const newEnd = new Date(endDate + 'T23:59:59');

      for (let i = 0; i < $holidayRequestsStore.length; i++) {
        const other = $holidayRequestsStore[i];
        
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
          break;
        }
      }
    }
  }

  // Check if exceeds available days (only for Paid)
  $: exceedsAvailable = type === HolidayType.PAID && days > remainingDays;
  $: showRemainingWarning = type === HolidayType.PAID && days > 0;

  // Validate days format
  // Removed manual days validation UI; validation handled centrally in validateHolidayRequest

  async function handleSubmit() {
    formError = '';
    validationWarnings = [];

    // Validation checks
    if (!startDate || !endDate) {
      formError = 'Start date and end date are required';
      return;
    }

    if (!description.trim()) {
      formError = 'Description is required';
      return;
    }

    // Run comprehensive validation
    const validationResult = await validateHolidayRequest(
      {
        startDate,
        endDate,
        days,
        type,
        description,
        isAM, // keep sending required field (meaningful only if days=0.5)
      },
      {
        existingRequests: $holidayRequestsStore,
        legalHolidays: $legalHolidaysStore,
        remainingDays: $remainingDaysStore,
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
      const [year, month, day] = startDate.split('-');
      const backendStartDate = `${day}-${month}-${year}`;

      const [endYear, endMonth, endDay] = endDate.split('-');
      const backendEndDate = `${endDay}-${endMonth}-${endYear}`;

      await createNewHoliday({
        startDate: backendStartDate,
        endDate: backendEndDate,
        days,
        type,
        isAM,
        description: description.trim(),
      });

      resetForm();
    } catch (error) {
      formError = error instanceof Error ? error.message : 'Failed to create holiday request';
    } finally {
      isSubmitting = false;
    }
  }

  function resetForm() {
    startDate = '';
    endDate = '';
    days = 1;
    type = HolidayType.PAID;
    isAM = true;
    isHalfDay = false;
    description = '';
    formError = '';
    validationWarnings = [];
  }

  function handleClose() {
    resetForm();
    closeCreateModal();
  }
</script>

<ComposedModal
  open={$showCreateModalStore}
  on:close={handleClose}
  preventCloseOnClickOutside={isSubmitting}
  size="default"
  hasForm
>
  <ModalHeader title="New Holiday Request" />
  
  <ModalBody hasForm>
    {#if isSubmitting}
      <div class="loading-overlay">
        <div class="loading-content">
          <div class="loading-spinner"></div>
          <p class="loading-text">Submitting your request...</p>
        </div>
      </div>
    {/if}
    <form on:submit|preventDefault={handleSubmit} id="holiday-form" class="holiday-form" class:form-submitting={isSubmitting}>
      {#if formError}
        <InlineNotification
          kind="error"
          title="Error"
          subtitle={formError}
          lowContrast
          hideCloseButton
        />
      {/if}

      {#if overlapWarning}
        <InlineNotification
          kind="warning"
          title="Overlap Warning"
          subtitle={overlapWarning}
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

      <div class="form-section compact">
        <div class="section-header merged">
          <span class="section-icon">📅</span>
          <h4 class="section-title">Dates & Duration</h4>
        </div>
        <div class="date-duration-row">
          <div class="date-picker-col">
            <DatePicker datePickerType="range" on:change={handleDateChange}>
              <DatePickerInput labelText="Start" placeholder="mm/dd/yyyy" />
              <DatePickerInput labelText="End" placeholder="mm/dd/yyyy" />
            </DatePicker>
          </div>
          <div class="days-info-col">
            <div class="days-info" aria-live="polite">
              {#if showHalfDaySelector}
                <div class="days-row half-day-toggle">
                  <Checkbox bind:checked={isHalfDay} labelText="Half day" id="half-day-checkbox" />
                </div>
              {/if}
              {#if exceedsAvailable}
                <div class="error-text">Exceeds balance ({remainingDays.toFixed(1)} left)</div>
              {/if}
            </div>
          </div>
        </div>
        {#if showRemainingWarning}
          <div class="balance-card" class:warning={exceedsAvailable}>
            <div class="balance-header">
              <span class="balance-icon">{exceedsAvailable ? '⚠️' : '✅'}</span>
              <span class="balance-title">{exceedsAvailable ? 'Insufficient Balance' : 'Balance Check'}</span>
            </div>
            <div class="balance-stats">
              <div class="balance-stat">
                <span class="balance-label">Available</span>
                <span class="balance-value">{remainingDays.toFixed(1)} days</span>
              </div>
              <div class="balance-stat">
                <span class="balance-label">Requesting</span>
                <span class="balance-value requesting">{days} days</span>
              </div>
              {#if exceedsAvailable}
                <div class="balance-stat">
                  <span class="balance-label">Over by</span>
                  <span class="balance-value error">{(days - remainingDays).toFixed(1)} days</span>
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
  </ModalBody>

  <ModalFooter>
    <Button kind="secondary" on:click={handleClose} disabled={isSubmitting}>
      Cancel
    </Button>
    <Button
      kind="primary"
      type="submit"
      form="holiday-form"
      disabled={isSubmitting}
    >
      {isSubmitting ? 'Submitting...' : 'Submit Request'}
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

  .half-day-section {
    margin-top: 1.25rem;
    padding-top: 1.25rem;
    border-top: 1px solid var(--custom-border);
  }

  :global(.holiday-form .bx--inline-notification) {
    margin-bottom: 1.25rem;
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
</style>
