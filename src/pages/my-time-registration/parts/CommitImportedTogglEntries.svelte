<script lang="ts">
  import { Button } from 'carbon-components-svelte';

  import { hasImportedData } from '../store';
  import TypOfWorkComboBox from './TypOfWorkComboBox.svelte';
  function saveImportedData() {}
</script>

{#if $hasImportedData}
  <TypOfWorkComboBox />
  <Button on:click={saveImportedData}>Save Updated Data</Button>
{/if}
