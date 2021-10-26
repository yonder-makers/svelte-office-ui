<script lang="ts">
  import { TableCell } from 'carbon-components-svelte';

  import { getTotalForMonth } from '../store/selectors';
</script>

<TableCell class="log-day">
  <span>{$getTotalForMonth}</span>
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
