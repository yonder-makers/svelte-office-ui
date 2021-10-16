<script lang="ts">
  import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableRow,
  } from 'carbon-components-svelte';
  import { getDaysRange, getLogEntryIds } from '../store/selectors';
  import LogColumnHeader from './LogColumnHeader.svelte';
  import LogDay from './LogDay.svelte';
  import LogDayHeader from './LogRowHeader.svelte';
  import TotalPerDayCell from './TotalPerDayCell.svelte';
</script>

<Table stickyHeader={true}>
  <TableRow>
    <TableHead class="row-header" />
    {#each $getDaysRange as day}
      <LogColumnHeader {day} />
    {/each}
  </TableRow>
  <TableBody style="overflow-x: unset;">
    {#each $getLogEntryIds as taskId}
      <TableRow>
        <LogDayHeader {taskId} />
        {#each $getDaysRange as day}
          <LogDay {day} {taskId} />
        {/each}
      </TableRow>
    {/each}
    <TableRow>
      <TableCell class="row-header">
        <span class="total">TOTAL</span>
      </TableCell>
      {#each $getDaysRange as day}
        <TotalPerDayCell {day} />
      {/each}
    </TableRow>
  </TableBody>
</Table>

<style>
  :global(td.row-header, thead.row-header) {
    min-width: 200px !important;
    position: sticky;
    left: 0;
    display: flex;
    align-items: center;
    padding: 0 1rem !important;
    z-index: 2;
    border-right: 1px solid gray;
  }

  :global(td.log-day, thead.log-day) {
    padding: 0 !important;
    cursor: pointer;
    min-width: 50px !important;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
  }

  .total {
    font-weight: bolder;
  }
</style>
