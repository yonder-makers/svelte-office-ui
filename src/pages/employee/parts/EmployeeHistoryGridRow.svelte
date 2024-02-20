<script lang="ts">
  import { TableCell, TableRow } from 'carbon-components-svelte';
  import { employeeHistoryState } from '../store';

  export let historyId: number;

  $: historyItem = $employeeHistoryState.byId[historyId];
</script>

{#if historyItem !== undefined}
  <TableRow>
    <TableCell>{historyItem.dateStart}</TableCell>
    <TableCell>{historyItem.firstName} {historyItem.lastName}</TableCell>
    <TableCell>{historyItem.position}</TableCell>
    <TableCell>{historyItem.departmentName ?? ''}</TableCell>
    <TableCell>{historyItem.birthDate ?? ''}</TableCell>
    <TableCell>{historyItem.hireDate}</TableCell>
    <TableCell>{historyItem.created} by {historyItem.createdBy}</TableCell>
  </TableRow>
{/if}
