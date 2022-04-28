<script lang="ts">
  import { TableHead, Checkbox } from 'carbon-components-svelte';
  import { getIsWorkFromHome, isAnyOfTheLogLoading, setWorkFromHomeForDay } from '../store';

  export let day: Date;
  
  $: dayOfTheWeek = `day-${day.getDay()}`;

  $: isWorkFromHome = getIsWorkFromHome(day);
  $: isIndeterminate = $isWorkFromHome === null;

  let isAnyLoading = isAnyOfTheLogLoading;

  function onToggle(e: Event) {
    const { checked  } = e.target as any;
    setWorkFromHomeForDay(day, checked);
  }

</script>

<TableHead class="log-day {dayOfTheWeek}">
  <div class="container">
    <Checkbox disabled={$isAnyLoading} indeterminate={isIndeterminate} checked={$isWorkFromHome} on:change={onToggle} />
  </div>
</TableHead>

<style>
  .container {
    display: flex;
    align-items: center;
  }
</style>
