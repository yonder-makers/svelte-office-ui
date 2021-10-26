<script lang="ts">
  import { TableCell, Loading } from 'carbon-components-svelte';

  import { tick } from 'svelte';
  import { selectLog, submitHours, updateEditingValue } from '../store/actions';
  import {
    getLogInfo,
    isGridReadOnly,
    isLogLoading,
    isLogSelected,
  } from '../store/selectors';
  import { editingValue, enteringMode } from '../store/state';

  export let day: Date;
  export let taskId: number;

  let isSelected = isLogSelected(taskId, day);
  let isLoading = isLogLoading(taskId, day);

  $: log = getLogInfo(taskId, day);
  $: {
    if ($isSelected && $enteringMode === 'hours') {
      focusInput();
    }
  }
  $: containerClass = `log-day${$isSelected ? ' selected' : ''}${
    $isLoading ? ' loading' : ''
  }`;

  async function focusInput() {
    await tick();
    valueInput.focus();
    valueInput.setSelectionRange(0, valueInput.value.length);
  }

  function keyUpValue(event: KeyboardEvent) {
    if (event.key === 'Enter') {
      //submitHours(false);
    } else if (event.key === 'Escape') {
      // valueInput.value = $log.hours.toString();
      // focusOnEntry(undefined, undefined);
    } else {
      updateEditingValue(valueInput.value);
    }
  }

  function focus(event: MouseEvent) {
    if ($isLoading) return;

    const ctrlPressed = event.metaKey || event.ctrlKey;
    selectLog(taskId, day, ctrlPressed);
  }

  let valueInput: HTMLInputElement, noteInput: HTMLInputElement;
</script>

{#if $isGridReadOnly}
  <TableCell class="log-day">
    <div class="read-only">
      {#if $log === undefined}
        -
      {:else}
        <b>{$log.hours}</b>
      {/if}
    </div>
  </TableCell>
{:else}
  <TableCell on:click={focus} class={containerClass}>
    <div class:loading={$isLoading} class:selected={$isSelected}>
      {#if $isLoading}
        <Loading withOverlay={false} small />
      {:else if $enteringMode === 'hours' && $isSelected}
        <input
          bind:this={valueInput}
          on:keyup={keyUpValue}
          class="value-input"
          type="text"
          value={$editingValue}
        />
      {:else if $log === undefined}
        -
      {:else}
        <b>{$log.hours}</b>
      {/if}
    </div>
  </TableCell>
{/if}

<style>
  div {
    cursor: pointer;
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
  }
  div.read-only {
    cursor: default;
  }

  .selected {
    background-color: #0f62fe;
    color: white;
  }

  input {
    margin: 0;
    z-index: 1;
  }

  .value-input {
    max-width: 40px;
  }
</style>
