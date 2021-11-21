<script lang="ts">
  import { Button, TextInput, Toggle } from 'carbon-components-svelte';

  import {
    cancelImportFromToggl,
    hasImportedData,
    importinfo,
    saveImportedData,
  } from '../store';
  import TypOfWorkComboBox from './TypOfWorkComboBox.svelte';
  function onSaveClicked() {
    saveImportedData();
  }

  function onClickCancel() {
    cancelImportFromToggl();
  }
</script>

{#if $hasImportedData === false}
  <TypOfWorkComboBox bind:selectedIndex={$importinfo.selectedTypeOfWorkIndex} />
  <Toggle
    labelText="Work from home"
    bind:toggled={$importinfo.isWorkFromHome}
  />
{/if}
{#if $importinfo.isWorkFromHome && $hasImportedData === false}
  <TextInput
    labelText="Work day started"
    placeholder="Enter when have you started working"
    bind:value={$importinfo.workFromHomeStart}
  />
{/if}

{#if $hasImportedData}
  <Button
    disabled={$importinfo.selectedTypeOfWorkIndex === undefined}
    on:click={onSaveClicked}>Save Updated Data</Button
  >

  <Button on:click={onClickCancel}>Cancel Import</Button>
{/if}
