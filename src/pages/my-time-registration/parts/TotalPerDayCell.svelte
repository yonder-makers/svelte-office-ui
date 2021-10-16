<script lang="ts">
  import { TableCell } from 'carbon-components-svelte';

  import { getTotalHoursForDay } from '../store/selectors';

  export let day: Date;

  $: total = getTotalHoursForDay(day);
</script>

<TableCell class="log-day">
  <span>{$total}</span>
</TableCell>

<style>
  span {
    font-weight: bold;
    font-size: larger;
    display: flex;
    align-items: center;
    flex-direction: column;
  }
</style>
