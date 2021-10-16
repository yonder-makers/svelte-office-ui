<script lang="ts">
  import LogDay from './LogDay.svelte';
  import {
    endOfMonth,
    startOfMonth,
    eachDayOfInterval,
    format,
  } from 'date-fns';

  import { getDateForMonthId, getDayId } from '../../core/id-utils';
  import LogDayHeader from './LogDayHeader.svelte';
  import TotalPerDay from './TotalPerDay.svelte';
  import { getTasksIdsForCurrentMonth, selectedMonth } from './store/selectors';
  import { goNextMonth, goPreviousMonth } from './store/actions';

  let days: Date[] = [];

  $: {
    const start = startOfMonth(getDateForMonthId($selectedMonth));
    const end = endOfMonth(start);
    days = eachDayOfInterval({ start, end });
  }
</script>

<bx-btn on:click={goPreviousMonth} kind="primary" size icon-layout>
  <span slot="icon">-</span>
</bx-btn>

{format(getDateForMonthId($selectedMonth), 'yyyy MMM')}

<bx-btn on:click={goNextMonth} kind="primary" size icon-layout>
  <span slot="icon">+</span>
</bx-btn>

<div class="grid-container">
  <bx-table :size="null">
    <bx-table-head>
      <bx-table-header-row>
        <bx-table-header-cell class="day-column"> Day </bx-table-header-cell>
        <bx-table-header-cell class="day-column"> Total </bx-table-header-cell>
        {#each $getTasksIdsForCurrentMonth as taskId}
          <LogDayHeader {taskId} />
        {/each}
      </bx-table-header-row>
    </bx-table-head>
    <bx-table-body>
      {#each days as day}
        <bx-table-row>
          <bx-table-cell> {format(day, 'MMM d')} </bx-table-cell>
          <bx-table-cell>
            <TotalPerDay day={getDayId(day)} />
          </bx-table-cell>
          {#each $getTasksIdsForCurrentMonth as taskId}
            <bx-table-cell>
              <LogDay day={getDayId(day)} {taskId} />
            </bx-table-cell>
          {/each}
        </bx-table-row>
      {/each}
    </bx-table-body>
  </bx-table>
</div>

<style>
  .grid-container {
    overflow: scroll;
  }

  bx-table {
    width: unset;
  }

  bx-table-cell {
    padding-top: 0;
    padding-bottom: 0;
  }

  bx-table-header-cell,
  bx-table-cell {
    max-width: 50px;
    min-width: 50px;
  }
</style>
