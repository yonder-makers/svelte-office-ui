<script lang="ts">
  import { Loading, TableRow } from 'carbon-components-svelte';

  import { logEntriesAreLoading } from '../store/state';
</script>

{#if $logEntriesAreLoading}
  <Loading />
  {#each [1, 2, 3, 4, 5] as i}
    <TableRow />
  {/each}
{/if}
