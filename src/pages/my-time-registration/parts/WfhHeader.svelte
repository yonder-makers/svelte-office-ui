<script lang="ts">
  import { TableHead, Checkbox } from 'carbon-components-svelte';
  import { getIsWorkFromHome } from '../store';

  export let day: Date;

  $: isWorkFromHome = getIsWorkFromHome(day);
  $: isIndeterminate = $isWorkFromHome === null;

</script>

<TableHead class="log-day">
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
