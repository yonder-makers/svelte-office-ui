<script lang="ts">
  import { TableCell, Loading } from 'carbon-components-svelte';

  import { tick } from 'svelte';
  import {
    enterKeyPressed,
    selectLog,
    updateEditingValue,
  } from '../store/actions';
  import {
    getLogInfo,
    isGridReadOnly,
    isLogLoading,
    isLogSelected,
    isLogImported,
    isLogUpdated,
    isLogInvalid,
  } from '../store/selectors';
  import { editingValue, enteringMode } from '../store/state';

  export let day: Date;
  export let taskId: number;

  $: dayOfTheWeek = `day-${day.getDay()}`;

  $: isSelected = isLogSelected(taskId, day);
  $: isImported = isLogImported(taskId, day);
  $: isUpdated = isLogUpdated(taskId, day);
  $: isLoading = isLogLoading(taskId, day);
  $: isInvalid = isLogInvalid(taskId, day);


  $: log = getLogInfo(taskId, day);
  $: {
    if ($isSelected && $enteringMode === 'hours') {
      focusInput();
    }
  }
  $: containerClass = `log-day${$isSelected ? ' selected' : ''}${
    $isLoading ? ' loading' : ''
  }${$isImported ? ' imported' : ''}${
    $isUpdated ? ' updated' : ''
  } ${dayOfTheWeek} ${$isInvalid ? ' invalid' : ''}`;

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

  function onDbClick(event: MouseEvent) {
    selectLog(taskId, day, false);
    enterKeyPressed();
  }

  let valueInput: HTMLInputElement, noteInput: HTMLInputElement;
</script>

{#if $isGridReadOnly}
  <TableCell class="log-day {dayOfTheWeek}">
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
    <div
      on:dblclick={onDbClick}
      class:loading={$isLoading}
      class:selected={$isSelected}
      class:imported={$isImported}
      class:updated={$isUpdated}
    >
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

  .imported {
    background-color: #ff00ff;
    color: white;
  }

  .updated {
    background-color: #f6be00;
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
