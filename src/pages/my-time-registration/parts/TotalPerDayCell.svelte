<script lang="ts">
  import { getTotalHoursForDay } from '../store/selectors';

  export let day: Date;

  $: total = getTotalHoursForDay(day);
</script>

<bx-table-cell>
  <span>{$total}</span>
</bx-table-cell>

<style>
  span {
    font-weight: bold;
    font-size: larger;
    display: flex;
    align-items: center;
    flex-direction: column;
  }
</style>
