<script lang="ts">
  import {
    ToolbarSearch,
    Checkbox,
  } from 'carbon-components-svelte';
  import { holidayRequestsStore } from '../store/state';
  import { getHolidayTypeName } from '../../../apis/holidays.api';
  import HolidaysGridRow from './HolidaysGridRow.svelte';

  let searchValue = '';
  
  // Type filters - all enabled by default
  let showPaid = true;
  let showCompensation = true;
  let showUnpaid = true;
  let showLegal = true;

  $: holidays = $holidayRequestsStore;
  
  $: filteredHolidays = holidays.filter(holiday => {
    // Get type name for filtering
    const typeName = typeof holiday.type === 'string' 
      ? holiday.type 
      : (holiday.typeName || (holiday.type !== undefined ? getHolidayTypeName(Number(holiday.type)) : ''));
    
    // Type filter
    const typeFilter = 
      (showPaid && typeName?.toLowerCase() === 'paid') ||
      (showCompensation && typeName?.toLowerCase() === 'compensation') ||
      (showUnpaid && (typeName?.toLowerCase() === 'not paid' || typeName?.toLowerCase() === 'unpaid')) ||
      (showLegal && typeName?.toLowerCase() === 'legal');
    
    if (!typeFilter) return false;
    
    // Search filter
    if (!searchValue) return true;
    const search = searchValue.toLowerCase();
    return (
      typeName?.toLowerCase().includes(search) ||
      holiday.description?.toLowerCase().includes(search) ||
      holiday.startDate?.toLowerCase().includes(search) ||
      holiday.endDate?.toLowerCase().includes(search) ||
      holiday.status?.toLowerCase().includes(search)
    );
  });

  const headers = [
    { key: 'type', value: 'Type' },
    { key: 'status', value: 'Status' },
    { key: 'startDate', value: 'Start Date' },
    { key: 'endDate', value: 'End Date' },
    { key: 'days', value: 'Days' },
    { key: 'description', value: 'Description' },
    { key: 'created', value: 'Created' },
    { key: 'modified', value: 'Modified' },
    { key: 'actions', value: 'Actions' },
  ];
</script>

<div class="holidays-grid">
  {#if holidays.length === 0}
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
          size="sm"
        />
      </div>
      
      <div class="filters-container">
        <span class="filter-label">Show:</span>
        <Checkbox bind:checked={showPaid} labelText="Paid" />
        <Checkbox bind:checked={showCompensation} labelText="Compensation" />
        <Checkbox bind:checked={showUnpaid} labelText="Unpaid" />
        <Checkbox bind:checked={showLegal} labelText="Legal" />
      </div>
    </div>

    <div class="custom-table">
      <table>
        <thead>
          <tr>
            {#each headers as header}
              <th>{header.value}</th>
            {/each}
          </tr>
        </thead>
        <tbody>
          {#each filteredHolidays as holiday}
            <HolidaysGridRow holiday={holiday} />
          {/each}
        </tbody>
      </table>
    </div>

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
    padding: 4rem 2rem;
    text-align: center;
  }

  .empty-title {
    font-size: 1.25rem;
    font-weight: 600;
    color: #161616;
    margin: 0 0 0.5rem 0;
  }

  .empty-subtitle {
    font-size: 0.875rem;
    color: #525252;
    margin: 0;
  }

  .toolbar-section {
    background: white;
    border-bottom: 1px solid #e0e0e0;
    padding: 0.75rem 1rem;
    margin-bottom: 0;
    display: flex;
    align-items: center;
    gap: 2rem;
    flex-wrap: wrap;
  }

  .search-container {
    flex: 1;
    min-width: 250px;
  }

  .filters-container {
    display: flex;
    align-items: center;
    gap: 1rem;
    flex-wrap: wrap;
  }

  .filter-label {
    font-size: 0.875rem;
    font-weight: 600;
    color: #161616;
    margin-right: 0.5rem;
  }

  :global(.filters-container .bx--checkbox-wrapper) {
    margin-bottom: 0;
  }

  :global(.filters-container .bx--checkbox-label) {
    font-size: 0.875rem;
  }

  .custom-table {
    overflow-x: auto;
    margin-top: 0;
  }

  .custom-table table {
    width: 100%;
    border-collapse: collapse;
  }

  .custom-table thead {
    background: #f4f4f4;
    border-bottom: 1px solid #e0e0e0;
  }

  .custom-table th {
    padding: 1rem;
    text-align: left;
    font-size: 0.75rem;
    font-weight: 600;
    color: #525252;
    text-transform: uppercase;
    letter-spacing: 0.02em;
  }

  .no-results {
    padding: 2rem;
    text-align: center;
    color: #525252;
  }

  :global(.search-container .bx--search) {
    width: 100%;
  }
</style>
