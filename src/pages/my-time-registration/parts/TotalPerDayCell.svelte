<script lang="ts">
  import { TableCell } from 'carbon-components-svelte';

  import { getTotalHoursForDay } from '../store/selectors';

  export let day: Date;

  $: dayOfTheWeek = `day-${day.getDay()}`;

  $: total = getTotalHoursForDay(day);
</script>

<TableCell class="log-day {dayOfTheWeek}">
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
