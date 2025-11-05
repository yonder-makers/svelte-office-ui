<script lang="ts">
  import { Button, InlineLoading, Modal, Tag } from 'carbon-components-svelte';
  import TrashCan from 'carbon-icons-svelte/lib/TrashCan.svelte';
  import { deleteExistingHoliday } from '../store';
  import { HolidayType, getHolidayTypeName, type HolidayResponse } from '../../../apis/holidays.api';

  export let holiday: any; // Using any because backend returns mixed format
  
  // Handle both old HolidayDto (type as string "Paid") and new HolidayResponse (type as enum)
  $: displayTypeName = typeof holiday?.type === 'string' 
    ? holiday.type  // Old format: type is already a string like "Paid"
    : (holiday?.typeName || (holiday?.type ? getHolidayTypeName(Number(holiday.type)) : 'Unknown'));
  
  // Use days field, fallback to numberOfDays for old format
  $: displayDays = holiday?.days ?? holiday?.numberOfDays ?? 0;
  
  // Get ID - use id for new format, uid for old format
  $: holidayId = holiday?.id ?? holiday?.uid;
  
  // Determine row status - handle both old (decision boolean) and new (managerDecision string) formats
  $: decision = holiday?.managerDecision ?? holiday?.decision;
  
  // Check status for both formats
  $: isPending = holiday && (
    decision === '?' || 
    decision === undefined || 
    decision === null ||
    (decision === false && holiday.advice === false)
  );
  
  $: isApproved = holiday && (decision === 'YES' || decision === true);
  $: isRejected = holiday && (decision === 'NO' || (decision === false && holiday.advice !== false));
  
  $: rowClass = isPending ? 'pending-row' : isRejected ? 'rejected-row' : '';
  
  // Can delete based on canDelete field from API
  $: canDelete = holiday?.canDelete ?? false;
  
  let showDeleteModal = false;
  let isDeleting = false;
  let deleteError = '';
  
  function handleDeleteClick() {
    showDeleteModal = true;
    deleteError = '';
  }
  
  async function confirmDelete() {
    if (!holiday) return;
    
    isDeleting = true;
    deleteError = '';
    
    try {
      // Use ID from either format (id for new, uid for old)
      await deleteExistingHoliday(holidayId);
      showDeleteModal = false;
    } catch (error) {
      deleteError = error instanceof Error ? error.message : 'Failed to delete holiday';
      console.error('Delete error:', error);
      console.error('Holiday data:', holiday);
    } finally {
      isDeleting = false;
    }
  }
  
  function formatDate(dateStr: string): string {
    if (!dateStr) return '';
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
    } catch {
      return dateStr;
    }
  }
</script>

{#if holiday}
  <tr class={rowClass}>
    <td class="type-cell">
      <span class="type-badge {displayTypeName?.toLowerCase().replace(' ', '-')}">{displayTypeName}</span>
    </td>
    <td class="status-cell">
      {#if isApproved}
        <Tag type="green" size="sm">Approved</Tag>
      {:else if isRejected}
        <Tag type="red" size="sm">Rejected</Tag>
      {:else}
        <Tag type="yellow" size="sm">Pending</Tag>
      {/if}
    </td>
    <td class="date-cell">{formatDate(holiday.startDate)}</td>
    <td class="date-cell">{formatDate(holiday.endDate)}</td>
    <td class="days-cell">{displayDays}</td>
    <td class="description-cell">{holiday.description || '-'}</td>
    <td class="date-cell">{formatDate(holiday.requestDate || holiday.createdAt)}</td>
    <td class="modified-cell">
      <div class="modified-info">
        <span class="modified-date">{formatDate(holiday.modifiedDate)}</span>
        <span class="modified-by">{holiday.modifiedBy || '-'}</span>
      </div>
    </td>
    <td class="actions-cell">
      {#if canDelete}
        <Button
          kind="danger-ghost"
          size="small"
          icon={TrashCan}
          iconDescription="Delete request"
          tooltipPosition="left"
          on:click={handleDeleteClick}
        />
      {:else}
        <span class="no-action">-</span>
      {/if}
    </td>
  </tr>
{/if}

<Modal
  bind:open={showDeleteModal}
  modalHeading="Delete Holiday Request"
  primaryButtonText="Delete"
  secondaryButtonText="Cancel"
  danger
  primaryButtonDisabled={isDeleting}
  on:click:button--secondary={() => (showDeleteModal = false)}
  on:submit={confirmDelete}
>
  <p>Are you sure you want to delete this holiday request?</p>
  {#if holiday}
    <div class="delete-details">
      <strong>{displayTypeName}</strong>
      <span>{formatDate(holiday.startDate)} - {formatDate(holiday.endDate)}</span>
      <span>{displayDays} days</span>
    </div>
  {/if}
  
  {#if isDeleting}
    <InlineLoading description="Deleting..." />
  {/if}
  
  {#if deleteError}
    <p class="error-text">{deleteError}</p>
  {/if}
</Modal>

<style>
  tr {
    border-bottom: 1px solid var(--custom-border);
    transition: background-color 0.15s ease;
  }

  tr:hover {
    background-color: var(--custom-hover);
  }

  tr.pending-row {
    background-color: rgba(241, 194, 27, 0.1) !important;
    border-left: 3px solid #f1c21b;
  }
  
  tr.pending-row td {
    background-color: rgba(241, 194, 27, 0.1) !important;
  }
  
  tr.pending-row:hover {
    background-color: rgba(241, 194, 27, 0.15) !important;
  }
  
  tr.pending-row:hover td {
    background-color: rgba(241, 194, 27, 0.15) !important;
  }
  
  tr.rejected-row {
    background-color: rgba(218, 30, 40, 0.1) !important;
    border-left: 3px solid #da1e28;
  }
  
  tr.rejected-row td {
    background-color: rgba(218, 30, 40, 0.1) !important;
  }
  
  tr.rejected-row:hover {
    background-color: rgba(218, 30, 40, 0.15) !important;
  }
  
  tr.rejected-row:hover td {
    background-color: rgba(218, 30, 40, 0.15) !important;
  }

  td {
    padding: 1rem;
    font-size: 0.875rem;
    color: var(--custom-text);
    vertical-align: middle;
  }

  .type-cell {
    font-weight: 500;
  }

  .type-badge {
    display: inline-block;
    padding: 0.25rem 0.75rem;
    border-radius: 12px;
    font-size: 0.75rem;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.02em;
  }

  .type-badge.paid {
    background: rgba(15, 98, 254, 0.15);
    color: #0f62fe;
  }

  .type-badge.compensation {
    background: rgba(36, 161, 72, 0.15);
    color: #24a148;
  }

  .type-badge.not-paid {
    background: rgba(218, 30, 40, 0.15);
    color: #da1e28;
  }

  .type-badge.legal {
    background: var(--custom-bg-tertiary);
    color: var(--custom-text);
  }

  .status-cell {
    white-space: nowrap;
  }

  .date-cell {
    color: var(--custom-text-secondary);
    white-space: nowrap;
  }

  .days-cell {
    text-align: center;
    font-weight: 600;
    color: #0f62fe;
  }

  .description-cell {
    max-width: 200px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .modified-cell {
    color: #8d8d8d;
    font-size: 0.8125rem;
  }

  .modified-info {
    display: flex;
    flex-direction: column;
    gap: 0.125rem;
  }

  .modified-date {
    color: #525252;
  }

  .modified-by {
    color: var(--custom-text-secondary);
    font-size: 0.75rem;
  }

  .actions-cell {
    text-align: center;
    width: 80px;
  }

  .no-action {
    color: var(--custom-text-secondary);
  }

  .delete-details {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    margin-top: 1rem;
    padding: 1rem;
    background: var(--custom-bg-secondary);
    border-radius: 4px;
  }

  .delete-details strong {
    font-size: 1rem;
    color: var(--custom-text);
  }

  .delete-details span {
    font-size: 0.875rem;
    color: #525252;
  }

  .error-text {
    color: #da1e28;
    font-size: 0.875rem;
    margin-top: 1rem;
  }
</style>
