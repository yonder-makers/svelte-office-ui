<script lang="ts">
  import { Button, TextInput, Toggle } from 'carbon-components-svelte';

  import { hasImportedData, importinfo } from '../store';
  import TypOfWorkComboBox from './TypOfWorkComboBox.svelte';
  function saveImportedData() {}
</script>

<TypOfWorkComboBox bind:selectedIndex={$importinfo.selectedTypeOfWorkIndex} />
<Toggle labelText="Work from home" bind:toggled={$importinfo.isWorkFromHome} />
{#if $importinfo.isWorkFromHome}
  <TextInput
    labelText="Work day started"
    placeholder="Enter when have you started working"
    bind:value={$importinfo.workFromHomeStart}
  />
{/if}
{#if $hasImportedData}
  <Button
    disabled={$importinfo.selectedTypeOfWorkIndex === undefined}
    on:click={saveImportedData}>Save Updated Data</Button
  >
{/if}
