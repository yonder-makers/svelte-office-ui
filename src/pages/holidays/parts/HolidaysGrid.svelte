<script lang="ts">
  import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableRow,
  } from 'carbon-components-svelte';
  import { holidaysState } from '../store';
  import HolidaysGridRow from './HolidaysGridRow.svelte';
</script>

<Table stickyHeader={true}>
  <TableRow>
    <TableHead><span>Type</span></TableHead>
    <TableHead><span>Decision</span></TableHead>
    <TableHead><span>Start date</span></TableHead>
    <TableHead><span>End date</span></TableHead>
    <TableHead><span>Description</span></TableHead>
    <TableHead><span>Created</span></TableHead>
    <TableHead><span>Modified</span></TableHead>
  </TableRow>
  <TableBody>
    {#each $holidaysState.allIds as holidayId}
      <HolidaysGridRow {holidayId} />
    {/each}
  </TableBody>
</Table>

<style>
  span {
    padding: 1rem;
  }
</style>
