<script lang="ts">
  import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableRow,
  } from 'carbon-components-svelte';
  import { holidayRequestsStore } from '../../holidays/store/state';
  import { getDaysRange } from '../store/selectors';
  import { logEntries, tasksState } from '../store/state';
  import LoadingGrid from './LoadingGrid.svelte';
  import LogColumnHeader from './LogColumnHeader.svelte';
  import LogDay from './LogDay.svelte';
  import LogDayHeader from './LogRowHeader.svelte';
  import TotalPerDayCell from './TotalPerDayCell.svelte';
  import TotalPerMonthCell from './TotalPerMonthCell.svelte';
  import TotalPerTaskCell from './TotalPerTaskCell.svelte';
  import WfhHeader from './WfhHeader.svelte';

  function getDayStatus(day: Date, entries: any[]) {
    // Simple date comparison (ignoring time)
    const dayTime = new Date(day).setHours(0, 0, 0, 0);
    const dayEntries = entries.filter(
      (e) => new Date(e.date).setHours(0, 0, 0, 0) === dayTime,
    );

    const isLegalDay = dayEntries.some((e) => e.taskId === 194);
    const isApprovedDay = dayEntries.some((e) => e.taskId === 190);
    return { isLegalDay, isApprovedDay };
  }
</script>

<Table stickyHeader={true}>
  <TableRow>
    <TableHead class="row-header" />
    <TableHead class="log-day" />
    {#each $getDaysRange as day}
      {@const status = getDayStatus(day, $logEntries)}
      <LogColumnHeader
        {day}
        holidayRequests={$holidayRequestsStore}
        isLegalDay={status.isLegalDay}
        isApprovedDay={status.isApprovedDay}
      />
    {/each}
  </TableRow>
  <TableRow class="wfh-header">
    <TableHead class="row-header"></TableHead>
    <TableHead class="log-day">WFH?</TableHead>
    {#each $getDaysRange as day}
      <WfhHeader {day} />
    {/each}
  </TableRow>

  <TableBody style="overflow-x: unset;">
    {#each $tasksState.allIds as taskId}
      <TableRow>
        <LogDayHeader {taskId} />
        <TotalPerTaskCell {taskId} />
        {#each $getDaysRange as day}
          {@const status = getDayStatus(day, $logEntries)}
          <LogDay
            {day}
            {taskId}
            holidayRequests={$holidayRequestsStore}
            isLegalDay={status.isLegalDay}
            isApprovedDay={status.isApprovedDay}
          />
        {/each}
      </TableRow>
    {/each}
    <LoadingGrid />
    <TableRow>
      <TableCell class="row-header">
        <span class="total">TOTAL</span>
      </TableCell>
      <TotalPerMonthCell />
      {#each $getDaysRange as day}
        <TotalPerDayCell {day} />
      {/each}
    </TableRow>
  </TableBody>
</Table>

<style>
  :global(.bx--data-table tr) {
    min-height: 3rem;
    height: auto;
  }
  :global(.bx--data-table--sticky-header) {
    max-height: calc(100vh - 342px) !important;
  }
  :global(.bx--data-table--sticky-header > tr) {
    position: sticky;
    top: 0px;
    z-index: 10;
  }
  :global(.bx--data-table--sticky-header > tr.wfh-header) {
    top: 48px; /* the height of the first header-row */
  }
  :global(.bx--data-table--sticky-header > tbody > tr:last-child) {
    position: sticky;
    bottom: 0px;
    z-index: 10;
  }
  :global(td.row-header, thead.row-header) {
    min-width: 200px !important;
    position: sticky;
    left: 0;
    display: flex;
    flex-direction: column;
    justify-content: center;
    padding: 0 0.5rem !important;
    z-index: 2;
    border-right: 1px solid gray;
    background-color: var(--cds-ui-01, #ffffff);
  }

  :global(td.log-day, thead.log-day) {
    padding: 0 !important;
    min-width: 50px !important;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
  }
  :global(td.row-header + td.log-day, thead.row-header + thead.log-day) {
    position: sticky;
    left: 200px;
    z-index: 10;
    background-color: var(--cds-ui-01, #ffffff);
  }

  :global(td.log-day.day-1, thead.log-day.day-1) {
    border-left: 3px solid black;
  }

  :global(td.log-day.invalid, thead.log-day.invalid) {
    background-color: rgb(254, 106, 106);
  }

  /* Weekend styling - Light theme */
  :global(
      td.log-day.day-0,
      td.log-day.day-6,
      thead.log-day.day-0,
      thead.log-day.day-6
    ) {
    background-color: rgba(226, 232, 240, 0.6);
  }

  /* Dark theme specific styles for weekends */
  :global([data-carbon-theme='g90'] td.log-day.day-0),
  :global([data-carbon-theme='g90'] td.log-day.day-6),
  :global([data-carbon-theme='g90'] thead.log-day.day-0),
  :global([data-carbon-theme='g90'] thead.log-day.day-6),
  :global([data-carbon-theme='g100'] td.log-day.day-0),
  :global([data-carbon-theme='g100'] td.log-day.day-6),
  :global([data-carbon-theme='g100'] thead.log-day.day-0),
  :global([data-carbon-theme='g100'] thead.log-day.day-6) {
    background-color: rgba(82, 82, 82, 0.4);
  }

  /* Pending Holiday Styling */
  :global(td.log-day.pending-holiday, thead.log-day.pending-holiday) {
    background-color: rgba(255, 165, 0, 0.2) !important; /* Light Orange */
    border-bottom: 2px solid orange;
  }

  /* Approved Holiday Styling */
  :global(td.log-day.approved-holiday, thead.log-day.approved-holiday) {
    background-color: rgba(0, 128, 255, 0.2) !important; /* Light Blue */
    border-bottom: 2px solid #0080ff;
  }

  /* Legal Holiday Styling */
  :global(td.log-day.legal-holiday, thead.log-day.legal-holiday) {
    background-color: rgba(0, 128, 0, 0.2) !important; /* Light Green */
    border-bottom: 2px solid green;
  }
</style>
