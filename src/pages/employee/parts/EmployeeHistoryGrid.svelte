<script lang="ts">
  import {
    Table,
    TableBody,
    TableHead,
    TableRow,
  } from 'carbon-components-svelte';
  import { employeeHistoryState } from '../store';
  import EmployeeHistoryGridRow from './EmployeeHistoryGridRow.svelte';
</script>

<Table stickyHeader={true}>
  <TableRow>
    <TableHead><span>Date</span></TableHead>
    <TableHead><span>Name</span></TableHead>
    <TableHead><span>Position</span></TableHead>
    <TableHead><span>Birth date</span></TableHead>
    <TableHead><span>Hire date</span></TableHead>
    <TableHead><span>Modified at</span></TableHead>
  </TableRow>
  <TableBody>
    {#each $employeeHistoryState.allIds as holidayId}
      <EmployeeHistoryGridRow historyId={holidayId} />
    {/each}
  </TableBody>
</Table>

<style>
  span {
    padding: 1rem;
  }
</style>
