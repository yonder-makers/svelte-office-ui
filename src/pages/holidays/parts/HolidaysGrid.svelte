<script lang="ts">
  import { afterUpdate } from 'svelte';
  import {
    ToolbarSearch,
    Checkbox,
    DataTable,
    Modal,
    InlineLoading,
    Button,
    Tag,
    SkeletonText
  } from 'carbon-components-svelte';
  import TrashCan from 'carbon-icons-svelte/lib/TrashCan.svelte';
  import Edit from 'carbon-icons-svelte/lib/Edit.svelte';
  import { holidayRequestsStore, errorStore, loadingHolidaysStore } from '../store/state';
  import { getHolidayTypeName } from '../../../apis/holidays.api';
  import { deleteExistingHoliday, openEditModal } from '../store';
  import { parseDateFromWebOffice } from '../../../utils/holiday-date-utils';

  let searchValue = '';
  
  // Type filters - legal hidden by default
  let showPaid = true;
  let showCompensation = true;
  let showUnpaid = true;
  let showLegal = false;

  $: holidays = $holidayRequestsStore;
  
  function resolveTypeName(holiday: any) {
    if (!holiday) return '';
    if (holiday.typeName) return holiday.typeName;
    if (typeof holiday.type === 'string') return holiday.type;
    if (typeof holiday.type === 'number') return getHolidayTypeName(holiday.type);
    return '';
  }

  $: filteredHolidays = holidays
    .filter((holiday) => {
      // Resolve a human-friendly type name from several possible shapes
      const typeName = resolveTypeName(holiday)?.toString() ?? '';

      // Type filter
      const tn = typeName.toLowerCase();
      const typeFilter =
        (showPaid && tn === 'paid') ||
        (showCompensation && tn === 'compensation') ||
        (showUnpaid && (tn === 'not paid' || tn === 'unpaid')) ||
        (showLegal && tn === 'legal');

      if (!typeFilter) return false;

      // Search filter
      if (!searchValue) return true;
      const search = searchValue.toLowerCase();
      return (
        typeName.toLowerCase().includes(search) ||
        (holiday.description ?? '').toString().toLowerCase().includes(search) ||
        (holiday.startDate ?? '').toString().toLowerCase().includes(search) ||
        (holiday.endDate ?? '').toString().toLowerCase().includes(search) ||
        (holiday.status ?? '').toString().toLowerCase().includes(search) ||
        (holiday.employeeName ?? '').toString().toLowerCase().includes(search)
      );
    })
    .map((h: any) => {
      // Add row class based on status
      const decision = h.managerDecision ?? h.decision;
      const isPendingRow = decision === '?' || decision === undefined || decision === null || (decision === false && h.advice === false);
      const isRejectedRow = decision === 'NO' || (decision === false && h.advice !== false);
      
      return {
        ...h,
        id: h.id ?? h.uid ?? h.holidayId,
        class: isPendingRow ? 'pending-row' : isRejectedRow ? 'rejected-row' : ''
      };
    })
    .sort((a, b) => {
      // Sort pending holidays first
      const aIsPending = a.class === 'pending-row' ? 0 : 1;
      const bIsPending = b.class === 'pending-row' ? 0 : 1;
      if (aIsPending !== bIsPending) return aIsPending - bIsPending;
      // Then sort by start date (earliest first) - use proper DD-MM-YYYY parser
      const aDate = parseDateFromWebOffice(a.startDate).getTime();
      const bDate = parseDateFromWebOffice(b.startDate).getTime();
      return aDate - bDate;
    });

  const headers: any = [
    { key: 'type', value: 'Type', width: '250px' },
    { key: 'status', value: 'Status' },
    { key: 'startDate', value: 'Start Date' },
    { key: 'endDate', value: 'End Date' },
    { key: 'days', value: 'Days' },
    { key: 'description', value: 'Description' },
    { key: 'created', value: 'Created' },
    { key: 'modified', value: 'Modified' },
    { key: 'actions', value: 'Actions' },
  ];

  // Modal / delete handling
  let showDeleteModal = false;
  let deleting = false;
  let deleteError = '';
  let holidayToDelete: any = null;

  function openDeleteModal(row: any) {
    holidayToDelete = row;
    deleteError = '';
    showDeleteModal = true;
  }

  function isApproved(row: any) {
    const decision = row.managerDecision ?? row.decision;
    return decision === 'YES' || decision === true;
  }

  function isRejected(row: any) {
    const decision = row.managerDecision ?? row.decision;
    return decision === 'NO' || (decision === false && row.advice !== false);
  }

  function isPending(row: any) {
    const decision = row.managerDecision ?? row.decision;
    return (
      decision === '?' || 
      decision === undefined || 
      decision === null ||
      (decision === false && row.advice === false)
    );
  }

  function getDays(row: any) {
    return row.days ?? row.numberOfDays ?? 0;
  }

  function getCreated(row: any) {
    return row.requestDate ?? row.createdAt ?? '';
  }

  async function confirmDelete() {
    if (!holidayToDelete) return;
    deleting = true;
    deleteError = '';
    try {
      const id = holidayToDelete.id ?? holidayToDelete.uid ?? holidayToDelete.holidayId;
      await deleteExistingHoliday(id);
      showDeleteModal = false;
      holidayToDelete = null;
    } catch (err) {
      deleteError = err instanceof Error ? err.message : 'Failed to delete holiday';
      console.error(err);
    } finally {
      deleting = false;
    }
  }

  function formatDate(dateStr: string) {
    if (!dateStr) return '';
    try {
      // Use proper DD-MM-YYYY parser for backend dates
      const date = parseDateFromWebOffice(dateStr);
      if (isNaN(date.getTime())) {
        return dateStr;
      }
      return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
    } catch (error) {
      console.warn('Failed to format date:', dateStr, error);
      return dateStr;
    }
  }

  // Apply row classes for pending/rejected styling
  afterUpdate(() => {
    const rows = document.querySelectorAll('.table-wrapper tbody tr');
    rows.forEach((row) => {
      const statusCell = row.querySelector('td:nth-child(2)');
      if (statusCell) {
        const statusText = statusCell.textContent?.toLowerCase() || '';
        if (statusText.includes('pending')) {
          row.classList.add('pending-row');
          row.classList.remove('rejected-row');
        } else if (statusText.includes('rejected')) {
          row.classList.add('rejected-row');
          row.classList.remove('pending-row');
        } else {
          row.classList.remove('pending-row', 'rejected-row');
        }
      }
    });
  });
</script>

<div class="holidays-grid">
  {#if $loadingHolidaysStore}
    <div class="loading-state">
      <InlineLoading description="Loading holidays..." />
      <div class="skeleton-rows">
        {#each Array(5) as _, i}
          <div class="skeleton-row">
            <SkeletonText width="15%" />
            <SkeletonText width="10%" />
            <SkeletonText width="12%" />
            <SkeletonText width="12%" />
            <SkeletonText width="8%" />
            <SkeletonText width="25%" />
            <SkeletonText width="12%" />
          </div>
        {/each}
      </div>
    </div>
  {:else if holidays.length === 0}
    <div class="empty-state">
      <p class="empty-title">No holidays yet</p>
      <p class="empty-subtitle">Click "New Request" to create your first holiday request</p>
    </div>
  {:else}
    <div class="toolbar-section">
      <div class="search-container">
        <ToolbarSearch
          bind:value={searchValue}
          placeholder="Search holidays..."
          persistent
        />
      </div>

      <!-- Debug info: show counts and any backend error (temporary) -->
      <div class="debug-info" aria-hidden="false">
        <small>Loaded: {$holidayRequestsStore.length} · Filtered: {filteredHolidays.length}</small>
        {#if $errorStore}
          <div class="backend-error">{ $errorStore }</div>
        {/if}
      </div>
      
      <div class="filters-container">
        <span class="filter-label">Show:</span>
        <Checkbox bind:checked={showPaid} labelText="Paid" />
        <Checkbox bind:checked={showCompensation} labelText="Compensation" />
        <Checkbox bind:checked={showUnpaid} labelText="Unpaid" />
        <Checkbox bind:checked={showLegal} labelText="Legal" />
      </div>
    </div>

    {#if $holidayRequestsStore.length === 0}
      <div style="padding: 0.75rem 2rem;">
        <small>No holiday requests loaded from the backend.</small>
        <Button kind="ghost" size="sm" on:click={() => {
          // Inject sample rows for local UI testing
          holidayRequestsStore.set([
            {
              id: 1,
              employeeCode: 'E001',
              employeeName: 'Alice Example',
              requestDate: new Date().toISOString(),
              startDate: new Date().toISOString(),
              endDate: new Date(Date.now() + 2 * 24 * 3600 * 1000).toISOString(),
              days: 3,
              typeName: 'Paid',
              type: 1,
              isAM: false,
              description: 'Visiting family',
              supervisorAdvice: '?',
              managerDecision: '?',
              status: 'Pending',
              canModify: true,
              canDelete: true,
              modifiedDate: new Date().toISOString(),
              modifiedBy: 'Manager'
            }
          ]);
        }}>Load sample data</Button>
      </div>
    {/if}

    <div class="table-wrapper">
      <DataTable {headers} rows={filteredHolidays}>
        <svelte:fragment slot="head" let:header>
          <th data-column-key={header.key}>{header.value}</th>
        </svelte:fragment>

        <svelte:fragment slot="cell" let:row let:cell>
        <!-- row is the holiday object provided by rows -->
        {#if cell.key === 'type'}
          {@const typeName = resolveTypeName(row)}
          {@const tn = typeName.toLowerCase()}
          {#if tn === 'paid'}
            <Tag type="blue" size="sm">Paid</Tag>
          {:else if tn === 'compensation'}
            <Tag type="green" size="md">Compensation</Tag>
          {:else if tn === 'not paid' || tn === 'unpaid'}
            <Tag type="red" size="sm">{typeName}</Tag>
          {:else if tn === 'legal'}
            <Tag type="purple" size="sm">Legal</Tag>
          {:else}
            <Tag type="gray" size="sm">{typeName}</Tag>
          {/if}
        {:else if cell.key === 'status'}
          {#if isApproved(row)}
            <Tag type="green" size="sm">Approved</Tag>
          {:else if isRejected(row)}
            <Tag type="red" size="sm">Rejected</Tag>
          {:else if isPending(row)}
            <Tag type="gray" size="sm">Pending</Tag>
          {:else}
            <Tag type="gray" size="sm">Unknown</Tag>
          {/if}
        {:else if cell.key === 'startDate'}
          {formatDate(row.startDate)}
        {:else if cell.key === 'endDate'}
          {formatDate(row.endDate)}
        {:else if cell.key === 'days'}
          {getDays(row)}
        {:else if cell.key === 'description'}
          {row.description || '-'}
        {:else if cell.key === 'created'}
          {formatDate(getCreated(row))}
        {:else if cell.key === 'modified'}
          <div class="modified-info">
            <div class="modified-date">{formatDate(row.modifiedDate)}</div>
            <div class="modified-by">{row.modifiedBy || '-'}</div>
          </div>
        {:else if cell.key === 'actions'}
          <div class="actions-buttons">
            {#if isPending(row)}
              {#if row.canModify !== false}
                <Button
                  kind="ghost"
                  size="small"
                  icon={Edit}
                  iconDescription="Edit request"
                  tooltipPosition="left"
                  on:click={() => openEditModal(row)}
                />
              {/if}
              {#if row.canDelete !== false}
                <Button
                  kind="danger-ghost"
                  size="small"
                  icon={TrashCan}
                  iconDescription="Delete request"
                  tooltipPosition="left"
                  on:click={() => openDeleteModal(row)}
                />
              {/if}
            {:else}
              <span class="no-action">-</span>
            {/if}
          </div>
        {:else}
          {cell.value}
        {/if}
      </svelte:fragment>

    </DataTable>
    </div>

    <Modal
      bind:open={showDeleteModal}
      modalHeading="Delete Holiday Request"
      primaryButtonText="Delete"
      secondaryButtonText="Cancel"
      danger
      primaryButtonDisabled={deleting}
      on:click:button--secondary={() => (showDeleteModal = false)}
      on:submit={confirmDelete}
    >
      <p>Are you sure you want to delete this holiday request?</p>
      {#if holidayToDelete}
        <div class="delete-details">
          <strong>{holidayToDelete.typeName || holidayToDelete.type}</strong>
          <span>{formatDate(holidayToDelete.startDate)} - {formatDate(holidayToDelete.endDate)}</span>
          <span>{holidayToDelete.days ?? holidayToDelete.numberOfDays ?? 0} days</span>
        </div>
      {/if}

      {#if deleting}
        <InlineLoading description="Deleting..." />
      {/if}

      {#if deleteError}
        <p class="error-text">{deleteError}</p>
      {/if}
    </Modal>

    {#if filteredHolidays.length === 0 && searchValue}
      <div class="no-results">
        <p>No holidays match your search</p>
      </div>
    {/if}
  {/if}
</div>

<style>
  .holidays-grid {
    min-height: 400px;
  }

  .empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 5rem 2rem;
    text-align: center;
    background: linear-gradient(135deg, var(--custom-bg) 0%, var(--custom-bg-secondary) 100%);
    border-radius: 12px;
    border: 1px solid var(--custom-border);
  }

  .empty-title {
    font-size: 1.75rem;
    font-weight: 700;
    color: var(--custom-text);
    margin: 0 0 0.5rem 0;
    letter-spacing: -0.02em;
  }

  .empty-subtitle {
    font-size: 0.95rem;
    color: var(--custom-text-secondary);
    margin: 0;
    line-height: 1.5;
  }

  .toolbar-section {
    background: var(--custom-bg);
    border: 1px solid var(--custom-border);
    padding: 1.75rem 2rem;
    margin-bottom: 0;
    display: flex;
    align-items: center;
    gap: 2rem;
    flex-wrap: wrap;
    border-radius: 12px 12px 0 0;
  }

  .search-container {
    flex: 1;
    min-width: 300px;
  }

  .filters-container {
    display: flex;
    align-items: center;
    gap: 1.75rem;
    flex-wrap: wrap;
    padding: 0 0.5rem;
  }

  .filter-label {
    font-size: 0.8rem;
    font-weight: 700;
    color: var(--custom-text);
    margin-right: 0.25rem;
    text-transform: uppercase;
    letter-spacing: 0.03em;
    opacity: 0.75;
  }

  .no-results {
    padding: 3rem 2rem;
    text-align: center;
    color: var(--custom-text-secondary);
    background: linear-gradient(135deg, var(--custom-bg) 0%, var(--custom-bg-secondary) 100%);
    border-radius: 0 0 12px 12px;
    border: 1px solid var(--custom-border);
    border-top: none;
  }

  .no-results p {
    font-size: 1rem;
    margin: 0;
    opacity: 0.8;
  }

  .actions-buttons {
    display: flex;
    gap: 0.75rem;
    align-items: center;
    justify-content: center;
  }

  :global(.search-container .bx--search) {
    width: 100%;
    background: var(--custom-bg-secondary);
  }

  :global(.search-container .bx--search-input) {
    background: var(--custom-bg-secondary);
    color: var(--custom-text);
    border-radius: 6px;
    padding: 0.875rem 1rem;
  }

  :global(.bx--data-table) {
    table-layout: auto;
    border-collapse: collapse;
  }

  :global(.bx--data-table thead th) {
    padding: 1.25rem 1.5rem !important;
    height: auto;
    font-weight: 700;
    font-size: 0.85rem;
    letter-spacing: 0.02em;
    background: linear-gradient(135deg, var(--custom-bg) 0%, var(--custom-bg-secondary) 100%);
    border-bottom: 2px solid var(--custom-border);
    color: var(--custom-text);
  }

  :global(.bx--data-table th:nth-child(1)),
  :global(.bx--data-table td:nth-child(1)) {
    width: 350px !important;
  }

  /* --- Match styles from HolidaysGridRow.svelte --- */
  :global(.bx--data-table tbody tr) {
    border-bottom: 1px solid var(--custom-border);
    transition: all 0.2s cubic-bezier(0.2, 0, 0.38, 0.9);
  }

  :global(.bx--data-table tbody tr:hover) {
    background-color: var(--custom-hover);
    box-shadow: inset 4px 0 0 0 var(--cds-link-01, #0f62fe);
  }

  /* Pending holiday rows - use theme variables so values update per Carbon theme */
  :global(.bx--data-table tbody tr.pending-row) {
    background-color: var(--holiday-pending-bg) !important;
    border-left: 4px solid var(--holiday-pending-border);
  }

  :global(.bx--data-table tbody tr.pending-row) td {
    background-color: var(--holiday-pending-bg) !important;
  }

  :global(.bx--data-table tbody tr.pending-row:hover) {
    background-color: var(--holiday-pending-bg) !important;
    box-shadow: inset 4px 0 0 0 var(--holiday-pending-border);
  }

  :global(.bx--data-table tbody tr.pending-row:hover) td {
    background-color: var(--holiday-pending-bg) !important;
  }
  
  /* Rejected holiday rows - theme variables provide correct light/dark variants */
  :global(.bx--data-table tbody tr.rejected-row) {
    background-color: var(--holiday-rejected-bg) !important;
    border-left: 4px solid var(--holiday-rejected-border);
  }
  
  :global(.bx--data-table tbody tr.rejected-row) td {
    background-color: var(--holiday-rejected-bg) !important;
  }
  
  :global(.bx--data-table tbody tr.rejected-row:hover) {
    background-color: var(--holiday-rejected-bg) !important;
    box-shadow: inset 4px 0 0 0 var(--holiday-rejected-border);
  }
  
  :global(.bx--data-table tbody tr.rejected-row:hover) td {
    background-color: var(--holiday-rejected-bg) !important;
  }

  :global(.bx--data-table td) {
    padding: 1.25rem 1.5rem;
    font-size: 0.9rem;
    color: var(--custom-text);
    vertical-align: middle;
    background-color: var(--custom-bg);
  }

  :global(.bx--data-table td:first-child) {
    padding-left: 2rem;
  }

  :global(.bx--data-table td:last-child) {
    padding-right: 2rem;
  }

  .type-badge {
    display: inline-block;
    padding: 0.35rem 0.85rem;
    border-radius: 14px;
    font-size: 0.8rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.03em;
    transition: all 0.2s ease;
  }

  .type-badge.paid {
    background: var(--holiday-approved-badge-bg);
    color: var(--holiday-approved-badge-color);
    border: 1px solid var(--holiday-approved-badge-color);
  }

  .type-badge.paid:hover {
    filter: brightness(1.1);
    transform: translateY(-1px);
  }

  .type-badge.compensation {
    background: rgba(36, 161, 72, 0.12);
    color: #24a148;
    border: 1px solid rgba(36, 161, 72, 0.3);
  }

  .type-badge.compensation:hover {
    filter: brightness(1.1);
    transform: translateY(-1px);
  }

  :global([data-carbon-theme="g90"]) .type-badge.compensation,
  :global([data-carbon-theme="g100"]) .type-badge.compensation {
    background: rgba(66, 190, 101, 0.18);
    color: #42be65;
    border: 1px solid rgba(66, 190, 101, 0.3);
  }

  .type-badge.not-paid,
  .type-badge.unpaid {
    background: rgba(218, 30, 40, 0.12);
    color: #da1e28;
    border: 1px solid rgba(218, 30, 40, 0.2);
  }

  .type-badge.not-paid:hover,
  .type-badge.unpaid:hover {
    filter: brightness(1.1);
    transform: translateY(-1px);
  }

  :global([data-carbon-theme="g90"]) .type-badge.not-paid,
  :global([data-carbon-theme="g100"]) .type-badge.not-paid,
  :global([data-carbon-theme="g90"]) .type-badge.unpaid,
  :global([data-carbon-theme="g100"]) .type-badge.unpaid {
    background: rgba(255, 131, 137, 0.18);
    color: #ff8389;
    border: 1px solid rgba(255, 131, 137, 0.3);
  }

  .type-badge.legal {
    background: var(--custom-bg-tertiary);
    color: var(--custom-text);
    border: 1px solid var(--custom-border);
  }

  .type-badge.legal:hover {
    filter: brightness(1.05);
    transform: translateY(-1px);
  }

  .date-cell {
    color: var(--custom-text-secondary);
    white-space: nowrap;
    font-variant-numeric: tabular-nums;
  }

  .days-cell {
    text-align: center;
    font-weight: 700;
    color: var(--holiday-approved-badge-color);
    font-variant-numeric: tabular-nums;
  }

  .description-cell {
    max-width: 220px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .modified-info {
    display: flex;
    flex-direction: column;
    gap: 0.2rem;
  }

  .modified-date {
    color: var(--custom-text);
    font-weight: 500;
    font-variant-numeric: tabular-nums;
  }

  .modified-by {
    color: var(--custom-text-secondary);
    font-size: 0.8rem;
  }

  .no-action {
    color: var(--custom-text-secondary);
  }

  .error-text { 
    color: var(--holiday-rejected-border);
    margin-top: 1rem;
    font-weight: 500;
  }

  .debug-info {
    display: flex;
    align-items: center;
    gap: 1rem;
    font-size: 0.8rem;
    color: var(--custom-text-secondary);
  }

  .backend-error {
    color: var(--cds-support-01, #da1e28);
    font-weight: 600;
  }

  .table-wrapper {
    border: 1px solid var(--custom-border);
    border-top: none;
    border-radius: 0 0 12px 12px;
    overflow: hidden;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.06);
  }

  .loading-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 3rem 2rem;
    background: var(--custom-bg);
    border-radius: 12px;
    border: 1px solid var(--custom-border);
    gap: 2rem;
  }

  .skeleton-rows {
    width: 100%;
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .skeleton-row {
    display: flex;
    gap: 1rem;
    padding: 1rem 2rem;
    background: var(--custom-bg-secondary);
    border-radius: 8px;
    border: 1px solid var(--custom-border);
  }

  /* Pending holiday rows styling */
  :global(.table-wrapper tbody tr.pending-row) {
    background-color: var(--holiday-pending-bg) !important;
  }

  :global(.table-wrapper tbody tr.pending-row td) {
    background-color: var(--holiday-pending-bg) !important;
  }

  /* Rejected holiday rows styling */
  :global(.table-wrapper tbody tr.rejected-row) {
    background-color: var(--holiday-rejected-bg) !important;
  }

  :global(.table-wrapper tbody tr.rejected-row td) {
    background-color: var(--holiday-rejected-bg) !important;
  }
</style>
