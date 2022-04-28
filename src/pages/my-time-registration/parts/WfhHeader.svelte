<script lang="ts">
  import { TableHead, Checkbox } from 'carbon-components-svelte';
  import { getIsWorkFromHome } from '../store';

  export let day: Date;
  
  $: dayOfTheWeek = `day-${day.getDay()}`;

  $: isWorkFromHome = getIsWorkFromHome(day);
  $: isIndeterminate = $isWorkFromHome === null;

</script>

<TableHead class="log-day {dayOfTheWeek}">
  <div class="container">
    <Checkbox indeterminate={isIndeterminate} checked={$isWorkFromHome} />
  </div>
</TableHead>

<style>
  .container {
    display: flex;
    align-items: center;
  }
</style>
