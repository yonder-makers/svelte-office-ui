<script lang="ts">
  import { TableHead } from 'carbon-components-svelte';
  import { format } from 'date-fns';

  export let day: Date;
</script>

<TableHead class="log-day">
  <span>
    {format(day, 'd')}
  </span>
  <i>{format(day, 'EEE')}</i>
</TableHead>

<style>
  span {
    display: block;
  }

  i {
    font-size: smaller;
  }
</style>
