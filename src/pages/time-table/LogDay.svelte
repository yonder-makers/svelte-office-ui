<script lang="ts">
  import { getTimeEntryByDay } from '../../state/selectors';
  import { tick } from 'svelte';
  import { setLog } from '../../state/actions';
  import type { DayId } from '../../core/id-utils';
  import { focusedEntry } from './store/selectors';
  import { focusOnEntry, focusOnNextEntry } from './store/actions';

  export let day: DayId;
  export let taskId: number;

  $: log = getTimeEntryByDay(day, taskId);

  $: focused =
    $focusedEntry !== undefined &&
    day === $focusedEntry.day &&
    taskId === $focusedEntry.taskId;

  async function onfocus() {
    await tick();
    valueInput.focus();
    valueInput.setSelectionRange(0, valueInput.value.length);
  }

  $: {
    if (focused) {
      onfocus();
    }
  }

  async function valueBlur(event: FocusEvent) {
    const value = parseInt(valueInput.value);
    setLog(day, taskId, value, noteInput.value);
  }

  async function focus() {
    focusOnEntry(day, taskId);
  }

  function keyUpValue(event: KeyboardEvent) {
    if (event.key === 'Enter') {
      noteInput.focus();
      noteInput.setSelectionRange(0, noteInput.value.length);
    } else if (event.key === 'Escape') {
      valueInput.value = $log.hours.toString();
      focusOnEntry(undefined, undefined);
    }
  }
  function keyUpDescription(event: KeyboardEvent) {
    if (event.key === 'Enter' || event.key === 'Tab') {
      event.preventDefault();
      focusOnNextEntry();
    } else if (event.key === 'Escape') {
      noteInput.value = $log.note;
      focusOnEntry(undefined, undefined);
    }
  }

  let valueInput: HTMLInputElement, noteInput: HTMLInputElement;
</script>

{#if focused === false}
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
{/if}

<style>
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
