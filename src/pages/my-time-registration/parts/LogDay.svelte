<script lang="ts">
  import { Loading, TableCell } from 'carbon-components-svelte';

  import { tick } from 'svelte';
  import { DaySelectionType } from '../enums';
  import {
    enterKeyPressed,
    selectLog,
    updateEditingValue,
  } from '../store/actions';
  import {
    getLogInfo,
    isGridReadOnly,
    isLogImported,
    isLogInvalid,
    isLogLoading,
    isLogSelected,
    isLogUpdated,
  } from '../store/selectors';
  import { editingValue, enteringMode } from '../store/state';

  import type { HolidayResponse } from '../../../apis/holidays.api';
  import { isPendingHoliday } from '../../../utils/holiday-status-utils';

  export let day: Date;
  export let taskId: number;
  export let holidayRequests: HolidayResponse[] = [];
  export let isLegalDay: boolean = false;
  export let isApprovedDay: boolean = false;

  $: dayOfTheWeek = `day-${day.getDay()}`;

  $: isSelected = isLogSelected(taskId, day);
  $: isImported = isLogImported(taskId, day);
  $: isUpdated = isLogUpdated(taskId, day);
  $: isLoading = isLogLoading(taskId, day);
  $: isInvalid = isLogInvalid(taskId, day);
  $: isPending = isPendingHoliday(day, holidayRequests);

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
  } ${dayOfTheWeek} ${$isInvalid ? ' invalid' : ''} ${
    isPending
      ? 'pending-holiday'
      : isApprovedDay
        ? 'approved-holiday'
        : isLegalDay
          ? 'legal-holiday'
          : ''
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
    const shiftPressed = event.shiftKey;
    const daySelectionType = shiftPressed
      ? DaySelectionType.Row
      : ctrlPressed
        ? DaySelectionType.Scattered
        : DaySelectionType.Single;
    selectLog(taskId, day, daySelectionType);
  }

  function onDbClick(event: MouseEvent) {
    selectLog(taskId, day, DaySelectionType.Single);
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
    user-select: none;
    -webkit-user-select: none;
    -moz-user-select: none;
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
