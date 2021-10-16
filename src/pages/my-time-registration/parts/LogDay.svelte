<script lang="ts">
  import { tick } from 'svelte';
  import { selectLog, submitHours, updateEditingValue } from '../store/actions';
  import { getLogInfo, isLogLoading, isLogSelected } from '../store/selectors';
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

  // $: focused =
  //   $focusedEntry !== undefined &&
  //   day === $focusedEntry.day &&
  //   taskId === $focusedEntry.taskId;

  async function focusInput() {
    await tick();
    valueInput.focus();
    valueInput.setSelectionRange(0, valueInput.value.length);
  }

  // $: {
  //   if (focused) {
  //     onfocus();
  //   }
  // }

  // async function valueBlur(event: FocusEvent) {
  //   const value = parseInt(valueInput.value);
  //   setLog(day, taskId, value, noteInput.value);
  // }

  // async function focus() {
  //   focusOnEntry(day, taskId);
  // }

  function keyUpValue(event: KeyboardEvent) {
    if (event.key === 'Enter') {
      submitHours(false);
    } else if (event.key === 'Escape') {
      // valueInput.value = $log.hours.toString();
      // focusOnEntry(undefined, undefined);
    } else {
      updateEditingValue(valueInput.value);
    }
  }
  // function keyUpDescription(event: KeyboardEvent) {
  //   if (event.key === 'Enter' || event.key === 'Tab') {
  //     event.preventDefault();
  //     focusOnNextEntry();
  //   } else if (event.key === 'Escape') {
  //     noteInput.value = $log.note;
  //     focusOnEntry(undefined, undefined);
  //   }
  // }

  function focus(event: MouseEvent) {
    const ctrlPressed = event.metaKey || event.ctrlKey;
    selectLog(taskId, day, ctrlPressed);
  }

  let valueInput: HTMLInputElement, noteInput: HTMLInputElement;
</script>

{#if $isLoading}
  <bx-table-cell class="loading"> OO </bx-table-cell>
{:else}
  <bx-table-cell on:click={focus} class={$isSelected ? 'selected' : ''}>
    {#if $enteringMode === 'hours' && $isSelected}
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
  </bx-table-cell>
{/if}

<!-- {#if focused === false}
  <div class="not-focused" on:click={focus}>
    {#if $log.hours === 0}
      <span class="empty">-</span>
    {:else}
      <span class="hours">{$log.hours}h</span>
      <span class="note"> - {$log.note}</span>
    {/if}
  </div>
{:else}
  <div>
    <input
      bind:this={valueInput}
      on:blur={valueBlur}
      on:keyup={keyUpValue}
      class="value-input"
      type="text"
      value={$log.hours}
    />
    <span>:</span>
    <input
      bind:this={noteInput}
      on:blur={valueBlur}
      on:keydown={keyUpDescription}
      type="text"
      value={$log.note}
    />
  </div>
{/if} -->
<style>
  bx-table-cell {
    cursor: pointer;
  }
  .loading {
    background-color: red;
  }
  .selected {
    background-color: yellow;
  }
  div.not-focused {
    cursor: pointer;
    display: flex;
  }

  div.not-focused .empty {
    padding-left: 18px;
    padding-right: 18px;
  }

  div.not-focused .hours {
    flex: 0 0 auto;
    min-width: 20px;
    font-weight: bold;
    text-align: center;
  }

  div.not-focused .note {
    flex: 1 1 auto;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  div {
    display: flex;
    align-items: center;
  }

  input {
    margin: 0;
    z-index: 1;
  }

  .value-input {
    max-width: 30px;
  }
</style>
