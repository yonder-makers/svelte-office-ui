<script lang="ts">
  import {
    Button,
    ComposedModal,
    InlineNotification,
    ModalBody,
    ModalFooter,
    ModalHeader,
    NumberInput,
    RadioButton,
    RadioButtonGroup,
    TextArea,
  } from 'carbon-components-svelte';
  import { HolidayType } from '../../../apis/holidays.api';
  import { createNewHoliday, closeCreateModal } from '../store';
  import { remainingDaysStore, showCreateModalStore } from '../store/state';

  let startDate = '';
  let endDate = '';
  let days = 1;
  let type = HolidayType.PAID;
  let isAM = true;
  let description = '';
  let isSubmitting = false;
  let formError = '';

  // Get remaining days from store
  $: remainingDays = $remainingDaysStore.remaining;
  $: totalDays = $remainingDaysStore.total;

  // Calculate working days when dates change
  $: if (startDate && endDate) {
    const start = new Date(startDate);
    const end = new Date(endDate);
    if (end >= start) {
      days = calculateWorkingDays(start, end);
    }
  }

  $: showHalfDaySelector = days === 0.5;
  
  // Check if requesting more days than available (only for Paid holidays)
  $: exceedsAvailable = type === HolidayType.PAID && days > remainingDays;
  $: showRemainingWarning = type === HolidayType.PAID && days > 0;

  function calculateWorkingDays(start: Date, end: Date): number {
    let count = 0;
    const current = new Date(start);
    
    while (current <= end) {
      const day = current.getDay();
      // Skip weekends (0 = Sunday, 6 = Saturday)
      if (day !== 0 && day !== 6) {
        count++;
      }
      current.setDate(current.getDate() + 1);
    }
    
    return count;
  }

  async function handleSubmit() {
    formError = '';
    
    // Validation
    if (!startDate || !endDate) {
      formError = 'Please select start and end dates';
      return;
    }
    
    if (!description || description.trim().length === 0) {
      formError = 'Please provide a description';
      return;
    }
    
    if (description.length > 50) {
      formError = 'Description must be 50 characters or less';
      return;
    }
    
    if (days < 0.5) {
      formError = 'Minimum 0.5 days required';
      return;
    }

    // Check if exceeds available days for Paid holidays
    if (type === HolidayType.PAID && days > remainingDays) {
      formError = `You only have ${remainingDays.toFixed(1)} days available. You are requesting ${days} days.`;
      return;
    }

    isSubmitting = true;

    try {
      await createNewHoliday({
        startDate,
        endDate,
        days,
        type,
        isAM,
        description: description.trim(),
      });
      
      // Reset form
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
    description = '';
    formError = '';
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
>
  <ModalHeader title="✨ New Holiday Request" />
  
  <ModalBody hasForm>
    <form on:submit|preventDefault={handleSubmit} id="holiday-form" class="holiday-form">
      {#if formError}
        <InlineNotification
          kind="error"
          title="Error"
          subtitle={formError}
          lowContrast
          hideCloseButton
        />
      {/if}

      <div class="form-section">
        <div class="section-header">
          <span class="section-icon">📅</span>
          <h4 class="section-title">Date Selection</h4>
        </div>
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

      <div class="form-section">
        <div class="section-header">
          <span class="section-icon">⏱️</span>
          <h4 class="section-title">Duration</h4>
        </div>
        <NumberInput
          label="Number of Days"
          bind:value={days}
          min={0.5}
          step={0.5}
          helperText="Auto-calculated from working days (excludes weekends)"
          invalid={exceedsAvailable}
          invalidText={exceedsAvailable ? `Exceeds available days (${remainingDays} remaining)` : ''}
          required
        />

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

        {#if showHalfDaySelector}
          <div class="half-day-section">
            <RadioButtonGroup
              legendText="Half Day Period"
              bind:selected={isAM}
            >
              <RadioButton
                labelText="🌅 Morning (AM)"
                value={true}
              />
              <RadioButton
                labelText="🌆 Afternoon (PM)"
                value={false}
              />
            </RadioButtonGroup>
          </div>
        {/if}

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
    gap: 1.5rem;
  }

  .form-section {
    background: #f4f4f4;
    border-radius: 8px;
    padding: 1.25rem;
    transition: box-shadow 0.2s ease;
  }

  .form-section:hover {
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  }

  .section-header {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    margin-bottom: 1rem;
    padding-bottom: 0.75rem;
    border-bottom: 2px solid #e0e0e0;
  }

  .section-icon {
    font-size: 1.5rem;
    line-height: 1;
  }

  .section-title {
    font-size: 1rem;
    font-weight: 600;
    color: #161616;
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
  }

  .date-field label {
    margin-bottom: 0.5rem;
    font-size: 0.75rem;
    font-weight: 600;
    line-height: 1rem;
    letter-spacing: 0.32px;
    color: #161616;
  }

  .date-input {
    padding: 0.75rem 1rem;
    font-size: 0.875rem;
    line-height: 1.25rem;
    border: 2px solid #e0e0e0;
    border-radius: 4px;
    background-color: #ffffff;
    outline: none;
    transition: all 0.2s cubic-bezier(0.2, 0, 0.38, 0.9);
  }

  .date-input:hover {
    border-color: #0f62fe;
  }

  .date-input:focus {
    outline: 2px solid #0f62fe;
    outline-offset: 2px;
    border-color: #0f62fe;
  }

  :global(.form-section .bx--number-input) {
    margin-bottom: 0;
  }

  :global(.form-section .bx--radio-button-group) {
    margin-bottom: 0;
  }

  :global(.form-section .bx--text-area) {
    margin-bottom: 0;
  }

  .balance-card {
    margin-top: 1rem;
    padding: 1rem;
    background: #e5f6ff;
    border: 2px solid #0f62fe;
    border-radius: 8px;
    transition: all 0.2s ease;
  }

  .balance-card.warning {
    background: #fff1f1;
    border-color: #da1e28;
    animation: pulse 2s ease-in-out infinite;
  }

  @keyframes pulse {
    0%, 100% {
      box-shadow: 0 0 0 0 rgba(218, 30, 40, 0.2);
    }
    50% {
      box-shadow: 0 0 0 8px rgba(218, 30, 40, 0);
    }
  }

  .balance-header {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    margin-bottom: 0.75rem;
  }

  .balance-icon {
    font-size: 1.25rem;
    line-height: 1;
  }

  .balance-title {
    font-size: 0.875rem;
    font-weight: 600;
    color: #161616;
  }

  .balance-stats {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(100px, 1fr));
    gap: 1rem;
  }

  .balance-stat {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
  }

  .balance-label {
    font-size: 0.75rem;
    color: #6f6f6f;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    font-weight: 500;
  }

  .balance-value {
    font-size: 1.125rem;
    font-weight: 700;
    color: #0f62fe;
  }

  .balance-value.requesting {
    color: #161616;
  }

  .balance-value.error {
    color: #da1e28;
  }

  .half-day-section {
    margin-top: 1rem;
    padding-top: 1rem;
    border-top: 1px solid #e0e0e0;
  }

  :global(.bx--modal-container) {
    max-width: 600px;
  }

  :global(.bx--modal-header__heading) {
    font-size: 1.25rem;
  }

  :global(.holiday-form .bx--text-area__wrapper textarea) {
    background-color: #ffffff;
    border: 2px solid #e0e0e0;
    transition: border-color 0.2s ease;
  }

  :global(.holiday-form .bx--text-area__wrapper textarea:hover) {
    border-color: #0f62fe;
  }

  :global(.holiday-form .bx--text-area__wrapper textarea:focus) {
    border-color: #0f62fe;
  }

  :global(.holiday-form .bx--inline-notification) {
    margin-bottom: 1rem;
    border-radius: 4px;
  }
</style>
