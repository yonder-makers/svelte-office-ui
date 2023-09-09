<script lang="ts">
  import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableRow,
  } from 'carbon-components-svelte';
  import { getDaysRange } from '../store/selectors';
  import { tasksState } from '../store/state';
  import LoadingGrid from './LoadingGrid.svelte';
  import LogColumnHeader from './LogColumnHeader.svelte';
  import LogDay from './LogDay.svelte';
  import LogDayHeader from './LogRowHeader.svelte';
  import TotalPerDayCell from './TotalPerDayCell.svelte';
  import TotalPerMonthCell from './TotalPerMonthCell.svelte';
  import TotalPerTaskCell from './TotalPerTaskCell.svelte';
  import WfhHeader from './WfhHeader.svelte';
</script>

<Table stickyHeader={true}>
  <TableRow >
    <TableHead class="row-header" />
    <TableHead class="log-day" />
    {#each $getDaysRange as day}
      <LogColumnHeader {day} />
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
          <LogDay {day} {taskId} />
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
      top:0px;
      z-index: 10;
  }
  :global(.bx--data-table--sticky-header > tr.wfh-header) {
      top:48px; /* the height of the first header-row */
  }
  :global(.bx--data-table--sticky-header > tbody > tr:last-child) {
      position: sticky;
      bottom:0px;
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
    left:200px;
    z-index: 10;
  }

  :global(td.log-day.day-1,thead.log-day.day-1){
    border-left: 3px solid black;
  }

  :global(td.log-day.invalid,thead.log-day.invalid){
    background-color: rgb(254, 106, 106);
  }

  :global(td.log-day.day-0, td.log-day.day-6, thead.log-day.day-0, thead.log-day.day-6) {
    background-color: rgb(202, 202, 246);
  }

  .total {
    font-weight: bolder;
  }
</style>
