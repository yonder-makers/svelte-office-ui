<script lang="ts">
  import { TableCell } from 'carbon-components-svelte';

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
      submitHours(false);
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

<TableCell on:click={focus} class={containerClass}>
  {#if $isLoading}
    OO
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
</TableCell>

<style>
  :global(td.loading) {
    background-color: red !important;
  }
  :global(td.selected) {
    background-color: yellow !important;
  }

  input {
    margin: 0;
    z-index: 1;
  }

  .value-input {
    max-width: 30px;
  }
</style>
