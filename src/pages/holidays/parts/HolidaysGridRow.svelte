<script lang="ts">
  import { TableCell, TableRow, Tag } from 'carbon-components-svelte';
  import { holidaysState } from '../store';

  export let holidayId: string;

  $: holiday = $holidaysState.byId[holidayId];
</script>

{#if holiday !== undefined}
  <TableRow>
    <TableCell>{holiday.type}</TableCell>
    <TableCell class="log-day">
      {#if holiday.decision}
        <Tag type="green" size="sm">Yes</Tag>
      {:else if holiday.decision}
        <Tag type="green" size="sm">No</Tag>
      {/if}
    </TableCell>
    <TableCell>{holiday.startDate}</TableCell>
    <TableCell>{holiday.endDate}</TableCell>
    <TableCell>{holiday.description}</TableCell>
    <TableCell>{holiday.createdAt}</TableCell>
    <TableCell>{holiday.modifiedDate} by {holiday.modifiedBy}</TableCell>
  </TableRow>
{/if}
